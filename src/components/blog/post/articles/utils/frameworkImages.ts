
import { getArticleImageBySlug as originalGetArticleImageBySlug } from '@/data/blogData';

// Function to get specific image for article by slug
export const getArticleImageBySlug = (slug: string): string => {
  // First, check the original function
  const originalImage = originalGetArticleImageBySlug(slug);
  if (originalImage) return originalImage;

  // Specific override for Polemic Led Growth article
  if (slug === "polemic-led-growth-metodo-linkedin-maquina-oportunidades") {
    return "/lovable-uploads/5f08293e-f50a-49d2-9352-340982a880fe.png";
  }

  // Return an empty string if no specific image is found
  return "";
};

// Re-export the rest of the original functions
export * from '@/data/blogData';
