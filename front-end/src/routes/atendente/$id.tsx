import { createRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Info } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceInfoPanel } from '@/features/chat/components/AttendanceInfoPanel'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import { useConversation } from '@/features/conversations/hooks/useConversation'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types'
import { rootRoute } from '../__root'

export const atendenteIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/atendente/$id',
  component: AtendenteChatPage,
})

const statusLabels = { bot: 'Bot', transferred: 'Transferido', in_progress: 'Em andamento' } as const
const sectorLabels = { vendas: 'Vendas', suporte: 'Suporte', financeiro: 'Financeiro' } as const

function AtendenteItem({ conversation }: { conversation: Conversation }) {
  const params = useParams({ strict: false })
  const isActive = params.id === conversation.id

  const initials = conversation.client_name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Link
      to="/atendente/$id"
      params={{ id: conversation.id }}
      className={cn('flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent', isActive && 'bg-accent')}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <span className="truncate font-medium text-foreground">{conversation.client_name}</span>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant={conversation.status} className="text-[10px]">
            {statusLabels[conversation.status]}
          </Badge>
          {conversation.sector && (
            <Badge variant={conversation.sector} className="text-[10px]">
              {sectorLabels[conversation.sector]}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

function AtendenteInbox() {
  const { data: conversations, isLoading } = useConversations()
  const pending = conversations?.filter(c => c.status === 'transferred' || c.status === 'in_progress') ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {pending.map(conversation => (
          <AtendenteItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </ScrollArea>
  )
}

function AtendenteChatPage() {
  const { id } = atendenteIdRoute.useParams()
  const { data: conversation, isLoading } = useConversation(id)

  return (
    <div className="flex h-full w-full">
      {/* Desktop: Attendant inbox */}
      <aside className="hidden w-80 shrink-0 border-r border-border lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">Fila de Atendimento</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <AtendenteInbox />
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-3 lg:hidden">
          <Link to="/atendente">
            <Button variant="ghost" size="icon" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="truncate text-sm font-medium text-foreground">
            {isLoading ? <Skeleton className="h-4 w-24" /> : conversation?.client_name || 'Chat'}
          </span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Informacoes">
                <Info className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Informacoes do Atendimento</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <AttendanceInfoPanel conversationId={id} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat window */}
        <div className="min-h-0 flex-1">
          <ChatWindow conversationId={id} mode="atendente" />
        </div>
      </div>

      {/* Desktop: Info panel */}
      <aside className="hidden w-72 shrink-0 border-l border-border lg:block">
        <AttendanceInfoPanel conversationId={id} />
      </aside>
    </div>
  )
}
