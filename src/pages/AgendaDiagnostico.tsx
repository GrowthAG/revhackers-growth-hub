
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';
import Section from '@/components/ui/Section';

const AgendaDiagnosticoPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    // Scroll to top when component mounts
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

      {/* Hero Section (BLACK HERO STANDARD) */}
      <section className="relative py-20 md:py-28 bg-black border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-5">
          <h1 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight text-center max-w-3xl mx-auto">
            Agendar <span className="text-[#00CC6A]">Sessão Estratégica</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center">
            Selecione o melhor horário abaixo no calendário oficial de diagnósticos da RevHackers.
          </p>
        </div>
      </section>

      {/* Main Section — Fundo 100% Branco Puro */}
      <section className="py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
        <div className="container-custom w-full max-w-5xl mx-auto px-6">

          {/* Calendar Container */}
          <div className="bg-white overflow-hidden rounded-xl border border-zinc-200/80 shadow-xs relative min-h-[750px]">
            <iframe
              src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${buildQueryParams()}`}
              style={{
                width: '100%',
                border: 'none',
                minHeight: '750px',
                backgroundColor: '#ffffff'
              }}
              id="sKnL4ucDKohNmqj1hn6H_1744205651626"
              title="Agendar diagnóstico"
            />
          </div>

          {/* Footer minimalista */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-wider">
              ← Voltar para Home
            </Link>
          </div>
        </div>
      </section>
};

export default AgendaDiagnosticoPage;
