import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { sectorSchema } from '../schemas/conversation.schema'

const SYSTEM_PROMPT = `Você é um assistente de triagem de atendimento ao cliente de uma empresa.
Seu papel é identificar a intenção do cliente e direcioná-lo ao setor correto.

REGRAS:
1. Cumprimente o cliente de forma amigável na primeira mensagem.
2. Identifique a intenção do cliente em poucas interações (máximo 3 perguntas).
3. Classifique o cliente em um dos setores: vendas, suporte ou financeiro.
4. Recuse tópicos fora do escopo com a mensagem padrão.
5. Quando a intenção estiver clara, informe a transferência e encerre.

SETORES:
- vendas: compra, negociação, descontos, informações sobre produtos
- suporte: problemas, reclamações, erros, acesso bloqueado
- financeiro: pagamento, boletos, estorno, nota fiscal

FORA DO ESCOPO:
Responda exatamente: "Desculpe, mas não tenho autorização para falar sobre esse assunto. Meu foco é ajudar com vendas, suporte ou questões financeiras."

QUANDO IDENTIFICAR O SETOR:
Responda APENAS com este JSON exato (sem texto antes ou depois, sem blocos de código):
{
  "reply": "mensagem de transferência para o cliente",
  "transfer": true,
  "intent": "setor_aqui",
  "summary": "Resumo para o atendente com contexto completo e informações coletadas"
}

ENQUANTO EM TRIAGEM:
Responda apenas com texto simples, sem JSON.`

const aiTransferSchema = z.object({
  reply: z.string(),
  transfer: z.literal(true),
  intent: sectorSchema.unwrap(),
  summary: z.string(),
})

export type AgentResult =
  | { transfer: false; reply: string }
  | { transfer: true; reply: string; intent: 'vendas' | 'suporte' | 'financeiro'; summary: string }

function extractJson(text: string): string {
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonBlockMatch) return jsonBlockMatch[1].trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0].trim()

  return text.trim()
}

function getModel() {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')
  return new GoogleGenerativeAI(key).getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  })
}

export async function runAgent(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<AgentResult> {
  const model = getModel()

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastMessage = messages[messages.length - 1].content

  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage)
  const text = result.response.text()

  try {
    const raw = extractJson(text)
    const parsed = JSON.parse(raw)
    const validated = aiTransferSchema.parse(parsed)
    return {
      transfer: true,
      reply: validated.reply,
      intent: validated.intent,
      summary: validated.summary,
    }
  } catch {
    return { transfer: false, reply: text }
  }
}
