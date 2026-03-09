import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dos módulos antes de importar o service
vi.mock('../repositories/conversation.repository')
vi.mock('../websocket', () => ({ broadcast: vi.fn() }))

import { NotFoundError } from '../errors'
import * as conversationRepository from '../repositories/conversation.repository'
import * as conversationService from '../services/conversation.service'
import { broadcast } from '../websocket'

const mockConversation = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  client_name: 'João Teste',
  status: 'bot' as const,
  sector: null,
  intent: null,
  summary: null,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('conversationService.createConversation', () => {
  it('cria conversa e emite evento WS', async () => {
    vi.mocked(conversationRepository.create).mockResolvedValue(mockConversation as any)

    const result = await conversationService.createConversation('João Teste')

    expect(conversationRepository.create).toHaveBeenCalledWith('João Teste')
    expect(broadcast).toHaveBeenCalledWith('new_conversation', mockConversation)
    expect(result).toEqual(mockConversation)
  })
})

describe('conversationService.getConversations', () => {
  it('retorna lista de conversas', async () => {
    vi.mocked(conversationRepository.findAll).mockResolvedValue([mockConversation] as any)

    const result = await conversationService.getConversations()

    expect(result).toEqual([mockConversation])
  })
})

describe('conversationService.getConversationById', () => {
  it('retorna conversa quando existe', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation as any)

    const result = await conversationService.getConversationById(mockConversation.id)

    expect(result).toEqual(mockConversation)
  })

  it('lança NotFoundError quando não existe', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(null)

    await expect(conversationService.getConversationById('id-inexistente')).rejects.toThrow(NotFoundError)
  })
})

describe('conversationService.assumeConversation', () => {
  it('atualiza status para in_progress e emite evento WS', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation as any)
    vi.mocked(conversationRepository.updateStatus).mockResolvedValue(undefined)

    const result = await conversationService.assumeConversation(mockConversation.id)

    expect(conversationRepository.updateStatus).toHaveBeenCalledWith(mockConversation.id, 'in_progress')
    expect(broadcast).toHaveBeenCalledWith('conversation_updated', {
      ...mockConversation,
      status: 'in_progress',
    })
    expect(result.status).toBe('in_progress')
  })

  it('lança NotFoundError quando conversa não existe', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(null)

    await expect(conversationService.assumeConversation('id-inexistente')).rejects.toThrow(NotFoundError)
  })
})
