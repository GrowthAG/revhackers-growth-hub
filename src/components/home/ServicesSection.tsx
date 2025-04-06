
import { ArrowRight, LineChart, Database, Zap, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "Automação de Revenue",
    description: "Automatizamos processos comerciais e de marketing para gerar mais resultados com menos esforço.",
    icon: Bot,
    link: "/servicos/automacao"
  },
  {
    title: "Revenue Intelligence",
    description: "Análise e insights a partir dos seus dados para melhorar a tomada de decisão em vendas e marketing.",
    icon: Database,
    link: "/servicos/revenue-intelligence"
  },
  {
    title: "Revenue Operations",
    description: "Alinhamento entre marketing, vendas e CS para uma gestão integrada do funil de vendas.",
    icon: LineChart,
    link: "/servicos/revops"
  },
  {
    title: "Customer Success",
    description: "Estratégias para maximizar a retenção e expansão da sua base de clientes.",
    icon: Zap,
    link: "/servicos/customer-success"
  }
];

const ServicesSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-lg mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Soluções estratégicas para crescimento B2B
          </h2>
          <p className="text-lg text-gray-600">
            Combinamos tecnologia de ponta e metodologias comprovadas para acelerar seu crescimento.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="card-hover border border-gray-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-revgreen/10 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-revgreen" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-6">{service.description}</CardDescription>
                <Link to={service.link} className="inline-flex items-center text-sm font-medium text-revgreen hover:text-black">
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button asChild variant="default">
            <Link to="/servicos">
              Ver todos os serviços
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
