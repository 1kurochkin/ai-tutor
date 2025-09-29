import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const { chatId } = await request.json()
    console.log('CHAT DELETE ROUTE API')
    // Check authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log(token, 'TOKEN')
    const user = await getUserFromToken(token)
    console.log(user, 'USER')
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Chat Delete
    await prisma.chat.delete({ where: { id: chatId } })
    console.log('✅ CHAT Deleted!')
    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
