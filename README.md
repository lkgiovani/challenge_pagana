# Triagem IA — Sistema de Atendimento Inteligente

Sistema Full Stack de triagem de atendimento ao cliente com IA. Um agente de IA realiza o primeiro contato, identifica a intenção do cliente e transfere para o setor humano correto.

---

## Visão Geral

O sistema possui dois painéis distintos:

| Painel | URL | Quem usa |
|--------|-----|----------|
| **Cliente** | `/atendimentos` | Cliente abre conversa e fala com a IA |
| **Atendente** | `/atendente` | Agente humano assume e responde ao cliente |

### Fluxo de atendimento

```
Cliente abre conversa
        ↓
  IA faz triagem
  (max 3 trocas)
        ↓
IA identifica intenção
e transfere para setor
        ↓
  Status: transferred
  Cliente fica pausado
        ↓
Atendente vê na fila
  e clica "Assumir"
        ↓
  Status: in_progress
Cliente e atendente
  conversam em tempo real
```

### Setores de encaminhamento

| Setor | Quando |
|-------|--------|
| **Vendas** | Compra, negociação, desconto, produto |
| **Suporte** | Problema, reclamação, erro, acesso |
| **Financeiro** | Pagamento, boleto, estorno, nota fiscal |

---

## Tecnologias

**Back-end**
- Node.js + TypeScript
- Fastify 5 (HTTP server)
- TypeORM + SQLite (banco de dados)
- Google Gemini 2.5 Flash (IA)
- WebSocket (tempo real)
- Zod (validação)
- Vitest (testes)

**Front-end**
- React 19 + TypeScript
- Vite 7
- TanStack Router (roteamento)
- TanStack Query (estado servidor)
- Tailwind CSS 4
- shadcn/ui (componentes)

---

## Pré-requisitos

- Node.js 20+
- Chave de API do Google Gemini ([obter aqui](https://aistudio.google.com/app/apikey))

---

## Rodando localmente

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd challenge_pagana
```

### 2. Back-end

```bash
cd back-end
npm install
```

Crie o arquivo `.env`:

```env
GEMINI_API_KEY=sua_chave_aqui
PORT=3001
```

Inicie o servidor:

```bash
npm run dev
```

O servidor sobe em `http://localhost:3001`.

### 3. Front-end

```bash
cd front-end
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

---

## Rodando com Docker

```bash
GEMINI_API_KEY=sua_chave_aqui docker compose up --build
```

- Front-end: `http://localhost`
- Back-end: `http://localhost:3001`

---

## Testes

```bash
cd back-end
npm test            # todos os testes
npm run test:coverage  # com cobertura
```

---

## Estrutura do projeto

```
challenge_pagana/
├── back-end/
│   └── src/
│       ├── ai/              # Integração com Gemini (agente de triagem)
│       ├── controllers/     # Handlers HTTP
│       ├── services/        # Lógica de negócio
│       ├── repositories/    # Acesso ao banco
│       ├── routes/          # Definição de rotas + schemas Zod
│       ├── database/        # TypeORM + entidades
│       ├── websocket/       # Servidor WebSocket
│       └── schemas/         # Schemas de validação
└── front-end/
    └── src/
        ├── features/
        │   ├── chat/        # ChatWindow, MessageInput, bubbles, hooks
        │   └── conversations/ # ConversationList, modais, hooks
        ├── routes/
        │   ├── atendimentos/  # Painel do cliente
        │   └── atendente/     # Painel do atendente
        └── lib/             # Axios, React Query, Router
```

---

## API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Health check |
| `POST` | `/api/conversations` | Criar nova conversa |
| `GET` | `/api/conversations` | Listar todas as conversas |
| `GET` | `/api/conversations/:id` | Buscar conversa por ID |
| `PATCH` | `/api/conversations/:id/assume` | Atendente assume a conversa |
| `POST` | `/api/messages` | Enviar mensagem (IA ou humano) |
| `GET` | `/api/messages/:conversationId` | Histórico de mensagens |

### Exemplo — enviar mensagem

```json
POST /api/messages
{
  "conversationId": "uuid",
  "message": "Quero pagar meu boleto",
  "sender": "user"
}
```

Resposta (triagem ativa):
```json
{
  "reply": "Claro! Vou te transferir para o financeiro.",
  "intent": "financeiro",
  "transfer": true,
  "summary": "Cliente solicita linha digitável de boleto vencendo hoje."
}
```

---

## Status das conversas

| Status | Descrição |
|--------|-----------|
| `bot` | IA realizando triagem |
| `transferred` | IA transferiu, aguardando atendente |
| `in_progress` | Atendente assumiu, conversa humana ativa |

---

## Variáveis de ambiente

### Back-end

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GEMINI_API_KEY` | Sim | Chave da API do Google Gemini |
| `PORT` | Não (padrão: 3001) | Porta do servidor |

### Front-end

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `http://localhost:3001/api` | URL base da API |
| `VITE_WS_URL` | `ws://localhost:3001` | URL do WebSocket |
