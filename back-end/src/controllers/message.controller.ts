import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'
import type { messagesParamsSchema, sendMessageBodySchema } from '../schemas/message.schema'
import * as messageService from '../services/message.service'

type SendMessageBody = z.infer<typeof sendMessageBodySchema>
type MessagesParams = z.infer<typeof messagesParamsSchema>

export async function send(request: FastifyRequest<{ Body: SendMessageBody }>, reply: FastifyReply) {
  const { conversationId, message } = request.body
  const result = await messageService.sendMessage(conversationId, message)
  return reply.send(result)
}

export async function findByConversation(request: FastifyRequest<{ Params: MessagesParams }>, reply: FastifyReply) {
  const messages = await messageService.getMessages(request.params.conversationId)
  return reply.send(messages)
}
