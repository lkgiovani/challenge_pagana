import 'reflect-metadata'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { AppDataSource } from '../database'
import { AppError } from '../errors'

vi.mock('../ai/agent', () => ({ runAgent: vi.fn() }))
vi.mock('../websocket', () => ({ broadcast: vi.fn() }))

import { runAgent } from '../ai/agent'

async function buildApp() {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof AppError) {
      const httpErrors: Record<number, string> = { 400: 'Bad Request', 404: 'Not Found' }
      return reply
        .status(error.statusCode)
        .send({ status: error.statusCode, error: httpErrors[error.statusCode] ?? 'Error', message: error.message })
    }
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send({ status: 400, error: 'Bad Request', message: 'Validation error', details: error.issues })
    }
    if ((error as any).validation) {
      return reply.status(400).send({ status: 400, error: 'Bad Request', message: (error as Error).message })
    }
    console.error('[Test Error]', error)
    return reply.status(500).send({ status: 500, error: 'Internal Server Error', message: 'Internal server error' })
  })
  const { conversationRoutes } = await import('../routes/conversation.routes')
  const { messageRoutes } = await import('../routes/message.routes')
  await app.register(conversationRoutes, { prefix: '/api' })
  await app.register(messageRoutes, { prefix: '/api' })
  await app.ready()
  return app
}

let app: Awaited<ReturnType<typeof buildApp>>

beforeAll(async () => {
  await AppDataSource.initialize()
  app = await buildApp()
})

afterAll(async () => {
  await app.close()
  if (AppDataSource.isInitialized) await AppDataSource.destroy()
})

beforeEach(async () => {
  await AppDataSource.query('DELETE FROM messages')
  await AppDataSource.query('DELETE FROM conversations')
  vi.clearAllMocks()
})

describe('POST /api/conversations', () => {
  it('cria conversa e retorna 201 com dados corretos', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      payload: { clientName: 'João da Silva' },
    })
    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.client_name).toBe('João da Silva')
    expect(body.status).toBe('bot')
    expect(body.sector).toBeNull()
    expect(body.id).toBeDefined()
  })

  it('retorna 400 para clientName vazio', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/conversations', payload: { clientName: '' } })
    expect(response.statusCode).toBe(400)
  })

  it('retorna 400 para body sem clientName', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/conversations', payload: {} })
    expect(response.statusCode).toBe(400)
  })
})

describe('GET /api/conversations', () => {
  it('retorna lista vazia inicialmente', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/conversations' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })

  it('retorna conversas criadas', async () => {
    await app.inject({ method: 'POST', url: '/api/conversations', payload: { clientName: 'A' } })
    await app.inject({ method: 'POST', url: '/api/conversations', payload: { clientName: 'B' } })
    const response = await app.inject({ method: 'GET', url: '/api/conversations' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(2)
  })
})

describe('GET /api/conversations/:id', () => {
  it('retorna conversa por id', async () => {
    const created = await app.inject({ method: 'POST', url: '/api/conversations', payload: { clientName: 'Pedro' } })
    const { id } = created.json()
    const response = await app.inject({ method: 'GET', url: `/api/conversations/${id}` })
    expect(response.statusCode).toBe(200)
    expect(response.json().id).toBe(id)
  })

  it('retorna 404 para id inexistente', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/conversations/00000000-0000-0000-0000-000000000000' })
    expect(response.statusCode).toBe(404)
  })

  it('retorna 400 para id que não é UUID', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/conversations/id-invalido' })
    expect(response.statusCode).toBe(400)
  })
})

describe('PATCH /api/conversations/:id/assume', () => {
  it('muda status para in_progress', async () => {
    const created = await app.inject({ method: 'POST', url: '/api/conversations', payload: { clientName: 'Ana' } })
    const { id } = created.json()
    const response = await app.inject({ method: 'PATCH', url: `/api/conversations/${id}/assume` })
    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe('in_progress')
  })

  it('retorna 404 para conversa inexistente', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/conversations/00000000-0000-0000-0000-000000000000/assume',
    })
    expect(response.statusCode).toBe(404)
  })
})

describe('POST /api/messages', () => {
  let conversationId: string
  beforeEach(async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      payload: { clientName: 'Cliente Mensagem' },
    })
    conversationId = res.json().id
  })

  it('envia mensagem sem transferência', async () => {
    vi.mocked(runAgent).mockResolvedValue({ transfer: false, reply: 'Como posso ajudar?' })
    const response = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { conversationId, message: 'Oi' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().transfer).toBe(false)
    expect(response.json().reply).toBe('Como posso ajudar?')
    expect(response.json().intent).toBeNull()
  })

  it('envia mensagem com transferência para financeiro', async () => {
    vi.mocked(runAgent).mockResolvedValue({
      transfer: true,
      reply: 'Transferindo',
      intent: 'financeiro',
      summary: 'Boleto',
    })
    const response = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { conversationId, message: 'Quero pagar boleto' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().transfer).toBe(true)
    expect(response.json().intent).toBe('financeiro')
    const conv = await app.inject({ method: 'GET', url: `/api/conversations/${conversationId}` })
    expect(conv.json().status).toBe('transferred')
    expect(conv.json().sector).toBe('financeiro')
  })

  it('retorna 400 quando conversa não está em status bot', async () => {
    await app.inject({ method: 'PATCH', url: `/api/conversations/${conversationId}/assume` })
    const response = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { conversationId, message: 'msg' },
    })
    expect(response.statusCode).toBe(400)
  })

  it('retorna 404 para conversationId inexistente', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { conversationId: '00000000-0000-0000-0000-000000000000', message: 'Oi' },
    })
    expect(response.statusCode).toBe(404)
  })

  it('retorna 400 para message vazia', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { conversationId, message: '' },
    })
    expect(response.statusCode).toBe(400)
  })
})

describe('GET /api/messages/:conversationId', () => {
  let conversationId: string
  beforeEach(async () => {
    const res = await app.inject({ method: 'POST', url: '/api/conversations', payload: { clientName: 'Histórico' } })
    conversationId = res.json().id
  })

  it('retorna histórico de mensagens', async () => {
    vi.mocked(runAgent).mockResolvedValue({ transfer: false, reply: 'Resposta' })
    await app.inject({ method: 'POST', url: '/api/messages', payload: { conversationId, message: 'msg' } })
    const response = await app.inject({ method: 'GET', url: `/api/messages/${conversationId}` })
    expect(response.statusCode).toBe(200)
    const msgs = response.json()
    expect(msgs).toHaveLength(2)
    expect(msgs[0].role).toBe('user')
    expect(msgs[1].role).toBe('assistant')
  })

  it('retorna array vazio para conversa sem mensagens', async () => {
    const response = await app.inject({ method: 'GET', url: `/api/messages/${conversationId}` })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })
})
