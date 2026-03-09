import cors from '@fastify/cors'
import fp from 'fastify-plugin'

export const corsPlugin = fp(async (app) => {
  app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
})
