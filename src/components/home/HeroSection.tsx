
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-black to-gray-900 text-white relative overflow-hidden">
      {/* Background elements - código matrix effect */}
      <div className="absolute inset-0 opacity-15 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5')] bg-center bg-cover opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 text-center">
            Aumente sua <span className="text-revgreen">receita recorrente</span> com 
            integração total entre Marketing, Vendas e CS
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-14 text-center leading-relaxed">
            Conectamos seus dados, processos e equipes para criar um ecossistema de crescimento B2B 
            através de automações e inteligência de dados.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-3xl mx-auto">
            <Button 
              asChild 
              className="bg-revgreen text-black font-medium px-8 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
              size="lg"
            >
              <Link to="/diagnostico" onClick={scrollToTop}>
                Solicitar diagnóstico estratégico
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="border-revgreen text-white hover:bg-revgreen hover:text-black py-6 px-8"
              size="lg"
            >
              <Link to="/cases" onClick={scrollToTop} className="flex items-center justify-center">
                <span>Ver ROI comprovado</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-400 mb-4">
              +150 empresas SaaS e B2B aceleraram seu crescimento com nossa metodologia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
