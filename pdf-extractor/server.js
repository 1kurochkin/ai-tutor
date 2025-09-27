import express from "express";
import multer from "multer";
import fs from "fs-extra";
import os from "os";
import path from "path";
import {exec} from "child_process";
import {promisify} from "util";
import {XMLParser} from "fast-xml-parser";
import * as cheerio from "cheerio";


const execAsync = promisify(exec);
const app = express();
const upload = multer({dest: "uploads/"});
app.use(express.json()); // to parse JSON bodies

app.post("/images-coords", upload.single("file"), async (req, res) => {
    let tempDir;
    try {
        // 1. Create a temporary directory
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-extract-"));

        // 2. Save uploaded PDF
        const pdfPath = path.join(tempDir, "input.pdf");
        await fs.copy(req.file.path, pdfPath);

        // 3. Run pdftohtml with XML output
        const xmlPath = path.join(tempDir, "output.xml");
        await execAsync(`pdftohtml -xml "${pdfPath}" "${xmlPath}"`);
        const xml = await fs.readFile(xmlPath, "utf-8");

        const parser = new XMLParser({ignoreAttributes: false});
        const json = parser.parse(xml);

        // 4. Normalize pages array
        const pages = Array.isArray(json.pdf2xml?.page)
            ? json.pdf2xml.page
            : json.pdf2xml?.page
                ? [json.pdf2xml.page]
                : [];

        const images = [];

        for (const p of pages) {
            const pageNumber = parseInt(p["@_number"], 10) || 1;
            const pageSize = {width: parseInt(p["@_width"]), height: parseInt(p["@_height"])}

            const imgs = Array.isArray(p.image)
                ? p.image
                : p.image
                    ? [p.image]
                    : [];

            for (const img of imgs) {
                const isFullPage = img['@_width'] >= p[['@_width']] * 0.9 && img['@_height'] >= p[['@_height']] * 0.9
                const isTopLeft = img["@_top"] < 5 && img["@_left"] < 5
                const hasTextNearby = p.text.some(t =>
                    t.pageNumber === img.pageNumber &&
                    Math.abs(t.top - img.top) < 20 &&
                    Math.abs(t.left - img.left) < 20)
                // Pass layout images
                if (isFullPage && isTopLeft && !hasTextNearby) continue
                try {
                    const imgPath = path.isAbsolute(img["@_src"])
                        ? img["@_src"]
                        : path.join(tempDir, img["@_src"]);
                    const buffer = await fs.readFile(imgPath);
                    const base64 = buffer.toString("base64");

                    images.push({
                        pageSize,
                        page: pageNumber,
                        x: parseFloat(img["@_left"]) || 0,
                        y: parseFloat(img["@_top"]) || 0,
                        width: parseFloat(img["@_width"]) || 0,
                        height: parseFloat(img["@_height"]) || 0,
                        base64: `data:image/png;base64,${base64}`,
                    });
                } catch (e) {
                    console.error("Failed to read image:", img, e.message);
                }
            }
        }

        res.json({images});
    } catch (err) {
        console.error("PDF image extraction error:", err);
        res.status(500).json({error: err.message});
    } finally {
        // 5. Cleanup temp files
        try {
            if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
            if (req.file?.path) await fs.remove(req.file.path);
        } catch (e) {
            console.warn("Cleanup failed:", e.message);
        }
    }
});


