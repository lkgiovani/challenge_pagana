import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Conversation } from './Conversation'

@Entity('messages')
export class Message {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string

  @Column('varchar', { length: 36 })
  conversation_id!: string

  @Column('varchar')
  role!: 'user' | 'assistant'

  @Column('text')
  content!: string

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation
}
