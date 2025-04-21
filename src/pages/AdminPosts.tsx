import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Eye, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts } from '@/data/blogData';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  date: string;
}

const AdminPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erro ao carregar os posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== id));
      setPostToDelete(null);
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir o post');
    }
  };

  const migrateExistingPosts = async () => {
    setIsMigrating(true);
    try {
      // Check if any posts already exist with the same IDs or slugs
      const { data: existingPosts } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .in('id', blogPosts.map(post => post.id));
      
      const existingIds = new Set((existingPosts || []).map(post => post.id));
      const existingSlugs = new Set((existingPosts || []).map(post => post.slug));
      
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      
      // Process posts in batches to avoid overwhelming the database
      const batchSize = 5;
      const totalPosts = blogPosts.length;
      
      for (let i = 0; i < totalPosts; i += batchSize) {
        const batch = blogPosts.slice(i, i + batchSize);
        const batchToImport = [];
        
        for (const post of batch) {
          // Skip if post with same ID or slug already exists
          if (existingIds.has(post.id) || existingSlugs.has(post.slug)) {
            console.log(`Skipping post: ${post.title} (already exists)`);
            skipped++;
            continue;
          }
          
          // Prepare the post data
          const postData = {
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content || `# ${post.title}\n\n${post.excerpt}`,
            category: post.category,
            image: post.image,
            author_name: post.author?.name || 'Giulliano Alves',
            author_role: post.author?.role || 'CEO da RevHackers',
            author_avatar: post.author?.avatar || '/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png',
            date: post.date,
            read_time: post.readTime || '5 min',
            featured: post.featured || false
          };
          
          batchToImport.push(postData);
        }
        
        if (batchToImport.length > 0) {
          // Insert batch into Supabase
          const { error, count } = await supabase
            .from('blog_posts')
            .insert(batchToImport);
            
          if (error) {
            console.error(`Error importing batch:`, error);
            errors++;
          } else {
            imported += batchToImport.length;
            console.log(`Successfully imported ${batchToImport.length} posts (batch ${i/batchSize + 1})`);
          }
        }
        
        // Small delay to avoid rate limiting
        if (i + batchSize < totalPosts) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Refresh posts list
      await fetchPosts();
      
      if (errors > 0) {
        toast.error(`Importação concluída com erros. ${imported} posts importados, ${skipped} posts ignorados, ${errors} erros.`);
      } else {
        toast.success(`Importação concluída! ${imported} posts importados, ${skipped} posts ignorados.`);
      }
      
      setShowMigrationDialog(false);
    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('Erro durante a migração dos posts');
    } finally {
      setIsMigrating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-revgreen border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gerenciar Posts">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Posts do Blog</h2>
        <div className="flex gap-2">
          <AlertDialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" /> Importar Posts
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar Posts Existentes</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso importará todos os posts existentes no arquivo blogData.ts para o banco de dados. 
                  Posts existentes com ID ou slug iguais serão ignorados.
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isMigrating}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.preventDefault();
                    migrateExistingPosts();
                  }}
                  disabled={isMigrating}
                  className="bg-revgreen hover:bg-revgreen/90"
                >
                  {isMigrating ? 'Importando...' : 'Importar Posts'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild>
            <Link to="/admin/posts/new">
              <Plus className="h-4 w-4 mr-2" /> Novo Post
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{formatDate(post.date)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Publicado
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/blog/${post.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/posts/edit/${post.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setPostToDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhum post encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminPosts;
