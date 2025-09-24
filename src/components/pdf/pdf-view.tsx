'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const PDFDocument = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Document })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-300 h-96 rounded-md"></div>
    ),
  },
)

const PDFPage = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Page })),
  { ssr: false },
)

// Set PDF.js worker on client
if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs }) => {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  })
}

interface Annotation {
  id: string
  type: 'highlight' | 'circle' | 'underline'
  coordinates?: { x: number; y: number; width: number; height: number }
  text?: string
  color: string
}

interface PDFViewerProps {
  url: string
  annotations?: Annotation[]
  onLoadSuccess?: (pdf: PDFDocumentProxy) => void
  className?: string
}

export default function PDFViewer({
  url,
  annotations,
  className,
  onLoadSuccess,
}: PDFViewerProps) {
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState({ width: 800, height: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  // Mount check
  useEffect(() => setIsMounted(true), [])

  // Track container width
  useEffect(() => {
    const resizeHandler = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.clientWidth - 40, 800)
        setPageSize(prev => ({ ...prev, width }))
      }
    }
    resizeHandler()
    window.addEventListener('resize', resizeHandler)
    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  const handleDocumentLoad = (pdf: PDFDocumentProxy) => {
    setTotalPages(pdf.numPages)
    setLoading(false)
    onLoadSuccess?.(pdf)
  }

  const handleDocumentError = (err: Error) => {
    console.error('PDF load failed:', err)
    setErrorMsg('Unable to load PDF. Try again.')
    setLoading(false)
  }

  const handlePageRender = (page: {
    getViewport: (opts: { scale: number }) => {
      width: number
      height: number
    }
  }) => {
    const viewport = page.getViewport({ scale: 1 })
    setPageSize({
      width: pageSize.width,
      height: (viewport.height / viewport.width) * pageSize.width,
    })
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex items-center justify-center p-4 text-gray-500">
          Loading PDF viewer...
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse bg-gray-300 h-96 w-full max-w-3xl rounded-md"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <Button
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1 || loading}>
          Prev
        </Button>
        <span>
          {loading ? 'Loading...' : `Page ${pageNumber} of ${totalPages}`}
        </span>
        <Button
          onClick={() =>
            setPageNumber(Math.min(totalPages, pageNumber + 1))
          }
          disabled={pageNumber >= totalPages || loading}>
          Next
        </Button>
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center p-4">
        {errorMsg ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-600">{errorMsg}</p>
            <Button
              onClick={() => {
                setErrorMsg('')
                setLoading(true)
              }}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="relative">
            <PDFDocument
              file={url}
              onLoadSuccess={handleDocumentLoad}
              onLoadError={handleDocumentError}
              className="shadow-md"
              loading={
                <Loader2 className="animate-spin w-8 h-8 text-blue-500 mx-auto" />
              }>
              <PDFPage
                pageNumber={pageNumber}
                width={pageSize.width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={handlePageRender}
                loading={
                  <Loader2 className="animate-spin w-8 h-8 text-blue-500 mx-auto" />
                }
              />
            </PDFDocument>
          </div>
        )}
      </div>
    </div>
  )
}
