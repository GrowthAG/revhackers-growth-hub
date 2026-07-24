import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Globe,
    Mail,
    Building2,
    Loader2,
    Zap,
    ExternalLink,
    MapPin,
    Briefcase,
    ArrowLeft
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAllClients, deleteClient, type Client } from '@/api/clients';
import { reiProjectsGcpAdapter, type ReiProject } from '@/api/adapters/rei-projects-gcp';

export const AdminClients = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [reiProjects, setReiProjects] = useState<ReiProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'churned'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const clientsData = await getAllClients();
            setClients(clientsData);

            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    const projectsData = await reiProjectsGcpAdapter.getAll();
                    setReiProjects(projectsData);
                } catch (e) {
                    console.warn('Projetos REI via GCP não carregados ou indisponíveis no momento.', e);
                }
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            toast({ title: 'Erro ao carregar clientes', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover o cliente "${name}"?`)) return;

        try {
            await deleteClient(id);
            toast({ title: 'Cliente removido com sucesso!' });
            loadData();
        } catch (error) {
            toast({ title: 'Erro ao remover cliente', variant: 'destructive' });
        }
    };

    const filteredClients = clients.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.segment?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeCount = clients.filter(c => c.status === 'active' || !c.status).length;
    const onboardingCount = clients.filter(c => c.status === 'onboarding').length;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Header SaaS Moderno */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
                    <div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
                        >
                            <ArrowLeft size={14} /> Voltar ao Hub
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                            Clientes & Operações
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gestão centralizada do portfólio de contas, empresas e contratos ativos.
                        </p>
                    </div>

                    <Button
                        onClick={() => navigate('/admin/clients/novo')}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-10 px-4 text-xs font-medium tracking-wide shadow-sm gap-2 flex items-center transition-all"
                    >
                        <Plus size={15} className="text-[#00CC6A]" /> Novo Cliente
                    </Button>
                </div>

                {/* Metric Cards - SaaS Style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 block mb-1">Total de Contas</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-zinc-900 tabular-nums">{clients.length}</span>
                            <span className="text-xs text-zinc-400 font-normal">registradas</span>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 block mb-1">Operações Ativas</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#00CC6A] tabular-nums">{activeCount}</span>
                            <span className="text-xs text-emerald-600/80 font-medium">em execução</span>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 block mb-1">Em Onboarding</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-zinc-900 tabular-nums">{onboardingCount}</span>
                            <span className="text-xs text-amber-600 font-medium">em setup</span>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 block mb-1">Projetos REI</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-zinc-900 tabular-nums">{reiProjects.length}</span>
                            <span className="text-xs text-zinc-400 font-normal">vinculados</span>
                        </div>
                    </div>
                </div>

                {/* Control Bar: Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar cliente, empresa ou segmento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-white border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-0 transition-all shadow-xs"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-lg border border-zinc-200/60">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                        >
                            Todos ({clients.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                        >
                            Ativos ({activeCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('onboarding')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === 'onboarding' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                        >
                            Onboarding ({onboardingCount})
                        </button>
                    </div>
                </div>

                {/* List / Cards */}
                {loading ? (
                    <div className="flex justify-center items-center py-16 bg-white border border-zinc-200/80 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-[#00CC6A]" />
                            <span className="text-xs text-zinc-500 font-medium">Carregando carteira de clientes...</span>
                        </div>
                    </div>
                ) : filteredClients.length > 0 ? (
                    <div className="space-y-3">
                        {filteredClients.map((client) => {
                            const clientProjects = reiProjects.filter(p =>
                                p.clientEmail?.toLowerCase() === client.email?.toLowerCase() ||
                                p.clientCompany?.toLowerCase() === client.company?.toLowerCase()
                            );
                            return (
                                <div
                                    key={client.id}
                                    className="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-xl p-5 transition-all shadow-xs group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Avatar / Logo + Information */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800 text-white font-bold text-sm">
                                                {client.logo_url ? (
                                                    <img src={client.logo_url} alt={client.name} className="w-6 h-6 object-contain" />
                                                ) : (
                                                    client.name.substring(0, 2).toUpperCase()
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <h3 className="text-sm font-semibold text-zinc-900">
                                                        {client.name}
                                                    </h3>
                                                    {client.status === 'active' || !client.status ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
                                                        </span>
                                                    ) : client.status === 'onboarding' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Onboarding
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                            Inativo
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-500">
                                                    {client.company && (
                                                        <span className="font-medium text-zinc-700">
                                                            {client.company}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={12} className="text-zinc-400" /> {client.email}
                                                    </span>
                                                    {client.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={12} className="text-zinc-400" /> {client.city}{client.state ? `, ${client.state}` : ''}
                                                        </span>
                                                    )}
                                                    {client.segment && (
                                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                                                            {client.segment}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            {client.website && (
                                                <a
                                                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-8 px-3 rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-all bg-white shadow-xs"
                                                >
                                                    <Globe size={13} /> Site <ExternalLink size={11} className="text-zinc-400" />
                                                </a>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/rei?search=${encodeURIComponent(client.email)}`)}
                                                className="h-8 px-3 rounded-lg border border-zinc-200 hover:border-zinc-300 text-xs font-medium gap-1.5 text-zinc-700 bg-white shadow-xs"
                                            >
                                                <Zap size={13} className="text-[#00CC6A]" /> REI ({clientProjects.length})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/clients/edit/${client.id}`)}
                                                className="h-8 px-3 rounded-lg border border-zinc-200 hover:border-zinc-300 text-xs font-medium gap-1.5 text-zinc-700 bg-white shadow-xs"
                                            >
                                                <Edit2 size={13} /> Editar
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(client.id, client.name)}
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* REI Projects Preview */}
                                    {clientProjects.length > 0 && (
                                        <div className="mt-3.5 pt-3.5 border-t border-zinc-100 flex items-center gap-2 text-xs">
                                            <span className="text-zinc-400 font-medium">Projetos ativos:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {clientProjects.map(proj => (
                                                    <span key={proj.id} className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-medium tracking-tight">
                                                        {proj.type.toUpperCase()} ({proj.quarter}/{proj.year}) — Próxima REI: {new Date(proj.nextReiDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 text-center bg-white border border-zinc-200/80 rounded-xl p-8 shadow-xs">
                        <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-zinc-700">Nenhum cliente encontrado</p>
                        <p className="text-xs text-zinc-400 mt-1">Tente buscar por outro termo ou limpe os filtros de busca.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminClients;
