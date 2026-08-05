# Diagnóstico de Problemas Críticos

## Problemas Reportados
1. ❌ Erro ao cadastrar cliente
2. ❌ Erro ao cadastrar projeto  
3. ❌ Erro ao iniciar REI

## Status da Investigação
- ✅ APIs GCP estão respondendo (retornam "unauthenticated" sem token)
- ✅ Código de criação está implementado corretamente
- ✅ Autenticação usa Firebase via `requireGoogleIdToken()`
- ⚠️  Falta arquivo `.env.local` com configuração

## Plano de Ação

### Fase 1: Configuração do Ambiente
1. Criar `.env.local` com variáveis necessárias
2. Validar que Firebase está autenticando
3. Testar geração de token

### Fase 2: Teste de Fluxos
1. Testar criação de cliente via UI
2. Testar criação de projeto REI via UI
3. Testar inicialização de REI via wizard

### Fase 3: Correção de Bugs
- Identificar causa raiz de cada erro
- Aplicar correções
- Validar com testes

## Arquivos Chave
- `src/api/adapters/_base.ts` - Autenticação API
- `src/pages/admin/ClientFormContent.tsx` - Formulário cliente
- `src/pages/admin/REIProjectForm.tsx` - Formulário projeto
- `src/components/rei/REIWizard.tsx` - Wizard REI
