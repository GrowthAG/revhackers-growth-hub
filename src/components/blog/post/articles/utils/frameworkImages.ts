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
  switch(slug) {
    case "polemic-led-growth-metodo-linkedin-maquina-oportunidades":
      return "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe3e8f11cc71d2ba4dbe53.png";
    case "plg-guia-definitivo-saas-b2b":
    case "o-que-e-plg-e-como-aplicar-em-startups-brasileiras":
      return "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1800&auto=format&fit=crop"; // Startup team with post-its

    // 3. CRO na prática
    case "cro-na-pratica-como-dobrar-sua-taxa-de-conversao":
      return "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1800&auto=format&fit=crop"; // Person analyzing conversion dashboards

    // 4. ABM para times pequenos
    case "abm-para-times-pequenos-segmentacao-que-converte":
    case "abm-implementar-account-based-marketing-ia":
      return "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=1800&auto=format&fit=crop"; // Small team strategizing with visual tools

    // 5. 7 automações de marketing
    case "7-automacoes-de-marketing-que-escalam-sua-operacao":
    case "automacoes-marketing-escalar-operacao":
      return "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1800&auto=format&fit=crop"; // Automation/workflow visualization

    // 6. Como construir um funil
    case "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto":
    case "construir-funil-aquisicao-proprio-produto":
      return "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=1800&auto=format&fit=crop"; // Funnel visualization/user journey

    default:
      return ""; // Empty string will fall back to the category image
  }
};
