import 'reflect-metadata'
import 'dotenv/config'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { ZodError, z } from 'zod'
import { initializeDatabase } from './database'
import { AppError } from './errors'
import { corsPlugin } from './plugins/cors'
import { conversationRoutes } from './routes/conversation.routes'
import { messageRoutes } from './routes/message.routes'
import { initializeWebSocket } from './websocket'

const envSchema = z.object({
  GEMINI_API_KEY: z.string(),
  PORT: z.coerce.number().default(3001),
})

const env = envSchema.parse(process.env)

const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

fastify.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    const httpErrors: Record<number, string> = {
      400: 'Bad Request',
      404: 'Not Found',
      422: 'Unprocessable Entity',
    }
    return reply.status(error.statusCode).send({
      status: error.statusCode,
      error: httpErrors[error.statusCode] ?? 'Error',
      message: error.message,
    })
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

  console.error('[Server Error]', error)
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

  await fastify.register(corsPlugin)
  await fastify.register(conversationRoutes, { prefix: '/api' })
  await fastify.register(messageRoutes, { prefix: '/api' })

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' })

  initializeWebSocket(fastify.server)

  console.log(`🚀 Server running on http://localhost:${env.PORT}`)
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
