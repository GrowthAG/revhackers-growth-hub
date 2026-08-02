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
    BarChart3,
    Clock,
    LucideProps
} from 'lucide-react';

/**
 * RevHackers Official Icon & Emoticon Design System Library
 * Strictly replaces lightning bolts (Zap) with high-converting RevOps icons:
 * - Sparkles (IA, Automação, Destaque)
 * - ShieldCheck (Segurança, Validação, Metodologia)
 * - Activity (Engenharia de Processos, Performance)
 * - FolderKanban (Projetos REI, Workflows, Funis)
 * - Cpu (IA Operations, LLMs)
 */

export interface IconProps extends LucideProps {
    variant?: 'green' | 'amber' | 'blue' | 'zinc' | 'dark';
}

export const RevIcon = {
    Sparkles: (props: IconProps) => <Sparkles {...props} />,
    Shield: (props: IconProps) => <ShieldCheck {...props} />,
    Activity: (props: IconProps) => <Activity {...props} />,
    Kanban: (props: IconProps) => <FolderKanban {...props} />,
    Cpu: (props: IconProps) => <Cpu {...props} />,
    Target: (props: IconProps) => <Target {...props} />,
    User: (props: IconProps) => <UserCheck {...props} />,
    Check: (props: IconProps) => <CheckCircle2 {...props} />,
    Trending: (props: IconProps) => <TrendingUp {...props} />,
    Building: (props: IconProps) => <Building2 {...props} />,
    Globe: (props: IconProps) => <Globe {...props} />,
    Database: (props: IconProps) => <Database {...props} />,
    Analytics: (props: IconProps) => <BarChart3 {...props} />,
    Clock: (props: IconProps) => <Clock {...props} />,
};

/**
 * Standardized Emoticon / Icon Map for Status & Badges
 */
export const REV_EMOTICONS = {
    AI: '✨',
    PRO: '🛡️',
    ACTIVE: '🟢',
    SUCCESS: '✅',
    GROWTH: '📈',
    TARGET: '🎯',
    BUILDING: '🏢',
    FIRE: '🔥',
    STAR: '🌟',
} as const;

export default RevIcon;
