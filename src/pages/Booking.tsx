
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';

const BookingPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Load user data from localStorage
    const storedData = getFormData();
    if (storedData) {
      const userName = storedData.name || `${storedData.firstName || ''} ${storedData.lastName || ''}`.trim();
      setUserData({
        name: userName,
        email: storedData.email || '',
      });
      
      console.log('Retrieved form data for booking:', storedData);
    }
    
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
      <section className="pt-0 pb-16 bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="w-full h-[30vh] relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
            alt="Código e desenvolvimento" 
            className="w-full h-full object-cover object-center brightness-[0.4]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container-custom text-center">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 drop-shadow-lg">
                Agende uma conversa com nossa equipe técnica
              </h1>
              <p className="text-base text-gray-100 max-w-2xl mx-auto drop-shadow-md">
                Escolha o melhor horário para conversarmos sobre suas necessidades de Revenue Operations, 
                estratégias técnicas e implementação de soluções para sua empresa.
              </p>
            </div>
          </div>
        </div>
        
        <div className="container-custom mt-8">
          {userData.name && (
            <div className="mb-8 max-w-3xl mx-auto text-center">
              <Card className="bg-green-900/30 border-green-800 p-4 rounded-xl inline-block">
                <p className="text-white">
                  Olá <strong>{userData.name}</strong>, você está quase lá! 
                  <br />Agora é só escolher o melhor horário para nossa conversa técnica.
                </p>
              </Card>
            </div>
          )}
          
          <div className="booking-calendar-container bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
              Selecione a data e horário para nossa conversa
            </h3>
            <div className="w-full">
              <iframe 
                src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${userData.email ? `?email=${encodeURIComponent(userData.email)}` : ''}`}
                style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
                scrolling="no" 
                id="sKnL4ucDKohNmqj1hn6H_1744205651626"
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6">O que discutiremos na nossa sessão técnica</h2>
            <p className="text-gray-700 mb-8">
              Durante nossa reunião, vamos analisar seus sistemas atuais,
              apresentar soluções técnicas de Revenue Operations e 
              discutir como podemos implementar melhorias em sua infraestrutura digital.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                <div className="text-revgreen font-bold text-xl mb-3">01</div>
                <h3 className="font-bold text-lg mb-2">Diagnóstico Técnico</h3>
                <p className="text-gray-600">
                  Análise de suas ferramentas atuais, sistemas e desafios específicos
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                <div className="text-revgreen font-bold text-xl mb-3">02</div>
                <h3 className="font-bold text-lg mb-2">Soluções</h3>
                <p className="text-gray-600">
                  Apresentação das melhores ferramentas e metodologias para seu cenário
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                <div className="text-revgreen font-bold text-xl mb-3">03</div>
                <h3 className="font-bold text-lg mb-2">Implementação</h3>
                <p className="text-gray-600">
                  Plano detalhado de execução com cronograma e métricas de sucesso
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
