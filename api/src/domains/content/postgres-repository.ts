import type { QueryResultRow } from 'pg';
import type { TenantId } from '../../contracts/tenant';
import { withTenantTransaction, type QueryablePool } from '../../db/postgres';
import type {
  BlogArticleRecord,
  CaseStudyRecord,
  CreateBlogArticleInput,
  CreateCaseStudyInput,
  CreateMaterialInput,
  MaterialRecord,
  UpdateBlogArticleInput,
  UpdateCaseStudyInput,
  UpdateMaterialInput,
} from './contracts';
import type { ContentRepository } from './repository';

// ---- Blog ----
interface BlogRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author_id: string;
  published: boolean;
  featured: boolean;
  read_time: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

const BLOG_COLUMNS = `id, tenant_id, title, slug, category, excerpt, content, image, author_id, published, featured, read_time, date, created_at, updated_at`;

function mapBlog(row: BlogRow): BlogArticleRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    authorId: row.author_id,
    published: row.published,
    featured: row.featured,
    readTime: row.read_time,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---- Materials ----
interface MaterialRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  material_name: string;
  slug: string;
  material_type: string;
  description: string | null;
  link_material: string | null;
  material_url: string;
  published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MATERIAL_COLUMNS = `id, tenant_id, material_name, slug, material_type, description, link_material, material_url, published, is_active, created_at, updated_at`;

function mapMaterial(row: MaterialRow): MaterialRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    materialName: row.material_name,
    slug: row.slug,
    materialType: row.material_type,
    description: row.description,
    linkMaterial: row.link_material,
    materialUrl: row.material_url,
    published: row.published,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---- Cases ----
interface CaseRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  client_name: string;
  case_category: string;
  headline: string;
  summary: string | null;
  client_logo: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  cover_image: string | null;
  metrics: unknown;
  testimonial: unknown;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const CASE_COLUMNS = `id, tenant_id, title, slug, client_name, case_category, headline, summary, client_logo, challenge, solution, results, cover_image, metrics, testimonial, published, created_at, updated_at`;

