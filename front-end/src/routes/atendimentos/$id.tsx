import { createRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceInfoPanel } from '@/features/chat/components/AttendanceInfoPanel'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { ConversationList } from '@/features/conversations/components/ConversationList'
import { useConversation } from '@/features/conversations/hooks/useConversation'
import { rootRoute } from '../__root'

export const atendimentosIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/atendimentos/$id',
  component: ChatPage,
})

function ChatPage() {
  const { id } = atendimentosIdRoute.useParams()
  const { data: conversation, isLoading } = useConversation(id)

  return (
    <div className="flex h-full w-full">
      {/* Desktop: Conversation list */}
      <aside className="hidden w-80 shrink-0 border-r border-border lg:block">
        <ConversationList />
      </aside>

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-3 lg:hidden">
          <Link to="/atendimentos">
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
          <ChatWindow conversationId={id} />
        </div>
      </div>

      {/* Desktop: Info panel */}
      <aside className="hidden w-72 shrink-0 border-l border-border lg:block">
        <AttendanceInfoPanel conversationId={id} />
      </aside>
    </div>
  )
}
