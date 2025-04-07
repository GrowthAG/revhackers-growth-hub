
import { CheckCircle } from 'lucide-react';
import ContactForm from '../shared/ContactForm';
import BookingWidget from '../shared/BookingWidget';

const benefits = [
  "Análise completa de sua operação de vendas e marketing",
  "Identificação de oportunidades de automação e otimização",
  "Diagnóstico de maturidade em RevOps e Revenue Intelligence",
  "Recomendações personalizadas para seu modelo de negócio",
  "Benchmarks do seu segmento de mercado",
  "Plano de ação priorizado para resultados rápidos"
];

const DiagnosticSection = () => {
  return (
    <section className="section-padding bg-black text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Diagnóstico gratuito de <span className="text-revgreen">Revenue Operations</span>
            </h2>
            
            <p className="text-lg text-gray-300">
              Entenda onde estão suas maiores oportunidades de crescimento B2B e quais 
              estratégias baseadas em dados podem acelerar seus resultados.
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
          
          <div className="bg-white text-black p-8 rounded-xl shadow-xl">
            <ContactForm formType="diagnosis" />
          </div>
        </div>
        
        <div className="mt-20">
          <BookingWidget />
        </div>
      </div>
    </section>
  );
};

export default DiagnosticSection;
