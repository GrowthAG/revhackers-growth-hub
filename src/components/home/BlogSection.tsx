
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const featuredArticles = [
  {
    title: "O que é PLG e como aplicar em startups brasileiras",
    excerpt: "Estratégias para usar o produto como motor de crescimento adaptadas à realidade do mercado brasileiro.",
    category: "Product Led Growth",
    author: {
      name: "Ana Mendes",
      role: "Head de Crescimento",
      avatar: "https://i.pravatar.cc/150?u=ana"
    },
    slug: "o-que-e-plg-e-como-aplicar-em-startups-brasileiras",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
  },
  {
    title: "CRO na prática: como dobrar sua taxa de conversão sem investir mais",
    excerpt: "Técnicas avançadas de otimização que podem transformar seus resultados sem aumentar seu orçamento.",
    category: "Conversão",
    author: {
      name: "Ricardo Torres",
      role: "Especialista em CRO",
      avatar: "https://i.pravatar.cc/150?u=ricardo"
    },
    slug: "cro-na-pratica-como-dobrar-sua-taxa-de-conversao",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
  },
  {
    title: "ABM para times pequenos: segmentação que converte",
    excerpt: "Como implementar Account-Based Marketing mesmo com recursos limitados e equipes enxutas.",
    category: "Account-Based Marketing",
    author: {
      name: "Juliana Costa",
      role: "Estrategista de Marketing B2B",
      avatar: "https://i.pravatar.cc/150?u=juliana"
    },
    slug: "abm-para-times-pequenos-segmentacao-que-converte",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
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
              Conteúdo estratégico sobre crescimento, marketing e vendas B2B.
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
