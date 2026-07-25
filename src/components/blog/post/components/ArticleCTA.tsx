import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ArticleCTAProps {
    title?: string;
    description?: string;
    primaryBtnText?: string;
    secondaryBtnText?: string;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
}

const ArticleCTA = ({
    title = "Pronto para escalar sua operação?",
    description = "Transforme sua operação comercial com nossa infraestrutura de Growth e inteligência de receita.",
    primaryBtnText = "Agendar Diagnóstico",
    secondaryBtnText,
    onPrimaryClick,
    onSecondaryClick
}: ArticleCTAProps) => {
    return (
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-8 md:p-10 text-left relative overflow-hidden my-12 shadow-xs space-y-6">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#00CC6A] text-black">
                    <Sparkles size={12} /> PRÓXIMO PASSO
                </span>
            </div>

            <div className="space-y-3 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight leading-snug">
                    {title}
                </h2>

                <p className="text-sm md:text-base text-zinc-600 font-normal leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                    className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-10 px-5 text-xs font-bold tracking-wide shadow-none gap-2 flex items-center transition-all border border-zinc-800"
                    onClick={onPrimaryClick}
                >
                    <span>{primaryBtnText}</span>
                    <ArrowRight size={15} className="text-[#00CC6A]" />
                </Button>

                {secondaryBtnText && (
                    <Button
                        variant="outline"
                        className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg h-10 px-5 text-xs font-bold tracking-wide transition-all"
                        onClick={onSecondaryClick}
                    >
                        {secondaryBtnText}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ArticleCTA;
