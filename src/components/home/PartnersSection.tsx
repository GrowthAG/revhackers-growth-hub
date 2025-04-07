
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
    name: "Anhembi Morumbi",
    logo: "/lovable-uploads/1e500cff-c2ae-4773-a17b-53b1af0ccc75.png",
    url: "/partners/anhembi",
    slug: "anhembi"
  },
  {
    name: "FMU Virtual",
    logo: "/lovable-uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png",
    url: "/partners/fmu-virtual",
    slug: "fmu-virtual"
  },
  {
    name: "TOEFL",
    logo: "/lovable-uploads/3bcf035e-8f15-4449-8008-e1fa958e7a1d.png",
    url: "/partners/toefl",
    slug: "toefl"
  },
  {
    name: "DataVoxx",
    logo: "/lovable-uploads/7fa541cd-3c76-419e-882f-f7a322d01c59.png",
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
                    <Card className="h-24 flex items-center justify-center p-4 bg-white border-0 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group-hover:scale-105">
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="max-h-12 max-w-[80%] object-contain transition-all duration-300 grayscale group-hover:grayscale-0"
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
          <Button variant="outline" asChild className="rounded-full px-8 group">
            <Link to="/cases">
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
