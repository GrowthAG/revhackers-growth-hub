
import { Card } from '@/components/ui/card';

const partners = [
  {
    name: "Security First",
    logo: "https://securityfirst.com.br/wp-content/uploads/2022/12/logo-ret.svg",
    url: "https://securityfirst.com.br/"
  },
  {
    name: "Anhembi Morumbi",
    logo: "https://portal.anhembi.br/wp-content/uploads/2023/12/logo-anhembi.png",
    url: "https://portal.anhembi.br/"
  },
  {
    name: "FMU Virtual",
    logo: "https://www.fmuvirtual.com.br/wp-content/themes/fmuvirtual/assets/images/fmu-virtual.svg",
    url: "https://www.fmuvirtual.com.br/"
  },
  {
    name: "TOEFL Junior",
    logo: "https://toefljunior.com.br/wp-content/uploads/2022/12/logo.png",
    url: "https://toefljunior.com.br/"
  },
  {
    name: "ENICS",
    logo: "https://enics.com.br/wp-content/uploads/2020/12/logo-enics-2020.png",
    url: "https://enics.com.br/"
  },
  {
    name: "Funnels",
    logo: "https://growthfunnels.com.br/wp-content/uploads/2021/01/cropped-Growth-Funnels-Logo.png",
    url: "https://growthfunnels.com.br/"
  },
  {
    name: "WA Project",
    logo: "https://www.waproject.com.br/wp-content/uploads/2021/03/logo-waproject.png",
    url: "https://www.waproject.com.br/"
  },
  {
    name: "BLDN Digital",
    logo: "https://bldndigital.com.br/wp-content/uploads/2022/04/logo-bldn-branco.png",
    url: "https://bldndigital.com.br/"
  }
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Nossos Clientes e Parceiros
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <a 
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="h-24 flex items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 transition-all">
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
