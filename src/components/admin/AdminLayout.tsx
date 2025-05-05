
import { useEffect, useState } from 'react';
import { getAllPosts } from '../../api/posts';
import DOMPurify from 'dompurify';
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// Original BlogTest component is kept but exported separately
function BlogTest() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar posts:', err);
        setError('Não foi possível carregar os posts. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando posts...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h2 className="text-xl font-bold mb-2">Erro</h2>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Posts do Blog</h1>
      {posts.length === 0 ? (
        <p>Nenhum post encontrado.</p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <span>Categoria: {post.category}</span>
                <span>Data: {new Date(post.date).toLocaleDateString('pt-BR')}</span>
                <span>{post.readTime}</span>
              </div>
              <div 
                className="text-gray-600 prose-sm" 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.excerpt) }} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
export { BlogTest };
