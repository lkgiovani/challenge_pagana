import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as controller from '../controllers/conversation.controller'
import {
  conversationParamsSchema,
  conversationSchema,
  createConversationBodySchema,
} from '../schemas/conversation.schema'
import {
  BadRequestResponse,
  InternalErrorResponse,
  NotFoundResponse,
  ValidationErrorResponse,
} from '../schemas/error.schema'

export async function conversationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/conversations',
    {
      schema: {
        summary: 'Criar conversa',
        tags: ['Conversations'],
        body: createConversationBodySchema,
        response: {
          201: conversationSchema,
          400: ValidationErrorResponse,
          500: InternalErrorResponse,
        },
      },
    },
    controller.create,
  )

  fastify.get(
    '/conversations',
    {
      schema: {
        summary: 'Listar conversas',
        tags: ['Conversations'],
        response: {
          200: z.array(conversationSchema),
          500: InternalErrorResponse,
        },
      },
    },
    controller.findAll,
  )

  fastify.get(
    '/conversations/:id',
    {
      schema: {
        summary: 'Buscar conversa por ID',
        tags: ['Conversations'],
        params: conversationParamsSchema,
        response: {
          200: conversationSchema,
          400: BadRequestResponse,
          404: NotFoundResponse,
          500: InternalErrorResponse,
        },
      },
    },
    controller.findOne,
  )

  fastify.patch(
    '/conversations/:id/assume',
    {
      schema: {
        summary: 'Assumir atendimento',
        tags: ['Conversations'],
        params: conversationParamsSchema,
        response: {
          200: conversationSchema,
          400: BadRequestResponse,
          404: NotFoundResponse,
          500: InternalErrorResponse,
        },
      },
    },
    controller.assume,
  )
}
