# Plano de Ação - Correção dos 3 Erros Críticos

## Status Atual
- ✅ API Cloud Run: Respondendo (HTTP 404 em /health é esperado)
- ✅ Autenticação: Requer token (correto)
- ✅ Código: Implementado
- ✅ Configuração: .env existe com variáveis
- ⚠️  Logs: Sem erros críticos recentes

## Problemas Reportados
1. ❌ Erro ao cadastrar cliente
2. ❌ Erro ao cadastrar projeto
3. ❌ Erro ao iniciar REI

---

## Plano de Execução

### Fase 1: Preparação (5 min)

```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev

# 2. Aguardar compilação (deve aparecer: "Local: http://localhost:5173")

# 3. Abrir navegador
open http://localhost:5173/login
```

### Fase 2: Coleta de Evidências (15 min)

Para cada erro, execute e documente:

#### Erro 1: Cadastro de Cliente
1. Login com conta admin
2. Navegar para `/admin/clients/novo`
3. Abrir DevTools (F12) → Console + Network
4. Preencher:
   - Nome: "Cliente Teste"
   - Email: "cliente@teste.com"
   - Status: "onboarding"
5. Clicar "Salvar"
6. **Documentar**:
   - Mensagem de erro exata do console
   - Status code da requisição POST /v1/clients
   - Response body da API

#### Erro 2: Cadastro de Projeto
1. Navegar para `/admin/projects/novo`
2. Preencher:
   - Nome: "Projeto Teste"
   - Email: "projeto@teste.com"
   - Trimestre: Q1
   - Ano: 2024
3. Clicar "Criar"
4. **Documentar**:
   - Mensagem de erro exata
   - Status code POST /v1/rei-projects
   - Response body

#### Erro 3: Iniciar REI
1. Navegar para `/admin/rei-projects`
2. Clicar em projeto existente
3. Clicar "Iniciar REI"
4. **Documentar**:
   - Mensagem de erro
   - Console errors
   - Network requests

### Fase 3: Análise (10 min)

Com base nas evidências coletadas, identificar:

#### Possíveis Causas
- [ ] **401 Unauthenticated**: Token Firebase não gerado
- [ ] **400 Bad Request**: Campos faltando ou formato inválido
- [ ] **403 Forbidden**: Permissão insuficiente
- [ ] **500 Internal Error**: Bug no backend
- [ ] **CORS Error**: Configuração de CORS incorreta
- [ ] **Network Error**: API não acessível

### Fase 4: Correção (30 min)

Aplicar correção específica baseada na causa identificada:

#### Se 401 (Autenticação)
```typescript
// Verificar: src/integrations/firebase/client.ts
// Função requireGoogleIdToken() está retornando token?
// Adicionar console.log para debug
```

#### Se 400 (Validação)
```typescript
// Verificar schemas Zod em:
// - api/src/http/clients-routes.ts
// - api/src/http/rei-projects-routes.ts
// Comparar com payload enviado pelo frontend
```

#### Se 403 (Permissão)
```typescript
// Verificar:
// - Tenant ID está correto?
// - Usuário tem role admin?
// - RLS policies configuradas?
```

#### Se 500 (Backend)
```bash
# Verificar logs do Cloud Run
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=revhackers-api-staging" \
  --limit=50
```

### Fase 5: Validação (15 min)

1. Aplicar correção
2. Testar fluxo novamente
3. Confirmar sucesso
4. Repetir para os 3 erros
5. Rodar testes unitários: `npm test`

---

## Comandos de Diagnóstico Rápido

### Testar API diretamente com token

```bash
# 1. Obter token (abrir console no navegador logado)
# await firebase.auth().currentUser.getIdToken()

# 2. Testar criação de cliente
curl -X POST https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Teste API",
    "email": "api@teste.com",
    "status": "onboarding"
  }'

# 3. Testar criação de projeto
curl -X POST https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/rei-projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "clientName": "Projeto Teste",
    "clientEmail": "projeto@teste.com",
    "analystEmail": "admin@revhackers.com",
    "quarter": "Q1",
    "year": 2024,
    "nextReiDate": "2024-03-01"
  }'
```

### Logs em tempo real

```bash
gcloud logging tail \
  --project=revhackers-staging \
  --filter="resource.labels.service_name=revhackers-api-staging"
```

---

## Template de Reporte de Erro

Para cada erro, preencha:

```markdown
### Erro X: [Nome do Fluxo]

**Mensagem de Erro:**
```
[copie a mensagem exata do console]
```

**Requisição:**
- URL: 
- Method: 
- Status: 
- Payload: 
```json
{...}
```

**Resposta:**
- Status Code: 
- Body: 
```json
{...}
```

**Console Errors:**
```
[liste todos os erros do console]
```

**Screenshot:**
[se possível]
```

---

## Checklist de Execução

- [ ] Fase 1: Servidor rodando
- [ ] Fase 2: Evidências coletadas (3 erros)
- [ ] Fase 3: Causa raiz identificada
- [ ] Fase 4: Correção aplicada
- [ ] Fase 5: Validação completa
- [ ] Testes passando
- [ ] Commit criado

---

## Ação Imediata

**Execute agora:**

```bash
# 1. Iniciar servidor
npm run dev

# 2. Em outra aba, monitorar logs do Cloud Run
gcloud logging tail --project=revhackers-staging

# 3. Abrir navegador
open http://localhost:5173
```

**Depois:**

1. Execute cada fluxo (cliente, projeto, REI)
2. Copie as mensagens de erro EXATAS
3. Envie aqui para análise
4. Aplicarei correção específica

---

## Estimativa de Tempo

- Coleta de evidências: 15 min
- Análise: 10 min
- Correção: 30 min
- Validação: 15 min
- **Total: ~1 hora**

---

## Suporte

Se precisar de ajuda:
1. Envie screenshots dos erros
2. Copie mensagens do console
3. Liste steps reproduzidos
4. Descreva comportamento esperado vs atual
