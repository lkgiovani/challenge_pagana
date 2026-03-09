import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/conversation.repository')
vi.mock('../repositories/message.repository')
vi.mock('../ai/agent')
vi.mock('../websocket', () => ({ broadcast: vi.fn() }))

import { runAgent } from '../ai/agent'
import { NotFoundError, ValidationError } from '../errors'
import * as conversationRepository from '../repositories/conversation.repository'
import * as messageRepository from '../repositories/message.repository'
import * as messageService from '../services/message.service'
import { broadcast } from '../websocket'

const convId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

const mockConversationBot = {
  id: convId,
  client_name: 'Maria Teste',
  status: 'bot' as const,
  sector: null,
  intent: null,
  summary: null,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

const mockConversationTransferred = {
  ...mockConversationBot,
  status: 'transferred' as const,
  sector: 'financeiro' as const,
  intent: 'financeiro',
  summary: 'Cliente quer pagar boleto',
}

const mockUserMessage = {
  id: 'msg-001',
  conversation_id: convId,
  role: 'user' as const,
  content: 'Quero pagar um boleto',
  created_at: new Date('2024-01-01'),
}

const mockAssistantMessage = {
  id: 'msg-002',
  conversation_id: convId,
  role: 'assistant' as const,
  content: 'Vou te transferir para o financeiro',
  created_at: new Date('2024-01-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('messageService.sendMessage', () => {
  it('lança NotFoundError quando conversa não existe', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(null)

    await expect(messageService.sendMessage(convId, 'oi')).rejects.toThrow(NotFoundError)
  })

  it('lança ValidationError quando conversa está em status transferred', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue({
      ...mockConversationBot,
      status: 'transferred',
    } as any)

    await expect(messageService.sendMessage(convId, 'oi')).rejects.toThrow(ValidationError)
  })

  it('atendente envia mensagem quando conversa está em status in_progress', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue({
      ...mockConversationBot,
      status: 'in_progress',
    } as any)
    vi.mocked(messageRepository.create).mockResolvedValueOnce(mockAssistantMessage as any)

    const result = await messageService.sendMessage(convId, 'Olá, como posso ajudar?')

    expect(result.reply).toBe('Olá, como posso ajudar?')
    expect(result.transfer).toBe(false)
    expect(result.intent).toBeNull()
    expect(broadcast).toHaveBeenCalledWith('new_message', mockAssistantMessage)
    expect(runAgent).not.toHaveBeenCalled()
  })

  it('processa mensagem sem transferência', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversationBot as any)
    vi.mocked(messageRepository.create)
      .mockResolvedValueOnce(mockUserMessage as any)
      .mockResolvedValueOnce(mockAssistantMessage as any)
    vi.mocked(messageRepository.findByConversationId).mockResolvedValue([mockUserMessage] as any)
    vi.mocked(runAgent).mockResolvedValue({ transfer: false, reply: 'Como posso ajudar?' })

    const result = await messageService.sendMessage(convId, 'Olá')

    expect(result.transfer).toBe(false)
    expect(result.intent).toBeNull()
    expect(broadcast).toHaveBeenCalledTimes(2)
    expect(broadcast).toHaveBeenCalledWith('new_message', mockUserMessage)
    expect(broadcast).toHaveBeenCalledWith('new_message', mockAssistantMessage)
    expect(conversationRepository.updateTriageResult).not.toHaveBeenCalled()
  })

  it('processa mensagem com transferência para financeiro', async () => {
    vi.mocked(conversationRepository.findById)
      .mockResolvedValueOnce(mockConversationBot as any)
      .mockResolvedValueOnce(mockConversationTransferred as any)
    vi.mocked(messageRepository.create)
      .mockResolvedValueOnce(mockUserMessage as any)
      .mockResolvedValueOnce(mockAssistantMessage as any)
    vi.mocked(messageRepository.findByConversationId).mockResolvedValue([mockUserMessage] as any)
    vi.mocked(runAgent).mockResolvedValue({
      transfer: true,
      reply: 'Transferindo para o financeiro',
      intent: 'financeiro',
      summary: 'Cliente quer pagar boleto',
    })
    vi.mocked(conversationRepository.updateTriageResult).mockResolvedValue(undefined)

    const result = await messageService.sendMessage(convId, 'Quero pagar um boleto')

    expect(result.transfer).toBe(true)
    expect(result.intent).toBe('financeiro')
    expect(result.summary).toBe('Cliente quer pagar boleto')
    expect(conversationRepository.updateTriageResult).toHaveBeenCalledWith(
      convId,
      'financeiro',
      'financeiro',
      'Cliente quer pagar boleto',
    )
    expect(broadcast).toHaveBeenCalledWith('conversation_updated', mockConversationTransferred)
  })

  it('emite eventos WS na ordem correta', async () => {
    const broadcastCalls: [string, unknown][] = []
    vi.mocked(broadcast).mockImplementation((event, data) => {
      broadcastCalls.push([event, data])
    })

    vi.mocked(conversationRepository.findById)
      .mockResolvedValueOnce(mockConversationBot as any)
      .mockResolvedValueOnce(mockConversationTransferred as any)
    vi.mocked(messageRepository.create)
      .mockResolvedValueOnce(mockUserMessage as any)
      .mockResolvedValueOnce(mockAssistantMessage as any)
    vi.mocked(messageRepository.findByConversationId).mockResolvedValue([mockUserMessage] as any)
    vi.mocked(runAgent).mockResolvedValue({
      transfer: true,
      reply: 'Transferindo',
      intent: 'vendas',
      summary: 'Resumo',
    })
    vi.mocked(conversationRepository.updateTriageResult).mockResolvedValue(undefined)

    await messageService.sendMessage(convId, 'Quero comprar')

    expect(broadcastCalls[0][0]).toBe('new_message')
    expect(broadcastCalls[1][0]).toBe('new_message')
    expect(broadcastCalls[2][0]).toBe('conversation_updated')
  })
})

describe('messageService.getMessages', () => {
  it('retorna mensagens da conversa', async () => {
    vi.mocked(messageRepository.findByConversationId).mockResolvedValue([mockUserMessage] as any)

    const result = await messageService.getMessages(convId)

    expect(result).toEqual([mockUserMessage])
    expect(messageRepository.findByConversationId).toHaveBeenCalledWith(convId)
  })
})
