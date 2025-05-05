const API_URL = 'https://blog.revhackers.com.br/wp-json/wp/v2/posts?_embed';

export async function getAllPosts() {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
}
