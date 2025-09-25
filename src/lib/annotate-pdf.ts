import { PDFDocument, rgb } from 'pdf-lib'
import {Annotation} from "@/components/pdf/pdf-view";

export async function annotatePdfClient(
    pdfBytes: ArrayBuffer,
    annotations: Annotation[],
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes)

    for (const ann of annotations) {
        const page = pdfDoc.getPage(ann.currentPage - 1)
        if (!page) continue

        const { x, y, width, height } = ann.coordinates

        // Convert top-left coordinates to PDF bottom-left origin
        const yPdfLib = page.getHeight() - y - height

        switch (ann.type) {
            case 'highlight':
                page.drawRectangle({
                    x,
                    y: yPdfLib,
                    width,
                    height,
                    color: rgb(1, 1, 0),
                    opacity: 0.3,
                })
                break
            case 'circle':
                page.drawEllipse({
                    x: x + width / 2,
                    y: yPdfLib + height / 2,
                    xScale: width / 2,
                    yScale: height / 2,
                    borderColor: rgb(1, 0, 0),
                    borderWidth: 2,
                })
                break
        }
    }

    return pdfDoc.save()
}
