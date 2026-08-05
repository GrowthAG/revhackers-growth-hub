import { test, expect } from '@playwright/test';

test.describe('Intelligence Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@revhackers.com');
    await page.getByPlaceholder(/senha/i).fill('test1234');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/admin');
  });

  test('dashboard carrega com lista de concorrentes', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Verificar que dashboard carrega
    await expect(page.locator('h1')).toContainText('Intelligence Dashboard', { timeout: 10000 });

    // 2. Verificar que lista de concorrentes existe
    await expect(page.locator('[data-testid="competitors-list"]')).toBeVisible();

    // 3. Verificar que há pelo menos um concorrente (seed data)
    const competitorCards = page.locator('[data-testid="competitor-card"]');
    await expect(competitorCards.first()).toBeVisible();
  });

  test('adicionar concorrente com CNPJ dispara enriquecimento automático', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Clicar em adicionar concorrente
    await page.getByRole('button', { name: /adicionar concorrente/i }).click();

    // 2. Preencher formulário
    const cnpj = '11222333000181';
    await page.getByLabel(/nome/i).fill('Empresa Enriquecimento Teste');
    await page.getByLabel(/cnpj/i).fill(cnpj);
    await page.getByLabel(/website/i).fill('https://empresa-teste.com');
    await page.getByLabel(/segmento/i).fill('SaaS B2B');
    await page.getByRole('button', { name: /salvar/i }).click();

    // 3. Verificar que concorrente aparece na lista
    await expect(page.locator('text=Empresa Enriquecimento Teste')).toBeVisible();

    // 4. Verificar que status de enriquecimento aparece
    await expect(page.locator('text=processing')).toBeVisible();

    // 5. Aguardar enriquecimento (polling a cada 2s por até 30s)
    let enriched = false;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(2000);
      await page.reload();
      const statusText = await page.locator('[data-testid="enrichment-status"]').textContent();
      if (statusText?.includes('enriched')) {
        enriched = true;
        break;
      }
    }

    expect(enriched).toBe(true);

    // 6. Verificar que dados enriquecidos aparecem
    await expect(page.locator('text=Razão Social:')).toBeVisible();
    await expect(page.locator('text=Capital Social:')).toBeVisible();
  });

  test('insights builder gera recomendações baseadas em concorrentes', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Aguardar carregamento de concorrentes
    await expect(page.locator('[data-testid="competitors-list"]')).toBeVisible();

    // 2. Clicar em gerar insights
    await page.getByRole('button', { name: /gerar insights/i }).click();

    // 3. Verificar que loading aparece
    await expect(page.locator('text=Gerando insights...')).toBeVisible();

    // 4. Aguardar conclusão
    await expect(page.locator('[data-testid="insights-panel"]')).toBeVisible({ timeout: 15000 });

    // 5. Verificar que há pelo menos 3 insights
    const insightCards = page.locator('[data-testid="insight-card"]');
    const count = await insightCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // 6. Verificar que insights têm categorias
    await expect(page.locator('text=pricing_alert').first()).toBeVisible();
    await expect(page.locator('text=market_trend').first()).toBeVisible();
  });

  test('signals list mostra eventos de mercado', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Navegar para aba de signals
    await page.getByRole('tab', { name: /sinais de mercado/i }).click();

    // 2. Verificar que lista de signals existe
    await expect(page.locator('[data-testid="signals-list"]')).toBeVisible();

    // 3. Verificar que há pelo menos um signal (seed data)
    const signalCards = page.locator('[data-testid="signal-card"]');
    await expect(signalCards.first()).toBeVisible();

    // 4. Verificar que signal tem tipo e impacto
    await expect(page.locator('text=signal_type:').first()).toBeVisible();
    await expect(page.locator('text=impact_level:').first()).toBeVisible();
  });

  test('job queue mostra jobs de enriquecimento', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Navegar para aba de jobs
    await page.getByRole('tab', { name: /jobs/i }).click();

    // 2. Verificar que lista de jobs existe
    await expect(page.locator('[data-testid="jobs-list"]')).toBeVisible();

    // 3. Verificar que há jobs (podem estar completed, processing ou pending)
    const jobCards = page.locator('[data-testid="job-card"]');
    const count = await jobCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // 4. Verificar que jobs têm status
    await expect(page.locator('text=status:').first()).toBeVisible();
  });

  test('findings mostra AI insights com drill-down', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Navegar para aba de findings
    await page.getByRole('tab', { name: /ai insights/i }).click();

    // 2. Verificar que lista de findings existe
    await expect(page.locator('[data-testid="findings-list"]')).toBeVisible();

    // 3. Verificar que há pelo menos um finding
    const findingCards = page.locator('[data-testid="finding-card"]');
    await expect(findingCards.first()).toBeVisible();

    // 4. Clicar em finding para drill-down
    await findingCards.first().click();

    // 5. Verificar que modal de detalhes abre
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Detalhes do Finding')).toBeVisible();

    // 6. Verificar que tem contexto do concorrente
    await expect(page.locator('text=Concorrente:')).toBeVisible();

    // 7. Fechar modal
    await page.getByRole('button', { name: /fechar/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('compartilhar growthmap gera link válido', async ({ page }) => {
    const projectId = 'demo-project';
    await page.goto(`/admin/intelligence/${projectId}`);

    // 1. Clicar em compartilhar
    await page.getByRole('button', { name: /compartilhar/i }).click();

    // 2. Verificar que modal abre
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 3. Verificar que link é gerado
    const shareInput = page.locator('input[readonly]');
    await expect(shareInput).toBeVisible();
    const shareUrl = await shareInput.inputValue();
    expect(shareUrl).toContain('/public/growthmap/');
    expect(shareUrl).toMatch(/shr_[a-z0-9]{48}/);

    // 4. Copiar link
    await page.getByRole('button', { name: /copiar/i }).click();

    // 5. Verificar que toast de sucesso aparece
    await expect(page.locator('text=Link copiado para a área de transferência')).toBeVisible();

    // 6. Fechar modal
    await page.getByRole('button', { name: /fechar/i }).click();
  });
});
