import { z } from 'zod'

export const conversationStatusSchema = z.enum(['bot', 'transferred', 'in_progress'])

export const sectorSchema = z.enum(['vendas', 'suporte', 'financeiro']).nullable()

export const conversationSchema = z.object({
  id: z.string().uuid(),
  client_name: z.string(),
  status: conversationStatusSchema,
  sector: sectorSchema,
  intent: z.string().nullable(),
  summary: z.string().nullable(),
  created_at: z.coerce.string(),
  updated_at: z.coerce.string(),
})

export const createConversationBodySchema = z.object({
  clientName: z.string().min(1),
})

export const conversationParamsSchema = z.object({
  id: z.string().uuid(),
})

export type Conversation = z.infer<typeof conversationSchema>
export type ConversationStatus = z.infer<typeof conversationStatusSchema>
export type Sector = z.infer<typeof sectorSchema>
