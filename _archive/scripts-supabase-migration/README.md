# Supabase → GCP Backfill Runbook

Esta pasta contém os scripts **únicos** que rodam uma única vez durante a janela de cutover para mover conteúdo legados (blog, materials, cases) do Supabase para o Cloud SQL do GCP.

## Por que existe

O GCP API já tem as rotas `/v1/blog/articles`, `/v1/materials`, `/v1/cases` (criadas na migration 0020-0022). Mas a GCP API lê de tabelas Cloud SQL **vazias**. Sem este backfill, deletar os catches Supabase de `CaseForm`/`MaterialForm`/`PostForm` faria todo o conteúdo do blog/serviços/cases desaparecer.

## Pré-condições

- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente (de `.env` ou export).
- `DATABASE_URL` apontando para o Cloud SQL com permissão de `INSERT` em `app.blog_articles`, `app.materials`, `app.case_studies`, `app._content_org_to_tenant`.
- `npx tsx` disponível (ou `npm install -g tsx`).
- Migrations 0019, 0020, 0021, 0022, 0023 já aplicadas no Cloud SQL.

## Procedimento

1. **Exportar** do Supabase:
   ```bash
   npx tsx _archive/scripts-supabase-migration/export.ts
   ```
   Gera `exports/{blog_posts,materials,cases}.json`.

2. **Inspecionar** os JSONs antes de importar. Procure:
   - Slugs duplicados (constraint UNIQUE em (tenant_id, slug)).
   - Conteúdo vazio.
   - Datas em formato inválido.

3. **Mapear organizações** Supabase → tenant GCP. Hoje o único tenant é `STAGING_TENANT_ID = 11111111-1111-4111-8111-111111111111`. Se houver múltiplos, popular `app._content_org_to_tenant` antes do import.

4. **Importar**:
   ```bash
   DATABASE_URL=postgres://... npx tsx _archive/scripts-supabase-migration/import.ts
   ```

5. **Verificar** contagens no Cloud SQL:
   ```sql
   SELECT 'blog' AS t, COUNT(*) FROM app.blog_articles
   UNION ALL SELECT 'materials', COUNT(*) FROM app.materials
   UNION ALL SELECT 'cases', COUNT(*) FROM app.case_studies;
   ```

6. **Validar** visualmente no app que o conteúdo aparece:
   - `https://staging.revhackers.com.br/blog`
   - `https://staging.revhackers.com.br/materiais`
   - `https://staging.revhackers.com.br/cases`

7. **Só então** deletar os catches Supabase de `CaseForm`/`MaterialForm`/`PostForm` no frontend (próximo patch da sequência).

8. **Após** confirmar paridade no app, deletar esta pasta inteira: `rm -rf _archive/scripts-supabase-migration/`.

## Bloqueio

- **NÃO** deletar os catches de `CaseForm`/`MaterialForm`/`PostForm` sem antes executar este backfill.
- **NÃO** rodar o import duas vezes sem truncar antes (constraint UNIQUE conflita).
- **NÃO** misturar tenants no mesmo import sem popular `_content_org_to_tenant`.
