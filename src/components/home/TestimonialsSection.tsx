
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: "A RevHackers transformou nossa estratégia de crescimento e lead generation. Tivemos um aumento significativo em conversões qualificadas e o time é extremamente proativo.",
    author: "Mário Sérgio",
    role: "CEO, SoftExpert",
    avatar: "https://revhackers.com.br/images/avatar-mario.webp"
  },
  {
    quote: "O diagnóstico que recebemos revelou oportunidades que nem sabíamos que existiam. Nossa conversão de trial para cliente pago cresceu substancialmente após implementar as recomendações.",
    author: "Vitor Torres",
    role: "Head de Marketing, Contabilizei",
    avatar: "https://revhackers.com.br/images/avatar-vitor.webp"
  },
  {
    quote: "Implementamos a estratégia PLG recomendada pela RevHackers e vimos nosso NPS subir enquanto o CAC diminuiu consistentemente. Resultados reais em poucos meses.",
    author: "Ana Mendes",
    role: "Growth Lead, RD Station",
    avatar: "https://revhackers.com.br/images/avatar-ana.webp"
  }
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  
  const next = () => {
    setCurrent((current + 1) % testimonials.length);
  };
  
  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-gray-600">
            Empresas que transformaram seus resultados com nossa metodologia
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 relative">
            <Quote className="text-revgreen/20 h-24 w-24 absolute top-8 left-8" />
            
            <blockquote className="relative z-10">
              <p className="text-xl md:text-2xl leading-relaxed text-gray-800 mb-8">
                "{testimonials[current].quote}"
              </p>
              
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={testimonials[current].avatar} alt={testimonials[current].author} />
                  <AvatarFallback>{testimonials[current].author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{testimonials[current].author}</p>
                  <p className="text-gray-600">{testimonials[current].role}</p>
                </div>
              </div>
            </blockquote>
          </div>
          
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={prev} 
              className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-revgreen hover:border-transparent hover:text-black transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full ${
                    i === current ? 'w-8 bg-revgreen' : 'w-2 bg-gray-300'
                  } transition-all`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
            
            <button 
              onClick={next} 
              className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-revgreen hover:border-transparent hover:text-black transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
