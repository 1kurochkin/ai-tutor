import pdfParse from "pdf-parse";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata?: any;
}

export async function extractTextFromPDF(
  file: File,
): Promise<PDFExtractionResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, metadata, numpages: pageCount } = await pdfParse(buffer);

    return {
      text,
      pageCount,
      metadata,
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}
