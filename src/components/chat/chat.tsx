'use client'
import React, {useEffect, useRef} from 'react'
import {useForm} from 'react-hook-form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import Message from '@/components/chat/message'
import {useVoiceInput} from '@/hooks/useVoiceInput'
import {MessagesLocalStateType} from "@/app/chat/[slug]/page";
import {Annotation} from "@/components/pdf/pdf-view";

export type ChatProps = {
  className?: string
  messages: MessagesLocalStateType
  loading: boolean
  onFormSubmitHandler: (data: ChatFormValues) => Promise<void>
  setRedirectPage: (redirectPage: number) => void
  showAnnotations: (annotations: Annotation[]) => void
}
export type ChatFormValues = { question: string }
const Chat = ({
  onFormSubmitHandler,
  className,
  messages,
  loading,
  setRedirectPage,
  showAnnotations,
}: ChatProps) => {
  const { register, handleSubmit, setValue, reset } =
    useForm<ChatFormValues>({
      mode: 'onChange',
    })
  const { listening, toggleListening } = useVoiceInput(transcript => {
    setValue('question', transcript)
  })
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  const submitHandler = async (data: ChatFormValues) => {
    await onFormSubmitHandler(data)
    reset()
  }

  return (
    <div
      className={`flex flex-col justify-between items-end border-l-2 border-black border-dashed p-4 ${className}`}>
      <div
        ref={containerRef}
        className="flex flex-col gap-4 overflow-scroll h-[88vh] pb-4">
        {messages?.map(message => (
          <Message
            setRedirectPage={
              message.navigation
                ? () => setRedirectPage(message.navigation!)
                : undefined
            }
            showAnnotations={
              message?.annotations?.length
                ? () => {
                    showAnnotations(message.annotations!)
                    setRedirectPage(message.navigation!)
                  }
                : undefined
            }
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
      </div>
      <form
        className={'flex gap-2'}
        onSubmit={handleSubmit(submitHandler)}>
        <Input
          className={'resize-none'}
          disabled={loading}
          {...register('question')}
          placeholder={'Ask anything'}
        />
        <Button
          type="button"
          onClick={toggleListening}
          variant={listening ? 'destructive' : 'default'}>
          {listening ? '🎤 Listening...' : '🎤'}
        </Button>
        <Button loading={loading}>Send</Button>
      </form>
    </div>
  )
}

export default Chat
