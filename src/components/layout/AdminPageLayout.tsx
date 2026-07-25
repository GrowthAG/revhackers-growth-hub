import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AdminPageLayoutProps {
    title: string;
    description?: string;
    backTo?: string;
    backLabel?: string;
    actions?: ReactNode;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    showBackButton?: boolean;
}

const AdminPageLayout = ({
    title,
    description,
    backTo = '/admin/rei',
    backLabel = 'Voltar ao Hub',
    actions,
    children,
    maxWidth = '7xl',
    showBackButton = true
}: AdminPageLayoutProps) => {
    const navigate = useNavigate();

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full'
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header - Enterprise Standard */}
            <div className="pb-6 border-b border-zinc-200/80">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                        <button
                            onClick={() => navigate(backTo)}
                            className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
                        </button>
                        <span>/</span>
                        <span className="text-zinc-900 font-semibold">{title}</span>
                    </div>
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-zinc-500 font-normal">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div>
                {children}
            </div>
        </div>
    );
};

export default AdminPageLayout;
