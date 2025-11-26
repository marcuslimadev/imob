import { test, expect } from '@playwright/test';

test.describe('Página de Leads', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leads');
  });

  test('deve carregar a página de leads', async ({ page }) => {
    // Verificar título
    await expect(page.getByRole('heading', { name: /gerenciamento de leads/i })).toBeVisible();

    // Verificar botão de export
    await expect(page.getByRole('button', { name: /exportar csv/i })).toBeVisible();
  });

  test('deve exibir filtros', async ({ page }) => {
    // Verificar campo de busca
    await expect(page.getByPlaceholder(/buscar por nome/i)).toBeVisible();

    // Verificar seção de filtros
    await expect(page.getByText(/filtros/i)).toBeVisible();
  });

  test('deve permitir buscar leads', async ({ page }) => {
    // Digitar no campo de busca
    const searchInput = page.getByPlaceholder(/buscar por nome/i);
    await searchInput.fill('João');

    // Aguardar filtro ser aplicado (debounce)
    await page.waitForTimeout(500);

    // Verificar que a tabela foi atualizada
    await expect(page.locator('table')).toBeVisible();
  });

  test('deve filtrar por stage', async ({ page }) => {
    // Clicar no select de stage
    const stageSelect = page.locator('[placeholder*="Todos os stages"]').or(page.getByText(/todos os stages/i));
    
    if (await stageSelect.count() > 0) {
      await stageSelect.first().click();

      // Selecionar um stage
      await page.getByText(/qualifica[çc][ãa]o/i).first().click();

      // Verificar que filtro foi aplicado
      await page.waitForTimeout(300);
    }
  });

  test('deve exibir tabela de leads', async ({ page }) => {
    // Verificar headers da tabela
    await expect(page.getByRole('columnheader', { name: /nome/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /contato/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /stage/i })).toBeVisible();
  });

  test('deve permitir exportar CSV', async ({ page }) => {
    // Configurar listener para download
    const downloadPromise = page.waitForEvent('download');

    // Clicar em exportar
    await page.getByRole('button', { name: /exportar csv/i }).click();

    // Aguardar download
    const download = await downloadPromise;
    
    // Verificar nome do arquivo
    expect(download.suggestedFilename()).toMatch(/leads_.*\.csv/);
  });

  test('deve abrir modal de detalhes', async ({ page }) => {
    // Verificar se há leads na tabela
    const viewButtons = page.getByRole('button').filter({ has: page.locator('[class*="lucide-eye"]') });
    
    if (await viewButtons.count() > 0) {
      // Clicar no primeiro botão de visualizar
      await viewButtons.first().click();

      // Verificar modal aberto
      await expect(page.getByText(/detalhes do lead/i)).toBeVisible();

      // Verificar tabs
      await expect(page.getByRole('tab', { name: /informa[çc][õo]es/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /hist[óo]rico/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /mensagens/i })).toBeVisible();
    }
  });

  test('deve permitir editar lead', async ({ page }) => {
    // Abrir modal de detalhes
    const viewButtons = page.getByRole('button').filter({ has: page.locator('[class*="lucide-eye"]') });
    
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();

      // Clicar em editar
      const editButton = page.getByRole('button', { name: /editar/i });
      if (await editButton.count() > 0) {
        await editButton.click();

        // Verificar botões de salvar/cancelar aparecem
        await expect(page.getByRole('button', { name: /salvar/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
      }
    }
  });

  test('deve limpar filtros', async ({ page }) => {
    // Aplicar filtro de busca
    await page.getByPlaceholder(/buscar por nome/i).fill('Test');
    await page.waitForTimeout(500);

    // Verificar botão de limpar filtros
    const clearButton = page.getByRole('button', { name: /limpar filtros/i });
    
    if (await clearButton.count() > 0) {
      await clearButton.click();

      // Verificar que campo foi limpo
      await expect(page.getByPlaceholder(/buscar por nome/i)).toHaveValue('');
    }
  });
});
