
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const cases = [
  {
    title: "ENICS",
    category: "Eventos",
    result: "3 mil ingressos em 30 dias",
    image: "/lovable-uploads/d3fb7069-d98b-48fe-a6b6-64c0ea6636f8.png",
    slug: "enics",
    logo: true
  },
  {
    title: "Heineken",
    category: "Bebidas",
    result: "Materiais em vídeo para parcerias",
    image: "/lovable-uploads/aada4820-3f12-4185-9af6-811f30795a93.png",
    slug: "heineken",
    logo: true
  },
  {
    title: "Agence MR",
    category: "Tecnologia",
    result: "Otimização de Google Ads",
    image: "/lovable-uploads/6c09375e-5298-4672-9226-27eb60a6b038.png",
    slug: "agence-mr",
    logo: true
  },
  {
    title: "TOEFL Brasil",
    category: "Educação",
    result: "Leads B2B para escolas",
    image: "/lovable-uploads/3bcf035e-8f15-4449-8008-e1fa958e7a1d.png",
    slug: "toefl",
    logo: true
  },
  {
    title: "DataVoxx",
    category: "Tecnologia",
    result: "Novo site e funil inbound",
    image: "/lovable-uploads/7fa541cd-3c76-419e-882f-f7a322d01c59.png",
    slug: "datavoxx",
    logo: true
  },
  {
    title: "BLDN Digital",
    category: "Marketing",
    result: "Funil completo e mídia paga",
    image: "/lovable-uploads/116d453a-7ffe-43a3-bcc4-aeac34c74bd4.png",
    slug: "emagrecentro",
    logo: true
  }
];

const CasesSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cases de sucesso
            </h2>
            <p className="text-lg text-gray-600">
              Empresas de referência que conquistaram resultados extraordinários com nossa metodologia de crescimento orientado a dados.
            </p>
          </div>
          
          <Link 
            to="/cases" 
            className="inline-flex items-center text-revgreen hover:text-black font-medium"
          >
            Ver todos os cases
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.slice(0, 3).map((item, index) => (
            <Link to={`/cases/${item.slug}`} key={index}>
              <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                <div className="h-48 overflow-hidden bg-white flex items-center justify-center p-6">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-3/4 h-auto max-h-32 object-contain transition-transform hover:scale-105 duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium">
                      {item.result}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <div className="mt-4 flex items-center text-revgreen font-medium text-sm">
                    <span>Ler estudo completo</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CasesSection;
