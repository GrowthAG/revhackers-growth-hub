
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import BlogPostHeader from '@/components/blog/post/BlogPostHeader';
import BlogPostContent from '@/components/blog/post/BlogPostContent';
import BlogPostFooter from '@/components/blog/post/BlogPostFooter';
import RelatedPosts from '@/components/blog/post/RelatedPosts';
import TableOfContents from '@/components/blog/post/TableOfContents';
import { getArticleImageBySlug } from '@/components/blog/post/articles/utils/frameworkImages';
import { getAllPosts } from '@/api/posts';

// Interface matches the WordPress API structure in RelatedPosts.tsx
interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  author: Author;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load posts from WordPress API
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar posts:", err);
        setError("Não foi possível carregar o artigo. Por favor, tente novamente mais tarde.");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  // Find the current post
  const post = posts.find(post => post.slug === slug);
  
  // Get related posts - garantimos conteúdo relacionado mas não repetitivo
  // Filtramos por categoria, mas excluímos o post atual
  const relatedPosts = post 
    ? posts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3)
    : [];
  
  // Format date to Portuguese
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // If post not found and not loading, redirect to blog page
  useEffect(() => {
    if (!isLoading && !post && posts.length > 0) {
      navigate('/blog');
    }
  }, [post, navigate, isLoading, posts]);
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full border-4 border-gray-200 border-t-revgreen animate-spin mb-4"></div>
            <h3 className="text-2xl font-bold mb-4">Carregando artigo...</h3>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout>
        <div className="container-custom py-20">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Erro ao carregar artigo</h3>
            <p className="text-gray-600 max-w-md mx-auto">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/blog')}
              className="mt-6 border-2 border-revgreen text-revgreen hover:bg-revgreen hover:text-white"
            >
              Voltar para o blog
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!post) {
    return null; // Will redirect in useEffect
  }
  
  // Get custom image if available for this article
  const customImage = getArticleImageBySlug(post.slug);
  
  // Copy the post but update the image if custom one exists
  const updatedPost = {
    ...post,
    image: customImage || post.image
  };
  
  return (
    <PageLayout>
      <article className="pt-16 pb-24">
        <div className="container-custom">
          <BlogPostHeader post={updatedPost} formatDate={formatDate} />
          
          {/* Article Content with Table of Contents */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <TableOfContents containerRef={contentRef} />
                </div>
              </div>
              <div ref={contentRef} className="lg:col-span-3">
                <BlogPostContent 
                  category={post.category}
                  authorName={post.author.name}
                  authorRole={post.author.role}
                  slug={post.slug}
                />
                <BlogPostFooter />
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Related Articles - sempre mostrando conteúdo relevante e não repetitivo */}
      <RelatedPosts posts={relatedPosts} />
    </PageLayout>
  );
};

export default BlogPostPage;
