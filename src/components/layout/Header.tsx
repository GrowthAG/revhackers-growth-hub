
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container-custom flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-display font-bold mr-8">
            RevHackers
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="nav-link nav-link-active">Home</Link>
            <Link to="/servicos" className="nav-link">Serviços</Link>
            <Link to="/cases" className="nav-link">Cases</Link>
            <Link to="/downloads" className="nav-link">Materiais</Link>
            <Link to="/comunidade" className="nav-link">Comunidade</Link>
            <Link to="/quem-somos" className="nav-link">Quem Somos</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
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
            <Link to="/" className="nav-link" onClick={toggleMenu}>Home</Link>
            <Link to="/servicos" className="nav-link" onClick={toggleMenu}>Serviços</Link>
            <Link to="/cases" className="nav-link" onClick={toggleMenu}>Cases</Link>
            <Link to="/downloads" className="nav-link" onClick={toggleMenu}>Materiais</Link>
            <Link to="/comunidade" className="nav-link" onClick={toggleMenu}>Comunidade</Link>
            <Link to="/quem-somos" className="nav-link" onClick={toggleMenu}>Quem Somos</Link>
            <Link to="/blog" className="nav-link" onClick={toggleMenu}>Blog</Link>
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
