'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Chat } from '@prisma/client'
import { MenuIcon } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar(props: {
  email: string
  chats: Partial<Chat>[]
  activeChatId: string
  logout: () => void
}) {
  const { email, chats, activeChatId, logout } = props
  console.log(JSON.stringify(props), 'Sidebar')
  const [isOpen, setIsOpen] = useState(true)
  const handleToggleSidebar = () => {
    console.log('handleToggleSidebar')
    setIsOpen(prev => !prev)
  }

  return (
    <div
      className={`${!isOpen ? 'w-20' : 'w-65'} bg-black text-white flex flex-col transition-all duration-300 p-4 gap-4`}>
      <div className={'flex justify-between items-center'}>
        {isOpen && (
          <Button asChild variant="outline">
            <Link href="/chat">New Chat</Link>
          </Button>
        )}
        <Button onClick={handleToggleSidebar} variant={'outline'}>
          <MenuIcon className={'text-black'} />
        </Button>
      </div>

      {isOpen && (
        <>
          <div className="mt-8 overflow-y-auto h-full flex flex-col gap-2">
            <span>Chats</span>
            {chats.map(chat => (
              <Button
                asChild
                key={chat.id}
                className={`hover:bg-white hover:text-black ${activeChatId === chat.id && 'cursor-default text-black bg-white hover:bg-white'}`}>
                <Link href={`/chat/${chat.id}`}>
                  {chat.title || 'Untitled Chat'}
                </Link>
              </Button>
            ))}
          </div>

          <span className={'text-xs text-center'}>{email}</span>

          <Button
            onClick={logout}
            className={'w-full'}
            type="submit"
            variant="outline">
            Logout
          </Button>
        </>
      )}
    </div>
  )
}
