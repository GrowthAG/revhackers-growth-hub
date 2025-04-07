
import { Calendar, Laptop, Layers, Rocket, Target, TrendingUp, Users, Zap } from 'lucide-react';

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isEven: boolean;
}

const TimelineItem = ({ year, title, description, icon, isEven }: TimelineItemProps) => {
  return (
    <div className="relative mb-20">
      <div className="flex flex-col md:flex-row items-center">
        {isEven ? (
          <>
            <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
              <h3 className="text-2xl font-bold text-revgreen mb-2">{year}</h3>
              <h4 className="text-xl font-semibold mb-3">{title}</h4>
              <p className="text-gray-600">{description}</p>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-start order-1 md:order-2 mb-6 md:mb-0">
              <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                {icon}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="md:w-1/2 flex justify-center md:justify-end order-1 mb-6 md:mb-0">
              <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                {icon}
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 md:text-left order-2">
              <h3 className="text-2xl font-bold text-revgreen mb-2">{year}</h3>
              <h4 className="text-xl font-semibold mb-3">{title}</h4>
              <p className="text-gray-600">{description}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TimelineSection = () => {
  const timelineItems = [
    {
      year: "2012-2013",
      title: "Início com websites e landing pages",
      description: "Começamos desenvolvendo websites e páginas de vendas para pequenas empresas, focados em design responsivo e conversões.",
      icon: <Laptop className="text-white w-8 h-8" />
    },
    {
      year: "2014-2015",
      title: "Expansão para mídias sociais",
      description: "Expandimos nossa oferta para incluir gestão de mídias sociais e estratégias de conteúdo, ajudando empresas a construir presença online consistente.",
      icon: <Users className="text-white w-8 h-8" />
    },
    {
      year: "2016-2017",
      title: "Tráfego pago e análise de dados",
      description: "Implementamos estratégias avançadas de tráfego pago e começamos a aplicar análise de dados para otimização de campanhas e ROI mensurável.",
      icon: <TrendingUp className="text-white w-8 h-8" />
    },
    {
      year: "2018-2019",
      title: "Funis de vendas completos",
      description: "Desenvolvemos metodologias para criação e otimização de funis de vendas completos, integrando marketing e vendas em processos fluidos.",
      icon: <Layers className="text-white w-8 h-8" />
    },
    {
      year: "2020-2021",
      title: "Automação de marketing",
      description: "Implementamos soluções avançadas de automação de marketing e vendas, permitindo escalabilidade e personalização das jornadas de clientes.",
      icon: <Zap className="text-white w-8 h-8" />
    },
    {
      year: "2022-2023",
      title: "RevOps e ABM",
      description: "Criamos nossa metodologia RevOps e implementamos estratégias de Account-Based Marketing (ABM) para empresas B2B que buscam crescimento estratégico.",
      icon: <Target className="text-white w-8 h-8" />
    },
    {
      year: "2024-2025",
      title: "Ecossistema completo",
      description: "Nos tornamos um ecossistema completo de educação, marketing, vendas e tecnologia, oferecendo soluções integradas para o crescimento sustentável de empresas B2B.",
      icon: <Rocket className="text-white w-8 h-8" />
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Nossa evolução
          </h2>
          <p className="text-lg text-gray-600">
            De 2012 a 2025: Uma jornada de inovação e crescimento exponencial
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline central line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-revgreen/30"></div>
          
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={item.year}
              year={item.year}
              title={item.title}
              description={item.description}
              icon={item.icon}
              isEven={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
