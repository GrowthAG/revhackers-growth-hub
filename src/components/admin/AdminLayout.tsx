import { useEffect, useState } from 'react';
import { getAllPosts } from './api/posts';

function BlogTest() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getAllPosts().then(setPosts);
  }, []);

  return (
    <div>
      <h1>Posts do Blog</h1>
      {posts.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ marginBottom: '2rem' }}>
            <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            <p dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
          </div>
        ))
      )}
    </div>
  );
}

export default BlogTest;
