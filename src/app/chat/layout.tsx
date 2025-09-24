'use server'
import React from 'react'
import Sidebar from '@/components/sidebar'
import { getChatsHandler } from '@/handlers/get-chats-handler'

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const chats = await getChatsHandler()

  return (
    <main className="h-screen flex overflow-hidden">
      <Sidebar chats={chats} />
      <div className="flex-1">{children}</div>
    </main>
  )
}
