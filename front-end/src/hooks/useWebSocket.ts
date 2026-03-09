import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onmessage = event => {
      try {
        const { event: eventName, data } = JSON.parse(event.data)

        if (eventName === 'new_conversation' || eventName === 'conversation_updated') {
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
          if (data?.id) {
            queryClient.invalidateQueries({ queryKey: ['conversation', data.id] })
          }
        }

        if (eventName === 'new_message' && data?.conversation_id) {
          queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] })
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => {
      // silently ignore — polling via refetchInterval is the fallback
    }

    return () => {
      ws.close()
    }
  }, [queryClient])
}
