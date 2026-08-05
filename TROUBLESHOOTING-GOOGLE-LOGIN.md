# 🔍 Troubleshooting: Tela Branca no Login Google

## Problema
Ao clicar em "Entrar com Google", a tela fica branca e não há redirecionamento.

## Diagnóstico

### 1. Verificar Logs do Console do Navegador

Abra o DevTools (F12) → Console e clique em "Entrar com Google". Você deve ver:

```
[Firebase] Environment check: {apiKey: '✓ set', authDomain: '✓ set', projectId: '✓ set'}
[Firebase Auth] Starting Google sign-in...
[Firebase Auth] Provider configured, opening popup...
[Firebase Auth] Sign-in successful, user: seu@email.com
```

**Se você NÃO vê esses logs:**
- Recarregue a página (Ctrl+Shift+R ou Cmd+Shift+R)
- Limpe o cache do navegador
- Verifique se o servidor está rodando: `npm run dev`

### 2. Verificar Variáveis de Ambiente

O arquivo `.env` deve conter:

```env
VITE_FIREBASE_API_KEY=AIzaSyDrdt32oOHC86aXqGxm7QC1HpbmH4H2VJk
VITE_FIREBASE_AUTH_DOMAIN=revhackers-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=revhackers-staging
VITE_GOOGLE_AUTH_ENABLED=true
```

**Se as variáveis estão faltando:**
1. Copie de `.env.example`
2. Reinicie o servidor: `npm run dev`

### 3. Verificar Configuração do Firebase Console

Acesse: https://console.firebase.google.com/project/revhackers-staging

**Authentication → Sign-in method:**
- ✅ Google provider deve estar **habilitado**

**Authentication → Settings → Authorized domains:**
- ✅ `localhost` deve estar na lista
- ✅ `revhackers-staging.firebaseapp.com` deve estar na lista
- ✅ Seu domínio de produção deve estar na lista (se aplicável)

### 4. Verificar Erros Comuns

#### Erro: "auth/unauthorized-domain"
```
FirebaseError: Firebase: This domain is not authorized for OAuth operations
```

**Solução:**
1. Vá em Firebase Console → Authentication → Settings
2. Adicione `localhost` e `revhackers-staging.firebaseapp.com` em "Authorized domains"
3. Salve e tente novamente

#### Erro: "auth/api-key-not-valid"
```
FirebaseError: Firebase: API key not valid
```

**Solução:**
1. Verifique se `VITE_FIREBASE_API_KEY` no `.env` está correta
2. Vá em Firebase Console → Project settings → General
3. Copie a "Web API Key" e atualize no `.env`
4. Reinicie o servidor

#### Erro: "auth/popup-closed-by-user"
```
FirebaseError: Firebase: The popup has been closed by the user
```

**Solução:**
- Não feche a janela popup antes de completar o login
- Desative bloqueadores de popup temporariamente

#### Erro: "auth/network-request-failed"
```
FirebaseError: Firebase: A network error has occurred
```

**Solução:**
- Verifique sua conexão com a internet
- Desative VPN temporariamente
- Tente em outra rede

### 5. Verificar Logs do AuthContext

Se o login Firebase funciona mas ainda há tela branca, verifique o console para:

```
[AuthContext] Google sign-in successful, fetching user profile...
[AuthContext] User profile loaded, navigating to /admin
```

**Se você vê erro de perfil:**
- Verifique se o usuário existe na tabela `profiles` do Supabase
- Verifique se há permissões RLS bloqueando acesso

### 6. Teste Rápido

Execute este comando no console do navegador após clicar em "Entrar com Google":

```javascript
// Verificar se Firebase está inicializado
import('firebase/app').then(({ getApps }) => {
  console.log('Firebase apps:', getApps().length);
});

// Verificar usuário atual
import('firebase/auth').then(({ getAuth }) => {
  const auth = getAuth();
  console.log('Current user:', auth.currentUser);
  if (auth.currentUser) {
    console.log('User email:', auth.currentUser.email);
    console.log('User ID:', auth.currentUser.uid);
  }
});
```

### 7. Fallback: Login Master

Se o login Google não funcionar, use o login master temporariamente:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
sessionStorage.setItem('rh_master_logged', 'true');
localStorage.setItem('rh_master_user_email', 'giulliano@usefunnels.io');
window.location.reload();
```
3. Você será redirecionado para `/admin` como super_admin

## Próximos Passos

Após identificar o erro específico:

1. **Copie a mensagem de erro exata** do console
2. **Tire screenshot** da tela branca (se houver)
3. **Compartilhe** as informações no chat

Com essas informações, posso aplicar a correção específica em ~15 minutos.

## Logs Adicionados

Já adicionei logs detalhados em:
- `src/integrations/firebase/client.ts` - Inicialização e sign-in
- `src/contexts/AuthContext.tsx` - Fluxo de autenticação

Esses logs aparecem no console do navegador quando você clica em "Entrar com Google".
