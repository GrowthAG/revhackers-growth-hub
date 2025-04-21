
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, LogOut, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const AdminLayout = ({ children, pageTitle }: AdminLayoutProps) => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-revgreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-revgreen">
                RevHackers CMS
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-medium">{pageTitle}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" target="_blank">
                  Ver site
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            <div className="text-sm font-semibold text-gray-500 px-3 py-2">
              Gerenciamento
            </div>
            <Link 
              to="/admin/posts"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Posts
            </Link>
            <Link 
              to="/admin/posts/new"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Post
            </Link>
            <Link 
              to="/admin/settings"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
