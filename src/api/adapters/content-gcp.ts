import { apiBase } from './_base';

export interface BlogArticleGcp {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  content: string;
  authorName?: string;
  readTime?: string;
  published: boolean;
  createdAt: string;
}

export interface MaterialGcp {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  fileUrl?: string;
  type: string;
  createdAt: string;
}

export interface CaseStudyGcp {
  id: string;
  clientName: string;
  clientLogo?: string;
  caseCategory: string;
  headline: string;
  summary?: string;
  published: boolean;
  createdAt: string;
}

export const contentGcpAdapter = {
  // Blog Articles
  async getBlogArticles(): Promise<BlogArticleGcp[]> {
    const res = await fetch(`${apiBase()}/blog/articles`);
    if (!res.ok) throw new Error('Falha ao carregar artigos do Blog da API GCP');
    return res.json();
  },

  // Materials
  async getMaterials(): Promise<MaterialGcp[]> {
    const res = await fetch(`${apiBase()}/materials`);
    if (!res.ok) throw new Error('Falha ao carregar materiais da API GCP');
    return res.json();
  },

  // Cases
  async getCases(): Promise<CaseStudyGcp[]> {
    const res = await fetch(`${apiBase()}/cases`);
    if (!res.ok) throw new Error('Falha ao carregar cases da API GCP');
    return res.json();
  },
};