app.post("/texts-coords", upload.single("file"), async (req, res) => {
    const textsArray = req.body.texts ? JSON.parse(req.body.texts) : [];
    if (!Array.isArray(textsArray)) {
        return res.status(400).json({ error: "Provide an array of texts in body" });
    }

    let tempDir;
    try {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-extract-"));
        const pdfPath = path.join(tempDir, "input.pdf");
        await fs.copy(req.file.path, pdfPath);

        const xmlPath = path.join(tempDir, "output.xml");
        await execAsync(`pdftohtml -xml "${pdfPath}" "${xmlPath}"`);
        const xml = await fs.readFile(xmlPath, "utf-8");

        // Load XML with cheerio (xmlMode preserves structure)
        const $ = cheerio.load(xml, { xmlMode: true, decodeEntities: true });

        const pages = [];
        $("page").each((pi, pageEl) => {
            const pageNumber = parseInt($(pageEl).attr("number"), 10) || pi + 1;
            const structuredLines = [];
            const pageSize = {width: parseInt($(pageEl).attr("width")), height: parseInt($(pageEl).attr("height"))}

            // loop through <text> nodes and get rendered text
            $(pageEl).find("text").each((ti, t) => {
                // .text() returns textContent (strips tags like <b>)
                let raw = $(t).text() || "";
                // normalize NBSP and whitespace, collapse multiple spaces to one, trim
                raw = raw.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
                if (!raw) return; // skip whitespace-only nodes

                const left = parseFloat($(t).attr("left")) || 0;
                const top = parseFloat($(t).attr("top")) || 0;
                const width = parseFloat($(t).attr("width")) || 0;
                const height = parseFloat($(t).attr("height")) || 0;

                structuredLines.push({
                    text: raw,
                    x: left,
                    y: top,
                    width,
                    height,
                });
            });

            // Sort reading order: top (y) then left (x) — small threshold for same line
            structuredLines.sort((a, b) => {
                const rowDiff = a.y - b.y;
                if (Math.abs(rowDiff) > 3) return rowDiff; // different rows
                return a.x - b.x; // same row, left-to-right
            });

            pages.push({ pageNumber, structuredLines, pageSize });
        });

        const result = [];

        for (const p of pages) {
            const pageNumber = p.pageNumber;
            const lines = p.structuredLines;

            for (const searchString of textsArray) {
                const searchLower = normalizeText(searchString).toLowerCase();
                if (!searchLower) continue;

                // sliding window over lines
                for (let i = 0; i < lines.length; i++) {
                    let combined = "";
                    const windowLines = [];

                    // limit the window to a reasonable number of lines to protect performance
                    // (adjust maxWindow if your phrases can be >10 lines)
                    const maxWindow = 10;
                    for (let j = i; j < Math.min(lines.length, i + maxWindow); j++) {
                        if (windowLines.length > 0) combined += " "; // preserve separation
                        combined += lines[j].text;
                        windowLines.push(lines[j]);

                        const combinedNorm = normalizeText(combined);

                        if (combinedNorm.includes(searchLower)) {
                            const matchStart = combinedNorm.indexOf(searchLower);
                            const matchEnd = matchStart + searchLower.length;

                            let cursor = 0;
                            const matchLines = [];
                            const partialBoxes = [];

                            for (let k = 0; k < windowLines.length; k++) {
                                const L = windowLines[k];
                                const textLen = L.text.length;
                                const segStart = cursor;
                                const segEnd = cursor + textLen;

                                const overlapStart = Math.max(matchStart, segStart);
                                const overlapEnd = Math.min(matchEnd, segEnd);

                                if (overlapStart < overlapEnd && textLen > 0) {
                                    matchLines.push(L);

                                    const relStart = overlapStart - segStart;
                                    const relEnd = overlapEnd - segStart;

                                    const fracStart = relStart / textLen;
                                    const fracEnd = relEnd / textLen;

                                    const subX = L.x + fracStart * L.width;
                                    const subW = Math.max(1, (fracEnd - fracStart) * L.width);

                                    partialBoxes.push({
                                        x: subX,
                                        y: L.y,
                                        width: subW,
                                        height: L.height,
                                    });
                                }

                                cursor = segEnd + 1; // account for added space
                            }

                            result.push({
                                page: pageNumber,
                                pageSize: p.pageSize,
                                searchString,
                                lines: matchLines,
                            });

// stop scanning further lines for this search string on this page
                            i = lines.length; // force exit from outer for (i)
                            break;
                        }

                    } // end j window
                } // end i lines
            } // end each searchString
        } // end pages

        res.json(result);
    } catch (err) {
        console.error("PDF structured text extraction error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        try {
            if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
            if (req.file?.path) await fs.remove(req.file.path);
        } catch (e) {
            console.warn("Cleanup failed:", e.message);
        }
    }
});

function normalizeText(s) {
    return (s || "")
        .replace(/\u00A0/g, " ")              // NBSP → space
        .replace(/\s+/g, " ")                 // collapse multiple spaces
        .replace(/[’‘]/g, "'")                // curly → straight apostrophe
        .replace(/[“”]/g, '"')                // curly → straight quotes
        .replace(/'(?=\s)/g, "")              // remove apostrophe before space ("customers' challenging" → "customers challenging")
        .replace(/\s*-\s*/g, "-")             // remove spaces around hyphens
        .replace(/\s*:\s*/g, ":")             // remove spaces around colons
        .replace(/\s*;\s*/g, ";")             // remove spaces around semicolons
        .replace(/\s*,\s*/g, ", ")            // normalize commas
        .replace(/\s*\.\s*/g, ". ")           // normalize periods
        .replace(/\s*\?\s*/g, "?")            // normalize question marks
        .replace(/\s*!\s*/g, "!")             // normalize exclamation marks
        .trim()
        .toLowerCase();
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

