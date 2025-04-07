
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const partners = [
  {
    name: "Security First",
    logo: "/lovable-uploads/3780d954-0e57-4db5-9e1b-312a0e93bd82.png",
    url: "https://securityfirst.com.br/"
  },
  {
    name: "Anhembi Morumbi",
    logo: "/lovable-uploads/1e500cff-c2ae-4773-a17b-53b1af0ccc75.png",
    url: "https://portal.anhembi.br/"
  },
  {
    name: "FMU Virtual",
    logo: "/lovable-uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png",
    url: "https://www.fmuvirtual.com.br/"
  },
  {
    name: "TOEFL",
    logo: "/lovable-uploads/3bcf035e-8f15-4449-8008-e1fa958e7a1d.png",
    url: "https://toefljunior.com.br/"
  },
  {
    name: "DataVoxx",
    logo: "/lovable-uploads/7fa541cd-3c76-419e-882f-f7a322d01c59.png",
    url: "https://datavoxx.com.br/"
  },
  {
    name: "Funnels",
    logo: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&fit=crop",
    url: "https://growthfunnels.com.br/"
  },
  {
    name: "WA Project",
    logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&fit=crop",
    url: "https://www.waproject.com.br/"
  },
  {
    name: "BLDN Digital",
    logo: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&fit=crop",
    url: "https://bldndigital.com.br/"
  },
  {
    name: "PlacLux",
    logo: "/lovable-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png",
    url: "https://placlux.com/"
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {partners.map((partner) => (
            <a 
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
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
            </a>
          ))}
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
