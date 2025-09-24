'use client'

import React, { use, useEffect, useState } from 'react'
import getChatHandler from '@/handlers/get-chat-handler'
import { Message, MessageRole } from '@prisma/client'
import PDFViewer from '@/components/pdf/pdf-view'
import Chat, { ChatFormValues } from '@/components/chat/chat'
import askChatHandler from '@/handlers/ask-chat-handler'
import { toast } from 'sonner'

type ChatIdProps = { params: Promise<{ slug: string }> }
export type MessagesLocalStateType = Array<
  Pick<Message, 'content' | 'role' | 'id'>
>

export default function ChatId({ params }: ChatIdProps) {
  const { slug } = use(params)

  // Initialize as empty array to avoid undefined issues
  const [messages, setMessages] = useState<MessagesLocalStateType>([])
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingAskChat, setLoadingAskChat] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      try {
        const chat = await getChatHandler(slug)
        setMessages(
          chat?.messages?.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })) || [],
        )
        setPdfUrl(chat?.file?.url || '')
      } catch (err) {
        toast((err as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  const onFormSubmitHandler = async ({ question }: ChatFormValues) => {
    setLoadingAskChat(true)
    try {
      const response = await askChatHandler(slug, question)

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: MessageRole.user,
          content: question,
        },
        {
          id: Math.random().toString(),
          role: MessageRole.assistant,
          content: response.answer,
        },
      ])
    } catch (err) {
      toast((err as Error).message)
    } finally {
      setLoadingAskChat(false)
    }
  }

  return (
    <div className="flex ">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <PDFViewer className="h-screen w-[68%]" url={pdfUrl} />
          <Chat
            className="w-[30%]"
            loading={loadingAskChat}
            onFormSubmitHandler={onFormSubmitHandler}
            messages={messages}
          />
        </>
      )}
    </div>
  )
}
