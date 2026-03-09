import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'
import type { conversationParamsSchema, createConversationBodySchema } from '../schemas/conversation.schema'
import * as conversationService from '../services/conversation.service'

type CreateBody = z.infer<typeof createConversationBodySchema>
type ConversationParams = z.infer<typeof conversationParamsSchema>

export async function create(request: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const conversation = await conversationService.createConversation(request.body.clientName)
  return reply.status(201).send(conversation)
}

export async function findAll(_request: FastifyRequest, reply: FastifyReply) {
  const conversations = await conversationService.getConversations()
  return reply.send(conversations)
}

export async function findOne(request: FastifyRequest<{ Params: ConversationParams }>, reply: FastifyReply) {
  const conversation = await conversationService.getConversationById(request.params.id)
  return reply.send(conversation)
}

export async function assume(request: FastifyRequest<{ Params: ConversationParams }>, reply: FastifyReply) {
  const conversation = await conversationService.assumeConversation(request.params.id)
  return reply.send(conversation)
}
