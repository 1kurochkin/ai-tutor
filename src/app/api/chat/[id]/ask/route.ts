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

  const systemPrompt = `You are an AI assistant that answers questions about a PDF and can highlight relevant content.

When responding, you can include special annotation commands in your response using this format:
[NAVIGATE:page_number:reason]
[HIGHLIGHT:page_number:exact_text:context_before:context_after:color:description]
[CIRCLE:page_number:exact_text:context_before:context_after:description]
[UNDERLINE:page_number:exact_text:context_before:context_after:description]

Rules for annotations:
1. Use exact text from the PDF (case-sensitive)
2. Include 2-5 words before and after for context (helps with disambiguation)
3. Colors for highlights: yellow, red, blue, green, orange
4. Keep text selections concise (1-20 words)
5. Always reference page numbers when citing information

Example response:
"A virus is a microscopic infectious agent. [NAVIGATE:23:explaining virus definition] [HIGHLIGHT:23:infectious agent that replicates:is a:only inside:yellow:main definition] You can see this clearly illustrated in the diagram. [CIRCLE:23:virus structure diagram:see the:on page:diagram showing virus components]"

Answer the user's question while incorporating relevant annotations to guide them to the important content.`

  // Build messages array for OpenAI
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
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

  try {
    // Send to OpenAI
    const response = await generateText({
      model: openai('gpt-4o-mini'),
      messages,
      maxOutputTokens: 500,
    })

    console.log('Raw AI response:', response.text)

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
    return NextResponse.json({
      answer: response.text,
      // annotations: parsedResponse.annotations,
      // navigation: parsedResponse.navigation,
    })
  } catch (e) {
    console.error('Error generating response:', e)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 },
    )
  }
}
