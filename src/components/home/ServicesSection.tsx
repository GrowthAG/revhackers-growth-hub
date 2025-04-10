
import { ArrowRight, LineChart, Database, Zap, Bot, Layers, GitMerge, HeartPulse, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "Automação de Revenue",
    description: "Fluxos inteligentes que conectam marketing, vendas e CS para eliminar tarefas manuais e criar resultados concretos.",
    icon: Bot,
    link: "/servicos/automacao"
  },
  {
    title: "Revenue Intelligence",
    description: "Transforme dados brutos em decisões estratégicas precisas e antecipe comportamentos de compra no cenário B2B.",
    icon: Database,
    link: "/servicos/revenue-intelligence"
  },
  {
    title: "Revenue Operations",
    description: "Alinhamento estratégico entre departamentos com métricas e tecnologias que efetivamente geram crescimento.",
    icon: LineChart,
    link: "/servicos/revops"
  },
  {
    title: "Integração de Sistemas",
    description: "Conectamos suas ferramentas de CRM, Marketing e CS em um ecossistema tecnológico sem barreiras de dados.",
    icon: GitMerge,
    link: "/servicos/integracoes"
  },
  {
    title: "Customer Success",
    description: "Estratégias para maximizar a retenção e expansão da sua base de clientes através de experiências excepcionais.",
    icon: HeartPulse,
    link: "/servicos/customer-success"
  },
  {
    title: "Account Based Marketing",
    description: "Estratégias personalizadas para conquistar contas estratégicas com abordagem altamente direcionada.",
    icon: Target,
    link: "/servicos/abm"
  },
  {
    title: "Sales Enablement",
    description: "Capacitação e ferramentas para potencializar o desempenho da sua equipe de vendas.",
    icon: Users,
    link: "/servicos/sales-enablement"
  }
];

const ServicesSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-lg mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Soluções de RevOps para seu crescimento B2B
          </h2>
          <p className="text-lg text-gray-600">
            Criamos o alinhamento entre pessoas, processos e plataformas para gerar resultados consistentes e mensuráveis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((service, index) => (
            <Card key={index} className="card-hover border border-gray-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-revgreen/10 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-revgreen" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-6">{service.description}</CardDescription>
                <Link to={service.link} onClick={scrollToTop} className="inline-flex items-center text-sm font-medium text-revgreen hover:text-black">
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button asChild variant="default">
            <Link to="/servicos" onClick={scrollToTop}>
              Ver todos os serviços
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
