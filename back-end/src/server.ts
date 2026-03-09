import 'reflect-metadata'
import 'dotenv/config'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { ZodError, z } from 'zod'
import { initializeDatabase } from './database'
import { BaseException, ExceptionHttpMapper } from './errors'
import { logger } from './logger'
import { conversationRoutes } from './routes/conversation.routes'
import { messageRoutes } from './routes/message.routes'
import { initializeWebSocket } from './websocket'

const envSchema = z.object({
  GEMINI_API_KEY: z.string(),
  PORT: z.coerce.number().default(3001),
})

const env = envSchema.parse(process.env)

const fastify = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>()

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof BaseException) {
    if (error.reportable) {
      logger.error({ err: error, method: request.method, url: request.url, metadata: error.metadata }, error.message)
    }
    const { status, error: errorText } = ExceptionHttpMapper.toHttp(error.code)
    return reply.status(status).send({ status, error: errorText, message: error.message })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: 400,
      error: 'Bad Request',
      message: 'Validation error',
      details: error.issues,
    })
  }

  if ((error as { validation?: unknown }).validation) {
    return reply.status(400).send({
      status: 400,
      error: 'Bad Request',
      message: (error as Error).message,
    })
  }

  logger.error({ err: error, method: request.method, url: request.url }, 'Internal server error')
  return reply.status(500).send({
    status: 500,
    error: 'Internal Server Error',
    message: 'Internal server error',
  })
})

fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

async function start() {
  await initializeDatabase()

  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  await fastify.register(conversationRoutes, { prefix: '/api' })
  await fastify.register(messageRoutes, { prefix: '/api' })

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' })

  initializeWebSocket(fastify.server)

  logger.info(`Server running on http://localhost:${env.PORT}`)
}

async function shutdown() {
  logger.info('Shutting down gracefully...')
  await fastify.close()
  logger.info('Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

start().catch(err => {
  logger.error(err)
  process.exit(1)
})
