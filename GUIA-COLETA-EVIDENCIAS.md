# 🚨 Guia de Coleta de Evidências - 3 Erros Críticos

## Objetivo
Coletar informações exatas sobre os 3 erros para aplicar correções precisas.

---

## Passo 1: Iniciar Ambiente de Teste

Abra o terminal e execute:

```bash
cd /Users/giullianoalves/Projects/active/RevHackers/repository
npm run dev
```

**Aguarde** até aparecer:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

---

## Passo 2: Abrir Navegador com DevTools

1. Abra: http://localhost:5173
2. Pressione **F12** para abrir DevTools
3. Clique na aba **Console**
4. Clique na aba **Network**
5. Marque a opção **"Preserve log"** (preservar log)

---

## Passo 3: Login

1. Clique em "Entrar"
2. Faça login com sua conta admin
3. Aguarde redirecionamento para `/admin`

---

## Passo 4: Testar os 3 Fluxos

### 🧪 TESTE 1: Cadastrar Cliente

**Ação:**
1. Navegar para: http://localhost:5173/admin/clients/novo
2. Preencher:
   - **Nome:** Cliente Teste Erro
   - **Email:** cliente.erro@teste.com
   - **Status:** onboarding
3. Clicar em **"Salvar Cliente"**

**Coletar:**
- [ ] Mensagem de erro no Console (copie EXATA)
- [ ] No Network, clique na requisição POST `/v1/clients`
- [ ] Status Code (200, 400, 401, 403, 500?)
- [ ] Response body (copie JSON completo)
- [ ] Screenshot da tela com erro

---

### 🧪 TESTE 2: Cadastrar Projeto REI

**Ação:**
1. Navegar para: http://localhost:5173/admin/projects/novo
2. Preencher:
   - **Nome do Cliente:** Projeto Teste Erro
   - **Email do Cliente:** projeto.erro@teste.com
   - **Email do Analista:** seu email admin
   - **Trimestre:** Q1
   - **Ano:** 2024
   - **Próxima REI:** 2024-06-01
3. Clicar em **"Criar Projeto"**

**Coletar:**
- [ ] Mensagem de erro no Console (copie EXATA)
- [ ] No Network, clique na requisição POST `/v1/rei-projects`
- [ ] Status Code
- [ ] Response body (copie JSON completo)
- [ ] Screenshot da tela com erro

---

### 🧪 TESTE 3: Iniciar REI (Wizard)

**Ação:**
1. Navegar para: http://localhost:5173/admin/rei-projects
2. Clique em qualquer projeto existente
3. Clique em **"Iniciar REI"** ou **"Ver REI"**

**Coletar:**
- [ ] Mensagem de erro no Console (copie EXATA)
- [ ] No Network, clique nas requisições GET
- [ ] Status Code de cada requisição
- [ ] Response body dos erros
- [ ] Screenshot da tela com erro

---

## Passo 5: Enviar Evidências

Copie este template e preencha:

```markdown
# Relatório de Erros - [DATA]

## Erro 1: Cadastrar Cliente

**Mensagem do Console:**
```
[cole aqui a mensagem exata]
```

**Network - POST /v1/clients:**
- Status: [200/400/401/403/500]
- Request Payload:
```json
[cole o JSON enviado]
```
- Response:
```json
[cole o JSON de resposta]
```

**Screenshot:** [anexe se possível]

---

## Erro 2: Cadastrar Projeto

**Mensagem do Console:**
```
[cole aqui a mensagem exata]
```

**Network - POST /v1/rei-projects:**
- Status: [200/400/401/403/500]
- Request Payload:
```json
[cole o JSON enviado]
```
- Response:
```json
[cole o JSON de resposta]
```

**Screenshot:** [anexe se possível]

---

## Erro 3: Iniciar REI

**Mensagem do Console:**
```
[cole aqui a mensagem exata]
```

**Network - GET /v1/rei-projects/:id:**
- Status: [200/400/401/403/404/500]
- Response:
```json
[cole o JSON de resposta]
```

**Screenshot:** [anexe se possível]

---

## Informações Adicionais

**Navegador:** [Chrome/Firefox/Safari]
**Versão:** [ex: Chrome 120]
**Sistema:** [macOS/Windows/Linux]

**Comportamento Esperado:**
[descreva o que deveria acontecer]

**Comportamento Atual:**
[descreva o que está acontecendo]
```

---

## Envie o Relatório

Cole o relatório preenchido aqui no chat.

Com essas informações, vou:
1. ✅ Identificar a causa raiz exata
2. ✅ Aplicar correção específica
3. ✅ Validar com testes
4. ✅ Commitar a solução

---

## Tempo Estimado

- Coleta de evidências: **15 minutos**
- Análise e correção: **30 minutos**
- Validação: **15 minutos**

**Total: ~1 hora para resolver os 3 problemas**

---

## Dicas Importantes

### Se aparecer "Network Error" ou "Failed to fetch":
- Verifique se o servidor está rodando (`npm run dev`)
- Verifique se está em http://localhost:5173 (não https)
- Verifique se não há bloqueio de CORS no console

### Se aparecer "401 Unauthenticated":
- Faça logout e login novamente
- Verifique se o token Firebase está sendo gerado
- No console, execute: `firebase.auth().currentUser?.getIdToken()`

### Se aparecer "500 Internal Server Error":
- Verifique logs do Cloud Run: `gcloud logging tail`
- Pode ser migration não aplicada ou bug no backend

---

## Execução Rápida

Execute agora em 3 terminais diferentes:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Logs Cloud Run:**
```bash
gcloud logging tail --project=revhackers-staging
```

**Terminal 3 - Navegador:**
```bash
open http://localhost:5173
```

Depois execute os 3 testes e me envie o relatório!
