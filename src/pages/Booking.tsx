
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';

const BookingPage = () => {
  useEffect(() => {
    // Create a script element for the form embed
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Add the script to the document
    document.body.appendChild(script);
    
    // Clean up function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <PageLayout>
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Agende uma conversa com nossa equipe
            </h1>
            <p className="text-lg text-gray-300">
              Escolha o melhor horário para conversarmos sobre suas necessidades de Revenue Operations, 
              estratégias de marketing B2B e crescimento para sua empresa.
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="booking-calendar-container bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">
              Selecione a data e horário para nossa conversa
            </h3>
            <div className="w-full">
              <iframe 
                src="https://team.growthagency.com.br/widget/booking/q8iihQ5MnZfqRAHh3KZz" 
                style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
                scrolling="no" 
                id="q8iihQ5MnZfqRAHh3KZz_1743983913878"
                title="Agendar consulta"
                className="min-h-[700px]"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">O que esperar da nossa conversa</h2>
            <p className="text-gray-700 mb-8">
              Durante nossa reunião, vamos entender seus desafios atuais, 
              apresentar soluções customizadas de Revenue Operations e 
              discutir como podemos ajudar sua empresa a crescer.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-revgreen font-bold text-xl mb-3">01</div>
                <h3 className="font-bold text-lg mb-2">Entendimento</h3>
                <p className="text-gray-600">
                  Compreenderemos seus desafios atuais e objetivos de negócio
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-revgreen font-bold text-xl mb-3">02</div>
                <h3 className="font-bold text-lg mb-2">Diagnóstico</h3>
                <p className="text-gray-600">
                  Identificaremos oportunidades e áreas de melhoria em seu funil de vendas
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-revgreen font-bold text-xl mb-3">03</div>
                <h3 className="font-bold text-lg mb-2">Proposta</h3>
                <p className="text-gray-600">
                  Apresentaremos um plano de ação personalizado para seu negócio
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
