
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const cases = [
  {
    title: "ENICS",
    category: "Eventos",
    result: "3 mil ingressos em 30 dias",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/enics-logo.png",
    slug: "enics",
    logo: true
  },
  {
    title: "Wa Project",
    category: "Software",
    result: "R$ 3 milhões em vendas",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/waproject-logo.png",
    slug: "waproject",
    logo: true
  },
  {
    title: "Funnels",
    category: "Tecnologia",
    result: "100 contas em 3 meses",
    image: "/lovable-uploads/208e34c7-ea4e-4bd1-b6e9-1b0ef887f201.png",
    slug: "funnels",
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
          {cases.map((item, index) => (
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
