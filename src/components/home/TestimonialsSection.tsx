
import { useState } from 'react';
import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    quote: "A consultoria da RevHackers nos ajudou a implementar uma estratégia de RevOps que integrou nossas equipes de marketing e vendas, trazendo resultados expressivos em poucos meses.",
    author: "Lucio Sardinha",
    role: "CEO, FMU Virtual",
    avatar: "/lovable-uploads/96db41f1-2d74-4913-997d-3296df29d457.png"
  },
  {
    quote: "Reduzimos nosso CAC em 38% após implementar as recomendações da RevHackers. O conhecimento técnico da equipe e a capacidade de extrair insights dos dados foram cruciais para nossa estratégia de crescimento.",
    author: "Fernando Correa",
    role: "CEO, First Security",
    avatar: "/lovable-uploads/2abb9e01-3bb4-413b-887d-0efab88c25eb.png"
  },
  {
    quote: "A metodologia da RevHackers trouxe clareza para nossos processos de vendas e marketing. Hoje temos métricas confiáveis e um pipeline muito mais previsível, o que nos permite escalar com segurança.",
    author: "Carla Macedo",
    role: "Diretora de Vendas, TOEFL Junior Brasil",
    avatar: "/lovable-uploads/95e8dfb6-30ef-4311-b229-a6c702cd57b7.png"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-gray-600">
            Empresas que transformaram seus resultados com nossa metodologia
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                  <div className="p-1">
                    <Card className="bg-white rounded-xl shadow-md p-8 md:p-12 relative">
                      <Quote className="text-revgreen/20 h-16 w-16 absolute top-8 left-8" />
                      
                      <blockquote className="relative z-10">
                        <p className="text-xl md:text-2xl leading-relaxed text-gray-800 mb-8">
                          "{testimonial.quote}"
                        </p>
                        
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                            <AvatarFallback>{testimonial.author.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">{testimonial.author}</p>
                            <p className="text-gray-600">{testimonial.role}</p>
                          </div>
                        </div>
                      </blockquote>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="relative static mr-2" />
              <CarouselNext className="relative static ml-2" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
