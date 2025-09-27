import {Annotation} from "@/components/pdf/pdf-view";
import {PDFDocument as PDFLibDocument, rgb} from "pdf-lib/cjs/api";

export async function annotatePDF(
    pdfBytes: ArrayBuffer,
    annotations: Annotation[],
): Promise<Uint8Array> {
    const pdfDoc = await PDFLibDocument.load(pdfBytes)

    for (const ann of annotations) {
        const page = pdfDoc.getPage(ann.currentPage - 1)
        if (!page) continue

        const { x, y, width, height } = ann.coordinates!
        const scaleX = page.getWidth() / ann.pageSize.width
        const scaleY = page.getHeight() / ann.pageSize.height

        const pdfX = x * scaleX
        const pdfY = (ann.pageSize.height - y - height) * scaleY
        const pdfWidth = width * scaleX
        const pdfHeight = height * scaleY

        switch (ann.type) {
            case 'highlight':
                page.drawRectangle({
                    x: pdfX,
                    y: pdfY,
                    width: pdfWidth,
                    height: pdfHeight,
                    color: rgb(1, 1, 0),
                    opacity: 0.3,
                })
                break
            case 'circle':
                page.drawEllipse({
                    x: pdfX + pdfWidth / 2,
                    y: pdfY + pdfHeight / 2,
                    xScale: pdfWidth / 2,
                    yScale: pdfHeight / 2,
                    borderColor: rgb(1, 0, 0),
                    borderWidth: 2,
                })
                break
        }
    }

    return pdfDoc.save()
}
