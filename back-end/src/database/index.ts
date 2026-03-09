import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Conversation } from './entities/Conversation'
import { Message } from './entities/Message'

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [Conversation, Message],
})

export async function initializeDatabase(): Promise<void> {
  await AppDataSource.initialize()
}
