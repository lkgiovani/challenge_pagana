import { MessageSquare } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversation } from '@/features/conversations/hooks/useConversation'
import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useSendMessage'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TransferredBanner } from './TransferredBanner'
import { TypingIndicator } from './TypingIndicator'

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: messages, isLoading: messagesLoading } = useMessages(conversationId)
  const { data: conversation } = useConversation(conversationId)
  const sendMessage = useSendMessage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMessage.isPending])

  const isInputDisabled = conversation?.status !== 'bot'

  if (messagesLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'} rounded-2xl`} />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {messages && messages.length > 0 ? (
            <>
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {sendMessage.isPending && <TypingIndicator />}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">Envie uma mensagem para comecar a conversa</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {conversation && conversation.status !== 'bot' && (
        <TransferredBanner conversationId={conversationId} status={conversation.status} />
      )}

      <div className="sticky bottom-0 mt-auto">
        <MessageInput conversationId={conversationId} disabled={isInputDisabled} />
      </div>
    </div>
  )
}
