import { AlertCircle, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssumeConversation } from '@/features/conversations/hooks/useAssumeConversation'
import type { ConversationStatus } from '@/types'

interface TransferredBannerProps {
  conversationId: string
  status: ConversationStatus
}

export function TransferredBanner({ conversationId, status }: TransferredBannerProps) {
  const assumeConversation = useAssumeConversation()

  if (status === 'bot') return null

  const handleAssume = () => {
    assumeConversation.mutate(conversationId)
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border bg-amber-500/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-amber-700 dark:text-amber-300">
          {status === 'transferred' ? 'Atendimento transferido para um humano' : 'Atendimento em andamento'}
        </span>
      </div>
      {status === 'transferred' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleAssume}
          disabled={assumeConversation.isPending}
          className="shrink-0 border-amber-600/30 text-amber-700 hover:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-300"
        >
          <UserCheck className="mr-1 h-4 w-4" />
          {assumeConversation.isPending ? 'Assumindo...' : 'Assumir Atendimento'}
        </Button>
      )}
    </div>
  )
}
