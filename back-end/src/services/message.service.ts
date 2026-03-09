import { runAgent } from '../ai/agent'
import type { Message } from '../database/entities/Message'
import { NotFoundError, ValidationError } from '../errors'
import * as conversationRepository from '../repositories/conversation.repository'
import * as messageRepository from '../repositories/message.repository'
import type { SendMessageResponse } from '../schemas/message.schema'
import { broadcast } from '../websocket'

export async function sendMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
  const conversation = await conversationRepository.findById(conversationId)
  if (!conversation) throw new NotFoundError(`Conversa ${conversationId} não encontrada`)

  if (conversation.status !== 'bot') {
    throw new ValidationError(`Esta conversa não está mais em triagem automática. Status atual: ${conversation.status}`)
  }

  const userMessage = await messageRepository.create(conversationId, 'user', content)
  broadcast('new_message', userMessage)

  const history = await messageRepository.findByConversationId(conversationId)
  const agentMessages = history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const result = await runAgent(agentMessages)

  const assistantMessage = await messageRepository.create(conversationId, 'assistant', result.reply)
  broadcast('new_message', assistantMessage)

  if (result.transfer) {
    await conversationRepository.updateTriageResult(conversationId, result.intent, result.intent, result.summary)
    const updatedConversation = await conversationRepository.findById(conversationId)
    broadcast('conversation_updated', updatedConversation)

    return {
      reply: result.reply,
      intent: result.intent,
      transfer: true,
      summary: result.summary,
    }
  }

  return {
    reply: result.reply,
    intent: null,
    transfer: false,
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return messageRepository.findByConversationId(conversationId)
}
