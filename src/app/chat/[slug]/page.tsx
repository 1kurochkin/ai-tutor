import React from 'react'
import getChatHandler from '@/handlers/get-chat-handler'
import { File } from '@prisma/client'
import PDFViewer from '@/components/pdf/pdf-view'
import Chat from '@/components/chat/chat'

type ChatIdProps = { params: Promise<{ slug: string }> }

// Server component
export default async function ChatId({ params }: ChatIdProps) {
  const { slug } = await params
  // Fetch chat by slug
  const chat = await getChatHandler(slug)
  const { url } = chat?.file as File

  if (!chat) {
    return <p>Chat not found</p>
  }
  return (
    <div className={'flex'}>
      <PDFViewer className={'h-screen w-8/12 overflow-scroll'} url={url} />
      <Chat messages={chat.messages} chatId={slug} />
    </div>
  )
}
