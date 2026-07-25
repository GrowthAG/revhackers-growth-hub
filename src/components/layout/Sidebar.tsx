import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home, LayoutDashboard, Users,
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
        'fixed left-0 top-0 h-screen bg-white border-r border-zinc-200 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]',
        'transition-all duration-200 ease-out z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header com Logo */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-zinc-100">
        {!collapsed ? (
          <>
            <Link to="/admin" className="flex items-center gap-2 pl-2">
              <img 
                src={LOGO_URL}
                alt="RevHackers" 
                className="w-28 max-w-full h-auto invert opacity-90"
              />
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors mx-auto"
            aria-label="Expandir sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
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
  if (!title) return <div className="space-y-0.5">{children}</div>;
  
  return (
    <div className="space-y-1 mt-6 first:mt-0">
      <div className="px-3 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
        'transition-colors duration-150',
        'text-sm font-medium',
        active
          ? 'bg-zinc-100/80 text-zinc-900 font-semibold'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
        collapsed && 'justify-center'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-zinc-900" : "text-zinc-400")} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge != null && badge > 0 && (
            <span className="min-w-[20px] h-[20px] text-[11px] font-semibold flex items-center justify-center bg-zinc-100 text-zinc-600 px-1.5 rounded-full border border-zinc-200">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};
