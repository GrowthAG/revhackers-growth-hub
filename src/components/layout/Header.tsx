
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check if the path matches the current location
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container-custom flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-display font-bold mr-8">
            RevHackers
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'text-revgreen font-medium' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/servicos" 
              className={`nav-link ${isActive('/servicos') ? 'text-revgreen font-medium' : ''}`}
            >
              Serviços
            </Link>
            <Link 
              to="/cases" 
              className={`nav-link ${isActive('/cases') ? 'text-revgreen font-medium' : ''}`}
            >
              Cases
            </Link>
            <Link 
              to="/downloads" 
              className={`nav-link ${isActive('/downloads') ? 'text-revgreen font-medium' : ''}`}
            >
              Materiais
            </Link>
            <Link 
              to="/comunidade" 
              className={`nav-link ${isActive('/comunidade') ? 'text-revgreen font-medium' : ''}`}
            >
              Comunidade
            </Link>
            <Link 
              to="/quem-somos" 
              className={`nav-link ${isActive('/quem-somos') ? 'text-revgreen font-medium' : ''}`}
            >
              Quem Somos
            </Link>
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'text-revgreen font-medium' : ''}`}
            >
              Blog
            </Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button asChild variant="default">
            <Link to="/diagnostico">
              Solicitar diagnóstico
            </Link>
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <button onClick={toggleMenu} className="md:hidden text-black">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white w-full shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/servicos" 
              className={`nav-link ${isActive('/servicos') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Serviços
            </Link>
            <Link 
              to="/cases" 
              className={`nav-link ${isActive('/cases') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Cases
            </Link>
            <Link 
              to="/downloads" 
              className={`nav-link ${isActive('/downloads') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Materiais
            </Link>
            <Link 
              to="/comunidade" 
              className={`nav-link ${isActive('/comunidade') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Comunidade
            </Link>
            <Link 
              to="/quem-somos" 
              className={`nav-link ${isActive('/quem-somos') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Quem Somos
            </Link>
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'text-revgreen font-medium' : ''}`} 
              onClick={toggleMenu}
            >
              Blog
            </Link>
            <Button asChild variant="default" className="w-full mt-4">
              <Link to="/diagnostico">
                Solicitar diagnóstico
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
