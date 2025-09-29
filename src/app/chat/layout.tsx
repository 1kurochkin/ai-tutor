'use client'
import React, { useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { getChatsHandler } from '@/handlers/get-chats-handler'
import { usePathname, useRouter } from 'next/navigation'
import { logoutHandler } from '@/handlers/logout.handler'
import useAppContext from '@/hooks/useAppContext'
import getUserHandler from '@/handlers/get-user.handler'
import FullScreenPreloader from '@/components/full-screen-preloader'

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {
    email,
    setEmail,
    chats,
    handleSetChats,
    appLoading,
    setAppLoading,
  } = useAppContext()
  const pathname = usePathname()

  const router = useRouter()
  const parts = pathname.split('/')
  const activeChatId = parts[2]
  const handleLogout = async () => {
    setAppLoading('Logging out')
    await logoutHandler()
    router.replace('/home')
    setAppLoading('')
  }
  console.log(appLoading, 'appLoading')
  useEffect(() => {
    ;(async () => {
      const chats = await getChatsHandler()
      console.log(chats)
      const { email } = await getUserHandler()
      setEmail(email)
      handleSetChats(chats)
      setAppLoading('')
    })()
    return () => setAppLoading('Loading the app..')
  }, [])

  return (
    <main className="h-screen flex overflow-hidden">
      {appLoading && <FullScreenPreloader message={appLoading} />}
      <Sidebar
        email={email}
        activeChatId={activeChatId}
        logout={handleLogout}
        chats={chats}
      />
      <div className="flex-1">{children}</div>
    </main>
  )
}
