
const API_URL = 'https://materiais.revhackers.com.br/wp-json/wp/v2/posts?_embed';

export async function getAllMaterials() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}
