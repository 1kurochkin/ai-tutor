import {NextRequest, NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {put} from '@vercel/blob'
import {mergeTextImagesConent} from '@/lib/pdf/merge-text-images-content'
import {generateText} from "ai";
import {openai} from '@ai-sdk/openai'
import {getUserFromToken} from "@/lib/auth";
import {parseTextFromPDF, PDFExtractionResult} from "@/lib/pdf/parse-text";
import {ImagesCoordinatesResponse} from "@/app/api/chat/[id]/ask/route";


export async function POST(request: NextRequest) {
    try {
        console.log('CHAT CREATE ROUTE API')
        // Check authentication
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401})
        }
        console.log(token, 'TOKEN')
        const user = await getUserFromToken(token)
        console.log(user, 'USER')
        if (!user) {
            return NextResponse.json({error: 'Invalid token'}, {status: 401})
        }

        // Parse form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        console.log(file, 'FILE')
        if (!file) {
            return NextResponse.json(
                {error: 'No file provided'},
                {status: 400},
            )
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                {error: 'Only PDF files are allowed'},
                {status: 400},
            )
        }

        // Validate file size (10MB limit)
        const MAX_SIZE = 10 * 1024 * 1024 // 10MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                {error: 'File too large (max 10MB)'},
                {status: 400},
            )
        }

        // Create upload directory
        console.log('UPLOAD FILE')
        const filename = `${Date.now()}-${file.name}`
        const {url: uploadedFileUrl} = await put(
            `file-uploads/${filename}`,
            file,
            {
                access: 'public',
            },
        )
        console.log('FILE UPLOADED URL-', uploadedFileUrl)

        // Extract data from PDF
        let pdfTextExtractionResult: PDFExtractionResult
        let pdfImagesExtractionResult: ImagesCoordinatesResponse[] = []

        try {
            pdfTextExtractionResult = await parseTextFromPDF(file)
            const response = await fetch(
                process.env.PDF_EXTRACTOR_URL! + "/images-coords",
                {
                    method: "POST",
                    body: formData,
                }
            );
            pdfImagesExtractionResult = await response.json().then(data => data.images);
            console.log(pdfTextExtractionResult, "pdfTextExtractionResult")
            console.log(pdfImagesExtractionResult, "pdfImagesExtractionResul")
        } catch (error) {
            console.error('PDF parsing failed:', error)
        }


        if (pdfImagesExtractionResult.length) {
            // AI Describe images from PDF
            let describedImages: Omit<ImagesCoordinatesResponse, "base64">[] = []
            try {
                const systemPrompt = `
You are an AI assistant. Analyze the images provided and return a concise, **one-sentence description** of each image.  

- Each image is identified by a unique "objectNumber".  
- Respond ONLY in **JSON array format**, with objects containing these keys:
  { "description": string }  
- Do NOT include any extra text, commentary, or explanations or json.  
- Keep descriptions short but descriptive enough that another AI could use them to identify the image in the PDF for annotations.  
- Use consistent terminology (diagram, chart, table, photo, illustration, graph, figure, etc.) when applicable.

Example output:  
[
  { "description": "Diagram showing quarterly finance growth in 2025" },
  { "description": "Illustration of a virus structure" }
]
`

                const response = await generateText({
                    model: openai('gpt-4o'),
                    system: systemPrompt,
                    messages: [
                        {
                            role: "user", content: pdfImagesExtractionResult.map(img => ({
                                type: "image",
                                image: img.base64,
                            }))
                        }
                    ],
                })

                const aiTextToJson: { description: string }[] = JSON.parse(response.text)
                describedImages = pdfImagesExtractionResult.map(({base64, ...restExImg}, idx) => ({
                    ...restExImg,
                    description: aiTextToJson[idx].description
                }))
                console.log(describedImages, "describedImages")
                if (!response) throw new Error('No output from AI')
            } catch (e) {
                console.error('Failed to describe images:', e)
            }

            // Merge extracted Pdf Text With Described Images for each page
            // @ts-ignore
            pdfTextExtractionResult = mergeTextImagesConent(pdfTextExtractionResult, describedImages)
            console.log(pdfTextExtractionResult, "mergePdfTextWithImages")
        }

        // Save File record to database

        const fileRecord = await prisma.file.create({
            data: {
                filename,
                originalName: file.name,
                url: uploadedFileUrl,
                fileSize: file.size,
                mimeType: file.type,
                // @ts-ignore
                content: JSON.stringify(pdfTextExtractionResult.content),
                // @ts-ignore
                pageCount: pdfTextExtractionResult.pageCount,
                userId: user.id,
            },
        })
        console.log('✅ PDF record created:', fileRecord.id)

        // Chat creation
        const chat = await prisma.chat.create({
            data: {
                title: fileRecord.originalName,
                userId: user.id,
                fileId: fileRecord.id,
            },
        })
        console.log('✅ CHAT created:', chat.id)
        return NextResponse.json(chat)
    } catch
        (error) {
        console.error('Upload error:', error)
        return NextResponse.json({error: 'Upload failed'}, {status: 500})
    }
}
