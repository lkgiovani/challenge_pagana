import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'

export async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(cors, {
    origin: '*',
  })
}
