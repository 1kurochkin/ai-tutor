"use client"
import React, {useEffect, useState} from 'react'
import Sidebar from '@/components/sidebar'
import {getChatsHandler} from '@/handlers/get-chats-handler'
import {Chat} from "@prisma/client";
import {usePathname} from "next/navigation";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    const [chats, setChats] = useState<Chat[]>([])
    const pathname = usePathname();

    useEffect(() => {
        (async () => {
            const chats = await getChatsHandler()
            console.log(chats)
            setChats(chats)
        })()
    }, [pathname]);

  return (
    <main className="h-screen flex overflow-hidden">
      <Sidebar chats={chats} />
      <div className="flex-1">{children}</div>
    </main>
  )
}
