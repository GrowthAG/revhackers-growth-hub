
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-black to-gray-900 text-white relative overflow-hidden">
      {/* Background elements - subtle professional background */}
      <div className="absolute inset-0 opacity-15 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f5e')] bg-center bg-cover opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            Transforme seu negócio B2B com <span className="text-revgreen">RevOps integrado</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Ajudamos empresas ambiciosas a escalar sua receita recorrente através da integração estratégica
            entre Marketing, Vendas e Customer Success, com foco em dados, automação e resultados mensuráveis.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild 
              className="bg-revgreen text-white font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
            >
              <Link to="/diagnostico">
                Solicitar diagnóstico estratégico gratuito
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="group border-revgreen text-revgreen hover:bg-revgreen hover:text-white"
              asChild
            >
              <Link to="/cases">
                <span>Conheça nossos resultados</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-400 mb-4">
              Mais de 150 empresas SaaS e B2B já aceleraram seu crescimento com nossa metodologia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
