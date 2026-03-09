import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from '../database'
import { Conversation } from '../database/entities/Conversation'
import type { ConversationStatus, Sector } from '../schemas/conversation.schema'

function getRepo() {
  return AppDataSource.getRepository(Conversation)
}

export async function create(clientName: string): Promise<Conversation> {
  const repo = getRepo()
  const conversation = repo.create({
    id: uuidv4(),
    client_name: clientName,
    status: 'bot',
    sector: null,
    intent: null,
    summary: null,
  })
  return repo.save(conversation)
}

export async function findById(id: string): Promise<Conversation | null> {
  return getRepo().findOneBy({ id })
}

export async function findAll(): Promise<Conversation[]> {
  return getRepo().find({ order: { created_at: 'DESC' } })
}

export async function updateStatus(id: string, status: ConversationStatus): Promise<void> {
  await getRepo().update(id, { status })
}

export async function updateTriageResult(id: string, sector: Sector, intent: string, summary: string): Promise<void> {
  await getRepo().update(id, {
    sector: sector ?? undefined,
    intent,
    summary,
    status: 'transferred',
  })
}
