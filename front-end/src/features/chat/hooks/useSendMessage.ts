import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Message, SendMessagePayload, SendMessageResponse } from '@/types'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data } = await api.post<SendMessageResponse>('/messages', {
        conversationId: payload.conversationId,
        message: payload.message,
        sender: payload.sender,
      })
      return { ...data, conversationId: payload.conversationId }
    },
    onMutate: async payload => {
      await queryClient.cancelQueries({
        queryKey: ['messages', payload.conversationId],
      })

      const previousMessages = queryClient.getQueryData<Message[]>(['messages', payload.conversationId])

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: payload.conversationId,
        role: payload.sender ?? 'user',
        content: payload.message,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData<Message[]>(['messages', payload.conversationId], old => [
        ...(old || []),
        optimisticMessage,
      ])

      return { previousMessages }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['messages', data.conversationId],
      })

      if (data.transfer) {
        queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] })
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }
    },
    onError: (_, payload, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', payload.conversationId], context.previousMessages)
      }
    },
  })
}
