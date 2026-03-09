import type { Conversation, Message } from '@/types'

export const mockConversations: Conversation[] = [
  {
    id: '1',
    client_name: 'Maria Silva',
    status: 'bot',
    sector: null,
    intent: null,
    summary: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    client_name: 'Joao Santos',
    status: 'transferred',
    sector: 'vendas',
    intent: 'Interesse em plano premium',
    summary: 'Cliente interessado em upgrade para o plano premium. Solicitou informacoes sobre precos e beneficios.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    client_name: 'Ana Costa',
    status: 'in_progress',
    sector: 'suporte',
    intent: 'Problema tecnico',
    summary: 'Cliente relata problemas com login na plataforma. Erro 403 ao tentar acessar.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    client_name: 'Carlos Oliveira',
    status: 'transferred',
    sector: 'financeiro',
    intent: 'Duvida sobre cobranca',
    summary: 'Cliente questiona cobranca duplicada no cartao. Solicita estorno.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      conversation_id: '1',
      role: 'user',
      content: 'Ola, gostaria de informacoes sobre o produto',
      created_at: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: '1-2',
      conversation_id: '1',
      role: 'assistant',
      content: 'Ola! Seja bem-vindo(a)! Estou aqui para ajuda-lo(a). Sobre qual produto voce gostaria de saber mais?',
      created_at: new Date(Date.now() - 30000).toISOString(),
    },
  ],
  '2': [
    {
      id: '2-1',
      conversation_id: '2',
      role: 'user',
      content: 'Quero saber sobre o plano premium',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2-2',
      conversation_id: '2',
      role: 'assistant',
      content:
        'Entendi que voce tem interesse no plano premium! Vou transferi-lo para nossa equipe de vendas que podera dar todas as informacoes detalhadas.',
      created_at: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: '2-3',
      conversation_id: '2',
      role: 'assistant',
      content: '[Sistema] Conversa transferida para o setor de Vendas',
      created_at: new Date(Date.now() - 3400000).toISOString(),
    },
  ],
  '3': [
    {
      id: '3-1',
      conversation_id: '3',
      role: 'user',
      content: 'Nao estou conseguindo fazer login',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3-2',
      conversation_id: '3',
      role: 'assistant',
      content: 'Sinto muito pelo inconveniente. Pode me informar qual erro aparece na tela?',
      created_at: new Date(Date.now() - 7100000).toISOString(),
    },
    {
      id: '3-3',
      conversation_id: '3',
      role: 'user',
      content: 'Aparece erro 403',
      created_at: new Date(Date.now() - 7000000).toISOString(),
    },
    {
      id: '3-4',
      conversation_id: '3',
      role: 'assistant',
      content:
        'Entendo. O erro 403 geralmente indica um problema de permissao. Vou transferir voce para nossa equipe de suporte tecnico.',
      created_at: new Date(Date.now() - 6900000).toISOString(),
    },
  ],
  '4': [],
}

// In-memory store for mutations
let conversations = [...mockConversations]
const messages = { ...mockMessages }
let messageIdCounter = 100

export const mockApi = {
  getConversations: () => Promise.resolve([...conversations]),

  getConversation: (id: string) => {
    const conv = conversations.find(c => c.id === id)
    return Promise.resolve(conv || null)
  },

  getMessages: (conversationId: string) => {
    return Promise.resolve(messages[conversationId] || [])
  },

  createConversation: (clientName: string) => {
    const newConv: Conversation = {
      id: String(Date.now()),
      client_name: clientName,
      status: 'bot',
      sector: null,
      intent: null,
      summary: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    conversations = [newConv, ...conversations]
    messages[newConv.id] = []
    return Promise.resolve(newConv)
  },

  sendMessage: async (conversationId: string, content: string) => {
    // Add user message
    const userMessage: Message = {
      id: String(++messageIdCounter),
      conversation_id: conversationId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    if (!messages[conversationId]) {
      messages[conversationId] = []
    }
    messages[conversationId] = [...messages[conversationId], userMessage]

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate mock AI response
    const aiResponse = generateMockResponse(content)
    const assistantMessage: Message = {
      id: String(++messageIdCounter),
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse.reply,
      created_at: new Date().toISOString(),
    }
    messages[conversationId] = [...messages[conversationId], assistantMessage]

    // Update conversation if transferred
    if (aiResponse.transfer) {
      conversations = conversations.map(c =>
        c.id === conversationId
          ? {
              ...c,
              status: 'transferred' as const,
              sector: aiResponse.sector,
              intent: aiResponse.intent,
              summary: aiResponse.summary,
              updated_at: new Date().toISOString(),
            }
          : c,
      )
    }

    return Promise.resolve({
      reply: aiResponse.reply,
      intent: aiResponse.intent,
      transfer: aiResponse.transfer,
      summary: aiResponse.summary,
    })
  },

  assumeConversation: (conversationId: string) => {
    conversations = conversations.map(c =>
      c.id === conversationId ? { ...c, status: 'in_progress' as const, updated_at: new Date().toISOString() } : c,
    )
    return Promise.resolve(conversations.find(c => c.id === conversationId))
  },
}

function generateMockResponse(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase()

  // Check for sales-related keywords
  if (
    lowerMessage.includes('preco') ||
    lowerMessage.includes('comprar') ||
    lowerMessage.includes('plano') ||
    lowerMessage.includes('valor')
  ) {
    return {
      reply:
        'Entendi que voce tem interesse em nossos planos! Vou transferi-lo para nossa equipe de vendas que podera ajuda-lo com todas as informacoes de precos e condicoes especiais.',
      intent: 'Interesse comercial',
      transfer: true,
      sector: 'vendas' as const,
      summary: 'Cliente demonstrou interesse em precos e planos. Encaminhado para equipe de vendas.',
    }
  }

  // Check for support-related keywords
  if (
    lowerMessage.includes('erro') ||
    lowerMessage.includes('problema') ||
    lowerMessage.includes('bug') ||
    lowerMessage.includes('nao funciona')
  ) {
    return {
      reply:
        'Sinto muito pelo inconveniente que voce esta enfrentando. Vou encaminha-lo para nossa equipe de suporte tecnico que podera resolver essa questao.',
      intent: 'Problema tecnico',
      transfer: true,
      sector: 'suporte' as const,
      summary: 'Cliente relata problema tecnico. Encaminhado para suporte.',
    }
  }

  // Check for financial-related keywords
  if (
    lowerMessage.includes('pagamento') ||
    lowerMessage.includes('cobranca') ||
    lowerMessage.includes('fatura') ||
    lowerMessage.includes('reembolso')
  ) {
    return {
      reply:
        'Entendo sua preocupacao com questoes financeiras. Vou transferi-lo para nosso setor financeiro que podera esclarecer todas as suas duvidas.',
      intent: 'Questao financeira',
      transfer: true,
      sector: 'financeiro' as const,
      summary: 'Cliente com duvidas sobre cobrancas/pagamentos. Encaminhado para financeiro.',
    }
  }

  // Default bot response
  return {
    reply:
      'Obrigado pela sua mensagem! Como posso ajuda-lo hoje? Posso auxiliar com informacoes sobre nossos produtos, suporte tecnico ou questoes financeiras.',
    intent: null,
    transfer: false,
    sector: null,
    summary: null,
  }
}
