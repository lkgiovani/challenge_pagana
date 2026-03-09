import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCreateConversation } from '../hooks/useCreateConversation'

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewConversationModal({ open, onOpenChange }: NewConversationModalProps) {
  const [clientName, setClientName] = useState('')
  const navigate = useNavigate()
  const createConversation = useCreateConversation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) return

    try {
      const conversation = await createConversation.mutateAsync({
        clientName: clientName.trim(),
      })
      setClientName('')
      onOpenChange(false)
      navigate({ to: '/atendimentos/$id', params: { id: conversation.id } })
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
          <DialogDescription>Insira o nome do cliente para iniciar uma nova conversa com a IA.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="Nome do cliente"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!clientName.trim() || createConversation.isPending}>
              {createConversation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
