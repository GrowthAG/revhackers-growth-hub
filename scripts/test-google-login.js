#!/usr/bin/env node

/**
 * Script para testar login com Google manualmente
 * 
 * Uso:
 * 1. Execute: node scripts/test-google-login.js
 * 2. O navegador abrirá automaticamente
 * 3. Faça login com sua conta Google
 * 4. O script verificará se o token foi armazenado e se há erros 401
 */

const playwright = require('playwright');

(async () => {
  console.log('🚀 Iniciando teste de login com Google...\n');
  
  const browser = await playwright.chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const errors401 = [];
  const consoleLogs = [];

  // Capturar logs do console
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    
    if (text.includes('[Firebase]') || 
        text.includes('[Google Auth]') || 
        text.includes('Token') ||
        text.includes('401')) {
      console.log(`[CONSOLE ${msg.type()}] ${text}`);
    }
  });

  // Capturar erros de página
  page.on('pageerror', error => {
    console.log(`❌ [PAGE ERROR] ${error.message}`);
  });

  // Capturar requisições com erro 401
  page.on('response', response => {
    if (response.status() === 401) {
      const url = response.url();
      errors401.push(url);
      console.log(`⚠️  [401 ERROR] ${url}`);
    }
  });

  // Monitorar popups
  context.on('page', async (popup) => {
    console.log('\n🔓 [POPUP ABERTO]');
    console.log(`   URL: ${popup.url()}`);
    console.log('   Aguardando login...\n');
    
    popup.on('close', async () => {
      console.log('✅ [POPUP FECHADO]\n');
    });
  });

  try {
    console.log('📍 Navegando para /login...');
    await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle' });
    
    console.log('✅ Página carregada\n');
    console.log('👆 Clique no botão "Entrar com Google" no navegador');
    console.log('⏳ Aguardando 60 segundos para você fazer login...\n');
    
    // Aguardar o usuário fazer login (60 segundos)
    for (let i = 60; i > 0; i -= 10) {
      console.log(`   ⏱️  ${i} segundos restantes...`);
      await page.waitForTimeout(10000);
      
      // Verificar se já logou
      const url = page.url();
      if (url.includes('/admin') || url.includes('/dashboard')) {
        console.log('\n✅ Login detectado! Redirecionado para:', url);
        break;
      }
    }
    
    console.log('\n=== VERIFICANDO ESTADO ===\n');
    
    const token = await page.evaluate(() => sessionStorage.getItem('rh_firebase_id_token'));
    const masterLogged = await page.evaluate(() => sessionStorage.getItem('rh_master_logged'));
    const url = page.url();
    
    console.log(`📍 URL atual: ${url}`);
    console.log(`🔑 Token Firebase: ${token ? '✅ SIM (' + token.substring(0, 30) + '...)' : '❌ NÃO'}`);
    console.log(`👤 Master logged: ${masterLogged || '❌ NÃO'}`);
    console.log(`⚠️  Erros 401: ${errors401.length}`);
    
    if (errors401.length > 0) {
      console.log('\n❌ URLs com erro 401:');
      errors401.forEach(url => console.log(`   - ${url}`));
    }
    
    console.log('\n=== RESULTADO ===\n');
    
    if (token && errors401.length === 0) {
      console.log('✅ SUCESSO! Token armazenado e sem erros 401');
    } else if (token && errors401.length > 0) {
      console.log('⚠️  Token armazenado, mas há erros 401');
    } else {
      console.log('❌ Token não foi armazenado');
    }
    
    console.log('\n💡 Pressione Ctrl+C para fechar o navegador\n');
    
    // Aguardar o usuário fechar manualmente
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
