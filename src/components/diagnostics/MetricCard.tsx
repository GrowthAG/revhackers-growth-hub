import React from 'react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
 label: string;
 value: string | number;
 description?: string;
 subtext?: string;
 status?: 'neutral' | 'success' | 'warning' | 'critical';
 className?: string;
 variant?: 'light' | 'dark';
}

export const MetricCard = ({ label, value, description, subtext, status = 'neutral', className, variant = 'dark' }: MetricCardProps) => {

 const getStatusColor = (s: string) => {
 switch (s) {
 case 'success': return variant === 'dark' ? 'bg-revgreen' : 'bg-white';
 case 'warning': return 'bg-zinc-400';
 case 'critical': return variant === 'dark' ? 'bg-zinc-300' : 'bg-white';
 default: return variant === 'dark' ? 'bg-zinc-50' : 'bg-zinc-200';
 }
 };

 return (
 <div className={cn(
 "p-6 border transition-colors duration-300 h-full flex flex-col justify-between group",
 variant === 'dark'
 ? "border-zinc-200 bg-white/50 hover:border-zinc-200"
 : "border-zinc-200 bg-zinc-50 hover:border-zinc-300",
 className
 )}>
 <div className="flex justify-between items-start mb-6">
 <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-500 transition-colors">
 {label}
 </span>
 <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(status))} />
 </div>

 <div className="mb-4">
 <span className={cn(
 "text-lg md:text-xl font-bold block lowercase",
 variant === 'dark' ? "text-zinc-900" : "text-black"
 )}>
 {value}
 </span>
 </div>

 <div className="mt-auto">
 {description && (
 <p className={cn(
 "text-xs font-bold mb-1 ",
 variant === 'dark' ? "text-zinc-500" : "text-zinc-500"
 )}>
 {description}
 </p>
 )}
 {subtext && (
 <p className="text-xs text-zinc-500 leading-tight font-medium">
 {subtext}
 </p>
 )}
 </div>
 </div>
 );
};
