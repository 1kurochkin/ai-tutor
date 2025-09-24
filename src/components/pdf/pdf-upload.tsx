'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <div className={'flex flex-col gap-2'}>
        <Input
          type="file"
          accept="application/pdf"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="cursor-pointer"
        />
        <Button onClick={handleUpload} disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload PDF & Create Chat'}
        </Button>
      </div>
    </div>
  )
}
