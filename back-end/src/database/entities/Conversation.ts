import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('conversations')
export class Conversation {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string

  @Column('varchar', { length: 255 })
  client_name!: string

  @Column({
    type: 'varchar',
    default: 'bot',
  })
  status!: 'bot' | 'transferred' | 'in_progress'

  @Column({ type: 'varchar', nullable: true, default: null })
  sector!: 'vendas' | 'suporte' | 'financeiro' | null

  @Column({ type: 'text', nullable: true, default: null })
  intent!: string | null

  @Column({ type: 'text', nullable: true, default: null })
  summary!: string | null

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date
}
