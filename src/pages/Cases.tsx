
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
    image: "/lovable-uploads/d3fb7069-d98b-48fe-a6b6-64c0ea6636f8.png",
    slug: "enics",
    description: "Estratégia integrada de Google Ads, Meta Ads, remarketing e automações para venda de ingressos para o evento."
  },
  {
    title: "Heineken",
    category: "Bebidas",
    result: "R$ 3 milhões em vendas",
    image: "/lovable-uploads/aada4820-3f12-4185-9af6-811f30795a93.png",
    slug: "heineken",
    description: "Estratégia omnichannel que uniu mídias pagas, automações de marketing e integração com pontos de venda físicos."
  },
  {
    title: "Agence MR",
    category: "Tecnologia",
    result: "100 novas contas em 3 meses",
    image: "/lovable-uploads/6c09375e-5298-4672-9226-27eb60a6b038.png",
    slug: "agence-mr",
    description: "Sistema integrado de automação para qualificação de leads e otimização do tempo da equipe comercial."
  },
  {
    title: "Security First",
    category: "Segurança",
    result: "-35% no CAC em 4 meses",
    image: "/lovable-uploads/3780d954-0e57-4db5-9e1b-312a0e93bd82.png",
    slug: "security-first",
    description: "Estratégia completa de funil de vendas com conteúdo especializado e campanhas de mídia paga segmentadas."
  },
  {
    title: "Anhembi Morumbi",
    category: "Educação",
    result: "+42% em matrículas online",
    image: "/lovable-uploads/1e500cff-c2ae-4773-a17b-53b1af0ccc75.png",
    slug: "anhembi",
    description: "Estratégia de funil de vendas multicanal com segmentação por perfil de aluno e automações personalizadas."
  },
  {
    title: "BLDN Digital",
    category: "Marketing Digital",
    result: "+120% em agências parceiras",
    image: "/lovable-uploads/116d453a-7ffe-43a3-bcc4-aeac34c74bd4.png",
    slug: "bldn-digital",
    description: "Account-Based Marketing combinado com funil de vendas consultivo para agências de médio e grande porte."
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
                      className="w-3/4 h-auto max-h-32 object-contain transition-transform hover:scale-105 duration-500"
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
              <ContactForm formType="diagnosis" />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Cases;
