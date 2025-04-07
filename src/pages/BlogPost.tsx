
import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Twitter, Facebook, MessageSquare, Download, BookOpen, LineChart, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost } from '@/data/blogData';
import BlogCard from '@/components/blog/BlogCard';
import { Card, CardContent } from '@/components/ui/card';

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

  // Função para gerar imagem de framework com base na categoria
  const getFrameworkImage = (category: string) => {
    switch(category) {
      case "RevOps":
        return "https://images.unsplash.com/photo-1551288049-bebda4e38f71";
      case "Account Based Marketing":
        return "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7";
      case "PLG":
        return "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
      case "Estratégia":
        return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5";
      case "CRO":
        return "https://images.unsplash.com/photo-1551288049-bebda4e38f71";
      case "Geração de Demanda":
        return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d";
      case "Automação":
        return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6";
      case "DevOps":
        return "https://images.unsplash.com/photo-1518770660439-4636190af475";
      default:
        return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6";
    }
  };
  
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

            <div className="not-prose my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <BookOpen className="mr-2 text-revgreen" size={20} />
                Definição de {post.category}
              </h3>
              <p className="text-gray-700">
                {post.category === "RevOps" && "Revenue Operations (RevOps) é uma abordagem estratégica que alinha equipes de marketing, vendas e sucesso do cliente sob uma visão unificada do funil de receita, utilizando processos integrados, tecnologia conectada e métricas compartilhadas para acelerar o crescimento."}
                {post.category === "Account Based Marketing" && "Account Based Marketing (ABM) é uma estratégia focada que trata contas específicas como mercados individuais, criando campanhas personalizadas para cada conta-alvo com base em suas necessidades e desafios únicos."}
                {post.category === "PLG" && "Product-Led Growth (PLG) é uma estratégia de crescimento onde o produto em si é o principal motor de aquisição, conversão e expansão de usuários, permitindo que o valor do produto seja experimentado diretamente antes da compra."}
                {post.category === "Estratégia" && "Estratégia de crescimento B2B moderna combina abordagens inbound e outbound em um modelo integrado, utilizando dados para orientar decisões e personalizar interações em cada etapa da jornada do cliente."}
                {post.category === "CRO" && "Conversion Rate Optimization (CRO) é o processo sistemático de aumentar a porcentagem de visitantes que realizam ações desejadas em seu site, utilizando análise de dados, testes A/B e insights comportamentais."}
                {post.category === "Geração de Demanda" && "Geração de Demanda B2B é uma abordagem estratégica para criar awareness e interesse em produtos e serviços, educando o mercado sobre problemas que eles podem não saber que têm e apresentando soluções."}
                {post.category === "Automação" && "Automação de Marketing B2B é a utilização de tecnologia para gerenciar e orquestrar interações com leads e clientes em escala, entregando conteúdo relevante no momento certo através de múltiplos canais."}
                {post.category === "DevOps" && "DevOps aplicado ao Marketing é a integração de princípios de desenvolvimento ágil e operações de TI aos processos de marketing, permitindo iterações rápidas, experimentação contínua e melhor integração tecnológica."}
              </p>
            </div>
            
            <figure className="my-10">
              <img 
                src={getFrameworkImage(post.category)}
                alt={`Framework de ${post.category}`}
                className="w-full h-auto rounded-lg shadow-md"
              />
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                Framework visual de implementação de {post.category} para empresas B2B
              </figcaption>
            </figure>
            
            <h2>Principais componentes de uma estratégia de {post.category} eficaz</h2>
            
            <p>
              A implementação eficaz de metodologias como {post.category} requer uma abordagem sistemática 
              e orientada por métricas. Nossos especialistas desenvolveram um framework que simplifica 
              esse processo em etapas acionáveis:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
              <Card className="border border-gray-200">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <LineChart className="mr-2 text-revgreen" size={20} /> 
                    Análise e Diagnóstico
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-0.5" />
                      <span>Análise completa do funil de conversão</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-0.5" />
                      <span>Identificação de pontos de atrito na jornada</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-0.5" />
                      <span>Benchmark competitivo e de mercado</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <BarChart3 className="mr-2 text-revgreen" size={20} /> 
                    Implementação e Testes
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-0.5" />
                      <span>Desenvolvimento de experimentos baseados em hipóteses</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-0.5" />
                      <span>Implementação de testes A/B com estatística relevante</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-0.5" />
                      <span>Automação de processos para escala</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <blockquote>
              <p>"A verdadeira transformação acontece quando combinamos dados, tecnologia e processos 
              em uma estratégia coerente focada no cliente."</p>
              <cite>— {post.author.name}, {post.author.role}</cite>
            </blockquote>
            
            <h2>O framework de maturidade em {post.category}</h2>

            <p>
              Nossa pesquisa com mais de 150 empresas B2B identificou cinco estágios de maturidade 
              em {post.category}. Cada estágio representa um nível diferente de integração, 
              automação e eficiência:
            </p>

            <div className="not-prose my-8 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-gray-100 p-4 text-center md:w-1/5">
                  <div className="h-12 w-12 rounded-full bg-gray-300 mx-auto flex items-center justify-center mb-2">
                    <span className="font-bold">1</span>
                  </div>
                  <p className="font-medium">Inicial</p>
                  <p className="text-xs text-gray-500 mt-1">Processos isolados</p>
                </div>
                <div className="bg-gray-200 p-4 text-center md:w-1/5">
                  <div className="h-12 w-12 rounded-full bg-gray-400 mx-auto flex items-center justify-center mb-2">
                    <span className="font-bold">2</span>
                  </div>
                  <p className="font-medium">Emergente</p>
                  <p className="text-xs text-gray-500 mt-1">Primeiras integrações</p>
                </div>
                <div className="bg-gray-300 p-4 text-center md:w-1/5">
                  <div className="h-12 w-12 rounded-full bg-gray-500 mx-auto flex items-center justify-center mb-2">
                    <span className="font-bold">3</span>
                  </div>
                  <p className="font-medium">Definido</p>
                  <p className="text-xs text-gray-500 mt-1">Processos padronizados</p>
                </div>
                <div className="bg-gray-400 p-4 text-center md:w-1/5">
                  <div className="h-12 w-12 rounded-full bg-gray-600 mx-auto flex items-center justify-center mb-2 text-white">
                    <span className="font-bold">4</span>
                  </div>
                  <p className="font-medium">Otimizado</p>
                  <p className="text-xs text-gray-600 mt-1">Alta automação</p>
                </div>
                <div className="bg-gray-500 p-4 text-center md:w-1/5 text-white">
                  <div className="h-12 w-12 rounded-full bg-revgreen mx-auto flex items-center justify-center mb-2">
                    <span className="font-bold">5</span>
                  </div>
                  <p className="font-medium">Transformador</p>
                  <p className="text-xs text-gray-200 mt-1">Inovação contínua</p>
                </div>
              </div>
            </div>
            
            <h2>Casos de sucesso</h2>
            
            <p>
              Empresas que adotaram estas metodologias têm consistentemente superado seus concorrentes 
              em métricas cruciais como taxa de conversão, custo de aquisição de clientes e lifetime value. 
              Um exemplo notável é como a implementação de {post.category} levou a um aumento de 43% na 
              taxa de conversão para uma empresa de SaaS B2B em apenas três meses.
            </p>

            <div className="not-prose my-8 bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-bold mb-3">Resultados mensuráveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-3xl font-bold text-revgreen">+43%</p>
                  <p className="text-sm text-gray-600">Aumento na taxa de conversão</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-3xl font-bold text-revgreen">-27%</p>
                  <p className="text-sm text-gray-600">Redução no custo de aquisição</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-3xl font-bold text-revgreen">2.3x</p>
                  <p className="text-sm text-gray-600">Aumento no lifetime value</p>
                </div>
              </div>
            </div>
            
            <h2>Próximos passos</h2>
            
            <p>
              Para começar a implementar estas estratégias em sua empresa, recomendamos:
            </p>
            
            <ol>
              <li className="mb-3">Realizar um diagnóstico completo de suas métricas atuais</li>
              <li className="mb-3">Estabelecer objetivos claros alinhados com sua estratégia de negócios</li>
              <li className="mb-3">Selecionar as ferramentas e metodologias mais adequadas ao seu contexto</li>
              <li className="mb-3">Desenvolver um plano de implementação faseado</li>
              <li>Monitorar constantemente os resultados e iterar</li>
            </ol>

            <div className="not-prose my-10 bg-gray-800 text-white p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Quer implementar {post.category} na sua empresa?</h3>
              <p className="mb-6">Agende um diagnóstico gratuito com nossos especialistas e descubra como transformar sua operação.</p>
              <Button asChild className="bg-revgreen hover:bg-revgreen/90">
                <Link to="/diagnostico" className="flex items-center">
                  Solicitar diagnóstico gratuito
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <h2>Conclusão</h2>
            
            <p>
              A transformação digital no B2B não é mais uma opção, mas uma necessidade competitiva. 
              Empresas que dominam estratégias de {post.category} posicionam-se como líderes em seus 
              segmentos, construindo vantagens sustentáveis através de dados, automação e experiências 
              excepcionais para seus clientes.
            </p>

            <div className="not-prose my-6">
              <p className="text-sm font-medium">Recursos adicionais:</p>
              <div className="flex flex-col space-y-2 mt-2">
                <a href="#" className="flex items-center text-revgreen hover:underline">
                  <Download className="h-4 w-4 mr-2" />
                  <span>Guia Completo de {post.category} para B2B (PDF)</span>
                </a>
                <a href="#" className="flex items-center text-revgreen hover:underline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Webinar: Implementando {post.category} na prática</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="max-w-3xl mx-auto mt-12 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Compartilhe este artigo:</span>
              <div className="flex space-x-3">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <Facebook className="h-4 w-4" />
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
