
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

// This would normally come from an API or CMS
const casesData = {
  "ambipar": {
    title: "Ambipar",
    category: "Tecnologia Ambiental",
    logo: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-Ambipar.png",
    coverImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    challenge: "A Ambipar enfrentava desafios significativos na geração de leads qualificados e na integração entre marketing e vendas. O processo manual consumia muito tempo e resultava em oportunidades perdidas.",
    solution: "Implementamos uma estratégia completa de Revenue Operations, incluindo automação de marketing, integração de dados e otimização do funil de vendas.",
    results: [
      "173% de aumento em leads qualificados",
      "62% de redução no tempo do ciclo de vendas",
      "89% de melhoria na conversão de MQL para SQL",
      "42% de aumento na produtividade da equipe de vendas"
    ],
    quote: "A RevHackers transformou nosso processo de geração de demanda. A implementação de automação e inteligência de dados nos permitiu escalar nossos resultados de forma significativa.",
    author: "Ricardo Ferreira",
    role: "Head de Vendas, Ambipar"
  },
  "petroreconcavo": {
    title: "PetroReconcavo",
    category: "Energia e Petróleo",
    logo: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-petroreconcavo.png",
    coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
    challenge: "A PetroReconcavo buscava reduzir seu CAC e melhorar a eficiência do seu processo comercial. A falta de alinhamento entre marketing e vendas resultava em esforços duplicados e ineficiência.",
    solution: "Desenvolvemos uma estratégia integrada de lead generation alinhada ao processo de vendas, com automação de qualificação e nurturing de leads.",
    results: [
      "38% de redução no CAC",
      "54% de aumento na taxa de conversão",
      "105% de aumento no número de reuniões qualificadas",
      "27% de redução no tempo de onboarding de novos clientes"
    ],
    quote: "A consultoria da RevHackers trouxe resultados tangíveis para nosso negócio. A redução do CAC e o aumento da eficiência do processo comercial impactaram diretamente nosso crescimento.",
    author: "Carolina Santos",
    role: "Diretora de Marketing, PetroReconcavo"
  },
  "ntt-data": {
    title: "NTT DATA",
    category: "Tecnologia",
    logo: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NTTDATA.png",
    coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095",
    challenge: "A NTT DATA precisava aumentar significativamente o volume de leads qualificados e melhorar a integração entre suas diversas unidades de negócio globais.",
    solution: "Implementamos uma estratégia de RevOps com automação de processos, integração de dados e criação de dashboards consolidados para acompanhamento de resultados.",
    results: [
      "267% de aumento em MQLs",
      "78% de melhoria na taxa de conversão de leads",
      "42% de redução no tempo de qualificação",
      "124% de aumento na receita recorrente"
    ],
    quote: "O conhecimento técnico da equipe da RevHackers e a capacidade de extrair insights dos dados foram cruciais para o sucesso da implementação de RevOps em nossa empresa.",
    author: "Alexandre Martins",
    role: "CEO, NTT DATA Brasil"
  }
};

const CasesDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const caseData = slug ? casesData[slug as keyof typeof casesData] : null;

  if (!caseData) {
    return (
      <PageLayout>
        <div className="container-custom py-32">
          <h1 className="text-3xl font-bold">Case não encontrado</h1>
          <p className="mt-4">O case que você está procurando não existe ou foi removido.</p>
          <Button asChild className="mt-8">
            <a href="/cases">Voltar para cases</a>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <span className="text-sm text-gray-300 border border-gray-700 rounded-full px-4 py-1">
                {caseData.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Como a {caseData.title} transformou seus resultados com Revenue Operations
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <img 
                src={caseData.logo} 
                alt={caseData.title} 
                className="h-16 bg-white p-2 rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <img 
              src={caseData.coverImage} 
              alt={`${caseData.title} case study`} 
              className="w-full h-auto rounded-xl mb-12 shadow-lg"
            />
            
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-4">O Desafio</h2>
                <p className="text-gray-700">{caseData.challenge}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">A Solução</h2>
                <p className="text-gray-700">{caseData.solution}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Resultados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {caseData.results.map((result, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="text-revgreen h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-800">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl">
                <blockquote className="text-xl italic text-gray-700 mb-4">
                  "{caseData.quote}"
                </blockquote>
                <p className="font-bold">{caseData.author}</p>
                <p className="text-gray-600">{caseData.role}</p>
              </div>
              
              <div className="text-center pt-8">
                <h2 className="text-2xl font-bold mb-6">
                  Quer resultados como estes para sua empresa?
                </h2>
                <Button asChild size="lg">
                  <a href="/diagnostico">Solicitar diagnóstico gratuito</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default CasesDetalhe;
