import React from 'react';
import { 
    Sparkles, 
    ShieldCheck, 
    Activity, 
    FolderKanban, 
    Cpu, 
    Target, 
    UserCheck, 
    CheckCircle2,
    TrendingUp,
    Building2,
    Globe,
    Database,
    BarChart2,
    Clock,
    Lock,
    Search,
    LucideProps
} from 'lucide-react';

/**
 * RevHackers Black & Green Vector Icon System Library
 * Strictly bans emojis/emoticons and replaces them with sleek black & green (#00CC6A) vector icons:
 * - Card Icon Badge: bg-zinc-950 text-[#00CC6A] border-zinc-800
 * - Inline Icon: text-[#00CC6A]
 */

export interface RevIconProps extends LucideProps {
    className?: string;
    size?: number;
}

// 1. Icones Vetoriais Puros (Lucide-React)
export const RevIcon = {
    Sparkles: (props: RevIconProps) => <Target size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Shield: (props: RevIconProps) => <ShieldCheck size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Activity: (props: RevIconProps) => <Activity size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Kanban: (props: RevIconProps) => <FolderKanban size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Cpu: (props: RevIconProps) => <Cpu size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Target: (props: RevIconProps) => <Target size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    User: (props: RevIconProps) => <UserCheck size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Check: (props: RevIconProps) => <CheckCircle2 size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Trending: (props: RevIconProps) => <TrendingUp size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Building: (props: RevIconProps) => <Building2 size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Globe: (props: RevIconProps) => <Globe size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Database: (props: RevIconProps) => <Database size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Analytics: (props: RevIconProps) => <BarChart2 size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Clock: (props: RevIconProps) => <Clock size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Lock: (props: RevIconProps) => <Lock size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
    Search: (props: RevIconProps) => <Search size={props.size ?? 18} className={`text-[#00CC6A] ${props.className || ''}`} {...props} />,
};

// 2. Componente de Container Preto & Verde para Cards (Estilo Diagnóstico)
export const RevCardIcon = ({ icon: IconComponent, size = 22 }: { icon: React.ComponentType<any>; size?: number }) => (
    <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center border border-zinc-800 shrink-0">
        <IconComponent size={size} className="text-[#00CC6A]" />
    </div>
);

// 3. Container Inline Mini para Badges e Textos
export const RevBadgeIcon = ({ icon: IconComponent, size = 14 }: { icon: React.ComponentType<any>; size?: number }) => (
    <span className="w-6 h-6 rounded-md bg-zinc-950 text-white inline-flex items-center justify-center border border-zinc-800 shrink-0">
        <IconComponent size={size} className="text-[#00CC6A]" />
    </span>
);

export default RevIcon;
