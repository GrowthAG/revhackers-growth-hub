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
    const isDark = variant === 'dark';

    return (
        <PageLayout headerVariant={headerVariant}>
            <style>{`
                #chat-widget, 
                #leadconnector-chat-widget, 
                .hl-chat-widget, 
                #hl-chat-widget-container,
                iframe[name="chat-widget"] { 
                    display: none !important; 
                }
            `}</style>
            <div className={cn(
                "min-h-screen transition-colors duration-300 relative overflow-hidden",
                isDark ? "bg-black text-white" : "bg-zinc-50/80 text-zinc-900"
            )}>
                {/* Subtle Grid Pattern */}
                {!isDark && (
                    <div className="absolute inset-0 [background-size:16px_16px] opacity-40 pointer-events-none" />
                )}

                <Section
                    variant={isDark ? 'dark' : 'light'}
                    className={cn(
                        "pt-12 pb-16 min-h-screen flex flex-col justify-start relative z-10",
                        centered ? "items-center" : "items-center"
                    )}
                >
                    <div className="container-custom max-w-4xl mx-auto w-full my-auto flex flex-col items-center">
                        
                        {/* Standard SaaS Header */}
                        {!hideHeader && (
                            <div className="mb-8 w-full text-center space-y-2">
                                <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase">Diagnóstico</p>
                                <h1 className={cn(
                                    "text-2xl md:text-3xl font-bold tracking-tight text-zinc-900",
                                    isDark && "text-white"
                                )}>
                                    {title}
                                </h1>
                                <p className={cn(
                                    "text-sm md:text-base max-w-xl mx-auto text-zinc-500 font-medium leading-relaxed",
                                    isDark && "text-zinc-400"
                                )}>
                                    {subtitle}
                                </p>
                            </div>
                        )}

                        {/* Main Container Card Elevado */}
                        <div className={cn(
                            "w-full transition-all duration-300",
                            hideHeader ? "max-w-5xl" : "max-w-3xl"
                        )}>
                            {children}
                        </div>

                        {/* Governance Footer */}
                        {showGovernanceFooter && (
                            <div className="mt-16 text-center w-full max-w-xl mx-auto">
                                <p className="text-[11px] font-sans text-zinc-400 leading-relaxed font-medium">
                                    RevHackers Intelligence Unit — Diagnóstico preditivo de receita e maturidade operacional B2B.
                                </p>
                            </div>
                        )}
                    </div>
                </Section>
            </div>
        </PageLayout>
    );
};
