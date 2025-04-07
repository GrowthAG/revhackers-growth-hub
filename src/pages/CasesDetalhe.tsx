
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import ContactForm from '@/components/shared/ContactForm';

// This would normally come from an API or CMS
const casesData = {
  "enics": {
    title: "ENICS",
    category: "Eventos",
    logo: "https://revhackers.com.br/wp-content/uploads/2023/04/enics-logo.png",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    challenge: "O ENICS precisava vender 3 mil ingressos para seu evento em um prazo muito curto de 30 dias, necessitando uma estratégia eficiente de marketing digital.",
    solution: "Implementamos uma estratégia integrada de Google Ads, Meta Ads, campanhas de remarketing e automações via e-mail e WhatsApp altamente segmentadas para atingir o público correto.",
    results: [
      "3 mil ingressos vendidos no prazo estabelecido de 30 dias",
      "Campanhas de Google Ads e Meta Ads segmentadas atraíram o público ideal",
      "Remarketing aumentou a taxa de conversão em 50%",
      "Automação em e-mail e WhatsApp manteve o público engajado"
    ],
    metrics: [
      {
        value: "3 mil",
        label: "Ingressos vendidos em 30 dias"
      },
      {
        value: "30 dias",
        label: "Prazo necessário para atingir a meta de vendas"
      },
      {
        value: "50%",
        label: "Aumento na conversão com o uso de campanhas de remarketing"
      },
      {
        value: "4 canais",
        label: "Para impulsionar as vendas (Google Ads, Meta Ads, e-mail e WhatsApp)"
      }
    ],
    quote: "A estratégia integrada da RevHackers foi essencial para alcançarmos nossa meta de vendas em um prazo tão curto. A combinação de campanhas segmentadas e automações foi decisiva.",
    author: "Diretor de Marketing",
    role: "ENICS"
  },
  "waproject": {
    title: "Wa Project",
    category: "Software",
    logo: "https://revhackers.com.br/wp-content/uploads/2023/04/waproject-logo.png",
    coverImage: "https://images.unsplash.com/photo-1581094428992-6100bc3ac3e3",
    challenge: "A Wa Project buscava aumentar suas vendas e estabelecer parcerias estratégicas com grandes players do mercado de software, como Localiza e Porto Seguro.",
    solution: "Estruturamos um processo de Account-Based Marketing (ABM) personalizado para abordar grandes empresas do setor de software, com estratégias específicas para cada conta.",
    results: [
      "R$ 3 milhões em vendas gerados com contratos estratégicos",
      "Parcerias firmadas com empresas líderes como Localiza e Porto Seguro",
      "Ciclo de vendas otimizado em 50% com estratégias personalizadas",
      "Campanhas focadas resultaram em maior eficiência e conversão"
    ],
    metrics: [
      {
        value: "R$ 3 Mi",
        label: "Valor gerado em novos negócios com grandes empresas"
      },
      {
        value: "20%",
        label: "Aumento na taxa de conversão após a implementação do ABM"
      },
      {
        value: "50%",
        label: "Na estratégia, essa foi a taxa de redução no tempo do ciclo de vendas"
      },
      {
        value: "10",
        label: "Empresas-chave conquistadas como clientes no setor de software"
      }
    ],
    quote: "A estratégia de ABM implementada pela RevHackers nos permitiu abordar de forma efetiva grandes contas que antes pareciam inacessíveis, estabelecendo parcerias valiosas.",
    author: "CEO",
    role: "Wa Project"
  },
  "funnels": {
    title: "Funnels",
    category: "Tecnologia",
    logo: "https://revhackers.com.br/wp-content/uploads/2023/04/funnels-logo.png",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    challenge: "A Funnels precisava escalar rapidamente sua base de clientes e buscava uma estratégia eficiente para atrair contas qualificadas em curto prazo.",
    solution: "Implementamos uma estratégia personalizada combinando automação, personalização e abordagens focadas em atrair contas qualificadas no curto prazo.",
    results: [
      "Estratégia personalizada atraiu contas qualificadas no curto prazo",
      "100 novas contas foram adicionadas em 3 meses",
      "Campanhas ABM e automação otimizadas aumentaram conversões",
      "Base sólida para crescimento contínuo foi estabelecida"
    ],
    metrics: [
      {
        value: "100",
        label: "Novas contas ativas em 3 meses"
      },
      {
        value: "90%",
        label: "Aumento na taxa de conversão das campanhas"
      },
      {
        value: "3",
        label: "Meses para alcançar os resultados"
      },
      {
        value: "25%",
        label: "Essa foi a redução no ciclo de vendas"
      }
    ],
    quote: "A implementação da estratégia da RevHackers superou nossas expectativas iniciais, nos permitindo crescer rapidamente e de forma sustentável.",
    author: "Diretor Comercial",
    role: "Funnels"
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
      <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src={caseData.coverImage} 
            alt={`${caseData.title} cover`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <span className="text-sm text-gray-300 border border-gray-700 rounded-full px-4 py-1">
                {caseData.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Case {caseData.title} - Revenue Operations
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

              <div className="bg-[#f3ffcc] rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {caseData.metrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-4xl font-bold text-black mb-2">{metric.value}</div>
                      <div className="text-gray-600">{metric.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {caseData.results.map((result, index) => (
                    <div key={index} className="flex items-center space-x-3">
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
                
                <div className="mt-8 max-w-xl mx-auto bg-gray-50 p-8 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Solicite seu diagnóstico gratuito</h3>
                  <ContactForm formType="diagnosis" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default CasesDetalhe;
