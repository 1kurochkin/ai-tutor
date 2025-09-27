"use client"
import React, {useEffect, useState} from 'react'
import Sidebar from '@/components/sidebar'
import {getChatsHandler} from '@/handlers/get-chats-handler'
import {Chat} from "@prisma/client";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    const [chats, setChats] = useState<Chat[]>([])
    useEffect(() => {
        (async () => {
            const chats = await getChatsHandler()
            console.log(chats)
            setChats(chats)
        })()
    }, []);

  return (
    <main className="h-screen flex overflow-hidden">
      <Sidebar chats={chats} />
      <div className="flex-1">{children}</div>
    </main>
  )
}
