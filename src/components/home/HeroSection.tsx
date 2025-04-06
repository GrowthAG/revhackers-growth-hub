
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            Potencialize seu <span className="text-revgreen">crescimento B2B</span> com estratégia orientada por dados
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Ajudamos empresas a escalar através de automação, PLG, ABM e estratégias orientadas por dados para gerar resultados mensuráveis.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild 
              className="bg-revgreen text-white font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
            >
              <Link to="/diagnostico">
                Solicitar diagnóstico gratuito
              </Link>
            </Button>
            
            <Button variant="outline" className="group border-revgreen text-revgreen hover:bg-revgreen hover:text-white">
              <span>Ver cases de sucesso</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center space-x-4 pt-12">
            <div className="flex flex-wrap justify-center gap-8">
              <img src="https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-Ambipar.png" alt="Ambipar" className="h-10 w-auto object-contain" />
              <img src="https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-petroreconcavo.png" alt="PetroReconcavo" className="h-10 w-auto object-contain" />
              <img src="https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NTTDATA.png" alt="NTT DATA" className="h-10 w-auto object-contain" />
              <img src="https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NEOENERGIA.png" alt="Neoenergia" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-400 mt-4">
              +150 empresas aceleraram seu crescimento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
