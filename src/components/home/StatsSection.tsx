
import { Card } from '@/components/ui/card';
import { TrendingUp, Target, BarChart3, Users } from 'lucide-react';

const stats = [
  {
    value: "150+",
    label: "Empresas B2B atendidas",
    description: "Em diversos segmentos e portes",
    icon: Users
  },
  {
    value: "32%",
    label: "Aumento médio em vendas",
    description: "Nos primeiros 6 meses de implementação",
    icon: TrendingUp
  },
  {
    value: "5x",
    label: "ROI médio",
    description: "Retorno sobre investimento no primeiro ano",
    icon: Target
  },
  {
    value: "24%",
    label: "Redução média de churn",
    description: "Após implementação de RevOps",
    icon: BarChart3
  }
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Resultados que entregamos
          </h2>
          <p className="text-lg text-gray-600">
            Números que comprovam a eficácia da nossa metodologia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md p-8 text-center hover:shadow-lg transition-all duration-300 group">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-revgreen mb-6 group-hover:bg-revgreen group-hover:text-white transition-colors">
                  <IconComponent className="h-7 w-7" />
                </div>
                <p className="text-4xl md:text-5xl font-bold text-revgreen mb-2">{stat.value}</p>
                <p className="text-lg font-semibold mb-2">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
