'use client'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/auth'

const deleteChatHandler = async (chatId: string) => {
  console.log('deleteChatHandler', chatId)
  const response = await apiFetch('/api/chat/delete', {
    method: 'DELETE',
    body: JSON.stringify({ chatId }),
  })
  const data = await response.json()
  toast('Chat has been deleted!')
  console.log('deleteChatHandler DATA', data)
  if (!response.ok) {
    toast(
      data.error || 'Failed to delete the chat. Please try again later.',
    )
  }
  return data
}

export default deleteChatHandler
