import { ArrowRight } from 'lucide-react';

interface DiagnosticActionSectionProps {
 title: string;
 subtitle?: string;
 ctaText?: string;
 ctaLink?: string;
 onCtaClick?: () => void;
 variant?: 'white' | 'dark';
}

export const DiagnosticActionSection = ({
 title,
 subtitle = "Sessão gratuita de Diagnóstico Estratégico para detalhamento desses pilares.",
 ctaText = "AGENDAR DIAGNÓSTICO",
 ctaLink = "https://cal.com/revhackers/diagnostico",
 onCtaClick
}: DiagnosticActionSectionProps) => {
 return (
 <div className="w-full bg-white px-4 md:px-0 py-20 border-t border-zinc-100">
 <div className="max-w-6xl mx-auto space-y-32">

 {/* Copy Section */}
 <div className="text-center bg-zinc-50 p-12 md:p-20 border border-zinc-100">
 <div className="max-w-3xl mx-auto space-y-12">
 <div className="space-y-6">
 <span className="text-xs font-sans font-bold text-zinc-500 uppercase tracking-wider">Próximos Passos</span>
 <h2 className="text-2xl md:text-3xl font-bold text-black leading-none italic">
 {title}
 </h2>
 <p className="text-zinc-500 text-lg font-medium leading-relaxed font-sans">
 {subtitle}
 </p>
 </div>

 <div className="flex flex-col items-center gap-8">
 <a
 href={onCtaClick ? undefined : ctaLink}
 onClick={(e) => {
 if (onCtaClick) {
 e.preventDefault();
 onCtaClick();
 }
 }}
 target={onCtaClick ? undefined : "_blank"}
 rel={onCtaClick ? undefined : "noopener noreferrer"}
 className="group relative px-20 py-8 bg-white text-zinc-900 hover:bg-zinc-50 font-bold text-xs transition-all duration-500 rounded-none overflow-hidden shadow-sm cursor-pointer"
 >
 <span className="relative z-10 flex items-center gap-4">
 {ctaText} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
 </span>
 </a>
 <div className="flex items-center gap-4 text-xs text-zinc-500 font-bold">
 <span>TIME_SLOTS: LIMITED</span>
 <div className="w-px h-3 bg-zinc-200" />
 <span>EXCLUSIVO_PARA_FOUNDERS</span>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 );
};
