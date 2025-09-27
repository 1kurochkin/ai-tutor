'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import createChatHandler from '@/handlers/create-chat-handler'
import PdfUpload from '@/components/pdf/pdf-upload'
import FullScreenPreloader from "@/components/full-screen-preloader";

export default function Chat() {
  const [fileUploadLoading, setFileUploadLoading] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    setFileUploadLoading(true)
    try {
      const data = await createChatHandler(file)
      console.log(data, 'handleFileUpload')
      setTimeout(() => {
        router.push(`/chat/${data.chatId}`)
      }, 300)
    } catch (e) {
      toast((e as Error).message)
    }
    setFileUploadLoading(false)
  }

  if(fileUploadLoading) {
    return (
        <div className={"h-full flex flex-col justify-center items-center"}>
          <div>
            <span>AI analyzing your PDF...</span>
            <FullScreenPreloader className={'relative'}/>
          </div>
        </div>
    )
  }
  return (
      <PdfUpload
          loading={fileUploadLoading}
          onFileUpload={handleFileUpload}
        />
  )
}
