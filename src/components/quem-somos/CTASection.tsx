
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  
  return (
    <section className="section-padding bg-black text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Vamos crescer <span className="text-revgreen">juntos?</span>
            </h2>
            
            <p className="text-lg text-gray-300">
              Agende uma conversa com nossos especialistas e descubra como podemos 
              ajudar sua empresa a escalar resultados de forma sustentável.
            </p>
            
            <Button 
              asChild 
              className="bg-revgreen text-black font-medium px-8 py-4 rounded-md hover:brightness-110 transition-all shadow-lg"
            >
              <Link to="/diagnostico" onClick={scrollToTop}>
                Falar com um especialista
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
              alt="Estratégias de crescimento" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
