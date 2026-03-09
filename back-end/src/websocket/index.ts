import type { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { z } from 'zod'

const wsEventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
})

let wss: WebSocketServer | null = null

export function initializeWebSocket(server: Server): void {
  wss = new WebSocketServer({ server })
  wss.on('connection', ws => {
    ws.on('error', err => console.error('[WebSocket] client error:', err))
  })
  console.log('[WebSocket] server initialized')
}

export function broadcast(event: string, data: unknown): void {
  if (!wss) return
  const payload = JSON.stringify(wsEventSchema.parse({ event, data }))
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  })
}
