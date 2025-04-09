
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';

const BookingPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
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
        phone: storedData.phone || '',
        company: storedData.company || '',
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

  // Build query parameters for the iframe URL
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (userData.email) params.append('email', userData.email);
    if (userData.name) params.append('name', userData.name);
    if (userData.phone) params.append('phone', userData.phone);
    if (userData.company) params.append('company', userData.company);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  return (
    <PageLayout>
      <section className="pt-0 pb-12 bg-gradient-to-b from-black via-gray-900 to-black text-white">
        <div className="w-full h-[35vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-900 opacity-95"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container-custom text-center">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 animate-fade-in">
                <span className="text-revgreen">Agende</span> sua consulta técnica
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in">
                Escolha o melhor horário para conversarmos sobre suas necessidades 
                e discutir soluções sob medida para seu negócio.
              </p>
            </div>
          </div>
        </div>
        
        <div className="container-custom mt-12">
          {userData.name && (
            <div className="mb-8 max-w-3xl mx-auto text-center">
              <Card className="bg-gradient-to-r from-green-900/60 to-green-800/30 border-green-700/50 p-5 rounded-xl inline-block shadow-lg animate-fade-in">
                <p className="text-white text-lg">
                  Olá <span className="font-bold text-revgreen">{userData.name}</span>, você está quase lá! 
                  <br />Agora é só escolher o melhor horário para nossa conversa técnica.
                </p>
              </Card>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-b from-gray-800/80 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-6 md:p-8 animate-fade-in">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
                <span className="text-revgreen">Selecione</span> a data e horário
              </h3>
              
              <div className="booking-calendar-wrapper relative bg-gray-800/50 rounded-lg overflow-hidden p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-revgreen/5 to-transparent opacity-40"></div>
                <iframe 
                  src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${buildQueryParams()}`}
                  style={{ 
                    width: '100%', 
                    border: 'none', 
                    overflow: 'hidden', 
                    backgroundColor: 'transparent'
                  }} 
                  scrolling="no" 
                  id="sKnL4ucDKohNmqj1hn6H_1744205651626"
                  title="Agendar consulta"
                  className="min-h-[700px] relative z-10"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-b from-gray-100 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">O que discutiremos na nossa sessão</h2>
            <p className="text-gray-700 mb-10 text-lg">
              Durante nossa reunião, vamos analisar seus sistemas e
              discutir soluções técnicas personalizadas para seu negócio.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card className="relative bg-white p-6 rounded-xl border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-revgreen/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-revgreen to-revgreen/80 rounded-xl flex items-center justify-center text-xl font-bold text-black mb-4 shadow-md">01</div>
                  <h3 className="font-bold text-xl mb-3">Diagnóstico Técnico</h3>
                  <p className="text-gray-600">
                    Análise de suas ferramentas, sistemas e desafios específicos de operação
                  </p>
                </div>
              </Card>
              
              <Card className="relative bg-white p-6 rounded-xl border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-revgreen/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-revgreen to-revgreen/80 rounded-xl flex items-center justify-center text-xl font-bold text-black mb-4 shadow-md">02</div>
                  <h3 className="font-bold text-xl mb-3">Soluções Técnicas</h3>
                  <p className="text-gray-600">
                    Apresentação das melhores ferramentas e metodologias para seu cenário
                  </p>
                </div>
              </Card>
              
              <Card className="relative bg-white p-6 rounded-xl border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-revgreen/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-revgreen to-revgreen/80 rounded-xl flex items-center justify-center text-xl font-bold text-black mb-4 shadow-md">03</div>
                  <h3 className="font-bold text-xl mb-3">Implementação</h3>
                  <p className="text-gray-600">
                    Plano detalhado de execução com cronograma e métricas de sucesso
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
