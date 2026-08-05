import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';

const BOOKING_URL = 'https://pages.revhackers.com.br/widget/booking/frZ10gIRdS8iNvtlGq3q';
const IFRAME_ID = 'frZ10gIRdS8iNvtlGq3q_1775165036136';

const AgendaGiulliano = () => {
    useEffect(() => {
        const scriptId = "revhackers-booking-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://pages.revhackers.com.br/js/form_embed.js";
            script.type = "text/javascript";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <PageLayout>
            <SEO title="Agende Agora com Giulliano Alves" description="Agende sua sessão estratégica de 30 minutos com Giulliano Alves — Revenue Operations e Growth B2B." canonical="https://revhackers.com.br/agenda-giulliano" />
            <div className="min-h-screen bg-white flex flex-col">
                {/* Header com foto + headline */}
                <div className="w-full pt-28 pb-6 px-4">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        <img
                            src="/uploads/giulliano-linkedin-profile.png"
                            alt="Giulliano Alves"
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover object-[center_15%] border border-zinc-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-1">
                                Agende Agora
                            </h1>
                            <p className="text-sm text-zinc-500 font-medium">
                                Escolha o melhor horário para conversarmos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Calendario embed */}
                <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-8">
                    <iframe
                        src={BOOKING_URL}
                        id={IFRAME_ID}
                        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                        scrolling="no"
                        title="Agendar horário com Giulliano Alves"
                    />
                </div>
            </div>
        </PageLayout>
    );
};

export default AgendaGiulliano;
