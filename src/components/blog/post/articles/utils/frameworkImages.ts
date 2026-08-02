// Utility function to get framework image based on category & article slug

export const articleImageMap: Record<string, string> = {
  "revenue-architecture-guia-definitivo": "/uploads/revenue-architecture-hero.svg",
  "processo-comercial-b2b-guia-completo": "/uploads/processo-comercial-b2b.svg",
  "o-funil-que-realmente-funciona-para-empresas-b2b": "/uploads/processo-comercial-b2b.svg",
  "diagnostico-funil-comercial-identificar-gargalos": "/uploads/processo-comercial-b2b.svg",
  "revops-framework-definitivo-revenue-operations": "/uploads/revenue-architecture-hero.svg",
  "analise-de-dados-para-fundadores-quais-metricas-importam": "/uploads/revenue-architecture-hero.svg",
  "os-melhores-crms-e-automacoes-para-crescimento-b2b": "/uploads/processo-comercial-b2b.svg",
  "crm-2025-por-que-toda-empresa-b2b-precisa": "/uploads/processo-comercial-b2b.svg"
};

export const getArticleImageBySlug = (slug: string): string => {
  return articleImageMap[slug] || "/uploads/revenue-architecture-hero.svg";
};

export const getFrameworkImage = (category: string, slug?: string): string => {
  if (slug && articleImageMap[slug]) {
    return articleImageMap[slug];
  }
  if (category && (category.toLowerCase().includes('vendas') || category.toLowerCase().includes('comercial'))) {
    return "/uploads/processo-comercial-b2b.svg";
  }
  return "/uploads/revenue-architecture-hero.svg";
};
