import { z } from 'zod'
import { sectorSchema } from './conversation.schema'

export const messageRoleSchema = z.enum(['user', 'assistant'])

export const messageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  role: messageRoleSchema,
  content: z.string(),
  created_at: z.coerce.string(),
})

export const sendMessageBodySchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1),
  sender: messageRoleSchema.optional().default('user'),
})

export const sendMessageResponseSchema = z.object({
  reply: z.string(),
  intent: sectorSchema,
  transfer: z.boolean(),
  summary: z.string().optional(),
})

export const messagesParamsSchema = z.object({
  conversationId: z.string().uuid(),
})

export type Message = z.infer<typeof messageSchema>
export type MessageRole = z.infer<typeof messageRoleSchema>
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>
