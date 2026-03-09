import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json())

// CORS
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})
app.options('*', (_req, res) => { res.sendStatus(204) })

// In-memory store
interface Conversation {
  id: string
  client_name: string
  status: 'bot' | 'transferred' | 'in_progress'
  sector: 'vendas' | 'suporte' | 'financeiro' | null
  intent: string | null
  summary: string | null
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

const conversations = new Map<string, Conversation>()
const messages = new Map<string, Message[]>()

function classifyMessage(text: string): {
  transfer: boolean
  reply: string
  intent: 'vendas' | 'suporte' | 'financeiro' | null
  summary?: string
} {
  const lower = text.toLowerCase()

  if (/(boleto|pagamento|estorno|fatura|nota fiscal)/i.test(lower)) {
    return {
      transfer: true,
      intent: 'financeiro',
      reply: 'Perfeito! Vou te transferir para o setor financeiro que poderá te ajudar com seu pagamento.',
      summary: 'Cliente solicitando informações financeiras. Encaminhado para o setor financeiro.',
    }
  }

  if (/(comprar|produto|desconto|negoci|plano|valor|preço)/i.test(lower)) {
    return {
      transfer: true,
      intent: 'vendas',
      reply: 'Entendi! Vou te transferir para nossa equipe de vendas que poderá te ajudar.',
      summary: 'Cliente interessado em compra/produtos. Encaminhado para vendas.',
    }
  }

  if (/(erro|problema|bug|não funciona|acesso bloqueado|reclamação)/i.test(lower)) {
    return {
      transfer: true,
      intent: 'suporte',
      reply: 'Sinto muito pelo inconveniente! Vou te transferir para nossa equipe de suporte técnico.',
      summary: 'Cliente relata problema técnico. Encaminhado para suporte.',
    }
  }

  return {
    transfer: false,
    intent: null,
    reply: 'Olá! Seja bem-vindo ao atendimento. Como posso te ajudar hoje? Posso auxiliar com vendas, suporte ou questões financeiras.',
  }
}

// Routes
app.get('/api/conversations', (_req, res) => {
  res.json([...conversations.values()])
})

app.post('/api/conversations', (req, res) => {
  const { clientName } = req.body as { clientName: string }
  const now = new Date().toISOString()
  const conv: Conversation = {
    id: uuidv4(),
    client_name: clientName,
    status: 'bot',
    sector: null,
    intent: null,
    summary: null,
    created_at: now,
    updated_at: now,
  }
  conversations.set(conv.id, conv)
  messages.set(conv.id, [])
  res.status(201).json(conv)
})

app.get('/api/conversations/:id', (req, res) => {
  const conv = conversations.get(req.params.id)
  if (!conv) return res.status(404).json({ error: 'Not found' })
  res.json(conv)
})

app.patch('/api/conversations/:id/assume', (req, res) => {
  const conv = conversations.get(req.params.id)
  if (!conv) return res.status(404).json({ error: 'Not found' })
  conv.status = 'in_progress'
  conv.updated_at = new Date().toISOString()
  res.json(conv)
})

app.post('/api/messages', (req, res) => {
  const { conversationId, message } = req.body as { conversationId: string; message: string }
  const conv = conversations.get(conversationId)
  if (!conv) return res.status(404).json({ error: 'Not found' })

  const now = new Date().toISOString()
  const msgs = messages.get(conversationId) ?? []

  const userMsg: Message = { id: uuidv4(), conversation_id: conversationId, role: 'user', content: message, created_at: now }
  msgs.push(userMsg)

  const result = classifyMessage(message)

  const assistantMsg: Message = { id: uuidv4(), conversation_id: conversationId, role: 'assistant', content: result.reply, created_at: now }
  msgs.push(assistantMsg)
  messages.set(conversationId, msgs)

  if (result.transfer && result.intent) {
    conv.status = 'transferred'
    conv.sector = result.intent
    conv.intent = result.intent
    conv.summary = result.summary ?? null
    conv.updated_at = now
  }

  res.json({ reply: result.reply, intent: result.intent, transfer: result.transfer, summary: result.summary })
})

app.get('/api/messages/:conversationId', (req, res) => {
  res.json(messages.get(req.params.conversationId) ?? [])
})

const PORT = 3099
app.listen(PORT, () => {
  console.log(`[mock-server] running on http://localhost:${PORT}`)
})
