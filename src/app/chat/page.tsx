'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import createChatHandler from '@/handlers/create-chat-handler'
import PdfUpload from '@/components/pdf/pdf-upload'

export default function Chat() {
  const [fileUploadLoading, setFileUploadLoading] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    setFileUploadLoading(true)
    try {
      const data = await createChatHandler(file)
      console.log(data, 'handleFileUpload')
      router.refresh()
      setTimeout(() => {
        router.push(`/chat/${data.chatId}`)
      }, 300)
    } catch (e) {
      toast((e as Error).message)
    }
    setFileUploadLoading(false)
  }

  return (
    <PdfUpload
      loading={fileUploadLoading}
      onFileUpload={handleFileUpload}
    />
  )
}
