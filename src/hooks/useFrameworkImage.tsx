
const useFrameworkImage = () => {
  const getFrameworkImage = (category: string): string => {
    switch(category) {
      case "RevOps":
        return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop";
      case "Account Based Marketing":
      case "ABM":
        return "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1800&auto=format&fit=crop";
      case "PLG":
        return "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1800&auto=format&fit=crop";
      case "Estratégia":
        return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1800&auto=format&fit=crop";
      case "CRO":
        return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop";
      case "Geração de Demanda":
        return "https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1800&auto=format&fit=crop";
      case "Automação":
        return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1800&auto=format&fit=crop";
      case "DevOps":
        return "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1800&auto=format&fit=crop";
      case "MarTech":
        return "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1800&auto=format&fit=crop";
      case "Dados":
        return "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=1800&auto=format&fit=crop";
      case "Vendas":
        return "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=1800&auto=format&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1800&auto=format&fit=crop";
    }
  };

  return { getFrameworkImage };
};

export default useFrameworkImage;
