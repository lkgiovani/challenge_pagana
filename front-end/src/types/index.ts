export type ConversationStatus = 'bot' | 'transferred' | 'in_progress'
export type Sector = 'vendas' | 'suporte' | 'financeiro' | null

export interface Conversation {
  id: string
  client_name: string
  status: ConversationStatus
  sector: Sector
  intent: string | null
  summary: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface SendMessageResponse {
  reply: string
  intent: string | null
  transfer: boolean
  summary?: string
}

export interface CreateConversationPayload {
  clientName: string
}

export interface SendMessagePayload {
  conversationId: string
  message: string
}
