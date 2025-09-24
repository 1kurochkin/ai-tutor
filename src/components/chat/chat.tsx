'use client'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import askChatHandler from '@/handlers/ask-chat-handler'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Message as MessagePrismaType, MessageRole } from '@prisma/client'
import Message from '@/components/chat/message'
import { useVoiceInput } from '@/hooks/useVoiceInput'

type ChatProps = {
  chatId: string
  className?: string
  messages: Array<Pick<MessagePrismaType, 'content' | 'role' | 'id'>>
}
export type ChatFormValues = { question: string }
const Chat = ({ chatId, className, messages }: ChatProps) => {
  const [localMessages, setLocalMessages] = useState(messages)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, reset } =
    useForm<ChatFormValues>({
      mode: 'onChange',
    })

  const { listening, toggleListening } = useVoiceInput(transcript => {
    setValue('question', transcript)
  })

  const onFormSubmitHandler = async ({ question }: ChatFormValues) => {
    setLoading(true)
    console.log('onFormSubmitHandler', question)
    try {
      const response = await askChatHandler(chatId, question)
      console.log(response, 'response')
      setLocalMessages(prev => [
        ...prev,
        {
          id: Math.random() * 1000 + '',
          role: MessageRole.user,
          content: question,
        },
        {
          id: Math.random() * 1000 + '',
          role: MessageRole.assistant,
          content: response.answer,
        },
      ])
      reset()
    } catch (e) {
      toast((e as Error).message)
    }
    setLoading(false)
  }

  useEffect(() => {
    console.log(localMessages, 'localMessages UPDATED')
  }, [localMessages])
  return (
    <div
      className={`flex flex-col justify-between w-4/12 items-end border-l-2 border-black border-dashed p-4 ${className}`}>
      <div className="flex flex-col gap-4 w-full overflow-scroll h-[88vh] pb-4">
        {localMessages?.map(message => (
          <Message key={message.id} {...message} />
        ))}
      </div>
      <form
        className={'flex gap-2 w-full'}
        onSubmit={handleSubmit(onFormSubmitHandler)}>
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
