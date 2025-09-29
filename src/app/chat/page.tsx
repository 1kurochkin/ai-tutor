'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import createChatHandler from '@/handlers/create-chat-handler'
import PdfUpload from '@/components/pdf/pdf-upload'
import useAppContext from '@/hooks/useAppContext'

export default function Chat() {
  const router = useRouter()
  const { handleSetChats, setAppLoading } = useAppContext()

  const handleFileUpload = async (file: File) => {
    setAppLoading('AI analyzing uploaded PDF...')
    try {
      const chat = await createChatHandler(file)
      handleSetChats(chat)
      console.log(chat, 'handleFileUpload')
      router.push(`/chat/${chat.id}`)
    } catch (e) {
      toast((e as Error).message)
    }
  }

  return <PdfUpload onFileUpload={handleFileUpload} />
}
