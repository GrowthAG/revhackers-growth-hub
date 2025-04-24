
export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  image: string;
  author: Author;
  date: string;
  readTime: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 16,
    title: "Polemic Led Growth: O método que transforma seu LinkedIn em uma máquina de oportunidades silenciosa e magnética",
    slug: "polemic-led-growth-metodo-linkedin-maquina-oportunidades",
    excerpt: "Descubra como construir autoridade silenciosa e atrair oportunidades de alto valor no LinkedIn sem depender de autopromoção excessiva.",
    category: "PLG",
    image: "/lovable-uploads/3e83124e-b157-4e90-af6e-32ddb4c52178.png",
    author: {
      name: "Rafael Silva",
      role: "Especialista em Digital Branding",
      avatar: "https://i.pravatar.cc/150?u=rafaelsilva"
    },
    date: "2025-04-10",
    readTime: "10 min",
    featured: true
  },
  {
    id: 1,
    title: "O que é PLG e como aplicar em startups brasileiras",
    slug: "o-que-e-plg-e-como-aplicar-em-startups-brasileiras",
    excerpt: "Estratégias para usar o produto como motor de crescimento adaptadas à realidade do mercado brasileiro.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    author: {
      name: "Ana Mendes",
      role: "Head de Crescimento",
      avatar: "https://i.pravatar.cc/150?u=ana"
    },
    date: "2024-03-20",
    readTime: "8 min",
    featured: true
  },
  {
    id: 2,
    title: "CRO na prática: como dobrar sua taxa de conversão sem investir mais",
    slug: "cro-na-pratica-como-dobrar-sua-taxa-de-conversao",
    excerpt: "Técnicas avançadas de otimização que podem transformar seus resultados sem aumentar seu orçamento.",
    category: "CRO",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Ricardo Torres",
      role: "Especialista em CRO",
      avatar: "https://i.pravatar.cc/150?u=ricardo"
    },
    date: "2024-03-15",
    readTime: "6 min"
  },
  {
    id: 3,
    title: "ABM para times pequenos: segmentação que converte",
    slug: "abm-para-times-pequenos-segmentacao-que-converte",
    excerpt: "Como implementar Account-Based Marketing mesmo com recursos limitados e equipes enxutas.",
    category: "ABM",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    author: {
      name: "Juliana Costa",
      role: "Estrategista de Marketing B2B",
      avatar: "https://i.pravatar.cc/150?u=juliana"
    },
    date: "2024-03-10",
    readTime: "7 min",
    featured: true
  },
  {
    id: 4,
    title: "7 automações de marketing que escalam sua operação sem equipe extra",
    slug: "7-automacoes-de-marketing-que-escalam-sua-operacao",
    excerpt: "Ferramentas e processos para aumentar a produtividade do seu time de marketing sem novas contratações.",
    category: "Automação",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    author: {
      name: "Pedro Almeida",
      role: "Marketing Operations",
      avatar: "https://i.pravatar.cc/150?u=pedro"
    },
    date: "2024-03-05",
    readTime: "9 min"
  },
  {
    id: 5,
    title: "Como construir um funil de aquisição usando seu próprio produto",
    slug: "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto",
    excerpt: "Estratégias para transformar seu produto em uma máquina de aquisição de novos usuários.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Ana Mendes",
      role: "Head de Crescimento",
      avatar: "https://i.pravatar.cc/150?u=ana"
    },
    date: "2024-02-28",
    readTime: "7 min"
  },
  {
    id: 6,
    title: "Estratégias de inteligência artificial aplicadas a pré-vendas",
    slug: "estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas",
    excerpt: "Como usar IA para qualificar leads e aumentar a eficiência do seu time comercial.",
    category: "Vendas",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    author: {
      name: "Lucas Ferreira",
      role: "Sales Enablement",
      avatar: "https://i.pravatar.cc/150?u=lucas"
    },
    date: "2024-02-20",
    readTime: "8 min",
    featured: true
  },
  {
    id: 7,
    title: "Diagnóstico de marketing orientado por dados: como interpretar seus números",
    slug: "diagnostico-de-marketing-orientado-por-dados",
    excerpt: "Um guia completo para extrair insights acionáveis dos dados da sua operação de marketing.",
    category: "Dados",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    author: {
      name: "Carla Soares",
      role: "Data Analyst",
      avatar: "https://i.pravatar.cc/150?u=carla"
    },
    date: "2024-02-15",
    readTime: "10 min"
  },
  {
    id: 8,
    title: "Playbooks de vendas e marketing que escalam resultados em 90 dias",
    slug: "playbooks-de-vendas-e-marketing-que-escalam-resultados",
    excerpt: "Processos e estratégias prontos para implementar e colher resultados rápidos.",
    category: "Vendas",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    author: {
      name: "Rafael Costa",
      role: "Sales Director",
      avatar: "https://i.pravatar.cc/150?u=rafael"
    },
    date: "2024-02-10",
    readTime: "12 min"
  },
  {
    id: 9,
    title: "Como combinar inbound, outbound e PLG na mesma estratégia",
    slug: "como-combinar-inbound-outbound-e-plg",
    excerpt: "Criando uma abordagem integrada de aquisição para maximizar seus resultados.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Mariana Silva",
      role: "Marketing Director",
      avatar: "https://i.pravatar.cc/150?u=mariana"
    },
    date: "2024-02-05",
    readTime: "9 min"
  },
  {
    id: 10,
    title: "Canais de aquisição com ROI imediato para startups early-stage",
    slug: "canais-de-aquisicao-com-roi-imediato-para-startups",
    excerpt: "Estratégias de marketing com baixo investimento e alto retorno para empresas em fase inicial.",
    category: "MarTech",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    author: {
      name: "Gabriel Dias",
      role: "Growth Hacker",
      avatar: "https://i.pravatar.cc/150?u=gabriel"
    },
    date: "2024-01-28",
    readTime: "7 min"
  },
  {
    id: 11,
    title: "Como estruturar um time de growth com poucos recursos",
    slug: "como-estruturar-um-time-de-growth-com-poucos-recursos",
    excerpt: "Formando um time multidisciplinar e eficiente mesmo com orçamento limitado.",
    category: "MarTech",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    author: {
      name: "Ana Mendes",
      role: "Head de Crescimento",
      avatar: "https://i.pravatar.cc/150?u=ana"
    },
    date: "2024-01-20",
    readTime: "8 min"
  },
  {
    id: 12,
    title: "Análise de dados para fundadores: quais métricas importam de verdade",
    slug: "analise-de-dados-para-fundadores-quais-metricas-importam",
    excerpt: "Um guia objetivo sobre os KPIs que realmente fazem diferença no crescimento do seu negócio.",
    category: "Dados",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Rodrigo Alves",
      role: "Co-founder & CEO",
      avatar: "https://i.pravatar.cc/150?u=rodrigo"
    },
    date: "2024-01-15",
    readTime: "11 min",
    featured: true
  },
  {
    id: 13,
    title: "Os melhores CRMs e automações para crescimento B2B em 2024",
    slug: "os-melhores-crms-e-automacoes-para-crescimento-b2b",
    excerpt: "Uma análise comparativa das principais ferramentas para gestão de relacionamento com clientes B2B.",
    category: "MarTech",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    author: {
      name: "Fernanda Castro",
      role: "Marketing Operations",
      avatar: "https://i.pravatar.cc/150?u=fernanda"
    },
    date: "2024-01-10",
    readTime: "10 min"
  },
  {
    id: 14,
    title: "SaaS + PLG: como usar seu trial gratuito para gerar pipeline",
    slug: "saas-plg-como-usar-seu-trial-gratuito-para-gerar-pipeline",
    excerpt: "Estratégias para converter usuários de trial em clientes pagantes com ativação eficiente.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    author: {
      name: "Bruno Martins",
      role: "Product Marketing",
      avatar: "https://i.pravatar.cc/150?u=bruno"
    },
    date: "2024-01-05",
    readTime: "7 min"
  },
  {
    id: 15,
    title: "Como desenhar uma jornada do usuário que ativa e converte",
    slug: "como-desenhar-uma-jornada-do-usuario-que-ativa-e-converte",
    excerpt: "Técnicas para mapear e otimizar a experiência do usuário visando maior retenção e conversão.",
    category: "CRO",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    author: {
      name: "Carolina Lima",
      role: "UX Researcher",
      avatar: "https://i.pravatar.cc/150?u=carolina"
    },
    date: "2024-01-01",
    readTime: "9 min"
  }
];
