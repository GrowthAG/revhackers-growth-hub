/**
 * BACKFILL EXPORT: Supabase → JSON local
 *
 * Lê as tabelas blog_posts, materials, cases do Supabase PostgREST e salva
 * em arquivos JSON sob _archive/scripts-supabase-migration/exports/.
 *
 * Pré-requisitos:
 *   - VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente (ou em .env).
 *   - Conexão de rede ao Supabase.
 *
 * Uso:
 *   npx tsx _archive/scripts-supabase-migration/export.ts
 *
 * Após execução, gerar o import via:
 *   npx tsx _archive/scripts-supabase-migration/import.ts
 *
 * ESTE SCRIPT NÃO É IDEMPOTENTE. Roda uma única vez durante a janela de
 * cutover. Após a migração, deletar _archive/scripts-supabase-migration/.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY antes de rodar.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = ['blog_posts', 'materials', 'cases'] as const;
const EXPORT_DIR = join(import.meta.dirname, 'exports');
mkdirSync(EXPORT_DIR, { recursive: true });

async function exportTable(name: string) {
  // PostgREST limita a 1000 rows por padrão. Usar .range() em chunks.
  const PAGE = 1000;
  let allRows: unknown[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(name)
      .select('*')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Supabase error on ${name}: ${error.message}`);
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const path = join(EXPORT_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(allRows, null, 2));
  console.log(`[export] ${name}: ${allRows.length} rows → ${path}`);
}

async function main() {
  for (const t of TABLES) {
    await exportTable(t);
  }
  console.log('\n[export] Done. Inspecione os arquivos em exports/ antes de rodar import.ts.');
}

void main().catch((err) => {
  console.error('[export] FATAL:', err);
  process.exit(1);
});
