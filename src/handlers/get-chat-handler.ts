"use client"
import {apiFetch} from "@/lib/auth";
import {toast} from "sonner";

const getChatHandler = async (chatId: string) => {
    console.log('getChatHandler')
    const res = await apiFetch(`/api/chat/${chatId}`)
    const data = await res.json()
    console.log('getChatHandler DATA', data)
    if (!res.ok) {
        toast(data.error || 'Failed to get chat. Please try again later.')
        throw new Error(
            data.error || 'Failed to get chat. Please try again later.',
        )
    }
    return data
}

export default getChatHandler
