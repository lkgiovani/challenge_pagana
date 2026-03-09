import { MessageSquare } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations } from '../hooks/useConversations'
import { ConversationItem } from './ConversationItem'

export function ConversationList() {
  const { data: conversations, isLoading, isError } = useConversations()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-32" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-destructive">Erro ao carregar conversas</p>
        <p className="mt-1 text-xs text-muted-foreground">Verifique sua conexao com o servidor</p>
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
        <p className="mt-1 text-xs text-muted-foreground">Clique em "Nova conversa" para comecar</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {conversations.map(conversation => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </ScrollArea>
  )
}
