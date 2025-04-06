
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const cases = [
  {
    title: "SoftExpert",
    category: "SaaS B2B",
    result: "157% de aumento em MQLs",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  },
  {
    title: "Contabilizei",
    category: "Contabilidade Digital",
    result: "210% ROI em campanhas ABM",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
  },
  {
    title: "RD Station",
    category: "MarTech",
    result: "43% redução no CAC",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
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
              Veja como empresas de referência conquistaram resultados extraordinários com nossa metodologia.
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
            <Link to={`/cases/${item.title.toLowerCase()}`} key={index}>
              <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
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
