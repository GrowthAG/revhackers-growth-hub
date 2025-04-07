
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-black to-gray-900 text-white relative">
      <div className="absolute inset-0 z-0 opacity-15">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978" 
          alt="Digital Innovation Team" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Somos a <span className="text-revgreen">RevHackers</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Desde 2012, ajudamos empresas B2B a escalarem com inteligência através de 
            automação, estratégia, crescimento e inovação orientados por dados.
            Nossa expertise abrange todo o ecossistema de geração de receita.
          </p>
          
          <Button 
            asChild 
            className="bg-revgreen text-white font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
          >
            <Link to="/diagnostico">
              Conheça nossa metodologia
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
