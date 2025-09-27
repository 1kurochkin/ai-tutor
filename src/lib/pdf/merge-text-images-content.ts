import {ImagesCoordinatesResponse} from "@/app/api/chat/[id]/ask/route";
import {PDFExtractionResult} from "@/lib/pdf/parse-text";

export interface PDFPageContent {
    page: number;
    text: string;
    images: Omit<ImagesCoordinatesResponse, "page" | "base64">[];
}

export function mergeTextImagesConent(
    pdfParsed: PDFExtractionResult,
    images: ImagesCoordinatesResponse[]
): PDFExtractionResult {
    // Group images by page
    const grouped = groupByPage(images)

    // Insert images into the corresponding page
    for (const [page, imgs] of grouped.entries()) {
        const pageContent = pdfParsed.content.find((p) => p.page === page)
        if (pageContent) {
            // Strip "page" before pushing
            const cleaned = imgs.map(({page, ...restImg}) => ({
                ...restImg
            }))
            pageContent.images.push(...cleaned)
        }
    }

    return pdfParsed
}

function groupByPage(images: ImagesCoordinatesResponse[]): Map<number, ImagesCoordinatesResponse[]> {
    const map = new Map<number, ImagesCoordinatesResponse[]>()
    for (const img of images) {
        if (!map.has(img.page)) map.set(img.page, [])
        map.get(img.page)!.push(img)
    }
    return map
}
