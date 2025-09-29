'use client'

import React, { use, useEffect, useState } from 'react'
import getChatHandler from '@/handlers/get-chat-handler'
import { File, Message, MessageRole } from '@prisma/client'
import Chat, { ChatFormValues } from '@/components/chat/chat'
import askChatHandler from '@/handlers/ask-chat-handler'
import { toast } from 'sonner'
import PdfView, { Annotation } from '@/components/pdf/pdf-view'
import PdfViewControls from '@/components/pdf/pdf-view-controls'
import useAppContext from '@/hooks/useAppContext'
import { Button } from '@/components/ui/button'
import deleteChatHandler from '@/handlers/delete-chat.handler'
import { useRouter } from 'next/navigation'

type ChatIdProps = { params: Promise<{ slug: string }> }

export type MessagesLocalStateType = Array<
  Pick<Message, 'content' | 'role' | 'id' | 'navigation'> & {
    annotations: Annotation[]
  }
>

export default function ChatId({ params }: ChatIdProps) {
  const { slug } = use(params)

  const router = useRouter()
  const [messages, setMessages] = useState<MessagesLocalStateType>([])
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loadingAskChat, setLoadingAskChat] = useState<boolean>(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const { setAppLoading, chats, handleSetChats } = useAppContext()
  const [loadingDeleteChat, setLoadingDeleteChat] =
    useState<boolean>(false)

  const handleShowAnnotations = (annotations: Annotation[]) => {
    console.log('handleShowAnnotations', annotations)
    setAnnotations(annotations)
  }
  const handleDeleteChat = async () => {
    console.log('handleDeleteChat', slug)
    setLoadingDeleteChat(true)
    await deleteChatHandler(slug)
    const filteredChats = chats.filter(chat => chat.id !== slug)
    handleSetChats(filteredChats)
    router.replace('/chat')
    setLoadingDeleteChat(false)
  }

  useEffect(() => {
    ;(async () => {
      setAppLoading('Loading the PDF...')
      try {
        const chat = await getChatHandler(slug)
        if (!chat) {
          toast("This chat doesn't exist!")
          router.replace('/chat')
          return
        }
        const {
          messages: chatMessages,
          file: { url },
        } = chat as unknown as { messages: Message[]; file: File }

        const normalizedMessages: MessagesLocalStateType =
          chatMessages.map(m => ({
            ...m,
            annotations: m.annotations ? JSON.parse(m.annotations) : [],
          }))

        setPdfUrl(url)
        setMessages(normalizedMessages)
      } catch (err) {
        toast((err as Error).message)
      }
    })()
  }, [slug])

  const onFormSubmitHandler = async ({ question }: ChatFormValues) => {
    setLoadingAskChat(true)
    try {
      const {
        answer,
        annotations: newAnnotations,
        navigation,
      } = await askChatHandler(slug, question)

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
        setCurrentPage(navigation)
      }
    } catch (err) {
      toast((err as Error).message)
    } finally {
      setLoadingAskChat(false)
    }
  }

  const onClickNext = () =>
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  const onClickPrev = () => setCurrentPage(prev => Math.max(1, prev - 1))

  return (
    <div className="flex">
      <div className={'w-[68%]'}>
        <div
          className={
            'flex items-center justify-between gap-4 p-4 border-b border-dashed border-black'
          }>
          <PdfViewControls
            disabledNext={currentPage >= totalPages}
            disabledPrev={currentPage <= 1}
            onClickNext={onClickNext}
            onClickPrev={onClickPrev}
            text={`Page ${currentPage} of ${totalPages}`}
          />
          <Button loading={loadingDeleteChat} onClick={handleDeleteChat}>
            Delete chat
          </Button>
        </div>

        <PdfView
          setTotalPages={setTotalPages}
          className="h-screen"
          url={pdfUrl}
          annotations={annotations}
          currentPage={currentPage}
        />
      </div>

      <Chat
        className="w-[32%]"
        loading={loadingAskChat}
        onFormSubmitHandler={onFormSubmitHandler}
        messages={messages}
        setRedirectPage={setCurrentPage}
        showAnnotations={handleShowAnnotations}
      />
    </div>
  )
}
