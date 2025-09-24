'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Chat } from '@prisma/client'
import { usePathname } from 'next/navigation'
import { MenuIcon } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ chats }: { chats: Partial<Chat>[] }) {
  console.log(chats, 'Sidebar')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const handleToggleSidebar = () => {
    console.log('handleToggleSidebar')
    setIsOpen(prev => !prev)
  }
  return (
    <div
      className={`${!isOpen ? 'w-20' : 'w-64'} bg-black text-white flex flex-col transition-all duration-300 p-4 gap-4`}>
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
            {chats.length === 0 ? (
              <span>Chats</span>
            ) : (
              chats.map(chat => (
                <Button
                  asChild
                  key={chat.id}
                  className={
                    pathname.includes(chat.id || '') ? 'bg-gray-700' : ''
                  }>
                  <Link href={`/chat/${chat.id}`}>
                    {chat.title || 'Untitled Chat'}
                  </Link>
                </Button>
              ))
            )}
          </div>

          <form
            action="http://localhost:3000/api/auth/logout"
            method="post">
            <Button className={'w-full'} type="submit" variant="outline">
              Logout
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
