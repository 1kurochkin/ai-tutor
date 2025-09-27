'use client'

import dynamic from 'next/dynamic'
import {useCallback, useEffect, useRef, useState} from 'react'
import {toast} from 'sonner'
import PdfViewControls from '@/components/pdf/pdf-view-controls'
import {PDFDocumentProxy, PDFPageProxy} from 'pdfjs-dist'
import {annotatePDF} from "@/lib/pdf/annotate";

const PDFDocument = dynamic(
    () => import('react-pdf').then(mod => ({default: mod.Document})),
    {ssr: false, loading: () => <div className="animate-pulse bg-gray-300 h-96 rounded-md"/>}
)

const PDFPage = dynamic(
    () => import('react-pdf').then(mod => ({default: mod.Page})),
    {ssr: false}
)

// Set PDF.js worker on client
if (typeof window !== 'undefined') {
    import('react-pdf').then(({pdfjs}) => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    })
}

export interface Annotation {
    id: string
    type: 'highlight' | 'circle'
    currentPage: number
    coordinates?: { x: number; y: number; width: number; height: number }
    color?: string
    textReference?: string
}

export interface PDFViewport {
    width: number
    height: number
    scale: number
}

type PdfView2Props = {
    url: string
    className: string
    redirectPage?: number
    annotations?: Annotation[]
}

const PdfView = ({url, className, redirectPage, annotations = []}: PdfView2Props) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
    const [viewport, setViewport] = useState<PDFViewport>({width: 0, height: 0, scale: 1})
    const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
    const [renderPDFUrl, setRenderPDFUrl] = useState(url)
    const containerRef = useRef<HTMLDivElement>(null)
    const lastAnnotationsRef = useRef<string>('')
    // const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [canvasSize, setCanvasSize] = useState<{width: number, height: number} | null>(null)

    // Fetch PDF bytes once
    useEffect(() => {
        let canceled = false
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(bytes => {
                if (!canceled) setPdfBytes(bytes)
            })
            .catch(err => console.error('Failed to fetch PDF', err))
        return () => {
            canceled = true
        }
    }, [url])

    // Apply annotations only once per unique set
    useEffect(() => {
        if (!pdfBytes || !pdf || !annotations.length) return

        const annotationsKey = JSON.stringify(
            annotations.map(a => ({id: a.id, textReference: a.textReference}))
        )
        if (lastAnnotationsRef.current === annotationsKey) return
        lastAnnotationsRef.current = annotationsKey

        const applyAnnotations = async () => {
            console.log("applyAnnotations")
            try {
                // const updatedAnnotations: Annotation[] = []
                //
                // for (const ann of annotations) {
                //     const page = await pdf.getPage(ann.currentPage)
                //
                //     if (page && ann) {
                //         if (ann.type === "highlight") {
                //             const coordinates = await findTextCoordinates(page, ann.textReference!, viewport.scale)
                //             updatedAnnotations.push({...ann, coordinates})
                //         } else {
                //             updatedAnnotations.push(ann)
                //         }
                //
                //     }
                // }
                // console.log("updatedAnnotations", updatedAnnotations)
                // if (!updatedAnnotations.length) return

                const annotatedPdf = await annotatePDF(pdfBytes, annotations, canvasSize!)
                // @ts-ignore
                const blob = new Blob([annotatedPdf], {type: 'application/pdf'})
                const annotatedPDFUrl = URL.createObjectURL(blob)
                console.log("annotatedUrl", annotatedPDFUrl)
                // Revoke old URL if any
                if (renderPDFUrl.startsWith('blob:')) URL.revokeObjectURL(renderPDFUrl)

                setRenderPDFUrl(annotatedPDFUrl)
            } catch (err) {
                console.error('Failed to apply annotations', err)
                toast('Failed to apply annotations!')
            }
        }

        applyAnnotations()
    }, [annotations, pdf, pdfBytes, viewport.scale, renderPDFUrl])

    // Handle page resize
    useEffect(() => {
        const resizeHandler = () => {
            if (!containerRef.current) return
            const width = Math.min(containerRef.current.clientWidth - 40, 800)
            setViewport(prev => ({...prev, width}))
        }
        resizeHandler()
        window.addEventListener('resize', resizeHandler)
        return () => window.removeEventListener('resize', resizeHandler)
    }, [])

    // Redirect from AI response
    useEffect(() => {
        if (redirectPage) setCurrentPage(redirectPage)
    }, [redirectPage])

    const handleDocumentLoad = useCallback((pdf: PDFDocumentProxy) => {
        setTotalPages(pdf.numPages)
        setPdf(pdf)
    }, [])

    const handleDocumentLoadError = (err: Error) => {
        console.error('PDF load failed:', err)
        toast('Error loading PDF!')
    }

    const handlePageRender = useCallback((page: PDFPageProxy) => {
        const viewportObj = page.getViewport({ scale: 1 })
        const containerWidth = containerRef.current?.clientWidth || 800
        const scale = containerWidth / viewportObj.width

        const canvas = document.querySelector<HTMLCanvasElement>(
            `.react-pdf__Page__canvas`
        )
        if (canvas) {
            setCanvasSize({
                width: canvas.offsetWidth,
                height: canvas.offsetHeight,
            })
        }
        setViewport({
            width: viewportObj.width * scale,
            height: viewportObj.height * scale,
            scale
        })
    }, [])

    const onClickNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))
    const onClickPrev = () => setCurrentPage(prev => Math.max(1, prev - 1))

    return (
        <div ref={containerRef} className={`relative flex flex-col bg-gray-50 ${className}`}>
            <PdfViewControls
                disabledNext={currentPage >= totalPages}
                disabledPrev={currentPage <= 1}
                onClickNext={onClickNext}
                onClickPrev={onClickPrev}
                text={`Page ${currentPage} of ${totalPages}`}
            />
            <div className="overflow-auto">
                <PDFDocument
                    file={renderPDFUrl}
                    // @ts-ignore
                    onLoadSuccess={handleDocumentLoad}
                    onLoadError={handleDocumentLoadError}
                    className="shadow-md"
                >
                    <PDFPage
                        // canvasRef={pdfCanvasRef}
                        pageNumber={currentPage}
                        width={viewport.width}
                        // @ts-ignore
                        onRenderSuccess={handlePageRender}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </PDFDocument>
            </div>
        </div>
    )
}

export default PdfView
