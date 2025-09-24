import { prisma } from '@/lib/prisma'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/get-user-from-token'
import { generateText } from 'ai'
import { MessageRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  console.log('CHAT ASK ROUTE API')
  // Check authentication
  const token = req.cookies.get('token')?.value
  console.log(token, 'TOKEN')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  const { question, chatId } = await req.json()
  console.log(chatId, 'chatId')
  console.log(question, 'question')
  if (!question)
    return NextResponse.json(
      { error: 'Missing question' },
      { status: 400 },
    )

  // Get PDF text and previous messages
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      file: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { role: true, content: true },
      },
    },
  })
  if (!chat)
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  console.log(chat, 'Chat History')
  // Build messages array for OpenAI
  const messages = [
    {
      role: 'system',
      content:
        'You are an AI assistant that answers questions about a PDF.',
    },
    {
      role: 'assistant',
      content: `PDF content:\n\n${chat.file.extractedText}`,
    },
    ...chat.messages,
    { role: 'user', content: question },
  ] as {
    role: 'user' | 'assistant'
    content: string
  }[]

  // Send to OpenAI
  const response = await generateText({
    model: openai('gpt-4o-mini'),
    messages,
    maxOutputTokens: 500,
  })

  console.log(response.text, 'OpenAI answer')
  // const response = {
  //   text: 'hello' + Math.random() * 1000,
  // }

  // Save new message
  await prisma.message.create({
    data: {
      chatId,
      role: MessageRole.user,
      content: question,
    },
  })
  await prisma.message.create({
    data: {
      chatId,
      role: MessageRole.assistant,
      content: response.text,
    },
  })
  console.log('FINISH')
  return NextResponse.json({ answer: response.text })
}
