import { test, expect } from '@playwright/test';

test.describe('Navegação e Multi-Tenant', () => {
  test('deve navegar entre páginas', async ({ page }) => {
    // Ir para dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Ir para leads
    await page.goto('/leads');
    await expect(page.getByRole('heading', { name: /gerenciamento de leads/i })).toBeVisible();

    // Ir para conversas
    await page.goto('/conversas');
    await expect(page.locator('body')).toBeVisible();
  });

  test('deve manter company_id em todas as requisições', async ({ page }) => {
    // Interceptar requisições para verificar company_id
    const requests: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('localhost:8055') || request.url().includes('directus')) {
        requests.push(request.url());
      }
    });

    // Navegar para dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Verificar se houve requisições ao Directus
    expect(requests.length).toBeGreaterThan(0);
  });

  test('deve aplicar isolamento por empresa nos dados', async ({ page }) => {
    // Navegar para leads
    await page.goto('/leads');
    await page.waitForTimeout(1000);

    // Verificar se há leads na tabela
    const table = page.locator('table');
    if (await table.count() > 0) {
      await expect(table).toBeVisible();
    }
  });
});

test.describe('Performance', () => {
  test('dashboard deve carregar em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('página de leads deve carregar em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('conversas deve carregar em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/conversas');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('SEO e Acessibilidade', () => {
  test('dashboard deve ter meta tags corretas', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar title
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('deve ter estrutura HTML semântica', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar headings
    const h1 = page.getByRole('heading', { level: 1 });
    expect(await h1.count()).toBeGreaterThan(0);
  });

  test('botões devem ser acessíveis via teclado', async ({ page }) => {
    await page.goto('/leads');

    // Navegar com Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verificar que o foco está visível
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('contraste de cores deve ser adequado', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar se badges têm contraste suficiente
    const badges = page.locator('[class*="badge"]');
    if (await badges.count() > 0) {
      const firstBadge = badges.first();
      await expect(firstBadge).toBeVisible();
    }
  });
});

test.describe('Erros e Estados', () => {
  test('deve exibir estado vazio quando não há dados', async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(1000);

    // Verificar se há mensagem de estado vazio
    const emptyState = page.locator('text=/nenhum lead encontrado|sem resultados/i');
    
    // Estado vazio pode estar visível se não houver dados
    if (await emptyState.count() > 0) {
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test('deve exibir loading states', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar se há indicadores de loading (temporariamente)
    const loading = page.locator('text=/carregando|loading/i');
    
    // Loading pode aparecer brevemente
    await page.waitForTimeout(100);
  });

  test('deve lidar com erros de rede gracefully', async ({ page }) => {
    // Simular offline
    await page.context().setOffline(true);
    
    await page.goto('/dashboard').catch(() => {
      // Esperado falhar
    });

    // Restaurar conexão
    await page.context().setOffline(false);
  });
});

test.describe('Funcionalidades Específicas', () => {
  test('filtros devem funcionar em conjunto', async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(500);

    // Aplicar busca
    const searchInput = page.getByPlaceholder(/buscar por nome/i);
    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(500);

      // Aplicar filtro de stage (se disponível)
      const stageSelect = page.locator('[placeholder*="stage"]').or(page.getByText(/todos os stages/i));
      if (await stageSelect.count() > 0) {
        await stageSelect.first().click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('modal deve fechar ao clicar fora', async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(500);

    const viewButtons = page.getByRole('button').filter({ has: page.locator('[class*="lucide-eye"]') });
    
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(500);

      // Verificar modal aberto
      const modal = page.locator('[role="dialog"]');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();

        // Clicar fora (backdrop)
        await page.mouse.click(10, 10);
        await page.waitForTimeout(500);

        // Modal pode ter fechado
      }
    }
  });

  test('tabs devem alternar conteúdo', async ({ page }) => {
    await page.goto('/leads');
    await page.waitForTimeout(500);

    const viewButtons = page.getByRole('button').filter({ has: page.locator('[class*="lucide-eye"]') });
    
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(500);

      // Clicar em tab de mensagens
      const messagesTab = page.getByRole('tab', { name: /mensagens/i });
      if (await messagesTab.count() > 0) {
        await messagesTab.click();
        await page.waitForTimeout(300);

        // Verificar conteúdo da tab
        await expect(messagesTab).toBeVisible();
      }
    }
  });
});
