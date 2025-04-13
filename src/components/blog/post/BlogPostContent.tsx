
import { getFrameworkImage, getArticleImageBySlug } from './articles/utils/frameworkImages';
import PolemicLedGrowthArticle from './articles/PolemicLedGrowthArticle';
import DefaultArticle from './articles/DefaultArticle';

interface BlogPostContentProps {
  category: string;
  authorName: string;
  authorRole: string;
  slug?: string;
}

const BlogPostContent = ({ category, slug }: BlogPostContentProps) => {
  // Standard author info for all articles
  const authorName = "Giulliano Alves";
  const authorRole = "CEO da RevHackers";

  // Special content for the Polemic Led Growth article
  if (slug === "polemic-led-growth-metodo-linkedin-maquina-oportunidades") {
    return <PolemicLedGrowthArticle authorName={authorName} authorRole={authorRole} />;
  }

  // Default content for other articles
  return (
    <DefaultArticle 
      category={category}
      authorName={authorName}
      authorRole={authorRole}
      getFrameworkImage={getFrameworkImage}
      slug={slug}
      getArticleImageBySlug={getArticleImageBySlug}
    />
  );
};

export default BlogPostContent;
