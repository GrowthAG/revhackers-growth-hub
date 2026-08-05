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
            <SEO title="Sessão técnica com Giulliano Alves, Founder RevHackers" description="30 minutos comigo para mapear onde sua máquina de receita B2B está travando. Sem discurso de vendas, sem enrolação." canonical="https://revhackers.com.br/agenda-giulliano" />
            <div className="min-h-screen bg-white flex flex-col">
                {/* Header com foto + headline */}
                <div className="w-full pt-28 pb-8 px-4">
                    <div className="max-w-2xl mx-auto flex items-center gap-5">
                        <img
                            src="/uploads/giulliano-linkedin-profile.png"
                            alt="Giulliano Alves"
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover object-[center_15%] border border-zinc-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1.5">
                                Sessão 1:1 com o Founder
                            </p>
                            <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight leading-[1.05] mb-1.5">
                                Vamos achar o gargalo da sua receita.
                            </h1>
                            <p className="text-sm md:text-[15px] text-zinc-500 font-medium leading-relaxed">
                                30 minutos comigo, sem discurso de vendas. Eu mesmo reviso seu funil e te digo, na hora, onde está travando.
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
