import {Chat} from '@prisma/client'
import {apiFetch} from "@/lib/auth";
import {toast} from "sonner";

export const getChatsHandler = async (): Promise<Chat[]> => {
  console.log('getChatsHandler')
  const res = await apiFetch(`/api/chat/list`)
  const data = await res.json()
  console.log('askChatHandler DATA', data)
  if (!res.ok) {
    toast(data.error || 'Failed to get chats. Please try again later.')
    throw new Error(
        data.error || 'Failed to ask chat. Please try again later.',
    )
  }
  return data
}
