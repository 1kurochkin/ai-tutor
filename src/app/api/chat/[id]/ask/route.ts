import { prisma } from '@/lib/prisma'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { MessageRole } from '@prisma/client'
import { parseChatAIResponse } from '@/lib/ai'
import { getUserFromToken } from '@/lib/auth'

export interface ImagesCoordinatesResponse {
  page: number
  pageSize: {
    width: number
    height: number
  }
  x: number
  y: number
  width: number
  height: number
  base64: string
}

export type TextsCoordinatesResponse = Array<{
  page: number
  searchString: string
  pageSize: {
    width: number
    height: number
  }
  lines: Array<{
    text: string
    x: number
    y: number
    width: number
    height: number
  }>
}>

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

  const systemPrompt = `
You are an AI assistant that answers questions about a PDF document.  
You receive structured content for each page, including both text and image descriptions.

## Your Task
Always return two parts in your response:
1. A natural language answer to the user’s question.  
2. At least one annotation command in the required format, whenever relevant text or visuals exist.

## Annotation Commands
- [NAVIGATE:page_number]
- [HIGHLIGHT:page_number:exact_text]
- [CIRCLE:page_number:x:y:width:height:page_width:page_height]

### Annotation Rules
1. Always use **normalized text extracted from the PDF** for highlights:
   - Collapse multiple spaces into a single space.  
   - Remove stray spaces before/after punctuation (e.g. \`"Self - Awareness :" → "Self-Awareness:"\`).  
   - Keep case exactly as in the PDF.  
2. Highlights must match **contiguous text spans** from the normalized PDF (no paraphrasing).  
3. Keep highlight selections concise (1–20 words).  
4. Always include **[NAVIGATE:page_number]** when you use HIGHLIGHT or CIRCLE.  
5. For images:
   - Use the provided **description field** to understand what the image contains.  
   - When relevant, annotate the image using [CIRCLE:page_number:x:y:width:height:page_width:page_height].  

## Response Rules
1. Responses must include BOTH a natural language answer + annotation(s).  
   - If relevant text exists → use HIGHLIGHT.  
   - If relevant image exists (based on its description) → use CIRCLE.  
   - If nothing relevant exists → say so explicitly.  
2. Annotations must be in the strict command format (no extra words inside brackets).  
3. You can include multiple annotations in one response.

## Example
User: "What is a virus?"  

Assistant:  
"A virus is a microscopic infectious agent that replicates inside living hosts.  
[NAVIGATE:23] [HIGHLIGHT:23:infectious agent that replicates]  
You can also see this illustrated in the diagram.  
[CIRCLE:23:300:400:200:600:900"]"
`

  // Build messages array for OpenAI
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'assistant',
      // content: `PDF content:\n\n${chat.file.extractedText}`,
      content: `PDF content:\n\n${chat.file.content}`,
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
      model: openai('gpt-4o'),
      messages,
      maxOutputTokens: 500,
    })

    console.log('Raw AI response:', response.text)

    // Parse the response to extract annotations and clean text
    const { cleanText, annotations, highlightedText, navigation } =
      parseChatAIResponse(response.text)

    // Get exact coords of the highlighted text if any
    console.log('Get exact coords of the highlighted text if any')
    if (highlightedText.length) {
      const pdfFile = await fetch(chat.file.url).then(res => res.blob())
      const formData = new FormData()
      // @ts-ignore
      formData.append('file', pdfFile)
      formData.append('texts', JSON.stringify(highlightedText))
      const textsMatches: TextsCoordinatesResponse = await fetch(
        process.env.PDF_EXTRACTOR_URL! + '/texts-coords',
        {
          method: 'POST',
          body: formData,
        },
      ).then(res => res.json())
      console.log(JSON.stringify(textsMatches), 'textsCoordsResponse')
      for (const { page, pageSize, lines } of textsMatches) {
        const highlightsAnnotations = lines.map(
          ({ text, ...coordinates }) => ({
            id: `highlight-${Date.now()}-${Math.random()}`,
            type: 'highlight' as 'highlight',
            currentPage: page,
            pageSize,
            coordinates,
            textReference: text,
          }),
        )
        annotations.push(...highlightsAnnotations)
      }
      console.log(annotations, 'UPDATED ANNOTATIONS')
    }

    // Save new message with clean text
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
        content: cleanText,
        annotations: JSON.stringify(annotations),
        navigation,
      },
    })

    console.log('Parsed response:', cleanText, navigation, annotations)

    return NextResponse.json({
      answer: cleanText,
      annotations,
      navigation,
    })
  } catch (e) {
    console.error('Error generating response:', e)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 },
    )
  }
}
