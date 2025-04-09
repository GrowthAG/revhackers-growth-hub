
import { Link } from 'react-router-dom';
import { Youtube, Instagram, Linkedin, Mail } from 'lucide-react';
import NewsletterForm from '../shared/NewsletterForm';

const Footer = () => {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/lovable-uploads/9ca1f8d0-c9e9-4d69-b887-0617fbde8ec6.png" 
                alt="RevHackers Logo" 
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-gray-300 max-w-sm mb-6">
              Ajudamos empresas a escalarem com inteligência através de automação, estratégia,
              crescimento e inovação.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/34579614/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-revgreen">
                <Linkedin size={20} />
              </a>
              <a href="https://www.instagram.com/revhackers.com.br/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-revgreen">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@RevHackersTV" target="_blank" rel="noopener noreferrer" className="text-white hover:text-revgreen">
                <Youtube size={20} />
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
              <li><Link to="/servicos" className="text-gray-300 hover:text-revgreen">Serviços</Link></li>
              <li><Link to="/comunidade" className="text-gray-300 hover:text-revgreen">Comunidade</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Receba conteúdos exclusivos sobre RevOps, automação e estratégias de crescimento B2B.</p>
            <NewsletterForm />
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
            © {currentYear} RevHackers. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacidade" className="text-gray-400 text-sm hover:text-revgreen">Política de Privacidade</Link>
            <Link to="/termos-de-uso" className="text-gray-400 text-sm hover:text-revgreen">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
