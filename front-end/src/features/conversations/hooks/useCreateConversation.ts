import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Conversation, CreateConversationPayload } from '@/types'

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateConversationPayload) => {
      const { data } = await api.post<Conversation>('/conversations', { clientName: payload.clientName })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
