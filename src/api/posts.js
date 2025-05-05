const API_URL = 'https://materiais.revhackers.com.br/wp-json/wp/v2/posts?_embed';

export async function getAllPosts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const posts = await response.json();
    
    // Process and normalize the posts data
    return posts.map(post => {
      // Default author object to prevent undefined errors
      const authorInfo = {
        name: 'RevHackers Team',
        role: 'Equipe RevHackers',
        avatar: '/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png'
      };
      
      // Try to extract real author data if available in the API response
      if (post._embedded && post._embedded.author && post._embedded.author[0]) {
        const author = post._embedded.author[0];
        authorInfo.name = author.name || authorInfo.name;
        // Keep default role and avatar unless we explicitly get them from API
      }
      
      // Extract featured image if available
      let featuredImage = '/placeholder.svg';
      if (post._embedded && 
          post._embedded['wp:featuredmedia'] && 
          post._embedded['wp:featuredmedia'][0] &&
          post._embedded['wp:featuredmedia'][0].source_url) {
        featuredImage = post._embedded['wp:featuredmedia'][0].source_url;
      }
      
      // Extract category if available
      let category = 'Geral';
      if (post._embedded && 
          post._embedded['wp:term'] && 
          post._embedded['wp:term'][0] && 
          post._embedded['wp:term'][0][0]) {
        category = post._embedded['wp:term'][0][0].name;
      }
      
      // Calculate estimated read time (rough estimate)
      const wordCount = post.content.rendered.split(' ').length;
      const readTime = Math.max(1, Math.round(wordCount / 200)) + ' min de leitura';
      
      return {
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        date: post.date,
        readTime: readTime,
        image: featuredImage,
        category: category,
        author: authorInfo
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}
