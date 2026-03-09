import { createRoute, Link, useParams } from '@tanstack/react-router'
import { Headset, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types'
import { rootRoute } from '../__root'

export const atendenteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/atendente',
  component: AtendentePage,
})

function AtendentePage() {
  const { data: conversations, isLoading, isError } = useConversations()
  const pending = conversations?.filter(c => c.status === 'transferred' || c.status === 'in_progress') ?? []

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Headset className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Painel do Atendente</h2>
        {!isLoading && pending.length > 0 && (
          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {pending.length}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-destructive">Erro ao carregar atendimentos</p>
            <p className="mt-1 text-xs text-muted-foreground">Verifique sua conexão com o servidor</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhum atendimento pendente</p>
            <p className="mt-1 text-xs text-muted-foreground">Aguardando transferências da IA</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 p-2">
              {pending.map(conversation => (
                <AtendenteItem key={conversation.id} conversation={conversation} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

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
