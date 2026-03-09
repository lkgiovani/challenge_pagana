import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from '../database'
import { Message } from '../database/entities/Message'

function getRepo() {
  return AppDataSource.getRepository(Message)
}

export async function create(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
  const repo = getRepo()
  const message = repo.create({
    id: uuidv4(),
    conversation_id: conversationId,
    role,
    content,
  })
  return repo.save(message)
}

export async function findByConversationId(conversationId: string): Promise<Message[]> {
  return getRepo().find({
    where: { conversation_id: conversationId },
    order: { created_at: 'ASC' },
  })
}
