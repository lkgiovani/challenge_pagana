import swagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'

export const docsPlugin = fp(async (app) => {
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Triagem Atendimento IA API',
        description: 'API para triagem e atendimento com IA',
        version: '1.0.0',
      },
    },
  })

  app.register(fastifySwaggerUi, { routePrefix: '/docs' })
})
