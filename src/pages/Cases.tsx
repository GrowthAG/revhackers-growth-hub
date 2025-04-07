
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ContactForm from '@/components/shared/ContactForm';

const caseStudies = [
  {
    title: "ENICS",
    category: "Eventos",
    result: "3 mil ingressos em 30 dias",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/enics-logo.png",
    slug: "enics",
    description: "Estratégia integrada de Google Ads, Meta Ads, remarketing e automações para venda de ingressos para o evento."
  },
  {
    title: "Wa Project",
    category: "Software",
    result: "R$ 3 milhões em vendas",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/waproject-logo.png",
    slug: "waproject",
    description: "Processo de Account-Based Marketing (ABM) para gerar parcerias sólidas com grandes players do mercado."
  },
  {
    title: "Funnels",
    category: "Tecnologia",
    result: "100 novas contas em 3 meses",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/funnels-logo.png",
    slug: "funnels",
    description: "Estratégia personalizada combinando automação e abordagens focadas em atrair contas qualificadas."
  }
];

const Cases = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-10 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978" 
            alt="Cases de sucesso background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Cases de Sucesso</h1>
            <p className="text-xl text-gray-300 mb-8">
              Conheça as histórias de empresas que transformaram seus resultados de negócio 
              com nossas soluções de Revenue Operations
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((caseStudy, index) => (
              <Link to={`/cases/${caseStudy.slug}`} key={index}>
                <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                  <div className="h-48 overflow-hidden bg-white flex items-center justify-center p-6">
                    <img 
                      src={caseStudy.image} 
                      alt={caseStudy.title} 
                      className="w-3/4 h-auto object-contain transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">{caseStudy.category}</span>
                      <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium">
                        {caseStudy.result}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{caseStudy.title}</h3>
                    <p className="text-gray-600 mb-4">{caseStudy.description}</p>
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

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Sua empresa será nosso próximo case?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Entre em contato agora mesmo e descubra como podemos ajudar sua empresa 
              a obter resultados excepcionais como estes.
            </p>
            
            <div className="mt-8 max-w-xl mx-auto bg-gray-50 p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold mb-6">Solicite seu diagnóstico gratuito</h3>
              <ContactForm formType="diagnosis" />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Cases;
