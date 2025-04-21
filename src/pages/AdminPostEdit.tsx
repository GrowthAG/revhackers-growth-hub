
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import PostEditor from '@/components/admin/PostEditor';
import { blogPosts, BlogPost } from '@/data/blogData';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AdminPostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Buscar post pelo ID
    const fetchPost = () => {
      setIsLoading(true);
      
      // Tentar buscar do localStorage primeiro
      const savedPosts = localStorage.getItem('blogPosts');
      let posts = savedPosts ? JSON.parse(savedPosts) : blogPosts;
      
      const foundPost = posts.find((p: BlogPost) => p.id === Number(id));
      
      if (foundPost) {
        setPost(foundPost);
      } else {
        navigate('/admin/posts');
      }
      
      setIsLoading(false);
    };
    
    fetchPost();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-revgreen border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout pageTitle="Post não encontrado">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Post não encontrado</h2>
          <Button onClick={() => navigate('/admin/posts')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Editar Post">
      <PostEditor post={post} isEditing={true} />
    </AdminLayout>
  );
};

export default AdminPostEdit;
