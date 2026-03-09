# Plano: Melhorar o back-end do challenge seguindo padrões do boilerplate-api

## Context

O projeto `challenge_pagana/back-end` usa `console.log/error` para logging e tem uma hierarquia de erros simples sem códigos estruturados. O objetivo é elevar a qualidade do código seguindo os padrões do `boilerplate-api` (logger com pino, erros com ExceptionCode, mapeamento HTTP centralizado), **sem mudar a arquitetura existente** (mantém Fastify, TypeORM, repositórios, serviços, controllers, rotas).

---

## Arquivos a modificar

| Arquivo | Ação |
|---|---|
| `back-end/package.json` | Adicionar `pino` e `pino-pretty` como dependências |
| `back-end/src/logger.ts` | **Criar** — logger com pino (novo arquivo) |
| `back-end/src/errors.ts` | **Atualizar** — ExceptionCode, BaseException, exceções tipadas, ExceptionHttpMapper |
| `back-end/src/server.ts` | **Atualizar** — usar logger, novo error handler, graceful shutdown |

---

## Mudanças detalhadas

### 1. Instalar dependências

```bash
npm install pino pino-pretty
```

### 2. Criar `src/logger.ts`

Logger simples com pino + pino-pretty (sem OTEL, pois o projeto não tem essa infraestrutura):

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
})
```

Interface compatível com o boilerplate (methods: `info`, `warn`, `error`, `debug`).

### 3. Atualizar `src/errors.ts`

Seguindo o padrão do boilerplate:

- **`ExceptionCode` enum** — códigos semânticos: `BadRequest`, `NotFound`, `Unprocessable`, `Internal`
- **`BaseException`** — substitui `AppError`, com `code`, `metadata`, `reportable`
- **Exceções concretas**: `BadRequestException`, `NotFoundException`, `ValidationException`, `InternalException`
- **`ExceptionHttpMapper`** — mapeamento centralizado `ExceptionCode → { status, error }`

Os testes e services usam os nomes antigos (`NotFoundError`, `ValidationError`, `AppError`).
O `errors.ts` **exporta ambos os nomes** — os novos e os antigos como aliases:

```typescript
// Aliases para retrocompatibilidade
export { BaseException as AppError }
export { NotFoundException as NotFoundError }
export { BadRequestException as ValidationError }
```

Isso evita tocar nos testes e garante que tudo continue funcionando.

### 4. Atualizar `src/server.ts`

- Remover todos os `console.log/error`
- Usar `logger` do `src/logger.ts`
- Substituir `Fastify({ logger: true })` por `Fastify({ logger: false })` (pino gerencia logging)
- Atualizar `setErrorHandler` para usar `ExceptionHttpMapper` e `logger.error` condicional baseado em `reportable`
- Adicionar **graceful shutdown** (`SIGTERM`/`SIGINT`) com `fastify.close()`

---

## Error response format (mantido igual)

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Conversa xyz não encontrada"
}
```

---

## Verificação

1. `npm run dev` — servidor sobe sem erros, logs em formato pino-pretty
2. `POST /api/conversations` com body inválido → retorna 400 com log estruturado
3. `GET /api/conversations/:id` com ID inexistente → retorna 404 sem logar (não reportable)
4. Erro inesperado → retorna 500 e loga com `logger.error`
5. `SIGINT` (Ctrl+C) → shutdown graceful com mensagem no log
6. `npm test` — testes passam sem alterações
