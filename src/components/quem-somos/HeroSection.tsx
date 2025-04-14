import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  return <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-white to-gray-50">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
            Somos a <img src="/lovable-uploads/00aac887-24ac-4c80-a2f3-d4912050bb97.png" alt="RevHackers" className="h-18 md:h-16 inline-block align-middle ml-2" />
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-10">
            Transformamos estratégias de marketing B2B através de funis de vendas otimizados, automações inteligentes e integração entre times de marketing e vendas para gerar resultados mensuráveis.
          </p>
          
          <Button asChild className="bg-revgreen text-black font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg">
            <Link to="/diagnostico" onClick={scrollToTop}>
              Conheça nossa metodologia
            </Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default HeroSection;