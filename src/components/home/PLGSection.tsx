
import { ArrowRight, Zap, Shield, LineChart, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PLGSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Estratégia Product-Led Growth para <span className="text-revgreen">aceleração de resultados</span>
          </h2>
          <p className="text-lg text-gray-600">
            Abandonamos fórmulas genéricas e criamos um método proprietário que coloca seu produto no centro da estratégia de crescimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-start mb-4">
              <div className="mr-4 p-3 bg-green-50 rounded-lg">
                <Zap className="h-6 w-6 text-revgreen" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Crescimento Acelerado</h3>
                <p className="text-gray-600">
                  Nossa metodologia PLG identifica os gatilhos de valor do seu produto e cria experiências que aceleram a adoção pelos usuários, gerando crescimento orgânico sustentável.
                </p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="mr-4 p-3 bg-green-50 rounded-lg">
                <Shield className="h-6 w-6 text-revgreen" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Redução de Fricção</h3>
                <p className="text-gray-600">
                  Eliminamos todos os obstáculos entre seu cliente e o valor que seu produto entrega, criando jornadas fluidas que maximizam conversão e retenção.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-start mb-4">
              <div className="mr-4 p-3 bg-green-50 rounded-lg">
                <LineChart className="h-6 w-6 text-revgreen" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Métricas Orientadas a Valor</h3>
                <p className="text-gray-600">
                  Definimos e monitoramos métricas que realmente importam para seu negócio, conectando diretamente uso do produto à geração de receita recorrente.
                </p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="mr-4 p-3 bg-green-50 rounded-lg">
                <BadgeCheck className="h-6 w-6 text-revgreen" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Comprovação de ROI</h3>
                <p className="text-gray-600">
                  Criamos mecanismos que demonstram o retorno sobre investimento para seus clientes desde os primeiros momentos de uso, facilitando decisões de upgrade.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Button asChild className="bg-revgreen hover:bg-revgreen/90 text-white">
            <Link to="/diagnostico">
              Solicitar um diagnóstico PLG gratuito
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PLGSection;
