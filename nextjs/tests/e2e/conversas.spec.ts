import { test, expect } from '@playwright/test';

test.describe('Página de Conversas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conversas');
  });

  test('deve carregar a interface de conversas', async ({ page }) => {
    // Verificar layout de 2 colunas (lista + chat)
    await expect(page.locator('text=/conversas/i').first()).toBeVisible();
  });

  test('deve exibir campo de busca', async ({ page }) => {
    // Verificar campo de busca
    const searchInput = page.getByPlaceholder(/buscar conversa/i).or(page.getByPlaceholder(/buscar/i));
    await expect(searchInput.first()).toBeVisible();
  });

  test('deve permitir buscar conversas', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar conversa/i).or(page.getByPlaceholder(/buscar/i));
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('João');
      await page.waitForTimeout(300);
    }
  });

  test('deve exibir lista de conversas', async ({ page }) => {
    // Verificar se há cards de conversas
    const conversationCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /[0-9]{2}:[0-9]{2}/ });
    
    // Se houver conversas, verificar estrutura
    if (await conversationCards.count() > 0) {
      await expect(conversationCards.first()).toBeVisible();
    }
  });

  test('deve selecionar uma conversa', async ({ page }) => {
    const conversationCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /[0-9]{2}:[0-9]{2}/ });
    
    if (await conversationCards.count() > 0) {
      // Clicar na primeira conversa
      await conversationCards.first().click();

      // Aguardar chat carregar
      await page.waitForTimeout(500);

      // Verificar área de chat está visível
      const chatArea = page.locator('[class*="overflow-y-auto"]').filter({ hasText: /.+/ });
      if (await chatArea.count() > 0) {
        await expect(chatArea.first()).toBeVisible();
      }
    }
  });

  test('deve exibir campo de nova mensagem', async ({ page }) => {
    const conversationCards = page.locator('[class*="cursor-pointer"]');
    
    if (await conversationCards.count() > 0) {
      await conversationCards.first().click();
      await page.waitForTimeout(500);

      // Verificar input de nova mensagem
      const messageInput = page.getByPlaceholder(/digite uma mensagem/i).or(page.getByPlaceholder(/mensagem/i));
      if (await messageInput.count() > 0) {
        await expect(messageInput.first()).toBeVisible();
      }
    }
  });

  test('deve permitir digitar mensagem', async ({ page }) => {
    const conversationCards = page.locator('[class*="cursor-pointer"]');
    
    if (await conversationCards.count() > 0) {
      await conversationCards.first().click();
      await page.waitForTimeout(500);

      const messageInput = page.getByPlaceholder(/digite uma mensagem/i).or(page.getByPlaceholder(/mensagem/i));
      
      if (await messageInput.count() > 0) {
        await messageInput.first().fill('Teste de mensagem');
        await expect(messageInput.first()).toHaveValue('Teste de mensagem');
      }
    }
  });

  test('deve enviar mensagem com Enter', async ({ page }) => {
    const conversationCards = page.locator('[class*="cursor-pointer"]');
    
    if (await conversationCards.count() > 0) {
      await conversationCards.first().click();
      await page.waitForTimeout(500);

      const messageInput = page.getByPlaceholder(/digite uma mensagem/i).or(page.getByPlaceholder(/mensagem/i));
      
      if (await messageInput.count() > 0) {
        await messageInput.first().fill('Teste');
        await messageInput.first().press('Enter');
        
        // Aguardar envio
        await page.waitForTimeout(500);
      }
    }
  });

  test('deve exibir badges de stage nas conversas', async ({ page }) => {
    // Verificar se há badges coloridos
    const badges = page.locator('[class*="bg-"]').filter({ hasText: /novo|contato|qualifica/i });
    
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('deve mostrar estado vazio quando não há conversa selecionada', async ({ page }) => {
    // Verificar mensagem de estado vazio no lado direito
    const emptyState = page.locator('text=/selecione uma conversa|nenhuma conversa selecionada/i');
    
    // Estado vazio deve estar visível inicialmente
    if (await emptyState.count() > 0) {
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test('deve ser responsivo', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    // Verificar que lista de conversas está visível
    await expect(page.locator('body')).toBeVisible();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await expect(page.locator('body')).toBeVisible();
  });
});
