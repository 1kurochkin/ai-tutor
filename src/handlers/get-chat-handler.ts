'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const getChatHandler = async (chatId: string) => {
  console.log('getChatHandler', chatId)
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/')
  }

  let payload: { userId: string }
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }
  } catch (err) {
    console.error('Invalid token', err)
    throw new Error('Unauthorized: Invalid token')
  }
  return prisma.chat.findUnique({
    where: { id: chatId, userId: payload.userId },
    include: {
      file: {
        select: {
          id: true,
          originalName: true,
          url: true,
          pageCount: true,
          extractedText: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export default getChatHandler
