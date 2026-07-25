import React from 'react';
import { ArrowRight, UserCircle, Gauge, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ContextualCTAProps {
    title: string;
    category: string;
}

const ContextualCTA = ({ title, category }: ContextualCTAProps) => {
    const text = (title + ' ' + category).toLowerCase();

    let type: 'founder' | 'revenue' | 'site' | 'general' = 'general';

    if (text.includes('linkedin') || text.includes('founder') || text.includes('marca pessoal') || text.includes('social selling')) {
        type = 'founder';
    } else if (text.includes('site') || text.includes('landing page') || text.includes('cro') || text.includes('performance') || text.includes('velocidade')) {
        type = 'site';
    } else if (text.includes('vendas') || text.includes('receita') || text.includes('outbound') || text.includes('comercial')) {
        type = 'revenue';
    }

    if (type === 'general') return null;

    const data = {
        founder: {
            title: "Audite sua Autoridade no LinkedIn",
            desc: "Descubra se seu perfil de Founder está gerando leads ou afastando oportunidades. Diagnóstico preditivo gratuito.",
            btn: "Iniciar Founder Score",
            link: "/score-founder",
            icon: <UserCircle className="w-6 h-6 text-zinc-800" />
        },
        revenue: {
            title: "Diagnóstico de Receita B2B",
            desc: "Identifique onde estão os gargalos que impedem sua operação de escalar previsivelmente.",
            btn: "Análise de Revenue Ops",
            link: "/score-revenue",
            icon: <Gauge className="w-6 h-6 text-zinc-800" />
        },
        site: {
            title: "Seu Site Converte ou Só Ocupa Espaço?",
            desc: "Descubra em 2 minutos se sua infraestrutura digital está otimizada para tráfego e conversão.",
            btn: "Verificar Site Score",
            link: "/score-site",
            icon: <Globe className="w-6 h-6 text-zinc-800" />
        },
        general: { title: "", desc: "", btn: "", link: "", icon: null }
    }[type];

    return (
        <div className="my-10 w-full">
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8 hover:border-zinc-300 transition-all duration-300 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                        {data.icon}
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00CC6A] text-black">
                                RECOMENDADO
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                            {data.title}
                        </h3>
                        <p className="text-xs text-zinc-500 font-normal leading-relaxed max-w-xl">
                            {data.desc}
                        </p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <Link to={data.link}>
                            <Button className="w-full md:w-auto h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg font-bold text-xs shadow-none gap-2 flex items-center border border-zinc-800 transition-all">
                                <span>{data.btn}</span>
                                <ArrowRight size={14} className="text-[#00CC6A]" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContextualCTA;
