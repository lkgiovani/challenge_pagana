# Backend — Sistema de Triagem de Atendimento com IA

API REST + WebSocket para triagem inteligente de atendimento ao cliente usando Claude da Anthropic.

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20+ | Runtime |
| TypeScript | 5.8 | Linguagem |
| Fastify | 5 | Framework HTTP |
| TypeORM | 0.3 | ORM |
| SQLite (in-memory) | — | Banco de dados |
| Zod | 3 | Validação de schemas |
| @fastify/type-provider-zod | 4 | Integração Fastify + Zod |
| Anthropic SDK | 0.39 | Claude AI |
| ws | 8 | WebSocket |

## Estrutura de pastas

```
src/
├── ai/agent.ts               # Integração com Claude
├── controllers/              # Camada de controle HTTP
├── database/
│   ├── entities/             # Entidades TypeORM
│   └── index.ts              # DataSource SQLite in-memory
├── errors.ts                 # Classes de erro customizadas
├── plugins/cors.ts           # Plugin CORS
├── repositories/             # Acesso a dados via TypeORM
├── routes/                   # Definição de rotas + schemas Zod
├── schemas/                  # Schemas Zod + tipos TypeScript
├── services/                 # Regras de negócio
├── websocket/index.ts        # Servidor WebSocket
└── server.ts                 # Entry point
```

## Como rodar

```bash
cd back-end
cp .env.example .env
# Edite .env com sua ANTHROPIC_API_KEY
npm install
npm run dev
```

## Endpoints

### GET /health
```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

### POST /api/conversations
**Body:** `{ "clientName": "João Silva" }`
**Response 201:**
```json
{
  "id": "uuid",
  "client_name": "João Silva",
  "status": "bot",
  "sector": null,
  "intent": null,
  "summary": null,
  "created_at": "...",
  "updated_at": "..."
}
```

### GET /api/conversations
**Response 200:** Array de conversas

### GET /api/conversations/:id
**Response 200:** Conversa pelo ID (404 se não encontrada)

### PATCH /api/conversations/:id/assume
Atendente assume a conversa — muda status para `in_progress`
**Response 200:** Conversa atualizada

### POST /api/messages
**Body:** `{ "conversationId": "uuid", "message": "quero comprar um produto" }`
**Response 200:**
```json
{
  "reply": "mensagem da IA",
  "intent": null,
  "transfer": false
}
```
Quando a IA identifica o setor:
```json
{
  "reply": "Vou te transferir para o setor de vendas!",
  "intent": "vendas",
  "transfer": true,
  "summary": "Cliente quer comprar produto X, interessado em desconto."
}
```

### GET /api/messages/:conversationId
**Response 200:** Array de mensagens da conversa

## WebSocket

Conecte em `ws://localhost:3001` para receber eventos em tempo real:

| Evento | Quando |
|---|---|
| `new_conversation` | Nova conversa criada |
| `new_message` | Mensagem salva (user ou assistant) |
| `conversation_updated` | Status/setor/intent/summary alterados |

**Formato:**
```json
{ "event": "new_message", "data": { ... } }
```

## Status das conversas

| Status | Descrição |
|---|---|
| `bot` | Em triagem automática com IA |
| `transferred` | Triagem concluída, aguardando atendente |
| `in_progress` | Atendente assumiu a conversa |

## Comportamento da IA

A IA (Claude) recebe o histórico completo da conversa e:
1. Cumprimenta o cliente na primeira mensagem
2. Identifica a intenção em poucas trocas
3. Classifica em `vendas`, `suporte` ou `financeiro`
4. Recusa tópicos fora do escopo
5. Quando identifica o setor, retorna JSON com `transfer: true` e encerra a triagem
