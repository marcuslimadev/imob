import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Timeout máximo por teste */
  timeout: 30 * 1000,
  
  /* Expectativas com timeout */
  expect: {
    timeout: 5000,
  },
  
  /* Executar testes em paralelo */
  fullyParallel: true,
  
  /* Fail no primeiro erro em CI */
  forbidOnly: !!process.env.CI,
  
  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4000',
    
    /* Coletar traces em falhas */
    trace: 'on-first-retry',
    
    /* Screenshots em falhas */
    screenshot: 'only-on-failure',
    
    /* Vídeos em falhas */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para diferentes browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Testes mobile */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* Servidor de desenvolvimento */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
