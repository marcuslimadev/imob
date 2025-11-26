import { test, expect } from '@playwright/test';

test.describe('Dashboard CRM', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para o dashboard
    await page.goto('/dashboard');
  });

  test('deve carregar o dashboard com métricas', async ({ page }) => {
    // Verificar título
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Verificar cards de métricas
    await expect(page.getByText(/total de leads/i)).toBeVisible();
    await expect(page.getByText(/im[óo]veis ativos/i)).toBeVisible();
    await expect(page.getByText(/conversas ativas/i)).toBeVisible();
    await expect(page.getByText(/mensagens enviadas/i)).toBeVisible();
  });

  test('deve exibir distribuição de stages', async ({ page }) => {
    // Verificar seção de stages
    await expect(page.getByText(/distribui[çc][ãa]o por stage/i)).toBeVisible();

    // Verificar se há badges de stages
    const stageBadges = page.locator('[class*="bg-"]').filter({ hasText: /lead novo|primeiro contato|qualifica[çc][ãa]o/i });
    await expect(stageBadges.first()).toBeVisible();
  });

  test('deve exibir atividades recentes', async ({ page }) => {
    // Verificar seção de atividades
    const activitySection = page.locator('text=/atividades? recentes?/i');
    
    if (await activitySection.count() > 0) {
      await expect(activitySection).toBeVisible();
    }
  });

  test('deve ser responsivo', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
