import { test, expect } from '@playwright/test';

test.describe('REI Onboarding E2E — Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@revhackers.com');
    await page.getByPlaceholder(/senha/i).fill('test1234');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/admin');
  });

  test('fluxo completo: criar projeto → onboarding → frameworks → wrap-up', async ({ page }) => {
    const projectName = `E2E Test Project ${Date.now()}`;
    const clientName = 'Empresa Teste E2E';
    const clientEmail = `teste-${Date.now()}@empresa.com`;

    // 1. Criar novo projeto REI
    await page.goto('/admin/projects');
    await page.getByRole('button', { name: /novo projeto/i }).click();
    await page.getByLabel(/nome do projeto/i).fill(projectName);
    await page.getByLabel(/nome do cliente/i).fill(clientName);
    await page.getByLabel(/email do cliente/i).fill(clientEmail);
    await page.getByRole('button', { name: /criar/i }).click();

    // 2. Verificar redirecionamento para cockpit
    await page.waitForURL(/\/admin\/rei-cockpit\//);
    await expect(page.locator('h1')).toContainText(projectName);

    // 3. Verificar status onboarding
    await expect(page.locator('text=onboarding')).toBeVisible();

    // 4. Iniciar onboarding
    await page.getByRole('button', { name: /iniciar onboarding/i }).click();
    await expect(page.locator('text=Kickoff')).toBeVisible();

    // 5. Completar etapa Kickoff
    await page.getByLabel(/objetivos do cliente/i).fill('Aumentar conversão em 30% em 90 dias');
    await page.getByLabel(/icp primário/i).fill('SaaS B2B Series A, 50-200 funcionários');
    await page.getByRole('button', { name: /próximo/i }).click();

    // 6. Completar etapa Setup
    await expect(page.locator('text=Setup Técnico')).toBeVisible();
    await page.getByLabel(/crm atual/i).fill('HubSpot');
    await page.getByLabel(/ferramentas de marketing/i).fill('Mailchimp, Google Ads');
    await page.getByRole('button', { name: /próximo/i }).click();

    // 7. Completar etapa Diagnóstico
    await expect(page.locator('text=Diagnóstico')).toBeVisible();
    await page.getByLabel(/principais gargalos/i).fill('Lead qualification, SLA de vendas, automação');
    await page.getByRole('button', { name: /próximo/i }).click();

    // 8. Completar etapa Quick Wins
    await expect(page.locator('text=Quick Wins')).toBeVisible();
    await page.getByLabel(/quick win 1/i).fill('Implementar lead scoring no CRM');
    await page.getByLabel(/quick win 2/i).fill('Automatizar follow-up em 5 minutos');
    await page.getByRole('button', { name: /próximo/i }).click();

    // 9. Validar wrap-up
    await expect(page.locator('text=Wrap-up')).toBeVisible();
    await page.getByRole('button', { name: /finalizar onboarding/i }).click();

    // 10. Verificar status mudou para active
    await expect(page.locator('text=active')).toBeVisible();

    // 11. Verificar que frameworks estão disponíveis
    await page.getByRole('link', { name: /frameworks/i }).click();
    await expect(page.locator('text=37 frameworks')).toBeVisible();
  });

  test('onboarding incompleto mostra progresso', async ({ page }) => {
    const projectName = `E2E Incomplete ${Date.now()}`;

    // 1. Criar projeto
    await page.goto('/admin/projects');
    await page.getByRole('button', { name: /novo projeto/i }).click();
    await page.getByLabel(/nome do projeto/i).fill(projectName);
    await page.getByLabel(/nome do cliente/i).fill('Cliente Incompleto');
    await page.getByLabel(/email do cliente/i).fill(`incompleto-${Date.now()}@test.com`);
    await page.getByRole('button', { name: /criar/i }).click();
    await page.waitForURL(/\/admin\/rei-cockpit\//);

    // 2. Iniciar onboarding mas não completar
    await page.getByRole('button', { name: /iniciar onboarding/i }).click();
    await page.getByLabel(/objetivos do cliente/i).fill('Objetivo parcial');
    await page.getByRole('button', { name: /próximo/i }).click();

    // 3. Sair da página
    await page.goto('/admin/projects');

    // 4. Voltar ao projeto
    await page.getByRole('link', { name: projectName }).click();

    // 5. Verificar que mostra progresso (50% completo)
    await expect(page.locator('text=Setup Técnico')).toBeVisible();
    await expect(page.locator('text=50%')).toBeVisible();
  });

  test('expansion opportunities aparecem após uso intenso', async ({ page }) => {
    const projectName = `E2E Expansion ${Date.now()}`;

    // 1. Criar projeto e completar onboarding (via API para economizar tempo)
    const projectId = await page.evaluate(async (name) => {
      const res = await fetch('/api/v1/rei/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          client_name: 'Cliente Expansion',
          client_email: `expansion-${Date.now()}@test.com`,
          status: 'active',
        }),
      });
      const data = await res.json();
      return data.id;
    }, projectName);

    // 2. Simular uso intenso (regenerar frameworks 6x via API)
    for (let i = 0; i < 6; i++) {
      await page.evaluate(async (pid) => {
        await fetch(`/api/v1/intelligence/frameworks/${pid}/regenerate`, {
          method: 'POST',
        });
      }, projectId);
    }

    // 3. Navegar para cockpit
    await page.goto(`/admin/rei-cockpit/${projectId}`);

    // 4. Verificar que expansion badge aparece
    await expect(page.getByRole('button', { name: /expansão/i })).toBeVisible();
    const badge = page.locator('.badge-destructive');
    await expect(badge).toContainText('1');

    // 5. Abrir modal de expansão
    await page.getByRole('button', { name: /expansão/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Upsell de Frameworks')).toBeVisible();
    await expect(page.locator('text=framework_regenerations: 6')).toBeVisible();

    // 6. Marcar como revisado
    await page.getByRole('button', { name: /marcar como revisado/i }).click();
    await expect(page.locator('text=reviewed')).toBeVisible();
  });
});
