
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/lovable-uploads/c445d3ba-e024-4832-a3de-4eebc53f55c7.png" 
                alt="RevHackers Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 max-w-sm mb-6">
              Ajudamos empresas a escalarem com inteligência através de automação, estratégia,
              crescimento e inovação.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-revgreen">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-revgreen">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-revgreen">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-revgreen">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Navegação</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-revgreen">Home</Link></li>
              <li><Link to="/downloads" className="text-gray-300 hover:text-revgreen">Downloads</Link></li>
              <li><Link to="/cases" className="text-gray-300 hover:text-revgreen">Cases</Link></li>
              <li><Link to="/quem-somos" className="text-gray-300 hover:text-revgreen">Quem Somos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Conteúdo</h3>
            <ul className="space-y-3">
              <li><Link to="/blog" className="text-gray-300 hover:text-revgreen">Blog</Link></li>
              <li><Link to="/tutoriais" className="text-gray-300 hover:text-revgreen">Tutoriais</Link></li>
              <li><Link to="/comunidade" className="text-gray-300 hover:text-revgreen">Comunidade</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-revgreen" />
                <a href="mailto:contato@revhackers.com.br" className="text-gray-300 hover:text-revgreen">contato@revhackers.com.br</a>
              </li>
              <li><a href="/diagnostico" className="text-gray-300 hover:text-revgreen">Solicitar Diagnóstico</a></li>
              <li><a href="#" className="text-revgreen hover:underline">Falar com um especialista</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 RevHackers. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 text-sm hover:text-revgreen">Política de Privacidade</a>
            <a href="#" className="text-gray-400 text-sm hover:text-revgreen">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
