import { createRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConversationList } from '@/features/conversations/components/ConversationList'
import { NewConversationModal } from '@/features/conversations/components/NewConversationModal'
import { rootRoute } from '../__root'

export const atendimentosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/atendimentos',
  component: AtendimentosPage,
})

function AtendimentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Nova conversa
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ConversationList />
      </div>
      <NewConversationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
