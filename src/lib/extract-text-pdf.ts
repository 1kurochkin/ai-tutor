import pdf from 'pdf-parse'

export interface PDFExtractionResult {
  text: string
  pageCount: number
  metadata?: any
}

export async function extractTextFromPDF(
  file: File,
): Promise<PDFExtractionResult> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const pages: string[] = []

  // Custom page renderer
  const options = {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      pages.push(
        `Here starts page ${pages.length + 1} content: "` +
          pageText.trim() +
          `/"`,
      )
      return pageText
    },
  }

  await pdf(buffer, options)

  return {
    text: pages.join(''),
    pageCount: pages.length,
  }
}
