import type { TenantId } from '../../contracts/tenant';

export interface BlogArticleRecord {
  id: string;
  tenantId: TenantId;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  authorId: string;
  published: boolean;
  featured: boolean;
  readTime: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogArticleInput {
  title: string;
  slug: string;
  category: string;
  excerpt?: string | undefined;
  content: string;
  image?: string | undefined;
  authorId: string;
  published?: boolean | undefined;
  featured?: boolean | undefined;
  readTime?: string | undefined;
  date?: string | undefined;
}

export interface UpdateBlogArticleInput {
  title?: string | undefined;
  slug?: string | undefined;
  category?: string | undefined;
  excerpt?: string | null | undefined;
  content?: string | undefined;
  image?: string | null | undefined;
  published?: boolean | undefined;
  featured?: boolean | undefined;
  readTime?: string | null | undefined;
  date?: string | undefined;
}

export interface MaterialRecord {
  id: string;
  tenantId: TenantId;
  materialName: string;
  slug: string;
  materialType: string;
  description: string | null;
  linkMaterial: string | null;
  materialUrl: string;
  published: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialInput {
  materialName: string;
  slug: string;
  materialType: string;
  description?: string | undefined;
  linkMaterial?: string | undefined;
  materialUrl: string;
  published?: boolean | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateMaterialInput {
  materialName?: string | undefined;
  slug?: string | undefined;
  materialType?: string | undefined;
  description?: string | null | undefined;
  linkMaterial?: string | null | undefined;
  materialUrl?: string | undefined;
  published?: boolean | undefined;
  isActive?: boolean | undefined;
}

export interface CaseStudyRecord {
  id: string;
  tenantId: TenantId;
  title: string;
  slug: string;
  clientName: string;
  caseCategory: string;
  headline: string;
  summary: string | null;
  clientLogo: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  coverImage: string | null;
  metrics: unknown;
  testimonial: unknown;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseStudyInput {
  title: string;
  slug: string;
  clientName: string;
  caseCategory: string;
  headline: string;
  summary?: string | undefined;
  clientLogo?: string | undefined;
  challenge?: string | undefined;
  solution?: string | undefined;
  results?: string | undefined;
  coverImage?: string | undefined;
  metrics?: unknown;
  testimonial?: unknown;
  published?: boolean | undefined;
}

export interface UpdateCaseStudyInput {
  title?: string | undefined;
  slug?: string | undefined;
  clientName?: string | undefined;
  caseCategory?: string | undefined;
  headline?: string | undefined;
  summary?: string | null | undefined;
  clientLogo?: string | null | undefined;
  challenge?: string | null | undefined;
  solution?: string | null | undefined;
  results?: string | null | undefined;
  coverImage?: string | null | undefined;
  metrics?: unknown;
  testimonial?: unknown;
  published?: boolean | undefined;
}
