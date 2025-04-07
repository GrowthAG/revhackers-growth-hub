
import { Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

const QuoteSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-transparent border border-gray-700 p-10 relative">
            <div className="absolute -top-5 -left-5 h-10 w-10 bg-revgreen rounded-full flex items-center justify-center">
              <Quote className="h-5 w-5 text-white" />
            </div>
            
            <p className="text-xl md:text-2xl italic mb-8 text-white font-medium">
              "A RevHackers tem sido uma parceira fundamental para a BLDN Digital. Enquanto nós 
              focamos em vender os projetos, eles se encarregam de operacionalizar tudo, criando uma 
              integração perfeita entre nossos processos e os dos nossos clientes. Isso tornou nossa 
              operação muito mais eficiente e escalável, permitindo que entreguemos resultados 
              consistentes com agilidade."
            </p>
            
            <div className="flex items-center">
              <div className="mr-4">
                <div className="h-12 w-12 bg-gray-700 rounded-full overflow-hidden">
                  <img 
                    src="/lovable-uploads/e7b7343c-3506-497a-a146-eb393723c3a9.png" 
                    alt="Fabio CEO" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="font-bold text-white">Fabio Boldrini</p>
                <p className="text-gray-300">CEO, BLDN Digital</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;
