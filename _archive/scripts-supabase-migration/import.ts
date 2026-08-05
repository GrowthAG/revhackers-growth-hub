/**
 * BACKFILL IMPORT: JSON local → Cloud SQL
 *
 * Lê os JSONs gerados por export.ts e insere em app.blog_articles, app.materials,
 * app.case_studies. Mapeia organization_id (Supabase) → tenant_id (GCP) via
 * tabela app._content_org_to_tenant.
 *
 * Pré-requisitos:
 *   - Migration 0023 aplicada no Cloud SQL.
 *   - DATABASE_URL configurado com permissão de INSERT nas tabelas content.
 *   - JSONs existentes em _archive/scripts-supabase-migration/exports/.
 *
 * Uso:
 *   DATABASE_URL=postgres://... npx tsx _archive/scripts-supabase-migration/import.ts
 *
 * ESTE SCRIPT NÃO É IDEMPOTENTE. A constraint UNIQUE em (tenant_id, slug)
 * causa conflito se rodar duas vezes. Em caso de re-run, faça
 * `TRUNCATE app.blog_articles, app.materials, app.case_studies CASCADE;` antes.
 *
 * Após sucesso: deletar _archive/scripts-supabase-migration/ e fechar Gate A
 * do checklist de decommission.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client as PgClient } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Defina DATABASE_URL antes de rodar.');
  process.exit(1);
}
const EXPORT_DIR = join(import.meta.dirname, 'exports');

const STAGING_TENANT_ID = '11111111-1111-4111-8111-111111111111';
const SYSTEM_AUTHOR_ID = '22222222-2222-4222-8222-222222222222';

const pg = new PgClient({ connectionString: DATABASE_URL });

interface BlogRow {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  author_id: string | null;
  author_name: string | null;
  published: boolean | null;
  featured: boolean | null;
  read_time: string | null;
  date: string | null;
  created_at: string | null;
  organization_id: string | null;
}
interface MaterialRow {
  id: string;
  material_name: string;
  slug: string | null;
  material_type: string;
  description: string | null;
  link_material: string | null;
  material_url: string;
  published: boolean | null;
  is_active: boolean | null;
  organization_id: string | null;
}
interface CaseRow {
  id: string;
  title: string;
  slug: string;
  case_category: string | null;
  client_name: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  client_logo: string | null;
  published: boolean | null;
  organization_id: string | null;
  metrics: unknown;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;
  testimonial_avatar: string | null;
  cover_image?: string | null;
  summary?: string | null;
}

async function importBlog() {
  const rows: BlogRow[] = JSON.parse(readFileSync(join(EXPORT_DIR, 'blog_posts.json'), 'utf8'));
  console.log(`[import] blog_posts: ${rows.length} rows`);

  for (const r of rows) {
    if (!r.slug) {
      console.warn(`  [skip] blog_posts id=${r.id} sem slug`);
      continue;
    }
    await pg.query(
      `INSERT INTO app.blog_articles (
        id, tenant_id, title, slug, category, excerpt, content, image,
        author_id, published, featured, read_time, date, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (tenant_id, slug) DO NOTHING`,
      [
        r.id,
        STAGING_TENANT_ID,
        r.title,
        r.slug,
        r.category ?? 'Geral',
        r.excerpt,
        r.content ?? '',
        r.image,
        r.author_id ?? SYSTEM_AUTHOR_ID,
        r.published ?? false,
        r.featured ?? false,
        r.read_time,
        r.date ?? new Date().toISOString(),
        r.created_at ?? new Date().toISOString(),
        new Date().toISOString(),
      ],
    );
  }
}

async function importMaterials() {
  const rows: MaterialRow[] = JSON.parse(readFileSync(join(EXPORT_DIR, 'materials.json'), 'utf8'));
  console.log(`[import] materials: ${rows.length} rows`);

  for (const r of rows) {
    if (!r.slug) {
      console.warn(`  [skip] materials id=${r.id} sem slug`);
      continue;
    }
    await pg.query(
      `INSERT INTO app.materials (
        id, tenant_id, material_name, slug, material_type, description,
        link_material, material_url, published, is_active, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (tenant_id, slug) DO NOTHING`,
      [
        r.id,
        STAGING_TENANT_ID,
        r.material_name,
        r.slug,
        r.material_type,
        r.description,
        r.link_material,
        r.material_url,
        r.published ?? true,
        r.is_active ?? true,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );
  }
}

async function importCases() {
  const rows: CaseRow[] = JSON.parse(readFileSync(join(EXPORT_DIR, 'cases.json'), 'utf8'));
  console.log(`[import] cases: ${rows.length} rows`);

  for (const r of rows) {
    await pg.query(
      `INSERT INTO app.case_studies (
        id, tenant_id, title, slug, client_name, case_category, headline,
        summary, client_logo, challenge, solution, results, cover_image,
        metrics, testimonial, published, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      ON CONFLICT (tenant_id, slug) DO NOTHING`,
      [
        r.id,
        STAGING_TENANT_ID,
        r.title,
        r.slug,
        r.client_name ?? r.title.split(':')[0] ?? 'Cliente',
        r.case_category ?? 'Geral',
        r.title,
        r.challenge,
        r.client_logo,
        r.challenge,
        r.solution,
        r.results,
        r.client_logo,
        r.metrics ? JSON.stringify(r.metrics) : null,
        r.testimonial_quote
          ? JSON.stringify({
              quote: r.testimonial_quote,
              author: r.testimonial_author,
              role: r.testimonial_role,
              avatar: r.testimonial_avatar,
            })
          : null,
        r.published ?? true,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );
  }
}

async function main() {
  await pg.connect();
  try {
    await importBlog();
    await importMaterials();
    await importCases();
    console.log('\n[import] Done. Verifique com:');
    console.log("  SELECT 'blog' AS t, COUNT(*) FROM app.blog_articles");
    console.log("  UNION ALL SELECT 'materials', COUNT(*) FROM app.materials");
    console.log("  UNION ALL SELECT 'cases', COUNT(*) FROM app.case_studies;");
  } finally {
    await pg.end();
  }
}

void main().catch((err) => {
  console.error('[import] FATAL:', err);
  process.exit(1);
});
