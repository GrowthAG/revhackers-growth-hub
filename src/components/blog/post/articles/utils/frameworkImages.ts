// Utility function to get framework image based on category
export const getFrameworkImage = (category: string): string => {
  switch(category) {
    case "RevOps":
      return "https://images.unsplash.com/photo-1553484771-047a44eee27a?q=80&w=1800&auto=format&fit=crop"; // Team working on integration whiteboard
    case "Account Based Marketing":
    case "ABM":
      return "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1800&auto=format&fit=crop"; // Targeted marketing/personas work
    case "PLG":
      return "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1800&auto=format&fit=crop"; // Product strategy session
    case "Estratégia":
      return "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1800&auto=format&fit=crop"; // Strategic planning with post-its
    case "CRO":
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop"; // Dashboard/analytics/conversions
    case "Geração de Demanda":
      return "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1800&auto=format&fit=crop"; // Marketing funnel visualization
    case "Automação":
      return "https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1800&auto=format&fit=crop"; // Marketing automation visual
    case "DevOps":
      return "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1800&auto=format&fit=crop"; // Team collaboration/process
    case "MarTech":
      return "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1800&auto=format&fit=crop"; // Marketing technology visualization
    case "Dados":
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop"; // Data analysis/dashboards
    case "Vendas":
      return "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1800&auto=format&fit=crop"; // Sales/business discussion
    case "Polemic Led Growth":
      return "https://images.unsplash.com/photo-1484069560501-87d72b0c3669?q=80&w=1800&auto=format&fit=crop"; // Provocative image of confrontation/disruption
    default:
      return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1800&auto=format&fit=crop"; // Team collaboration
  }
};

// Function to get specific image for article by slug
export const getArticleImageBySlug = (slug: string): string => {
  const articleImageMap: Record<string, string> = {
    // PLG articles - each with unique imagery
    "polemic-led-growth-metodo-linkedin-maquina-oportunidades": 
      "/lovable-uploads/116be6ad-cd44-4cf3-b9aa-fac29176a53c.png",
    "plg-guia-definitivo-saas-b2b": 
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1800&auto=format&fit=crop",
    "o-que-e-plg-e-como-aplicar-em-startups-brasileiras": 
      "https://images.unsplash.com/photo-1536825211030-094de935f680?q=80&w=1800&auto=format&fit=crop",

    // CRO articles
    "cro-na-pratica-como-dobrar-sua-taxa-de-conversao": 
      "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe41c1c7a015061ddad94c.webp",

    // Data-driven articles
    "diagnostico-de-marketing-orientado-por-dados": 
      "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe44c6266b6f314095cef2.webp",

    // AI strategy articles
    "estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas": 
      "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe4564266b6f147c95d647.jpeg",

    // Sales & Marketing articles
    "playbooks-de-vendas-e-marketing-que-escalam-resultados": 
      "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe45ae266b6f07fd95deee.jpeg",

    // ABM articles - each with unique imagery
    "abm-para-times-pequenos-segmentacao-que-converte": 
      "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=1800&auto=format&fit=crop",
    "abm-implementar-account-based-marketing-ia": 
      "https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1800&auto=format&fit=crop",

    // Automation articles - each with unique imagery
    "7-automacoes-de-marketing-que-escalam-sua-operacao": 
      "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1800&auto=format&fit=crop",
    "automacoes-marketing-escalar-operacao": 
      "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1800&auto=format&fit=crop",

    // Acquisition funnel articles
    "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto": 
      "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe48dc71384bf372b7d943.webp",
    "construir-funil-aquisicao-proprio-produto": 
      "https://images.unsplash.com/photo-1551135049-8a33b5883817?q=80&w=1800&auto=format&fit=crop",
      
    // RevOps articles
    "revops-framework-completo-integracao":
      "https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1800&auto=format&fit=crop",
      
    // Strategy articles
    "modelo-funil-gravatinha-transformando-jornada-cliente":
      "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=1800&auto=format&fit=crop",
  };
  
  return articleImageMap[slug] || "";
};
