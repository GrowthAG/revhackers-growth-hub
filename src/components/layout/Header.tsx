
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
            <Link to="/downloads" className="nav-link">Downloads</Link>
            <Link to="/cases" className="nav-link">Cases</Link>
            <Link to="/quem-somos" className="nav-link">Quem Somos</Link>
            <Link to="/comunidade" className="nav-link">Comunidade</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
            <Link to="/tutoriais" className="nav-link">Tutoriais</Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-black hover:text-revgreen">Login</Button>
          <Button className="btn-primary">
            Falar com um especialista
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
            <Link to="/downloads" className="nav-link" onClick={toggleMenu}>Downloads</Link>
            <Link to="/cases" className="nav-link" onClick={toggleMenu}>Cases</Link>
            <Link to="/quem-somos" className="nav-link" onClick={toggleMenu}>Quem Somos</Link>
            <Link to="/comunidade" className="nav-link" onClick={toggleMenu}>Comunidade</Link>
            <Link to="/blog" className="nav-link" onClick={toggleMenu}>Blog</Link>
            <Link to="/tutoriais" className="nav-link" onClick={toggleMenu}>Tutoriais</Link>
            <Button className="btn-primary w-full mt-4">
              Falar com um especialista
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