function mapCase(row: CaseRow): CaseStudyRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    title: row.title,
    slug: row.slug,
    clientName: row.client_name,
    caseCategory: row.case_category,
    headline: row.headline,
    summary: row.summary,
    clientLogo: row.client_logo,
    challenge: row.challenge,
    solution: row.solution,
    results: row.results,
    coverImage: row.cover_image,
    metrics: row.metrics,
    testimonial: row.testimonial,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresContentRepository implements ContentRepository {
  constructor(private readonly pool: QueryablePool) {}

  // ---- Blog ----
  async listBlogArticles(tenantId: TenantId, opts?: { publishedOnly?: boolean }): Promise<BlogArticleRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const where = opts?.publishedOnly ? 'WHERE published = true' : '';
      const result = await client.query<BlogRow>(
        `SELECT ${BLOG_COLUMNS} FROM app.blog_articles ${where} ORDER BY date DESC`,
      );
      return result.rows.map(mapBlog);
    });
  }

  async getBlogArticleBySlug(tenantId: TenantId, slug: string): Promise<BlogArticleRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<BlogRow>(
        `SELECT ${BLOG_COLUMNS} FROM app.blog_articles WHERE slug = $1 LIMIT 1`,
        [slug],
      );
      const row = result.rows[0];
      return row ? mapBlog(row) : null;
    });
  }

  async createBlogArticle(tenantId: TenantId, input: CreateBlogArticleInput): Promise<BlogArticleRecord> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<BlogRow>(
        `INSERT INTO app.blog_articles (
          tenant_id, title, slug, category, excerpt, content, image,
          author_id, published, featured, read_time, date
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING ${BLOG_COLUMNS}`,
        [
          tenantId,
          input.title,
          input.slug,
          input.category,
          input.excerpt ?? null,
          input.content,
          input.image ?? null,
          input.authorId,
          input.published ?? false,
          input.featured ?? false,
          input.readTime ?? null,
          input.date ?? new Date().toISOString(),
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error('Blog article creation returned no row.');
      return mapBlog(row);
    });
  }

  async updateBlogArticle(tenantId: TenantId, id: string, input: UpdateBlogArticleInput): Promise<BlogArticleRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const existing = await client.query<BlogRow>(
        `SELECT ${BLOG_COLUMNS} FROM app.blog_articles WHERE id = $1::uuid LIMIT 1`,
        [id],
      );
      if (!existing.rows[0]) return null;
      const current = existing.rows[0];
      const result = await client.query<BlogRow>(
        `UPDATE app.blog_articles SET
          title = $2, slug = $3, category = $4, excerpt = $5, content = $6,
          image = $7, published = $8, featured = $9, read_time = $10, date = $11,
          updated_at = now()
        WHERE id = $1::uuid
        RETURNING ${BLOG_COLUMNS}`,
        [
          id,
          input.title ?? current.title,
          input.slug ?? current.slug,
          input.category ?? current.category,
          input.excerpt !== undefined ? (input.excerpt ?? null) : current.excerpt,
          input.content ?? current.content,
          input.image !== undefined ? (input.image ?? null) : current.image,
          input.published !== undefined ? input.published : current.published,
          input.featured !== undefined ? input.featured : current.featured,
          input.readTime !== undefined ? (input.readTime ?? null) : current.read_time,
          input.date !== undefined ? input.date : current.date,
        ],
      );
      const row = result.rows[0];
      return row ? mapBlog(row) : null;
    });
  }

  async deleteBlogArticle(tenantId: TenantId, id: string): Promise<boolean> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(
        `DELETE FROM app.blog_articles WHERE id = $1::uuid`,
        [id],
      );
      return (result.rowCount ?? 0) > 0;
    });
  }

  // ---- Materials ----
  async listMaterials(tenantId: TenantId, opts?: { publishedOnly?: boolean }): Promise<MaterialRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const where = opts?.publishedOnly ? 'WHERE published = true AND is_active = true' : '';
      const result = await client.query<MaterialRow>(
        `SELECT ${MATERIAL_COLUMNS} FROM app.materials ${where} ORDER BY created_at DESC`,
      );
      return result.rows.map(mapMaterial);
    });
  }

  async getMaterialBySlug(tenantId: TenantId, slug: string): Promise<MaterialRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<MaterialRow>(
        `SELECT ${MATERIAL_COLUMNS} FROM app.materials WHERE slug = $1 LIMIT 1`,
        [slug],
      );
      const row = result.rows[0];
      return row ? mapMaterial(row) : null;
    });
  }

  async createMaterial(tenantId: TenantId, input: CreateMaterialInput): Promise<MaterialRecord> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<MaterialRow>(
        `INSERT INTO app.materials (
          tenant_id, material_name, slug, material_type, description,
          link_material, material_url, published, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING ${MATERIAL_COLUMNS}`,
        [
          tenantId,
          input.materialName,
          input.slug,
          input.materialType,
          input.description ?? null,
          input.linkMaterial ?? null,
          input.materialUrl,
          input.published ?? true,
          input.isActive ?? true,
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error('Material creation returned no row.');
      return mapMaterial(row);
    });
  }

  async updateMaterial(tenantId: TenantId, id: string, input: UpdateMaterialInput): Promise<MaterialRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const existing = await client.query<MaterialRow>(
        `SELECT ${MATERIAL_COLUMNS} FROM app.materials WHERE id = $1::uuid LIMIT 1`,
        [id],
      );
      if (!existing.rows[0]) return null;
      const current = existing.rows[0];
      const result = await client.query<MaterialRow>(
        `UPDATE app.materials SET
          material_name = $2, slug = $3, material_type = $4, description = $5,
          link_material = $6, material_url = $7, published = $8, is_active = $9,
          updated_at = now()
        WHERE id = $1::uuid
        RETURNING ${MATERIAL_COLUMNS}`,
        [
          id,
          input.materialName ?? current.material_name,
          input.slug ?? current.slug,
          input.materialType ?? current.material_type,
          input.description !== undefined ? (input.description ?? null) : current.description,
          input.linkMaterial !== undefined ? (input.linkMaterial ?? null) : current.link_material,
          input.materialUrl ?? current.material_url,
          input.published !== undefined ? input.published : current.published,
          input.isActive !== undefined ? input.isActive : current.is_active,
        ],
      );
      const row = result.rows[0];
      return row ? mapMaterial(row) : null;
    });
  }

  async deleteMaterial(tenantId: TenantId, id: string): Promise<boolean> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(
        `DELETE FROM app.materials WHERE id = $1::uuid`,
        [id],
      );
      return (result.rowCount ?? 0) > 0;
    });
  }

  // ---- Cases ----
  async listCaseStudies(tenantId: TenantId, opts?: { publishedOnly?: boolean }): Promise<CaseStudyRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const where = opts?.publishedOnly ? 'WHERE published = true' : '';
      const result = await client.query<CaseRow>(
        `SELECT ${CASE_COLUMNS} FROM app.case_studies ${where} ORDER BY created_at DESC`,
      );
      return result.rows.map(mapCase);
    });
  }

  async getCaseStudyBySlug(tenantId: TenantId, slug: string): Promise<CaseStudyRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<CaseRow>(
        `SELECT ${CASE_COLUMNS} FROM app.case_studies WHERE slug = $1 LIMIT 1`,
        [slug],
      );
      const row = result.rows[0];
      return row ? mapCase(row) : null;
    });
  }

  async createCaseStudy(tenantId: TenantId, input: CreateCaseStudyInput): Promise<CaseStudyRecord> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<CaseRow>(
        `INSERT INTO app.case_studies (
          tenant_id, title, slug, client_name, case_category, headline,
          summary, client_logo, challenge, solution, results, cover_image,
          metrics, testimonial, published
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING ${CASE_COLUMNS}`,
        [
          tenantId,
          input.title,
          input.slug,
          input.clientName,
          input.caseCategory,
          input.headline,
          input.summary ?? null,
          input.clientLogo ?? null,
          input.challenge ?? null,
          input.solution ?? null,
          input.results ?? null,
          input.coverImage ?? null,
          input.metrics ? JSON.stringify(input.metrics) : null,
          input.testimonial ? JSON.stringify(input.testimonial) : null,
          input.published ?? true,
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error('Case study creation returned no row.');
      return mapCase(row);
    });
  }

  async updateCaseStudy(tenantId: TenantId, id: string, input: UpdateCaseStudyInput): Promise<CaseStudyRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const existing = await client.query<CaseRow>(
        `SELECT ${CASE_COLUMNS} FROM app.case_studies WHERE id = $1::uuid LIMIT 1`,
        [id],
      );
      if (!existing.rows[0]) return null;
      const current = existing.rows[0];
      const result = await client.query<CaseRow>(
        `UPDATE app.case_studies SET
          title = $2, slug = $3, client_name = $4, case_category = $5,
          headline = $6, summary = $7, client_logo = $8, challenge = $9,
          solution = $10, results = $11, cover_image = $12,
          metrics = $13, testimonial = $14, published = $15,
          updated_at = now()
        WHERE id = $1::uuid
        RETURNING ${CASE_COLUMNS}`,
        [
          id,
          input.title ?? current.title,
          input.slug ?? current.slug,
          input.clientName ?? current.client_name,
          input.caseCategory ?? current.case_category,
          input.headline ?? current.headline,
          input.summary !== undefined ? (input.summary ?? null) : current.summary,
          input.clientLogo !== undefined ? (input.clientLogo ?? null) : current.client_logo,
          input.challenge !== undefined ? (input.challenge ?? null) : current.challenge,
          input.solution !== undefined ? (input.solution ?? null) : current.solution,
          input.results !== undefined ? (input.results ?? null) : current.results,
          input.coverImage !== undefined ? (input.coverImage ?? null) : current.cover_image,
          input.metrics !== undefined ? (input.metrics ? JSON.stringify(input.metrics) : null) : current.metrics,
          input.testimonial !== undefined ? (input.testimonial ? JSON.stringify(input.testimonial) : null) : current.testimonial,
          input.published !== undefined ? input.published : current.published,
        ],
      );
      const row = result.rows[0];
      return row ? mapCase(row) : null;
    });
  }

  async deleteCaseStudy(tenantId: TenantId, id: string): Promise<boolean> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(
        `DELETE FROM app.case_studies WHERE id = $1::uuid`,
        [id],
      );
      return (result.rowCount ?? 0) > 0;
    });
  }
}
