import pdf from "pdf-parse";
import {PDFPageContent} from "@/lib/pdf/merge-text-images-content";

export interface PDFExtractionResult {
    pageCount: number;
    content: PDFPageContent[];
}

export async function parseTextFromPDF(file: File): Promise<PDFExtractionResult> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const pages: PDFPageContent[] = [];

    const options = {
        pagerender: async (pageData: any) => {
            const textContent = await pageData.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");

            const pageNumber = pages.length + 1;

            pages.push({
                page: pageNumber,
                text: pageText.trim(),
                images: [], // placeholder, to be filled later by AI
            });

            return pageText;
        },
    };

    await pdf(buffer, options);

    return {
        pageCount: pages.length,
        content: pages,
    };
}
