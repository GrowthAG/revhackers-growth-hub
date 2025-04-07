
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const featuredArticles = [
  {
    title: "RevOps: Framework completo para integrar Marketing, Vendas e CS",
    excerpt: "Um guia detalhado de Revenue Operations com as melhores práticas para implementação e mensuração de resultados em empresas B2B.",
    category: "RevOps",
    author: {
      name: "Rafael Silva",
      role: "Especialista em RevOps",
      avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79"
    },
    slug: "revops-framework-completo-integracao",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3"
  },
  {
    title: "ABM 2.0: Como implementar Account Based Marketing com IA",
    excerpt: "Metodologia avançada para identificar contas-alvo, personalizar jornadas e maximizar ROI com inteligência artificial e automação.",
    category: "Account Based Marketing",
    author: {
      name: "Carla Mendes",
      role: "Estrategista de ABM",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
    },
    slug: "abm-implementar-account-based-marketing-ia",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
  },
  {
    title: "Product-Led Growth: O guia definitivo para SaaS B2B",
    excerpt: "Como construir uma estratégia PLG que transforma usuários em defensores da marca e acelera crescimento orgânico sustentável.",
    category: "PLG",
    author: {
      name: "Marcelo Costa",
      role: "Especialista em Produto",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
    },
    slug: "plg-guia-definitivo-saas-b2b",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
  },
  {
    title: "Data-Driven Growth: Métricas North Star para seu negócio",
    excerpt: "Como definir e implementar KPIs estratégicos que realmente impactam seu crescimento e orientam decisões corporativas.",
    category: "Dados",
    author: {
      name: "Ana Ferreira",
      role: "Head de BI",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    slug: "metricas-north-star-crescimento-baseado-dados",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
  }
];

const BlogSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Blog RevHackers
            </h2>
            <p className="text-lg text-gray-600">
              Conteúdo estratégico e especializado sobre crescimento, tecnologia e dados para empresas B2B.
            </p>
          </div>
          
          <Link 
            to="/blog" 
            className="inline-flex items-center text-revgreen hover:text-black font-medium"
          >
            Ver todos os artigos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredArticles.map((article, index) => (
            <Link to={`/blog/${article.slug}`} key={index}>
              <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={article.author.avatar} alt={article.author.name} />
                        <AvatarFallback>{article.author.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{article.author.name}</p>
                        <p className="text-xs text-gray-500">{article.author.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
