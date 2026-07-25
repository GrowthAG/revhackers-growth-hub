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
                "min-h-screen transition-colors duration-300",
                isDark ? "bg-zinc-950 text-white" : "bg-zinc-50/50 text-zinc-900"
            )}>
                <Section
                    variant={isDark ? 'dark' : 'light'}
                    className={cn(
                        "pt-16 pb-12 min-h-screen flex flex-col",
                        centered ? "items-center justify-start text-center" : "items-center justify-start"
                    )}
                >
                    <div className="container-custom max-w-5xl mx-auto relative z-10 w-full mb-auto mt-auto flex flex-col items-center">
                        {/* Standard SaaS Header */}
                        {!hideHeader && (
                            <div className={cn(
                                "mb-8 w-full pb-6 border-b",
                                isDark ? "border-zinc-800" : "border-zinc-200/80",
                                centered && "flex flex-col items-center text-center"
                            )}>
                                <div className={cn("space-y-2 w-full", centered && "flex flex-col items-center")}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#00CC6A] text-black">
                                            INTELIGÊNCIA B2B
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <h1 className={cn(
                                            "text-3xl md:text-4xl font-bold tracking-tight animate-fade-in w-full",
                                            isDark ? "text-white" : "text-zinc-900",
                                            centered && "text-center"
                                        )}>
                                            {title}
                                        </h1>
                                        <p className={cn(
                                            "text-sm md:text-base max-w-xl leading-relaxed font-medium animate-fade-in w-full",
                                            isDark ? "text-zinc-400" : "text-zinc-500",
                                            centered && "text-center mx-auto"
                                        )}>
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content Area */}
                        <div className={cn(
                            "animate-fade-in w-full",
                            centered && "flex flex-col items-center"
                        )}>
                            {children}
                        </div>

                        {/* Governance Footer */}
                        {showGovernanceFooter && (
                            <div className={cn(
                                "mt-24 pt-8 border-t text-center flex flex-col items-center gap-4 w-full",
                                isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-200/80 text-zinc-400"
                            )}>
                                <p className="text-[11px] font-mono leading-relaxed max-w-xl mx-auto font-medium">
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
