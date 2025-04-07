
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
    logo: "/lovable-uploads/3bcf035e-8f15-4449-8008-e1fa958e7a1d.png", // Logo correto do TOEFL
    url: "/partners/toefl",
    slug: "toefl"
  },
  {
    name: "Anhembi Morumbi",
    logo: "/lovable-uploads/1e500cff-c2ae-4773-a17b-53b1af0ccc75.png", // Logo correto da Anhembi
    url: "/partners/anhembi",
    slug: "anhembi"
  },
  {
    name: "DataVoxx",
    logo: "/lovable-uploads/7fa541cd-3c76-419e-882f-f7a322d01c59.png", // Logo correto da DataVoxx
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
    logo: "/lovable-uploads/116d453a-7ffe-43a3-bcc4-aeac34c74bd4.png", // Logo correto da BLDN Digital
    url: "/partners/bldn-digital",
    slug: "bldn-digital"
  },
  {
    name: "PlacLux",
    logo: "/lovable-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png", // Logo correto da PlacLux
    url: "/partners/placlux",
    slug: "placlux"
  },
  {
    name: "ENICS",
    logo: "/lovable-uploads/d3fb7069-d98b-48fe-a6b6-64c0ea6636f8.png",
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
        
        <div className="mb-12 px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
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
            <div className="flex justify-center mt-6">
              <CarouselPrevious className="static transform-none mx-2" />
              <CarouselNext className="static transform-none mx-2" />
            </div>
          </Carousel>
        </div>

        <div className="text-center mt-8">
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
