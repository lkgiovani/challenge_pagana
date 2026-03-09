import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,   // 60s por teste — Gemini pode demorar
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Assume que o backend já está rodando em :3001
    // e sobe apenas o Vite apontando para ele
    command: 'VITE_API_URL=http://localhost:3001/api VITE_WS_URL=ws://localhost:3001 npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 20000,
  },
})
