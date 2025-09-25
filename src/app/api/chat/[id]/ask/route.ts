import {prisma} from '@/lib/prisma'
import {openai} from '@ai-sdk/openai'
import {NextRequest, NextResponse} from 'next/server'
import {getUserFromToken} from '@/lib/get-user-from-token'
import {generateText} from 'ai'
import {MessageRole} from '@prisma/client'
import {parseAIResponse} from '@/lib/parse-ai-response'

export async function POST(req: NextRequest) {
    console.log('CHAT ASK ROUTE API')
    // Check authentication
    const token = req.cookies.get('token')?.value
    console.log(token, 'TOKEN')
    if (!token) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }
    const user = await getUserFromToken(token)
    if (!user) {
        return NextResponse.json({error: 'Invalid token'}, {status: 401})
    }
    const {question, chatId} = await req.json()
    console.log(chatId, 'chatId')
    console.log(question, 'question')
    if (!question)
        return NextResponse.json(
            {error: 'Missing question'},
            {status: 400},
        )

    // Get PDF text and previous messages
    const chat = await prisma.chat.findUnique({
        where: {id: chatId},
        include: {
            file: true,
            messages: {
                orderBy: {createdAt: 'asc'},
                select: {role: true, content: true},
            },
        },
    })
    if (!chat)
        return NextResponse.json({error: 'Chat not found'}, {status: 404})
    console.log(chat, 'Chat History')

    const systemPrompt = `
You are an AI assistant that answers questions about a PDF document.  
You MUST always return two parts in your response:
1. A natural language answer to the user’s question.  
2. At least one annotation command in the required format, whenever relevant text or visuals exist.

## Annotation Commands
- [NAVIGATE:page_number]
- [CIRCLE:page_number:exact_text]

### Annotation Rules
1. Always use **exact text from the PDF** (case-sensitive).
2. Keep text selections concise (1–20 words).
3. Always include **[NAVIGATE:page_number]** when you use CIRCLE.
4. Use:
   - HIGHLIGHT → for important text passages OR for key terms, definitions, or keywords 
   - CIRCLE → for images, diagrams, or visual elements  

## Response Rules
1. Responses must include BOTH natural language + annotation(s).  
   - If you find relevant content, annotate it.  
   - If no relevant content exists, say so explicitly and still provide a natural language response.  
2. Annotations must be in the strict command format (no extra words inside brackets).  
3. You can include multiple annotations in one response.

## Example
User: "What is a virus?"  

Assistant:  
"A virus is a microscopic infectious agent that replicates inside living hosts.  
[NAVIGATE:23] [HIGHLIGHT:23:infectious agent that replicates]  
You can also see this illustrated in the diagram.  
[CIRCLE:23:virus structure diagram]"
`

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
        {role: 'user', content: question},
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

        // Parse the response to extract annotations and clean text
        const {cleanText, annotations, navigation} = parseAIResponse(
            response.text,
        )

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
            {error: 'Failed to generate response'},
            {status: 500},
        )
    }
}
