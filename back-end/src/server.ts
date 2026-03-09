import 'reflect-metadata'
import 'dotenv/config'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { initializeDatabase } from './database'
import { logger } from './logger'
import { corsPlugin } from './plugins/cors'
import { docsPlugin } from './plugins/docs'
import { errorHandlerPlugin } from './plugins/error-handler'
import { healthPlugin } from './plugins/health'
import { routesPlugin } from './plugins/routes'
import { initializeWebSocket } from './websocket'

const envSchema = z.object({
  GEMINI_API_KEY: z.string(),
  PORT: z.coerce.number().default(3001),
})

const env = envSchema.parse(process.env)

const fastify = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>()

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

async function start() {
  await initializeDatabase()

  await fastify.register(errorHandlerPlugin)
  await fastify.register(corsPlugin)
  await fastify.register(docsPlugin)
  await fastify.register(healthPlugin)
  await fastify.register(routesPlugin)

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
