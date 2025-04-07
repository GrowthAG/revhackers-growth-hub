
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="section-padding bg-black text-white relative py-20">
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" 
          alt="Growth strategy" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Vamos crescer <span className="text-revgreen">juntos?</span>
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 mx-auto max-w-2xl">
            Agende uma conversa com nossos especialistas e descubra como podemos 
            ajudar sua empresa a escalar resultados de forma sustentável.
          </p>
          
          <Button 
            asChild 
            className="bg-revgreen text-white font-medium px-8 py-4 rounded-md hover:brightness-110 transition-all shadow-lg mx-auto"
          >
            <Link to="/diagnostico">
              Falar com um especialista
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
