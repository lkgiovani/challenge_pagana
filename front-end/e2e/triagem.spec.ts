import { test, expect, Page } from '@playwright/test'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function criarConversa(page: Page, clientName: string) {
  await page.goto('/atendimentos')
  await page.getByRole('button', { name: 'Nova conversa' }).click()
  await page.getByPlaceholder('Nome do cliente').fill(clientName)
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.waitForURL(/\/atendimentos\/.+/)
}

async function enviarMensagem(page: Page, texto: string) {
  const textarea = page.getByPlaceholder('Digite sua mensagem...')
  await textarea.fill(texto)
  await textarea.press('Enter')
}

// Aguarda a IA responder: o textarea volta a ficar enabled (ou desabilitado por transferência)
async function aguardarRespostaIA(page: Page) {
  await expect(page.locator('[data-role="assistant"]').last()).toBeVisible({ timeout: 45000 })
}

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Sistema de Triagem de Atendimento — Backend Real + Gemini', () => {

  test('1. Criar conversa e ver na lista com status Bot', async ({ page }) => {
    await page.goto('/atendimentos')
    await page.getByRole('button', { name: 'Nova conversa' }).click()

    await expect(page.getByPlaceholder('Nome do cliente')).toBeVisible()
    await page.getByPlaceholder('Nome do cliente').fill('Cliente E2E')
    await page.getByRole('button', { name: 'Criar' }).click()

    await page.waitForURL(/\/atendimentos\/.+/)

    await page.goto('/atendimentos')
    await expect(page.getByText('Cliente E2E')).toBeVisible()
    await expect(page.getByText('Bot')).toBeVisible()
  })

  test('2. Triagem financeiro — fluxo completo + assumir atendimento', async ({ page }) => {
    await criarConversa(page, 'João Silva Financeiro')

    await enviarMensagem(page, 'Quero informações sobre meu boleto vencido')

    // Aguarda a IA responder (até 45s para o Gemini)
    await aguardarRespostaIA(page)

    // A IA pode responder com triagem ou transferir direto
    // Se transferiu: banner aparece e input desabilita
    const foiTransferido = await page.getByText('Atendimento transferido para um humano').isVisible({ timeout: 45000 }).catch(() => false)

    if (foiTransferido) {
      // Input bloqueado
      await expect(page.getByPlaceholder('Chat desabilitado')).toBeVisible()

      // Painel com setor Financeiro
      await expect(page.getByText('Financeiro')).toBeVisible()

      // Resumo da IA presente
      await expect(page.getByText('Resumo da IA')).toBeVisible()

      // Assumir atendimento
      await page.getByRole('button', { name: 'Assumir Atendimento' }).click()
      await expect(page.getByText('Atendimento em andamento')).toBeVisible({ timeout: 10000 })
      await expect(page.getByRole('button', { name: 'Assumir Atendimento' })).not.toBeVisible()
    } else {
      // IA ainda em triagem — envia mais contexto
      await enviarMensagem(page, 'Quero pagar meu boleto atrasado e estorno de cobrança')
      await aguardarRespostaIA(page)
      await expect(page.getByText('Atendimento transferido para um humano')).toBeVisible({ timeout: 45000 })
      await expect(page.getByText('Financeiro')).toBeVisible()
    }
  })

  test('3. Triagem vendas — identificação de setor', async ({ page }) => {
    await criarConversa(page, 'Maria Santos Vendas')

    await enviarMensagem(page, 'Quero comprar um produto e saber sobre descontos disponíveis')
    await aguardarRespostaIA(page)

    // Se não transferiu na primeira, insiste
    const foiTransferido = await page.getByText('Atendimento transferido para um humano').isVisible().catch(() => false)
    if (!foiTransferido) {
      await enviarMensagem(page, 'Quero fechar uma compra agora, qual o preço?')
      await aguardarRespostaIA(page)
    }

    await expect(page.getByText('Atendimento transferido para um humano')).toBeVisible({ timeout: 45000 })
    await expect(page.getByText('Vendas')).toBeVisible()
  })

  test('4. Triagem suporte — identificação de setor', async ({ page }) => {
    await criarConversa(page, 'Pedro Alves Suporte')

    await enviarMensagem(page, 'Estou com um erro no sistema, não consigo acessar minha conta')
    await aguardarRespostaIA(page)

    const foiTransferido = await page.getByText('Atendimento transferido para um humano').isVisible().catch(() => false)
    if (!foiTransferido) {
      await enviarMensagem(page, 'Está dando erro 403 e meu acesso está bloqueado')
      await aguardarRespostaIA(page)
    }

    await expect(page.getByText('Atendimento transferido para um humano')).toBeVisible({ timeout: 45000 })
    await expect(page.getByText('Suporte')).toBeVisible()
  })

  test('5. Tópico fora do escopo — bot recusa e continua ativo', async ({ page }) => {
    await criarConversa(page, 'Ana Lima Escopo')

    await enviarMensagem(page, 'Vai chover amanhã na minha cidade?')
    await aguardarRespostaIA(page)

    // Input deve continuar ativo (não transferiu)
    await expect(page.getByPlaceholder('Digite sua mensagem...')).toBeEnabled()

    // Sem banner de transferência
    await expect(page.getByText('Atendimento transferido para um humano')).not.toBeVisible()

    // A IA deve mencionar que não pode falar sobre o assunto
    const resposta = page.locator('[data-role="assistant"]').last()
    await expect(resposta).toBeVisible()
    const texto = await resposta.textContent()
    expect(texto).toMatch(/autoriza|escopo|vendas|suporte|financeiro/i)
  })

  test('6. Múltiplas mensagens — triagem gradual', async ({ page }) => {
    await criarConversa(page, 'Carlos Melo Gradual')

    // Primeira: genérica
    await enviarMensagem(page, 'Olá, preciso de ajuda')
    await aguardarRespostaIA(page)

    // Bot deve responder sem transferir ainda
    await expect(page.getByPlaceholder('Digite sua mensagem...')).toBeEnabled()

    // Segunda: específica — boleto
    await enviarMensagem(page, 'Quero segunda via do meu boleto e informações de pagamento')
    await aguardarRespostaIA(page)

    // Pode ter transferido na segunda, se não, insiste
    const foiTransferido = await page.getByText('Atendimento transferido para um humano').isVisible().catch(() => false)
    if (!foiTransferido) {
      await enviarMensagem(page, 'Meu boleto venceu e quero pagar')
      await aguardarRespostaIA(page)
    }

    await expect(page.getByText('Atendimento transferido para um humano')).toBeVisible({ timeout: 45000 })
    await expect(page.getByPlaceholder('Chat desabilitado')).toBeVisible()
    await expect(page.getByText('Resumo da IA')).toBeVisible()

    // Histórico tem mensagens do user e da IA
    const mensagensUser = page.locator('[data-role="user"]')
    const mensagensIA = page.locator('[data-role="assistant"]')
    await expect(mensagensUser).toHaveCount(await mensagensUser.count(), { timeout: 1000 })
    expect(await mensagensUser.count()).toBeGreaterThanOrEqual(2)
    expect(await mensagensIA.count()).toBeGreaterThanOrEqual(2)
  })
})
