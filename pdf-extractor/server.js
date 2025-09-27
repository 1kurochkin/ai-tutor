import express from "express";
import multer from "multer";
import fs from "fs-extra";
import os from "os";
import path from "path";
import {exec} from "child_process";
import {promisify} from "util";
import {XMLParser} from "fast-xml-parser";

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
    const { texts } = req.body; // array of texts to find
    console.log(texts, "texts")
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

        const parser = new XMLParser({ ignoreAttributes: false });
        const json = parser.parse(xml);

        const pages = Array.isArray(json.pdf2xml?.page)
            ? json.pdf2xml.page
            : json.pdf2xml?.page
                ? [json.pdf2xml.page]
                : [];

        const result = [];

        for (const p of pages) {
            const pageNumber = parseInt(p["@_number"], 10) || 1;
            const lines = Array.isArray(p.text)
                ? p.text
                : p.text
                    ? [p.text]
                    : [];

            // Convert XML text nodes into structured array
            const structuredLines = []
            for (const l of lines) {
                if (!l["#text"] || Number.isInteger(l["#text"])) continue;
                const lineText = l["#text"]?.trim();  // <-- safely get text and trim
                structuredLines.push({
                    text: lineText,
                    x: parseFloat(l["@_left"]) || 0,
                    y: parseFloat(l["@_top"]) || 0,
                    width: parseFloat(l["@_width"]) || 0,
                    height: parseFloat(l["@_height"]) || 0,
                });
            }

            for (const searchString of textsArray) {
                let searchLower = searchString.toLowerCase();

                // slide over lines
                for (let i = 0; i < structuredLines.length; i++) {
                    let combinedText = "";
                    let j = i;
                    const linesToReturn = [];

                    while (j < structuredLines.length && combinedText.length < searchLower.length) {
                        combinedText += structuredLines[j].text + " ";
                        linesToReturn.push(structuredLines[j]);
                        j++;
                    }

                    if (combinedText.toLowerCase().includes(searchLower)) {
                        // Match found: return each line with coordinates
                        result.push({
                            page: pageNumber,
                            searchString,
                            lines: linesToReturn
                        });
                        i = j - 1; // skip lines already matched
                        break; // move to next searchText
                    }
                }
            }
        }

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

app.listen(3001, () => console.log("Server running on port 3001"));
