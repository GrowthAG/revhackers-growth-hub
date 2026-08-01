import React from 'react';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

interface DiagnosticLayoutProps {
 children: React.ReactNode;
 title: string;
 subtitle: string;
 showGovernanceFooter?: boolean;
 variant?: 'light' | 'dark';
 centered?: boolean;
 hideHeader?: boolean;
 headerVariant?: 'default' | 'light';
}

export const DiagnosticLayout = ({
 children,
 title,
 subtitle,
 showGovernanceFooter = true,
 variant = 'light',
 centered = true,
 hideHeader = false,
 headerVariant = 'default'
}: DiagnosticLayoutProps) => {
 return (
   <PageLayout headerVariant="default">
     <style>{`
       #chat-widget, 
       #leadconnector-chat-widget, 
       .hl-chat-widget, 
       #hl-chat-widget-container,
       iframe[name="chat-widget"] { 
         display: none !important; 
       }
     `}</style>

     {/* 1. Official Black Hero Header */}
     {!hideHeader && (
       <section className="bg-black py-16 md:py-24 border-b border-zinc-900 relative overflow-hidden">
         <div className="max-w-4xl mx-auto px-6 text-center space-y-4 relative z-10">
           <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase">
             Diagnóstico Preditivo B2B
           </p>
           <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
             {title}
           </h1>
           <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
             {subtitle}
           </p>
         </div>
       </section>
     )}

     {/* 2. Pure White Content Area */}
     <section className="py-16 md:py-24 bg-white min-h-[60vh]">
       <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
         <div className={cn(
           "w-full transition-all duration-300",
           hideHeader ? "max-w-5xl" : "max-w-3xl"
         )}>
           {children}
         </div>

         {showGovernanceFooter && (
           <div className="mt-16 text-center w-full max-w-xl mx-auto border-t border-zinc-100 pt-8">
             <p className="text-xs font-sans text-zinc-400 leading-relaxed font-medium">
               RevHackers Intelligence Unit — Diagnóstico preditivo de receita e maturidade operacional B2B.
             </p>
           </div>
         )}
       </div>
     </section>
   </PageLayout>
 );
};
