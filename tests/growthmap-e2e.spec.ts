import { test, expect } from '@playwright/test';

test.describe('GrowthMap E2E — Fluxo Completo', () => {
  const TENANT_ID = process.env.TEST_TENANT_ID || 'test-tenant-id';
  const PROJECT_ID = process.env.TEST_PROJECT_ID || 'demo-project';

  test.beforeEach(async ({ page }) => {
    // Skip auth para staging se necessário
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@revhackers.com');
    await page.getByPlaceholder(/senha/i).fill('test1234');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/admin');
  });

  test('fluxo completo: acessar → adicionar concorrente → gerar share → acessar público', async ({ page }) => {
    // 1. Navegar para Intelligence Dashboard
    await page.goto(`/admin/intelligence/${PROJECT_ID}`);
    await expect(page.locator('h1')).toContainText('Intelligence Dashboard', { timeout: 10000 });

    // 2. Adicionar concorrente
    await page.getByRole('button', { name: /adicionar concorrente/i }).click();
    await page.getByLabel(/nome/i).fill('Concorrente Teste E2E');
    await page.getByLabel(/cnpj/i).fill('12345678000195');
    await page.getByLabel(/website/i).fill('https://concorrente-teste.com');
    await page.getByRole('button', { name: /salvar/i }).click();

    // 3. Verificar que concorrente aparece na lista
    await expect(page.locator('text=Concorrente Teste E2E')).toBeVisible();

    // 4. Gerar share token
    await page.getByRole('button', { name: /compartilhar/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 5. Copiar link
    const shareInput = page.locator('input[readonly]');
    const shareUrl = await shareInput.inputValue();
    expect(shareUrl).toContain('/public/growthmap/');
    expect(shareUrl).toMatch(/shr_[a-z0-9]{48}/);

    // 6. Fechar modal
    await page.getByRole('button', { name: /fechar/i }).click();

    // 7. Acessar link público em nova aba
    const publicPage = await page.context().newPage();
    await publicPage.goto(shareUrl);
    await expect(publicPage.locator('h1')).toContainText('GrowthMap', { timeout: 10000 });
    await expect(publicPage.locator('text=Concorrente Teste E2E')).toBeVisible();

    // 8. Fechar página pública
    await publicPage.close();
  });

  test('share token expirado retorna 410 Gone', async ({ page }) => {
    // 1. Gerar share com expiração curta (1 minuto)
    await page.goto(`/admin/intelligence/${PROJECT_ID}`);
    await page.getByRole('button', { name: /compartilhar/i }).click();
    
    // 2. Selecionar expiração customizada
    await page.getByLabel(/expira em/i).selectOption('1m');
    const shareInput = page.locator('input[readonly]');
    const shareUrl = await shareInput.inputValue();
    await page.getByRole('button', { name: /fechar/i }).click();

    // 3. Aguardar expiração
    await page.waitForTimeout(65000); // 65 segundos

    // 4. Acessar link expirado
    const publicPage = await page.context().newPage();
    await publicPage.goto(shareUrl);
    await expect(publicPage.locator('text=Link de compartilhamento expirou')).toBeVisible();
    await publicPage.close();
  });

  test('revogar share token impede acesso', async ({ page }) => {
    // 1. Gerar share
    await page.goto(`/admin/intelligence/${PROJECT_ID}`);
    await page.getByRole('button', { name: /compartilhar/i }).click();
    const shareInput = page.locator('input[readonly]');
    const shareUrl = await shareInput.inputValue();
    await page.getByRole('button', { name: /fechar/i }).click();

    // 2. Verificar que funciona
    let publicPage = await page.context().newPage();
    await publicPage.goto(shareUrl);
    await expect(publicPage.locator('h1')).toContainText('GrowthMap');
    await publicPage.close();

    // 3. Revogar share (via API diretamente)
    await page.evaluate(async (url) => {
      const shareToken = url.split('/').pop();
      await fetch(`/api/v1/intelligence/share/${shareToken}`, {
        method: 'DELETE',
      });
    }, shareUrl);

    // 4. Verificar que não funciona mais
    publicPage = await page.context().newPage();
    await publicPage.goto(shareUrl);
    await expect(publicPage.locator('text=Link de compartilhamento inválido ou revogado')).toBeVisible();
    await publicPage.close();
  });
});
