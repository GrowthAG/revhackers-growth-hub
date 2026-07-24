import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import REIProjectCard from '@/components/rei/REIProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowLeft, Zap, Users, Target, Plus, Loader2 } from 'lucide-react';
import { REIProject, getProjectsNeedingAttention, groupProjectsByQuarter } from '@/lib/reiQuarterlySystem';

import { getAllReiProjects } from '@/api/reiProjects';
import { reiProjectsGcpAdapter } from '@/api/adapters/rei-projects-gcp';
import LeadWarRoomSheet from '@/components/rei/LeadWarRoomSheet';

const REIDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [projects, setProjects] = useState<REIProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);

    useEffect(() => {
        loadRealProjects();
    }, []);

    const loadRealProjects = async () => {
        setIsLoading(true);
        try {
            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    const gcpProjects = await reiProjectsGcpAdapter.getAll();
                    const mapped: REIProject[] = gcpProjects.map(p => ({
                        id: p.id,
                        clientName: p.clientName,
                        clientCompany: p.clientCompany || p.clientName,
                        clientEmail: p.clientEmail,
                        lastREIDate: new Date(p.lastReiDate || new Date().toISOString()),
                        nextREIDate: new Date(p.nextReiDate),
                        quarter: p.quarter as any || 'Q1',
                        year: p.year || new Date().getFullYear(),
                        status: p.status as any,
                        analystEmail: p.analystEmail
                    }));
                    setProjects(mapped);
                    setIsLoading(false);
                    return;
                } catch (e) {
                    console.warn('Projetos REI via GCP não disponíveis, tentando Supabase fallback...', e);
                }
            }

            const data = await getAllReiProjects();
            const mapped: REIProject[] = data.map(p => ({
                id: p.id,
                clientName: p.trade_name || p.client_name,
                clientCompany: p.client_company || p.client_name,
                clientEmail: p.client_email,
                lastREIDate: new Date(p.created_at || new Date().toISOString()),
                nextREIDate: new Date(p.next_rei_date),
                quarter: p.quarter as any || 'Q1',
                year: p.year || new Date().getFullYear(),
                status: p.status as any,
                analystEmail: p.analyst_email
            }));
            setProjects(mapped);
        } catch (error) {
            console.error('Erro ao carregar projetos REI:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const query = searchQuery.toLowerCase();
        return projects.filter(p =>
            p.clientName.toLowerCase().includes(query) ||
            p.clientEmail.toLowerCase().includes(query) ||
            p.clientCompany?.toLowerCase().includes(query)
        );
    }, [projects, searchQuery]);

    const activeClients = useMemo(() => filteredProjects.filter(p => p.status !== 'lead' && p.status !== ('diagnostic' as any)), [filteredProjects]);
    const leadProjects = useMemo(() => filteredProjects.filter(p => p.status === 'lead'), [filteredProjects]);

    const projectsNeedingAttention = useMemo(() =>
        getProjectsNeedingAttention(activeClients),
        [activeClients]
    );

    const projectsByQuarter = useMemo(() =>
        groupProjectsByQuarter(activeClients),
        [activeClients]
    );

    const stats = useMemo(() => {
        const overdue = activeClients.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days < 0;
        }).length;

        const pending = activeClients.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 30;
        }).length;

        return {
            total: activeClients.length,
            overdue,
            pending,
        };
    }, [activeClients]);

    return (
        <PageLayout>
            <div className="min-h-screen bg-white pt-16 pb-20">
                <div className="container mx-auto px-6 max-w-7xl space-y-8">
                    
                    {/* Header Nobibecode SaaS */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
                        <div>
                            <button
                                onClick={() => navigate('/admin')}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
                            >
                                <ArrowLeft size={14} /> Voltar ao Hub
                            </button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Projetos & Sprints REI
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                    {projects.length} PROJETOS
                                </span>
                            </div>
                            <p className="text-sm font-medium text-zinc-500 mt-1">
                                Revenue Excellence Initiative — Gestão operacional de diagnósticos e renovações trimestrais.
                            </p>
                        </div>

                        <Button
                            onClick={() => navigate('/admin/rei/novo')}
                            className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-mono font-bold tracking-wider uppercase shadow-none gap-2 flex items-center transition-all border border-zinc-800"
                        >
                            <Plus size={15} className="text-[#00CC6A]" /> Novo Projeto REI
                        </Button>
                    </div>

                    {/* Stats Strip — Strict Nobibecode Zinc + #00CC6A */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-zinc-200 rounded-xl p-4.5 shadow-none">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">Clientes Ativos</span>
                            <span className="text-2xl font-black text-zinc-900 tabular-nums">{stats.total}</span>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4.5 shadow-none">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">REIs em Atraso</span>
                            <span className="text-2xl font-black text-zinc-900 tabular-nums">{stats.overdue}</span>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4.5 shadow-none">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">Janela Próxima (30d)</span>
                            <span className="text-2xl font-black text-[#00CC6A] tabular-nums">{stats.pending}</span>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4.5 shadow-none">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">Leads Mapeados</span>
                            <span className="text-2xl font-black text-zinc-900 tabular-nums">{leadProjects.length}</span>
                        </div>
                    </div>

                    {/* Search & Tabs */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                type="search"
                                placeholder="Buscar por cliente ou e-mail..."
                                className="pl-10 pr-12 h-9 bg-white border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 transition-all shadow-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20 bg-white border border-zinc-200 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-[#00CC6A]" />
                                <span className="text-xs text-zinc-500 font-medium">Carregando projetos REI...</span>
                            </div>
                        </div>
                    ) : (
                        <Tabs defaultValue="clients" className="w-full">
                            <TabsList className="mb-6 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                                <TabsTrigger value="clients" className="text-xs font-mono font-bold uppercase tracking-wider rounded-md data-[state=active]:bg-zinc-950 data-[state=active]:text-white">
                                    <Users className="w-4 h-4 mr-2" /> Clientes Ativos ({activeClients.length})
                                </TabsTrigger>
                                <TabsTrigger value="leads" className="text-xs font-mono font-bold uppercase tracking-wider rounded-md data-[state=active]:bg-zinc-950 data-[state=active]:text-white">
                                    <Target className="w-4 h-4 mr-2" /> Oportunidades & Leads ({leadProjects.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="clients" className="space-y-8">
                                {projectsNeedingAttention.length > 0 && (
                                    <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#00CC6A]"></div>
                                            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                                                Projetos com Atenção Prioritária ({projectsNeedingAttention.length})
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {projectsNeedingAttention.map(project => (
                                                <REIProjectCard key={project.id} project={project} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 mb-4">
                                        Projetos Agrupados por Trimestre
                                    </h2>
                                    {Object.entries(projectsByQuarter)
                                        .sort(([a], [b]) => b.localeCompare(a))
                                        .map(([quarter, quarterProjects]) => (
                                            <div key={quarter} className="mb-8">
                                                <div className="mb-3">
                                                    <span className="bg-zinc-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-md">
                                                        {quarter}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {quarterProjects.map(project => (
                                                        <REIProjectCard key={project.id} project={project} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="leads">
                                <div className="mb-4">
                                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                                        Leads de Diagnóstico
                                    </h2>
                                </div>
                                
                                {leadProjects.length === 0 ? (
                                    <div className="bg-white border border-zinc-200 p-12 text-center text-xs font-mono text-zinc-500 rounded-xl">
                                        Nenhum lead encontrado.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {leadProjects.map(project => (
                                            <div 
                                                key={project.id} 
                                                className="hover:border-zinc-900 transition-all cursor-pointer"
                                                onClick={() => setSelectedLead({
                                                    id: project.id,
                                                    name: project.clientName,
                                                    company: project.clientCompany || project.clientName,
                                                    type: 'funnels_impl',
                                                    urgencyScore: 50,
                                                    maturityPct: 30,
                                                    nextAction: 'Reunião de Diagnóstico',
                                                    daysSinceActivity: Math.floor((new Date().getTime() - project.lastREIDate.getTime()) / (1000 * 60 * 60 * 24))
                                                })}
                                            >
                                                <REIProjectCard project={project} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>

            {/* War Room Sheet */}
            <LeadWarRoomSheet 
                lead={selectedLead} 
                open={!!selectedLead} 
                onClose={() => setSelectedLead(null)} 
                onQualified={() => {
                    loadRealProjects();
                }} 
            />
        </PageLayout>
    );
};

export default REIDashboard;
