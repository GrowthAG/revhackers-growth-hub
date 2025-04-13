
// Utility function to get framework image based on category
export const getFrameworkImage = (category: string): string => {
  switch(category) {
    case "RevOps":
      return "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1800&auto=format&fit=crop"; // Team collaboration/integration
    case "Account Based Marketing":
    case "ABM":
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1800&auto=format&fit=crop"; // Small team working together
    case "PLG":
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1800&auto=format&fit=crop"; // Team working together
    case "Estratégia":
      return "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1800&auto=format&fit=crop"; // Strategic planning/chess
    case "CRO":
      return "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1800&auto=format&fit=crop"; // Dashboard/analytics
    case "Geração de Demanda":
      return "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1800&auto=format&fit=crop"; // Lead generation magnets
    case "Automação":
      return "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1800&auto=format&fit=crop"; // Team with screens, automation visualization
    case "DevOps":
      return "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1800&auto=format&fit=crop"; // Code/deployment
    case "MarTech":
      return "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1800&auto=format&fit=crop"; // Marketing technology
    case "Dados":
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop"; // Data analysis/dashboards
    case "Vendas":
      return "https://images.unsplash.com/photo-1560438718-eb61ede255eb?q=80&w=1800&auto=format&fit=crop"; // Sales/business deals
    case "Polemic Led Growth":
      return "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=1800&auto=format&fit=crop"; // Person with lightbulb (surprise/insight)
    default:
      return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1800&auto=format&fit=crop"; // Team collaboration
  }
};

// Function to get specific image for article by slug
export const getArticleImageBySlug = (slug: string): string => {
  switch(slug) {
    // 1. Polemic Led Growth
    case "polemic-led-growth-metodo-linkedin-maquina-oportunidades":
      return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1800&auto=format&fit=crop"; // Represents surprise/unexpected

    // 2. O que é PLG e como aplicar
    case "plg-guia-definitivo-saas-b2b":
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1800&auto=format&fit=crop"; // Team working together

    // 3. CRO na prática
    case "cro-dobrar-taxa-conversao-sem-investir":
      return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1800&auto=format&fit=crop"; // Person analyzing data

    // 4. ABM para times pequenos
    case "abm-implementar-account-based-marketing-ia":
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1800&auto=format&fit=crop"; // Small team working together

    // 5. 7 automações de marketing
    case "automacoes-marketing-escalar-operacao":
      return "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1800&auto=format&fit=crop"; // Visual automation tools

    // 6. Como construir um funil
    case "construir-funil-aquisicao-proprio-produto":
      return "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=1800&auto=format&fit=crop"; // Visual growth/performance

    default:
      return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1800&auto=format&fit=crop"; // Default team collaboration
  }
};
