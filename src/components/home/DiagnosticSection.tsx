
import { CheckCircle } from 'lucide-react';
import ContactForm from '../shared/ContactForm';

const benefits = [
  "Análise completa do stack tecnológico e fluxo de dados entre marketing, vendas e CS",
  "Identificação de lacunas de automação e ineficiências em seu funil de receita",
  "Comparativo de maturidade em RevOps com os líderes do seu segmento",
  "Plano estratégico customizado para integração de sistemas e melhoria de processos",
  "Cálculo de ROI com aplicação de sistemas integrados e automações",
  "Roteiro técnico e estratégico para implementação estruturada"
];

const DiagnosticSection = () => {
  return (
    <section id="diagnostico" className="section-padding bg-black text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Diagnóstico executivo de <span className="text-[#00cf00]">Revenue Operations</span>
            </h2>
            
            <p className="text-lg text-gray-300">
              Nossa análise estratégica mapeia sua infraestrutura completa de crescimento B2B e identifica 
              oportunidades concretas para aumentar eficiência, reduzir CAC e maximizar LTV. 
              Desenvolvido especialmente para CEOs e diretores que precisam expandir receita 
              de forma consistente e escalável.
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
