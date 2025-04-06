
import { CheckCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ContactForm from '@/components/shared/ContactForm';

const benefits = [
  "Análise completa da sua estratégia digital atual",
  "Identificação de oportunidades de crescimento imediatas",
  "Benchmarks competitivos do seu segmento",
  "Recomendações personalizadas baseadas em dados",
  "Priorização de ações para resultados rápidos",
  "Sugestões de tecnologias e ferramentas adequadas para seu negócio"
];

const DiagnosticoPage = () => {
  return (
    <PageLayout>
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Diagnóstico gratuito de <span className="text-revgreen">crescimento B2B</span>
              </h1>
              
              <p className="text-lg text-gray-700">
                Descubra exatamente onde estão suas maiores oportunidades de crescimento 
                com nosso diagnóstico personalizado. Nossa equipe de especialistas analisará 
                sua operação atual e identificará ações de alto impacto para acelerar seus resultados.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-revgreen mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <ContactForm formType="diagnosis" />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Como funciona o diagnóstico?
            </h2>
            <p className="text-lg text-gray-600">
              Um processo simples e eficiente para identificar oportunidades de crescimento em seu negócio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-revgreen/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-revgreen">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Preenchimento do formulário</h3>
              <p className="text-gray-600">
                Compartilhe informações sobre sua empresa, desafios e objetivos atuais.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-revgreen/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-revgreen">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Análise de especialistas</h3>
              <p className="text-gray-600">
                Nossa equipe analisa seus dados e estratégias atuais com base em benchmarks do mercado.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-revgreen/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-revgreen">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Reunião de apresentação</h3>
              <p className="text-gray-600">
                Apresentamos o diagnóstico com recomendações práticas e um plano de ação.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default DiagnosticoPage;
