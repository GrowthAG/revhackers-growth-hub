# 🧪 Teste de Login Google - Diagnóstico de Tela Branca

Adicionei logs automáticos em todo o fluxo de login. Siga os passos abaixo:

## Passo 1: Abrir Página de Login

1. Abra o navegador em: `http://localhost:8080/login`
2. Pressione **F12** para abrir DevTools
3. Clique na aba **Console**
4. Marque **"Preserve log"** (preservar logs)

## Passo 2: Clicar em Login com Google

Clique no botão **"Entrar com Google"**

## Passo 3: Copiar Logs

Você deve ver logs como estes no console:

```
[Firebase] Environment check: {apiKey: '✓ set', authDomain: '✓ set', projectId: '✓ set'}
[Firebase Auth] Starting Google sign-in...
[Firebase Auth] Provider configured, opening popup...
[AuthContext] State changed: {hasUser: true, userEmail: 'seu@email.com', ...}
[Login] State check: {hasUser: true, isMaster: true, isProfileLoading: false, ...}
[Login useEffect] Checking redirect: {...}
[Login useEffect] Redirecting to /admin
```

## Passo 4: Enviar Logs

**Copie TODOS os logs do console** (selecione todos com Ctrl+A, copie com Ctrl+C) e cole aqui no chat.

## Se o Popup Não Abrir

Se o popup do Google não abrir, copie:
- Mensagem de erro exata do console
- Screenshot da tela branca (se houver)
- URL da página onde ficou parado

## Diagnóstico Rápido

**Perguntas para responder:**

1. O popup do Google abriu?
2. Você conseguiu selecionar a conta?
3. O popup fechou sozinho ou ficou aberto?
4. A tela ficou branca imediatamente ou após alguns segundos?
5. Há algum erro em vermelho no console?

## Fallback Temporário

Se precisar acessar o admin imediatamente, execute no console do navegador:

```javascript
sessionStorage.setItem('rh_master_logged', 'true');
localStorage.setItem('rh_master_user_email', 'giulliano@usefunnels.io');
window.location.href = '/admin';
```
