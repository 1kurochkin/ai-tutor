'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'

type PdfUploadProps = {
  loading?: boolean
  onFileUpload: (file: File) => void
}

export default function PdfUpload({
  onFileUpload,
  loading,
}: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = () => {
    if (!file) return
    onFileUpload(file)
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="w-full max-w-md border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Click to select a PDF
            </p>
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="w-full mt-2">
              {loading ? 'Uploading...' : `Upload ${file.name}`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
