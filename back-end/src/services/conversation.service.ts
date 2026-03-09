import type { Conversation } from '../database/entities/Conversation'
import { NotFoundError } from '../errors'
import * as conversationRepository from '../repositories/conversation.repository'
import { broadcast } from '../websocket'

export async function createConversation(clientName: string): Promise<Conversation> {
  const conversation = await conversationRepository.create(clientName)
  broadcast('new_conversation', conversation)
  return conversation
}

export async function getConversations(): Promise<Conversation[]> {
  return conversationRepository.findAll()
}

export async function getConversationById(id: string): Promise<Conversation> {
  const conversation = await conversationRepository.findById(id)
  if (!conversation) throw new NotFoundError(`Conversa ${id} não encontrada`)
  return conversation
}

export async function assumeConversation(id: string): Promise<Conversation> {
  const conversation = await getConversationById(id)
  await conversationRepository.updateStatus(id, 'in_progress')
  const updated = { ...conversation, status: 'in_progress' as const }
  broadcast('conversation_updated', updated)
  return updated
}
