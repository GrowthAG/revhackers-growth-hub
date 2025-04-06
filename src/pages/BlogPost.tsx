
import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost } from '@/data/blogData';
import BlogCard from '@/components/blog/BlogCard';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Find the current post
  const post = blogPosts.find(post => post.slug === slug);
  
  // Get related posts (same category, excluding current)
  const relatedPosts = post 
    ? blogPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3)
    : [];
  
  // Format date to Portuguese
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // If post not found, redirect to blog page
  useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
  }, [post, navigate]);
  
  if (!post) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <PageLayout>
      <article className="pt-16 pb-24">
        <div className="container-custom">
          {/* Back to Blog Link */}
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-gray-600 hover:text-revgreen"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Voltar para o blog</span>
            </Link>
          </div>
          
          {/* Article Header */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-gray-500">{post.author.role}</p>
                </div>
              </div>
              
              <div className="flex text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          <div className="max-w-4xl mx-auto mb-10">
            <figure className="rounded-lg overflow-hidden">
              <img 
                src={post.image}
                alt={post.title}
                className="w-full h-auto"
              />
            </figure>
          </div>
          
          {/* Article Content */}
          <div className="max-w-3xl mx-auto prose prose-lg lg:prose-xl">
            <p className="lead text-xl mb-8">
              {post.excerpt}
            </p>
            
            <h2>Introdução ao {post.category}</h2>
            
            <p>
              No dinâmico cenário de negócios B2B atual, estratégias baseadas em dados e tecnologia 
              têm se provado essenciais para empresas que buscam crescimento sustentável. Este artigo 
              mergulha nos conceitos fundamentais e aplicações práticas que podem transformar resultados.
            </p>
            
            <h2>Principais estratégias</h2>
            
            <p>
              A implementação eficaz de metodologias como {post.category} requer uma abordagem sistemática 
              e orientada por métricas. Nossos especialistas desenvolveram um framework que simplifica 
              esse processo em etapas acionáveis:
            </p>
            
            <ul>
              <li>Análise completa do funil de conversão</li>
              <li>Identificação de pontos de atrito na jornada do cliente</li>
              <li>Desenvolvimento de experimentos baseados em hipóteses</li>
              <li>Implementação de testes A/B com estatística relevante</li>
              <li>Automação de processos para escala</li>
            </ul>
            
            <blockquote>
              "A verdadeira transformação acontece quando combinamos dados, tecnologia e processos 
              em uma estratégia coerente focada no cliente."
            </blockquote>
            
            <h2>Casos de sucesso</h2>
            
            <p>
              Empresas que adotaram estas metodologias têm consistentemente superado seus concorrentes 
              em métricas cruciais como taxa de conversão, custo de aquisição de clientes e lifetime value. 
              Um exemplo notável é como a implementação de {post.category} levou a um aumento de 43% na 
              taxa de conversão para uma empresa de SaaS B2B em apenas três meses.
            </p>
            
            <h2>Próximos passos</h2>
            
            <p>
              Para começar a implementar estas estratégias em sua empresa, recomendamos:
            </p>
            
            <ol>
              <li>Realizar um diagnóstico completo de suas métricas atuais</li>
              <li>Estabelecer objetivos claros alinhados com sua estratégia de negócios</li>
              <li>Selecionar as ferramentas e metodologias mais adequadas ao seu contexto</li>
              <li>Desenvolver um plano de implementação faseado</li>
              <li>Monitorar constantemente os resultados e iterar</li>
            </ol>
            
            <h2>Conclusão</h2>
            
            <p>
              A transformação digital no B2B não é mais uma opção, mas uma necessidade competitiva. 
              Empresas que dominam estratégias de {post.category} posicionam-se como líderes em seus 
              segmentos, construindo vantagens sustentáveis através de dados, automação e experiências 
              excepcionais para seus clientes.
            </p>
          </div>
          
          {/* Share Buttons */}
          <div className="max-w-3xl mx-auto mt-12 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Compartilhe este artigo:</span>
              <div className="flex space-x-3">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container-custom">
            <h2 className="text-2xl font-bold mb-8">Artigos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
};

export default BlogPostPage;
