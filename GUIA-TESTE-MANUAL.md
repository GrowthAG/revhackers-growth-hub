# Guia de Teste Manual - Identificação de Erros

## Pré-requisitos
1. Abrir o navegador no console do desenvolvedor (F12)
2. Ir para aba "Console" e "Network"
3. Limpar console (botão 🚫)
4. Estar logado com conta admin

## Teste 1: Cadastro de Cliente

### Passos
1. Acessar: http://localhost:8080/admin/clients/novo
2. Preencher formulário:
   - Nome: Teste Cliente
   - Email: teste@example.com
   - Empresa: Empresa Teste
   - CNPJ: 12345678000195 (ou deixar vazio)
   - Status: onboarding
3. Clicar em "Salvar Cliente"
4. **Capturar erro do console**

### O que verificar no Console
```
- Mensagem de erro exata
- Status code da requisição POST /v1/clients
- Response body (se houver)
```

### O que verificar em Network
```
- Request URL: /v1/clients
- Request Headers: Authorization Bearer token?
- Request Payload: JSON correto?
- Response Status: 200, 400, 401, 403, 500?
- Response Body: mensagem de erro?
```

---

## Teste 2: Cadastro de Projeto REI

### Passos
1. Acessar: http://localhost:8080/admin/projects/novo
2. Preencher formulário:
   - Nome do Cliente: Teste Projeto
   - Email do Cliente: projeto@example.com
   - Email do Analista: admin@revhackers.com
   - Trimestre: Q1
   - Ano: 2024
   - Próxima REI: 2024-03-01
3. Clicar em "Criar Projeto"
4. **Capturar erro do console**

### O que verificar no Console
```
- Mensagem de erro exata
- Status code da requisição POST /v1/rei-projects
- Response body (se houver)
```

### O que verificar em Network
```
- Request URL: /v1/rei-projects
- Request Headers: Authorization Bearer token?
- Request Payload: JSON com todos os campos obrigatórios?
- Response Status: 200, 400, 401, 403, 500?
- Response Body: mensagem de erro?
```

---

## Teste 3: Iniciar REI (Wizard)

### Passos
1. Acessar: http://localhost:8080/rei/:projectId (usar ID de projeto existente)
2. Aguardar carregamento do wizard
3. **Capturar erro do console**

### O que verificar no Console
```
- Erro ao carregar dados do projeto?
- Erro ao carregar steps?
- Erro de autenticação?
```

### O que verificar em Network
```
- GET /v1/rei-projects/:id retorna 200?
- GET /v1/rei-projects/:id/responses retorna 200?
- Authorization header presente?
```

---

## Checklist de Diagnóstico

Para cada erro, colete:

- [ ] **Mensagem de erro exata** (copie do console)
- [ ] **URL da requisição** (Network tab)
- [ ] **Status code** (200, 400, 401, 403, 500)
- [ ] **Request payload** (JSON enviado)
- [ ] **Response body** (mensagem da API)
- [ ] **Screenshot** (se possível)

---

## Comandos de Diagnóstico Rápido

### Testar API diretamente
```bash
# Testar criação de cliente
curl -X POST https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "company": "Empresa Teste"
  }'

# Testar criação de projeto
curl -X POST https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/rei-projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientName": "Teste",
    "clientEmail": "teste@example.com",
    "analystEmail": "admin@revhackers.com",
    "quarter": "Q1",
    "year": 2024,
    "nextReiDate": "2024-03-01"
  }'
```

### Verificar logs do Cloud Run
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=revhackers-api-staging" \
  --limit=50 \
  --format=json
```

---

## Possíveis Causas

### 1. Erro 401 (Unauthenticated)
- Token Firebase não está sendo gerado
- Token expirado
- Configuração Firebase incorreta

### 2. Erro 400 (Bad Request)
- Campos obrigatórios faltando
- Formato de data inválido
- Validação Zod falhando

### 3. Erro 403 (Forbidden)
- Usuário não tem permissão
- Tenant ID incorreto
- RLS policy bloqueando

### 4. Erro 500 (Internal Server Error)
- Bug no backend
- Database connection error
- Migration não aplicada

---

## Ação Recomendada

1. **Execute os 3 testes acima**
2. **Copie as mensagens de erro exatas**
3. **Envie screenshots do console**
4. **Compartilhe o Network tab**

Com essas informações, posso:
- Identificar a causa raiz
- Aplicar correção específica
- Validar com teste automatizado
