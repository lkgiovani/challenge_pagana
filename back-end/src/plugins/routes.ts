import fp from 'fastify-plugin'
import { conversationRoutes } from '../routes/conversation.routes'
import { messageRoutes } from '../routes/message.routes'

export const routesPlugin = fp(async (app) => {
  app.register(conversationRoutes, { prefix: '/api' })
  app.register(messageRoutes, { prefix: '/api' })
})
