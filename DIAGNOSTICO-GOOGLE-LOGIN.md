# 🚨 Diagnóstico: Login Google com Tela Branca

## Instruções Rápidas (2 minutos)

### 1. Abra o Terminal e Execute:

```bash
cd /Users/giullianoalves/Projects/active/RevHackers/repository
npm run dev
```

### 2. Em OUTRO Terminal, Execute:

```bash
open http://localhost:8080/login
```

### 3. No Navegador:

1. Pressione **F12** para abrir DevTools
2. Clique na aba **Console**
3. Marque a opção **"Preserve log"** (✓)
4. Clique no botão **"Entrar com Google"**

### 4. Copie e Cole Aqui:

**Opção A - Se aparecer logs:**
Copie TODOS os logs do console (Ctrl+A, Ctrl+C) e cole aqui.

**Opção B - Se tela branca imediata:**
Me diga:
- O popup do Google chegou a abrir?
- A tela ficou branca ANTES ou DEPOIS do popup?
- Há algum erro em VERMELHO no console?

## Workaround Imediato

Se precisar acessar o admin AGORA, execute no console do navegador:

```javascript
sessionStorage.setItem('rh_master_logged', 'true');
localStorage.setItem('rh_master_user_email', 'giulliano@usefunnels.io');
window.location.href = '/admin';
```

## Possíveis Causas

1. **Popup bloqueado** - Navegador bloqueou o popup do Google
2. **Domínio não autorizado** - localhost não está em Firebase Console
3. **Erro de CORS** - API rejeita requisições de localhost
4. **Erro de inicialização** - Firebase falha ao carregar

## Logs que Adicionei

Já adicionei logs automáticos em:
- `src/integrations/firebase/client.ts` - Inicialização do Firebase
- `src/contexts/AuthContext.tsx` - Mudanças de estado
- `src/pages/auth/Login.tsx` - Redirecionamento

Esses logs aparecem automaticamente no console quando você clica em "Entrar com Google".

## Próximo Passo

**Cole os logs aqui** ou me diga se a tela ficou branca imediatamente (antes de qualquer log aparecer).

Com essa informação, aplico a correção em ~10 minutos.
