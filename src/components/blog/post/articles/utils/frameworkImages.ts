
// Utility function to get framework image based on category
export const getFrameworkImage = (category: string): string => {
  switch(category) {
    case "RevOps":
      return "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1800&auto=format&fit=crop"; // Team collaboration/integration
    case "Account Based Marketing":
    case "ABM":
      return "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1800&auto=format&fit=crop"; // Target marketing/personalization
    case "PLG":
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1800&auto=format&fit=crop"; // Product focused strategy
    case "Estratégia":
      return "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1800&auto=format&fit=crop"; // Strategic planning/chess
    case "CRO":
      return "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1800&auto=format&fit=crop"; // Conversion optimization/analytics
    case "Geração de Demanda":
      return "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1800&auto=format&fit=crop"; // Lead generation magnets
    case "Automação":
      return "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1800&auto=format&fit=crop"; // Automation/workflows
    case "DevOps":
      return "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1800&auto=format&fit=crop"; // Code/deployment
    case "MarTech":
      return "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1800&auto=format&fit=crop"; // Marketing technology
    case "Dados":
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop"; // Data analysis/dashboards
    case "Vendas":
      return "https://images.unsplash.com/photo-1560438718-eb61ede255eb?q=80&w=1800&auto=format&fit=crop"; // Sales/business deals
    default:
      return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1800&auto=format&fit=crop"; // Team collaboration
  }
};
