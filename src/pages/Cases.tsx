
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const caseStudies = [
  {
    title: "Ambipar",
    category: "Tecnologia Ambiental",
    result: "173% de aumento em leads qualificados",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-Ambipar.png",
    slug: "ambipar",
    description: "Como a Ambipar transformou seu processo de geração de demanda com automação e dados."
  },
  {
    title: "PetroReconcavo",
    category: "Energia e Petróleo",
    result: "38% redução no CAC",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-petroreconcavo.png",
    slug: "petroreconcavo",
    description: "Estratégia de lead generation alinhada ao sales process para redução significativa do CAC."
  },
  {
    title: "NTT DATA",
    category: "Tecnologia",
    result: "267% aumento em MQLs",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NTTDATA.png",
    slug: "ntt-data",
    description: "Implementação de RevOps e otimização do funil de vendas para aumento expressivo de leads qualificados."
  },
  {
    title: "Neoenergia",
    category: "Energia",
    result: "124% aumento em oportunidades",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NEOENERGIA.png",
    slug: "neoenergia",
    description: "Transformação digital do processo comercial com automação e integração de sistemas."
  },
  {
    title: "GetNinjas",
    category: "Marketplace",
    result: "85% melhoria na conversão",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/getninjas.png",
    slug: "getninjas",
    description: "Otimização de campanhas e processo de onboarding para aumento significativo na conversão."
  },
  {
    title: "XP Inc",
    category: "Finanças",
    result: "47% redução no tempo de vendas",
    image: "https://revhackers.com.br/wp-content/uploads/2023/04/xp-inc-logo.png",
    slug: "xp-inc",
    description: "Implementação de processos de sales enablement e automação para acelerar o ciclo de vendas."
  }
];

const Cases = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-10 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container-custom">
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
            <Link 
              to="/diagnostico" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-revgreen text-black font-medium hover:brightness-110 transition-all"
            >
              Solicitar diagnóstico gratuito
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Cases;
