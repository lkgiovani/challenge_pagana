import fp from 'fastify-plugin'

export const healthPlugin = fp(async (app) => {
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
})
