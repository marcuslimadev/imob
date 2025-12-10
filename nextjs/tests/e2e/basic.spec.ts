import { test, expect } from '@playwright/test';

// URLs configuráveis para testes dentro do Docker
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://directus:8055';
const NEXTJS_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4000';

test.describe('Sistema iMOBI - Testes Básicos', () => {
  
  test('Directus Admin carrega corretamente', async ({ page }) => {
    await page.goto(`${DIRECTUS_URL}/admin`);
    
    // Aguardar página de login carregar
    await expect(page).toHaveTitle(/Directus/);
    
    // Verificar campo de email
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Verificar campo de senha
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Verificar botão de login
    await expect(page.getByRole('button', { name: /sign in|entrar/i })).toBeVisible();
  });

  test('Next.js carrega página inicial', async ({ page }) => {
    await page.goto(NEXTJS_URL);
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se não há erro 500
    const content = await page.textContent('body');
    expect(content).not.toContain('500');
    expect(content).not.toContain('Internal Server Error');
  });

  test('Página de login do Next.js carrega', async ({ page }) => {
    await page.goto(`${NEXTJS_URL}/login`);
    
    // Aguardar formulário de login
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Verificar campos do formulário
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('API Directus responde corretamente', async ({ request }) => {
    const response = await request.get(`${DIRECTUS_URL}/server/health`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    // Status pode ser 'ok' ou 'warn' (sistema sob pressão)
    expect(['ok', 'warn']).toContain(body.status);
  });

  test('Collections existem no Directus', async ({ request }) => {
    // Login
    const loginResponse = await request.post(`${DIRECTUS_URL}/auth/login`, {
      data: {
        email: 'marcus@admin.com',
        password: 'Teste@123'
      }
    });
    
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    
    // Listar collections
    const collectionsResponse = await request.get(`${DIRECTUS_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(collectionsResponse.status()).toBe(200);
    const collectionsData = await collectionsResponse.json();
    
    // Verificar collections principais
    const collectionNames = collectionsData.data.map((c: any) => c.collection);
    expect(collectionNames).toContain('companies');
    expect(collectionNames).toContain('properties');
    expect(collectionNames).toContain('leads');
    expect(collectionNames).toContain('conversas');
  });

  test('Vitrine pública carrega', async ({ page }) => {
    await page.goto(`${NEXTJS_URL}/vitrine?company=exclusiva`);
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar que não há erro
    const content = await page.textContent('body');
    expect(content).not.toContain('404');
    expect(content).not.toContain('500');
  });

  test('Sistema suporta múltiplas abas', async ({ context }) => {
    // Abrir Directus
    const directusPage = await context.newPage();
    await directusPage.goto(`${DIRECTUS_URL}/admin`);
    await expect(directusPage).toHaveTitle(/Directus/);
    
    // Abrir Next.js
    const nextjsPage = await context.newPage();
    await nextjsPage.goto(NEXTJS_URL);
    await nextjsPage.waitForLoadState('networkidle');
    
    // Verificar ambos funcionam simultaneamente
    await expect(directusPage.locator('input[type="email"]')).toBeVisible();
    expect(await nextjsPage.textContent('body')).not.toContain('500');
    
    await directusPage.close();
    await nextjsPage.close();
  });
});
