'use client'

import {Card, CardContent} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {Message as MessagePrismaType, MessageRole} from '@prisma/client'
import {Button} from '@/components/ui/button'

type MessageProps = Partial<MessagePrismaType> & {
  setRedirectPage?: () => void
  showAnnotations?: () => void | undefined
}

export default function Message({
  role,
  content,
  setRedirectPage,
  showAnnotations,
}: MessageProps) {
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
        <CardContent className="p-0 flex flex-col gap-3">
          <p className="text-base whitespace-pre-wrap">{content}</p>
          {setRedirectPage && role === MessageRole.assistant && (
            <Button
              onClick={setRedirectPage}
              size={'sm'}>
              Follow to the page
            </Button>
          )}
          {showAnnotations && role === MessageRole.assistant && (
            <Button onClick={showAnnotations} size={'sm'}>
              Show annotations
            </Button>
          )}
        </CardContent>
      </Card>

      {role === MessageRole.user && <span className="text-2xl">👤</span>}
    </div>
  )
}
