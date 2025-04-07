
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-black to-gray-900 text-white relative overflow-hidden">
      {/* Background elements - code matrix effect */}
      <div className="absolute inset-0 opacity-15 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5')] bg-center bg-cover opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Aumente sua <span className="text-revgreen">receita recorrente</span> com integração total entre Marketing, Vendas e CS
          </h1>
          
          <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto mb-10">
            Conectamos seus dados, processos e equipes para criar um ecossistema de crescimento B2B através de RevOps, 
            automação e inteligência de dados. Solução completa para CEOs e diretores que buscam crescimento escalável.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild 
              className="bg-revgreen text-black font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
            >
              <Link to="/diagnostico">
                Solicitar diagnóstico estratégico
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="group border-revgreen text-black hover:bg-revgreen hover:text-black"
              asChild
            >
              <Link to="/cases">
                <span>Ver ROI comprovado</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-12">
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
