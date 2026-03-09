import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Conversation } from '@/types'

export function useAssumeConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<Conversation>(`/conversations/${id}/assume`)
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', data.id] })
    },
  })
}
