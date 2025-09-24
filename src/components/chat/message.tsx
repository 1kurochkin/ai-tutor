'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Message as MessagePrismaType, MessageRole } from '@prisma/client'

type MessageProps = Pick<MessagePrismaType, 'role' | 'content'>

export default function Message({ role, content }: MessageProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-2',
        role === MessageRole.user ? 'justify-end' : 'justify-start',
      )}>
      {role === MessageRole.assistant && (
        <span className="text-2xl">🤖</span>
      )}

      <Card
        className={cn(
          'max-w-[70%] shadow-md px-4 py-2 rounded-2xl',
          role === MessageRole.user
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-muted-foreground rounded-bl-none',
        )}>
        <CardContent className="p-0">
          <p className="text-base whitespace-pre-wrap">{content}</p>
        </CardContent>
      </Card>

      {role === MessageRole.user && <span className="text-2xl">👤</span>}
    </div>
  )
}
