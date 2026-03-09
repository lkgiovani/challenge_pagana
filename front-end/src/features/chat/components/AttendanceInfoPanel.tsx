import { Clock, FileText, Target, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversation } from '@/features/conversations/hooks/useConversation'
import type { ConversationStatus, Sector } from '@/types'

interface AttendanceInfoPanelProps {
  conversationId: string
}

const statusLabels: Record<ConversationStatus, string> = {
  bot: 'Atendimento pelo Bot',
  transferred: 'Transferido',
  in_progress: 'Em andamento',
}

const sectorLabels: Record<Exclude<Sector, null>, string> = {
  vendas: 'Vendas',
  suporte: 'Suporte',
  financeiro: 'Financeiro',
}

export function AttendanceInfoPanel({ conversationId }: AttendanceInfoPanelProps) {
  const { data: conversation, isLoading } = useConversation(conversationId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Separator />
        <div>
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-6 w-36" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Conversa nao encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Informacoes do Atendimento</h3>
      </div>

      <div className="flex items-start gap-3">
        <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-muted-foreground">Cliente</p>
          <p className="text-sm text-foreground">{conversation.client_name}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <Badge variant={conversation.status} className="mt-1">
            {statusLabels[conversation.status]}
          </Badge>
        </div>
      </div>

      <Separator />

      {conversation.sector && (
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Setor</p>
            <Badge variant={conversation.sector} className="mt-1">
              {sectorLabels[conversation.sector]}
            </Badge>
          </div>
        </div>
      )}

      {conversation.intent && (
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Intencao Detectada</p>
            <p className="mt-1 text-sm text-foreground">{conversation.intent}</p>
          </div>
        </div>
      )}

      {conversation.summary && (
        <>
          <Separator />
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Resumo da IA</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{conversation.summary}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
