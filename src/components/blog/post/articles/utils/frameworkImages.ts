
// Utility function to get framework image based on category
export const getFrameworkImage = (category: string): string => {
  switch(category) {
    case "RevOps":
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71";
    case "Account Based Marketing":
    case "ABM":
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
    case "MarTech":
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f";
    case "Dados":
      return "https://images.unsplash.com/photo-1543286386-713bdd548da4";
    case "Vendas":
      return "https://images.unsplash.com/photo-1450101499163-c8848c66ca85";
    default:
      return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6";
  }
};
