import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Message } from '@/types'

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data } = await api.get<Message[]>(`/messages/${conversationId}`)
      return data
    },
    enabled: !!conversationId,
  })
}
