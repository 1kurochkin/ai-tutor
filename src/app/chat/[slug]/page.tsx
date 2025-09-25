'use client'

import React, {use, useEffect, useState} from 'react'
import getChatHandler from '@/handlers/get-chat-handler'
import {File, Message, MessageRole} from '@prisma/client'
import Chat, {ChatFormValues} from '@/components/chat/chat'
import askChatHandler from '@/handlers/ask-chat-handler'
import {toast} from 'sonner'
import FullScreenPreloader from '@/components/full-screen-preloader'
import PdfView, {Annotation} from "@/components/pdf/pdf-view";

type ChatIdProps = { params: Promise<{ slug: string }> }

export type MessagesLocalStateType = Array<
    Pick<Message, 'content' | 'role' | 'id' | 'navigation'> & {
  annotations: Annotation[]
}
>

export default function ChatId({ params }: ChatIdProps) {
  const { slug } = use(params)

  const [messages, setMessages] = useState<MessagesLocalStateType>([])
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingAskChat, setLoadingAskChat] = useState<boolean>(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [redirectPage, setRedirectPage] = useState<number>()

  const handleShowAnnotations = (annotations: Annotation[]) => {
    console.log("handleShowAnnotations", annotations)
    setAnnotations(annotations)
  }

  useEffect(() => {
    ;(async () => {
      try {
        const chat = await getChatHandler(slug)
        const {
          messages: chatMessages,
          file: { url },
        } = chat as unknown as { messages: Message[]; file: File }

        const normalizedMessages: MessagesLocalStateType = chatMessages.map(m => ({
          ...m,
          annotations: m.annotations ? JSON.parse(m.annotations) : [],
        }))

        setPdfUrl(url)
        setMessages(normalizedMessages)
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
      const { answer, annotations: newAnnotations, navigation } =
          await askChatHandler(slug, question)

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: MessageRole.user,
          content: question,
          annotations: [],
          navigation: null,
        },
        {
          id: Math.random().toString(),
          role: MessageRole.assistant,
          content: answer,
          annotations: newAnnotations || [],
          navigation: navigation ?? null,
        },
      ])

      if (newAnnotations) setAnnotations(newAnnotations)
      if (navigation) {
        setRedirectPage(navigation)
        setTimeout(() => setRedirectPage(undefined), 2000)
      }
    } catch (err) {
      toast((err as Error).message)
    } finally {
      setLoadingAskChat(false)
    }
  }

  if (loading) return <FullScreenPreloader />

  return (
      <div className="flex">
        <PdfView
            className="h-screen w-[68%]"
            url={pdfUrl}
            annotations={annotations}
            redirectPage={redirectPage}
        />
        <Chat
            className="w-[30%]"
            loading={loadingAskChat}
            onFormSubmitHandler={onFormSubmitHandler}
            messages={messages}
            setRedirectPage={setRedirectPage}
            showAnnotations={handleShowAnnotations}
        />
      </div>
  )
}
