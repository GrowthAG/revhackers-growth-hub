
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LineChart, Database, Zap, Bot, Users, Target, BarChart, HeartPulse } from 'lucide-react';

const services = [
  {
    title: "Automação de Revenue",
    description: "Automatizamos processos comerciais e de marketing para gerar mais resultados com menos esforço.",
    icon: Bot,
    features: [
      "Automação de processos de marketing e vendas",
      "Implementação de CRM e ferramentas de automação",
      "Criação de fluxos de nutrição e qualificação de leads",
      "Otimização de processos para redução de CAC"
    ],
    slug: "automacao"
  },
  {
    title: "Revenue Intelligence",
    description: "Análise e insights a partir dos seus dados para melhorar a tomada de decisão em vendas e marketing.",
    icon: Database,
    features: [
      "Integração de dados de diversas fontes",
      "Criação de dashboards para acompanhamento de métricas",
      "Análise de dados para identificação de padrões",
      "Implementação de processos baseados em dados"
    ],
    slug: "revenue-intelligence"
  },
  {
    title: "Revenue Operations",
    description: "Alinhamento entre marketing, vendas e CS para uma gestão integrada do funil de vendas.",
    icon: LineChart,
    features: [
      "Análise e otimização do funil de vendas",
      "Alinhamento de processos entre marketing e vendas",
      "Implementação de metodologias ágeis",
      "Otimização de processos para redução de ciclo de vendas"
    ],
    slug: "revops"
  },
  {
    title: "Customer Success",
    description: "Estratégias para maximizar a retenção e expansão da sua base de clientes.",
    icon: HeartPulse,
    features: [
      "Implementação de processos de onboarding",
      "Criação de programas de customer success",
      "Análise de churn e estratégias de retenção",
      "Desenvolvimento de estratégias de upsell e cross-sell"
    ],
    slug: "customer-success"
  },
  {
    title: "Account Based Marketing",
    description: "Estratégias personalizadas para conquistar contas estratégicas com abordagem altamente direcionada.",
    icon: Target,
    features: [
      "Identificação de contas-alvo",
      "Desenvolvimento de estratégias personalizadas",
      "Implementação de campanhas multicanal",
      "Mensuração de resultados e otimização"
    ],
    slug: "abm"
  },
  {
    title: "Sales Enablement",
    description: "Capacitação e ferramentas para potencializar o desempenho da sua equipe de vendas.",
    icon: Users,
    features: [
      "Desenvolvimento de materiais de vendas",
      "Treinamento e capacitação de equipes",
      "Implementação de ferramentas de produtividade",
      "Otimização de processos de vendas"
    ],
    slug: "sales-enablement"
  }
];

const Servicos = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-10 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nossos Serviços</h1>
            <p className="text-xl text-gray-300 mb-8">
              Soluções completas para acelerar o crescimento do seu negócio B2B
              com estratégias baseadas em dados e tecnologia
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-revgreen/10 flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-revgreen" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="mt-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-revgreen mr-2 mt-1">•</span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={`/servicos/${service.slug}`} className="inline-flex items-center text-sm font-medium text-revgreen hover:text-black">
                    Ver detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black text-white rounded-xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Não sabe por onde começar?
                </h2>
                <p className="text-gray-300">
                  Solicite um diagnóstico gratuito e descubra quais serviços são mais adequados 
                  para o momento atual do seu negócio.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button asChild variant="default">
                  <Link to="/diagnostico">
                    Solicitar diagnóstico gratuito
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Servicos;
