
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const featuredArticles = [
  {
    title: "Automação de Revenue: Como otimizar seu funil de vendas com tecnologia",
    excerpt: "Descubra como a automação inteligente pode transformar seus processos de vendas e marketing para resultados mais previsíveis.",
    category: "Automação",
    author: {
      name: "Rafael Silva",
      role: "Especialista em RevOps",
      avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79"
    },
    slug: "automacao-de-revenue-como-otimizar-funil-vendas",
    image: "https://images.unsplash.com/photo-1488229297570-58520851e868?ixlib=rb-4.0.3"
  },
  {
    title: "Revenue Intelligence: Os dados que realmente importam para seu negócio",
    excerpt: "Como utilizar dados para tomar decisões estratégicas e melhorar o desempenho de vendas e marketing.",
    category: "Dados",
    author: {
      name: "Carla Mendes",
      role: "Analista de Dados",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
    },
    slug: "revenue-intelligence-dados-que-realmente-importam",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3"
  },
  {
    title: "RevOps: Integrando Marketing, Vendas e CS para crescimento acelerado",
    excerpt: "Como implementar uma estratégia de Revenue Operations eficiente para alinhar departamentos e maximizar resultados.",
    category: "RevOps",
    author: {
      name: "Marcelo Costa",
      role: "Diretor de RevOps",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
    },
    slug: "revops-integrando-marketing-vendas-cs-crescimento",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3"
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
