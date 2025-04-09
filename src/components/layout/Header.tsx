
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container-custom flex justify-between items-center py-2">
        <div className="flex items-center">
          <Link to="/" className="mr-8" onClick={scrollToTop}>
            <img 
              src="/lovable-uploads/00aac887-24ac-4c80-a2f3-d4912050bb97.png" 
              alt="RevHackers Logo" 
              className="h-16 w-auto" 
            />
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="nav-link nav-link-active" onClick={scrollToTop}>Home</Link>
            <Link to="/servicos" className="nav-link" onClick={scrollToTop}>Serviços</Link>
            <Link to="/cases" className="nav-link" onClick={scrollToTop}>Cases</Link>
            <Link to="/downloads" className="nav-link" onClick={scrollToTop}>Materiais</Link>
            <Link to="/comunidade" className="nav-link" onClick={scrollToTop}>Comunidade</Link>
            <Link to="/quem-somos" className="nav-link" onClick={scrollToTop}>Quem Somos</Link>
            <Link to="/blog" className="nav-link" onClick={scrollToTop}>Blog</Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button asChild variant="default">
            <Link to="/diagnostico" onClick={scrollToTop}>
              Solicitar diagnóstico
            </Link>
          </Button>
        </div>
        
        <button onClick={toggleMenu} className="md:hidden text-black">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white w-full shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col space-y-4">
            <Link to="/" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Home</Link>
            <Link to="/servicos" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Serviços</Link>
            <Link to="/cases" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Cases</Link>
            <Link to="/downloads" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Materiais</Link>
            <Link to="/comunidade" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Comunidade</Link>
            <Link to="/quem-somos" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Quem Somos</Link>
            <Link to="/blog" className="nav-link" onClick={() => { toggleMenu(); scrollToTop(); }}>Blog</Link>
            <Button asChild variant="default" className="w-full mt-4">
              <Link to="/diagnostico" onClick={() => { toggleMenu(); scrollToTop(); }}>
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
