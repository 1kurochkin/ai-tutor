import express from "express";
import multer from "multer";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { XMLParser } from "fast-xml-parser";

const execAsync = promisify(exec);
const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/extract", upload.single("file"), async (req, res) => {
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

        const parser = new XMLParser({ ignoreAttributes: false });
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

        res.json({ images });
    } catch (err) {
        console.error("PDF image extraction error:", err);
        res.status(500).json({ error: err.message });
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

app.listen(3000, () => console.log("Server running on port 3000"));
