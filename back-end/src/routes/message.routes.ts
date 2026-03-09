import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as controller from '../controllers/message.controller'
import {
  BadRequestResponse,
  InternalErrorResponse,
  NotFoundResponse,
  ValidationErrorResponse,
} from '../schemas/error.schema'
import {
  messageSchema,
  messagesParamsSchema,
  sendMessageBodySchema,
  sendMessageResponseSchema,
} from '../schemas/message.schema'

export async function messageRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/messages',
    {
      schema: {
        summary: 'Enviar mensagem para triagem',
        tags: ['Messages'],
        body: sendMessageBodySchema,
        response: {
          200: sendMessageResponseSchema,
          400: ValidationErrorResponse,
          404: NotFoundResponse,
          500: InternalErrorResponse,
        },
      },
    },
    controller.send,
  )

  fastify.get(
    '/messages/:conversationId',
    {
      schema: {
        summary: 'Listar mensagens de uma conversa',
        tags: ['Messages'],
        params: messagesParamsSchema,
        response: {
          200: z.array(messageSchema),
          400: BadRequestResponse,
          500: InternalErrorResponse,
        },
      },
    },
    controller.findByConversation,
  )
}
