import {NextRequest, NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {getUserFromToken} from "@/lib/auth";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params
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

        const chat = await prisma.chat.findUnique({
            where: {
                id,
                userId: user!.id
            },
            include: {
                file: {
                    select: {
                        id: true,
                        originalName: true,
                        url: true,
                        pageCount: true,
                        content: true,
                    },
                },
                messages: true,
            },
        })
        return NextResponse.json(chat)
    } catch
        (error) {
        console.error('Upload error:', error)
        return NextResponse.json({error: 'Upload failed'}, {status: 500})
    }
}
