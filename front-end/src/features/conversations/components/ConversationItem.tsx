import { Link, useParams } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Conversation, ConversationStatus, Sector } from '@/types'

interface ConversationItemProps {
  conversation: Conversation
}

const statusLabels: Record<ConversationStatus, string> = {
  bot: 'Bot',
  transferred: 'Transferido',
  in_progress: 'Em andamento',
}

const sectorLabels: Record<Exclude<Sector, null>, string> = {
  vendas: 'Vendas',
  suporte: 'Suporte',
  financeiro: 'Financeiro',
}

export function ConversationItem({ conversation }: ConversationItemProps) {
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
      to="/atendimentos/$id"
      params={{ id: conversation.id }}
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent',
        isActive && 'bg-accent',
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-foreground">{conversation.client_name}</span>
        </div>
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
