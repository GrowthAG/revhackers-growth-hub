
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

const partners = [
  {
    name: "Security First",
    logo: "/lovable-uploads/3780d954-0e57-4db5-9e1b-312a0e93bd82.png",
    url: "/partners/security-first",
    slug: "security-first"
  },
  {
    name: "TOEFL Brasil",
    logo: "/lovable-uploads/f591dfee-96da-4b90-905d-f74e1dd317c9.png", // Atualizando logo do TOEFL
    url: "/partners/toefl",
    slug: "toefl"
  },
  {
    name: "Anhembi Morumbi",
    logo: "/lovable-uploads/1e500cff-c2ae-4773-a17b-53b1af0ccc75.png", 
    url: "/partners/anhembi",
    slug: "anhembi"
  },
  {
    name: "DataVoxx",
    logo: "/lovable-uploads/99649815-1e1e-44ce-ae53-2973725aaeb8.png", // Atualizando logo da DataVoxx
    url: "/partners/datavoxx",
    slug: "datavoxx"
  },
  {
    name: "Agence MR",
    logo: "/lovable-uploads/6c09375e-5298-4672-9226-27eb60a6b038.png",
    url: "/partners/agence-mr",
    slug: "agence-mr"
  },
  {
    name: "Heineken",
    logo: "/lovable-uploads/aada4820-3f12-4185-9af6-811f30795a93.png",
    url: "/partners/heineken",
    slug: "heineken"
  },
  {
    name: "BLDN Digital",
    logo: "/lovable-uploads/116d453a-7ffe-43a3-bcc4-aeac34c74bd4.png", 
    url: "/partners/bldn-digital",
    slug: "bldn-digital"
  },
  {
    name: "PlacLux",
    logo: "/lovable-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png", 
    url: "/partners/placlux",
    slug: "placlux"
  },
  {
    name: "ENICS",
    logo: "/lovable-uploads/a05718ad-1822-4102-909a-7e86af151e98.png",
    url: "/partners/enics",
    slug: "enics"
  }
];

const PartnersSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nossos Clientes e Parceiros
          </h2>
          <p className="text-lg text-gray-600">
            Empresas que confiam na nossa expertise para impulsionar seus resultados
          </p>
        </div>
        
        <div className="px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent>
              {partners.map((partner) => (
                <CarouselItem key={partner.name} className="md:basis-1/3 lg:basis-1/4">
                  <Link 
                    to={partner.url}
                    className="group block"
                  >
                    <Card className="h-28 flex items-center justify-center p-4 bg-white border-0 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group-hover:scale-105">
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="max-h-16 max-w-[80%] object-contain transition-all duration-300 grayscale group-hover:grayscale-0"
                        />
                      </div>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="absolute top-1/2 -left-2 md:left-0 z-10 transform -translate-y-1/2">
              <CarouselPrevious className="bg-white shadow-lg border-0 text-black h-10 w-10 opacity-90 hover:opacity-100" />
            </div>
            
            <div className="absolute top-1/2 -right-2 md:right-0 z-10 transform -translate-y-1/2">
              <CarouselNext className="bg-white shadow-lg border-0 text-black h-10 w-10 opacity-90 hover:opacity-100" />
            </div>
          </Carousel>
        </div>

        <div className="text-center mt-10">
          <Button 
            asChild 
            className="bg-revgreen text-black font-medium px-8 py-6 rounded-md hover:brightness-110 transition-all shadow-lg min-w-[250px]"
            size="lg"
          >
            <Link to="/cases" className="flex items-center justify-center">
              <span>Ver mais sobre nossos cases</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
