
import { getFrameworkImage } from './articles/utils/frameworkImages';
import PolemicLedGrowthArticle from './articles/PolemicLedGrowthArticle';
import DefaultArticle from './articles/DefaultArticle';

interface BlogPostContentProps {
  category: string;
  authorName: string;
  authorRole: string;
  slug?: string;
}

const BlogPostContent = ({ category, authorName, authorRole, slug }: BlogPostContentProps) => {
  // Conteúdo específico para o artigo de Polemic Led Growth
  if (slug === "polemic-led-growth-metodo-linkedin-maquina-oportunidades") {
    return <PolemicLedGrowthArticle />;
  }

  // Default content for other articles
  return (
    <DefaultArticle 
      category={category}
      authorName={authorName}
      authorRole={authorRole}
      getFrameworkImage={getFrameworkImage}
    />
  );
};

export default BlogPostContent;
