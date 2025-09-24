'use client'

import { toast } from 'sonner'

const askChatHandler = async (
  chatId: string,
  question: string,
): Promise<{ answer: string }> => {
  console.log('askChatHandler', chatId, question)
  const res = await fetch(`http://localhost:3000/api/chat/${chatId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, chatId }),
  })
  const data = await res.json()
  console.log('askChatHandler DATA', data)
  if (!res.ok) {
    toast(data.error || 'Failed to ask chat. Please try again later.')
    throw new Error(
      data.error || 'Failed to ask chat. Please try again later.',
    )
  }
  return data
}

export default askChatHandler
