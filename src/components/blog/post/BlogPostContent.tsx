
import { getFrameworkImage, getArticleImageBySlug } from './articles/utils/frameworkImages';
import PolemicLedGrowthArticle from './articles/PolemicLedGrowthArticle';
import DefaultArticle from './articles/DefaultArticle';

interface BlogPostContentProps {
  category: string;
  authorName: string;
  authorRole: string;
  slug?: string;
}

const BlogPostContent = ({ category, authorName, authorRole, slug }: BlogPostContentProps) => {
  // Map each slug to its specific content category to ensure unique content
  const getArticleCategory = (slug?: string): string => {
    if (!slug) return category;
    
    // Map de slugs para categorias específicas para garantir conteúdo correto
    const slugToCategoryMap: Record<string, string> = {
      // RevOps articles
      "revops-framework-completo-integracao": "RevOps",
      
      // ABM articles
      "abm-implementar-account-based-marketing-ia": "Account Based Marketing",
      "abm-para-times-pequenos-segmentacao-que-converte": "Account Based Marketing",
      
      // PLG articles
      "plg-guia-definitivo-saas-b2b": "PLG",
      "o-que-e-plg-e-como-aplicar-em-startups-brasileiras": "PLG",
      
      // Strategy articles
      "modelo-funil-gravatinha-transformando-jornada-cliente": "Estratégia",
      
      // CRO articles
      "cro-na-pratica-como-dobrar-sua-taxa-de-conversao": "CRO",
      
      // Data-driven articles
      "diagnostico-de-marketing-orientado-por-dados": "Dados",
      
      // AI articles
      "estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas": "Automação",
      
      // Sales & Marketing articles
      "playbooks-de-vendas-e-marketing-que-escalam-resultados": "Vendas",
      
      // Automation articles
      "7-automacoes-de-marketing-que-escalam-sua-operacao": "Automação",
      "automacoes-marketing-escalar-operacao": "Automação",
      
      // Acquisition funnel articles
      "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto": "Geração de Demanda",
      "construir-funil-aquisicao-proprio-produto": "Geração de Demanda",
      
      // Polemic Led Growth articles
      "polemic-led-growth-metodo-linkedin-maquina-oportunidades": "Polemic Led Growth",
    };
    
    return slugToCategoryMap[slug] || category;
  };

  // Special content for specific articles
  if (slug === "polemic-led-growth-metodo-linkedin-maquina-oportunidades") {
    return <PolemicLedGrowthArticle authorName={authorName} authorRole={authorRole} />;
  }

  // Default content for other articles, but with the correct category mapping
  return (
    <DefaultArticle 
      category={getArticleCategory(slug)}
      authorName={authorName}
      authorRole={authorRole}
      getFrameworkImage={getFrameworkImage}
      slug={slug}
      getArticleImageBySlug={getArticleImageBySlug}
    />
  );
};

export default BlogPostContent;
