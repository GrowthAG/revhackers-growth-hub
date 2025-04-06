
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-white to-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Potencialize seu <span className="text-revgreen">crescimento B2B</span> com estratégia e dados
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 max-w-lg">
              Ajudamos empresas a escalar com inteligência através de automação, PLG, ABM e estratégias orientadas por dados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="btn-primary">
                <Link to="/diagnostico">
                  Solicitar diagnóstico gratuito
                </Link>
              </Button>
              
              <Button variant="outline" className="group">
                <span>Ver cases de sucesso</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                +150 empresas aceleraram seu crescimento
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -z-10 top-1/3 right-1/3 w-72 h-72 bg-revgreen/20 rounded-full blur-3xl" />
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
              alt="Data-driven growth strategy" 
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
