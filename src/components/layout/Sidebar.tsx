import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home, LayoutDashboard, Users, Activity, Building2, Clock,
  Book, Briefcase, ChevronLeft, ChevronRight,
  type LucideIcon
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';

const LOGO_URL = '/brand/revhackers-wordmark-white.png';

interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
  badgeKey?: 'pipeline' | 'projects';
}

const NAVIGATION: Record<string, NavItem[]> = {
  WORKSPACE: [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: LayoutDashboard, label: 'Projetos', to: '/admin/projects' },
    { icon: Activity, label: 'Cockpit REI', to: '/admin/rei' },
    { icon: Building2, label: 'Inteligência', to: '/admin/intelligence' },
    { icon: Clock, label: 'Lifecycle', to: '/admin/lifecycle' },
  ],
  CLIENTES: [
    { icon: Users, label: 'Clientes', to: '/admin/clients' },
  ],
  CONTEÚDO: [
    { icon: Book, label: 'Blog', to: '/admin/blog' },
    { icon: Book, label: 'Materiais', to: '/admin/materials' },
    { icon: Briefcase, label: 'Cases', to: '/admin/cases' },
  ],
  SISTEMA: [
    { icon: Users, label: 'Usuarios', to: '/admin/users' },
  ],
};

export const Sidebar = () => {
  const { collapsed, setCollapsed } = useSidebar();
  const location = useLocation();
  const badges = useSidebarBadges();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-black border-r border-zinc-800/80 shadow-2xl',
        'transition-all duration-200 ease-out z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header com Logo Centralizado */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80">
        {!collapsed ? (
          <>
            <div className="flex-1 flex justify-center items-center py-2">
              <Link to="/admin" className="flex items-center justify-center">
                <img 
                  src={LOGO_URL}
                  alt="RevHackers" 
                  className="w-32 max-w-full h-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors ml-1"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors mx-auto"
            aria-label="Expandir sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 overflow-y-auto h-[calc(100vh-4rem)] space-y-4">
        {Object.entries(NAVIGATION).map(([section, items]) => (
          <SidebarSection key={section} title={collapsed ? '' : section}>
            {items.map((item) => (
              <SidebarItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
                collapsed={collapsed}
                badge={item.badgeKey ? badges[item.badgeKey] : undefined}
              />
            ))}
          </SidebarSection>
        ))}
      </nav>
    </aside>
  );
};

// Section Component
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  if (!title) return <div className="space-y-1">{children}</div>;
  
  return (
    <div className="space-y-1 mt-4 first:mt-0">
      <div className="px-3 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
};

// Item Component
interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}

const SidebarItem = ({ icon: Icon, label, to, active, collapsed, badge }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg',
        'transition-all duration-150',
        'text-xs font-semibold',
        active
          ? 'bg-zinc-900 text-[#00CC6A] border border-zinc-800'
          : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white',
        collapsed && 'justify-center'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-[#00CC6A]" : "text-zinc-400")} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge != null && badge > 0 && (
            <span className="min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center bg-[#00CC6A]/20 text-[#00CC6A] px-1.5 rounded-full border border-[#00CC6A]/30">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};
