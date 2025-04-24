
// This file provides utility functions for working with framework and article images

// Function to get framework image by name
export const getFrameworkImage = (name: string): string => {
  const frameworkImageMap: { [key: string]: string } = {
    'plg': '/lovable-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png',
    'revops': '/lovable-uploads/e9f2329b-4293-420b-91da-b3eeadb382fd.png',
    'abm': '/lovable-uploads/81d46788-47c4-456e-b31d-d0681f39e12c.png',
    'cro': '/lovable-uploads/ca6527d9-4124-4e67-8d8a-19a74056feb0.png',
    'automation': '/lovable-uploads/99649815-1e1e-44ce-ae53-2973725aaeb8.png',
    'martech': '/lovable-uploads/d94e5cc3-478d-4778-8476-fbc147f9ddd7.png',
    'strategy': '/lovable-uploads/df4a88ca-2512-4ff3-831e-ceeb4564ed56.png',
    'data': '/lovable-uploads/34248d96-8719-4ebe-92df-787deb8621bd.png',
    'plg-hero': '/lovable-uploads/5f08293e-f50a-49d2-9352-340982a880fe.png',
  };
  
  return frameworkImageMap[name.toLowerCase()] || '';
};

// Function to get specific image for article by slug
export const getArticleImageBySlug = (slug: string): string => {
  // Specific override for Polemic Led Growth article
  if (slug === "polemic-led-growth-metodo-linkedin-maquina-oportunidades") {
    return "/lovable-uploads/5f08293e-f50a-49d2-9352-340982a880fe.png";
  }

  // Return an empty string if no specific image is found
  return "";
};
