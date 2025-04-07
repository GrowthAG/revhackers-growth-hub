
import { CheckCircle } from 'lucide-react';
import ContactForm from '../shared/ContactForm';

const benefits = [
  "Análise holística do seu tech stack e fluxo de dados entre marketing, vendas e CS",
  "Identificação de lacunas de automação e ineficiências em seu funil de receita",
  "Avaliação de maturidade em RevOps comparada aos líderes do seu setor",
  "Plano estratégico personalizado para integração de sistemas e otimização de processos",
  "Projeção de ROI com implementação de sistemas integrados e automações",
  "Roadmap técnico e estratégico para implementação em fases"
];

const DiagnosticSection = () => {
  return (
    <section className="section-padding bg-black text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Diagnóstico executivo de <span className="text-[#00cf00]">Revenue Operations</span>
            </h2>
            
            <p className="text-lg text-gray-300">
              Uma análise completa da sua infraestrutura de crescimento B2B para CEOs e diretores
              que buscam escalar receita de forma previsível e eficiente.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#00cf00] mr-3 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white text-black p-8 rounded-xl shadow-xl">
            <ContactForm formType="diagnosis" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagnosticSection;
