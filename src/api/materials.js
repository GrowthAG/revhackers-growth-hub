const API_URL = 'https://materiais.revhackers.com.br/wp-json/wp/v2/posts?_embed';

export async function getAllMaterials() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }
    
    const materials = await response.json();
    
    // Process and normalize the materials data
    return materials.map(material => {
      // Default author object to prevent undefined errors
      const authorInfo = {
        name: 'RevHackers Team',
        role: 'Equipe RevHackers',
        avatar: '/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png'
      };
      
      // Try to extract real author data if available in the API response
      if (material._embedded && material._embedded.author && material._embedded.author[0]) {
        const author = material._embedded.author[0];
        authorInfo.name = author.name || authorInfo.name;
        // Keep default role and avatar unless we explicitly get them from API
      }
      
      // Extract featured image if available
      let featuredImage = '/placeholder.svg';
      if (material._embedded && 
          material._embedded['wp:featuredmedia'] && 
          material._embedded['wp:featuredmedia'][0] &&
          material._embedded['wp:featuredmedia'][0].source_url) {
        featuredImage = material._embedded['wp:featuredmedia'][0].source_url;
      }
      
      // Extract category if available
      let category = 'Geral';
      if (material._embedded && 
          material._embedded['wp:term'] && 
          material._embedded['wp:term'][0] && 
          material._embedded['wp:term'][0][0]) {
        category = material._embedded['wp:term'][0][0].name;
      }
      
      return {
        id: material.id,
        title: material.title.rendered,
        slug: material.slug,
        excerpt: material.excerpt.rendered,
        content: material.content.rendered,
        date: material.date,
        image: featuredImage,
        category: category,
        author: authorInfo
      };
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}
