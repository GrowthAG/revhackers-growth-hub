
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

const journeySteps = [
  {
    title: "Alinhamento inicial",
    items: [
      "Alinhamento das equipes de marketing, vendas e sucesso do cliente",
      "Definição de metas e métricas compartilhadas",
      "Criação de um plano estratégico integrado"
    ]
  },
  {
    title: "Implantação",
    items: [
      "Implementação de tecnologias de automação",
      "Integração de ferramentas de CRM e análise de dados",
      "Capacitação das equipes com treinamentos específicos"
    ]
  },
  {
    title: "Acompanhamento",
    items: [
      "Monitoramento contínuo do desempenho das equipes",
      "Ajuste de estratégias com base em análises de dados",
      "Comunicação frequente para alinhamento de objetivos"
    ]
  },
  {
    title: "Ajustes constantes",
    items: [
      "Identificação e eliminação de pontos de barreira",
      "Otimização dos processos de atendimento ao cliente",
      "Aumento da eficiência nas transições entre equipes"
    ]
  },
  {
    title: "Análise de resultados",
    items: [
      "Medição de resultados e ajustes necessários",
      "Feedback constante entre as equipes",
      "Refinamento contínuo das estratégias aplicadas"
    ]
  },
  {
    title: "Escala e expansão",
    items: [
      "Escala das operações com base nos resultados obtidos",
      "Expansão das campanhas de marketing e vendas",
      "Implementação de melhorias contínuas para sustentabilidade"
    ]
  }
];

const JourneySection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Como será sua jornada
          </h2>
          <p className="text-lg text-gray-600">
            Acompanhamos cada passo do seu marketing e jornada do cliente, alinhando equipes e 
            otimizando operações para aumentar a eficiência do seu time de vendas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {journeySteps.map((step, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow p-6">
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <ul className="space-y-3">
                {step.items.map((item, idx) => (
                  <li key={idx} className="flex">
                    <div className="mr-3 mt-1">
                      <Check className="h-5 w-5 text-revgreen" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
