import {NextRequest, NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {getUserFromToken} from "@/lib/auth";


export async function GET(request: NextRequest) {
    try {
        console.log('CHAT GET ROUTE API')
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

        const chats = await prisma.chat.findMany({
            where: {
                userId: user!.id,
            },
            // Select fields only if not including relations
            select: { id: true, title: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(chats)
    } catch
        (error) {
        console.error('Upload error:', error)
        return NextResponse.json({error: 'Upload failed'}, {status: 500})
    }
}
