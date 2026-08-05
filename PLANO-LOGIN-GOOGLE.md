# 🚨 Plano de Ação: Corrigir Login Google com Tela Branca

## Status Atual
- ✅ Logs de debug adicionados em Firebase, AuthContext e Login
- ✅ Variáveis de ambiente verificadas (.env está correto)
- ⚠️  Aguardando logs do console para identificar causa raiz

## Próximos Passos (15 minutos)

### 1. Testar Login com Logs Ativos

Abra o navegador e siga:

```bash
# 1. Abrir página de login
open http://localhost:8080/login

# 2. Abrir DevTools (F12) → Console
# 3. Clicar em "Entrar com Google"
# 4. Copiar TODOS os logs do console
```

### 2. Identificar Onde Está o Problema

Com base nos logs, o problema está em UMA destas áreas:

#### Área A: Firebase não inicializa
**Sintoma:** Não aparece `[Firebase] Environment check`
**Causa:** Variáveis de ambiente não carregadas
**Solução:** Reiniciar servidor

#### Área B: Popup não abre
**Sintoma:** Para em `[Firebase Auth] Provider configured`
**Causa:** Domínio não autorizado no Firebase Console
**Solução:** Adicionar localhost em Firebase Console → Auth → Settings → Authorized domains

#### Área C: Autenticação funciona mas tela fica branca
**Sintoma:** Aparece `[Firebase Auth] Sign-in successful` mas não redireciona
**Causa:** Problema no useEffect do Login ou AuthContext
**Solução:** Corrigir lógica de redirecionamento

#### Área D: Erro de CORS ou API
**Sintoma:** Erro de rede ou 401 após autenticação
**Causa:** API não aceita token Firebase
**Solução:** Verificar configuração da API GCP

### 3. Aplicar Correção Específica

Com base nos logs, aplicarei a correção exata em ~10 minutos.

## Ação Imediata

**Execute agora:**

1. Abra: http://localhost:8080/login
2. DevTools (F12) → Console
3. Clique em "Entrar com Google"
4. **Cole aqui todos os logs do console**

Com os logs, identifico o problema em 2 minutos e aplico correção em 10 minutos.

## Fallback Enquanto Isso

Se precisar acessar o admin agora:

```javascript
// Execute no console do navegador
sessionStorage.setItem('rh_master_logged', 'true');
localStorage.setItem('rh_master_user_email', 'giulliano@usefunnels.io');
window.location.href = '/admin';
```

## Estimativa de Tempo

- Coleta de logs: 2 min
- Análise: 2 min
- Correção: 10 min
- **Total: ~15 minutos**
