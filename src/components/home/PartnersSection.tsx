
import { Card } from '@/components/ui/card';

const partners = [
  {
    name: "Security First",
    logo: "/lovable-uploads/3780d954-0e57-4db5-9e1b-312a0e93bd82.png",
    url: "https://securityfirst.com.br/",
    bgColor: "bg-white"
  },
  {
    name: "Anhembi Morumbi",
    logo: "/lovable-uploads/1e500cff-c2ae-4773-a17b-53b1af0ccc75.png",
    url: "https://portal.anhembi.br/",
    bgColor: "bg-[#222]"
  },
  {
    name: "FMU Virtual",
    logo: "/lovable-uploads/33cf0d95-8cfd-4cf6-bd31-49c3466c365d.png",
    url: "https://www.fmuvirtual.com.br/",
    bgColor: "bg-[#1A1F2C]"
  },
  {
    name: "TOEFL",
    logo: "/lovable-uploads/3bcf035e-8f15-4449-8008-e1fa958e7a1d.png",
    url: "https://toefljunior.com.br/",
    bgColor: "bg-[#222]"
  },
  {
    name: "DataVoxx",
    logo: "/lovable-uploads/7fa541cd-3c76-419e-882f-f7a322d01c59.png",
    url: "https://datavoxx.com.br/",
    bgColor: "bg-white"
  },
  {
    name: "Funnels",
    logo: "/lovable-uploads/c06ddff2-5712-4aef-bf4d-79b4ce4ac73f.png",
    url: "https://growthfunnels.com.br/",
    bgColor: "bg-white"
  },
  {
    name: "WA Project",
    logo: "/lovable-uploads/b22a6616-9c9c-41b9-9374-de85e7155c80.png",
    url: "https://www.waproject.com.br/",
    bgColor: "bg-[#221F26]"
  },
  {
    name: "BLDN Digital",
    logo: "/lovable-uploads/e9f2329b-4293-420b-91da-b3eeadb382fd.png",
    url: "https://bldndigital.com.br/",
    bgColor: "bg-white"
  },
  {
    name: "PlacLux",
    logo: "/lovable-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png",
    url: "https://placlux.com/",
    bgColor: "bg-[#222]"
  }
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Nossos Clientes e Parceiros
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <a 
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform hover:scale-105"
            >
              <Card className={`h-24 flex items-center justify-center p-4 ${partner.bgColor} shadow-md border-0`}>
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="max-h-16 max-w-full object-contain"
                />
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
