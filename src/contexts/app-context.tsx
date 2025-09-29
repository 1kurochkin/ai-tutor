'use client'
import { createContext, useMemo, useState } from 'react'
import { Chat } from '@prisma/client'

interface AppContextProps {
  email: string
  setEmail: (email: string) => void
  handleSetChats: (chats: Chat[] | Chat) => void
  chats: Chat[]
  appLoading: string
  setAppLoading: (loadingMessage: string) => void
}

const AppContext = createContext<AppContextProps | null>(null)

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState<string>('')
  const [chats, setChats] = useState<Chat[]>([])
  const [appLoading, setAppLoading] = useState<string>(
    'Loading the app...',
  )
  const handleSetChats = (chats: Chat[] | Chat) => {
    setChats(Array.isArray(chats) ? chats : prev => [...prev, chats])
  }

  const contextValue = useMemo<AppContextProps>(
    () => ({
      email,
      setEmail,
      chats,
      handleSetChats,
      appLoading,
      setAppLoading,
    }),
    [email, chats, setEmail, handleSetChats],
  )

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContextProvider, AppContext }
