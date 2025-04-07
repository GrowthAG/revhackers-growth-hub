
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: "A RevHackers tem sido uma parceira fundamental para a BLDN Digital. Enquanto nós focamos em vender os projetos, eles se encarregam de operacionalizar tudo, criando uma integração perfeita.",
    author: "Fabio Cará",
    role: "CEO, BLDN Digital",
    avatar: "/lovable-uploads/e7b7343c-3506-497a-a146-eb393723c3a9.png"
  },
  {
    quote: "A consultoria da RevHackers nos ajudou a implementar uma estratégia de RevOps que integrou nossas equipes de marketing e vendas, trazendo resultados expressivos em poucos meses.",
    author: "Carolina Santos",
    role: "Diretora de Marketing, PetroReconcavo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    quote: "Reduzimos nosso CAC em 38% após implementar as recomendações da RevHackers. O conhecimento técnico da equipe e a capacidade de extrair insights dos dados foram cruciais.",
    author: "Alexandre Martins",
    role: "CEO, NTT DATA Brasil",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
  },
  {
    quote: "A metodologia da RevHackers trouxe clareza para nossos processos de vendas e marketing. Hoje temos métricas confiáveis e um pipeline muito mais previsível.",
    author: "Renata Oliveira",
    role: "Head de Operações, FMU",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
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
    <section className="section-padding bg-gray-50 py-24">
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
