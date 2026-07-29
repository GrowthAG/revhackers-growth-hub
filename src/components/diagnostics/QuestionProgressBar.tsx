import React from 'react';
import { cn } from '@/lib/utils';

interface QuestionProgressBarProps {
    current: number;
    total: number;
    variant?: 'light' | 'dark';
}

export const QuestionProgressBar = ({ current, total, variant = 'dark' }: QuestionProgressBarProps) => {
    const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-bold text-zinc-900">
                    Etapa {current + 1} de {total}
                </span>
                <span className="text-zinc-500 font-medium flex items-center gap-1">
                    <span>⏱</span> ~1 min de análise
                </span>
            </div>
            <div className={cn(
                "h-2 w-full rounded-full overflow-hidden p-0.5 border",
                variant === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200/80"
            )}>
                <div
                    className="h-full rounded-full bg-[#00CC6A] transition-all duration-500 ease-out shadow-[0_0_10px_#00CC6A]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
