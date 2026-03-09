import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Conversation } from '@/types'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get<Conversation[]>('/conversations')
      return data
    },
    refetchInterval: 3000,
  })
}
