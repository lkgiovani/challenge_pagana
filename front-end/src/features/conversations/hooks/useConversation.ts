import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Conversation } from '@/types'

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const { data } = await api.get<Conversation>(`/conversations/${id}`)
      return data
    },
    enabled: !!id,
  })
}
