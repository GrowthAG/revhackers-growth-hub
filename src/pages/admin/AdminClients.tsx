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
    ShieldCheck
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
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

            // Tenta carregar projetos REI vinculados via GCP se a flag estiver ativa
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
            <AdminPageLayout
                title="Clientes & Operações B2B"
                description="Gestão centralizada do portfólio de contas, empresas sob contrato e projetos operacionais."
                backTo="/admin"
                backLabel="Voltar ao Hub"
                actions={
                    <Button
                        onClick={() => navigate('/admin/clients/novo')}
                        className="bg-black text-white hover:bg-zinc-800 rounded-none h-11 px-6 text-xs font-mono font-bold tracking-widest uppercase shadow-none gap-2 flex items-center border border-black"
                    >
                        <Plus size={14} className="text-[#00CC6A]" /> NOVO CLIENTE
                    </Button>
                }
            >
                <div className="space-y-8 py-8">
                    {/* METRIC STRIP — Nobibecode Style */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-zinc-50 border border-zinc-200">
                        <div>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">■ TOTAL DE CONTAS</span>
                            <span className="text-3xl font-black text-zinc-900 tracking-tight tabular-nums">{clients.length}</span>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">■ OPERAÇÕES ATIVAS</span>
                            <span className="text-3xl font-black text-[#00CC6A] tracking-tight tabular-nums">{activeCount}</span>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">■ EM ONBOARDING</span>
                            <span className="text-3xl font-black text-zinc-900 tracking-tight tabular-nums">{onboardingCount}</span>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">■ PROJETOS REI</span>
                            <span className="text-3xl font-black text-zinc-900 tracking-tight tabular-nums">{reiProjects.length}</span>
                        </div>
                    </div>

                    {/* CONTROL BAR: Search & Filter */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-6 border-b border-zinc-200">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="BUSCAR POR CLIENTE, EMPRESA OU SEGMENTO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-11 bg-white border-zinc-200 rounded-none text-xs font-mono tracking-wider focus-visible:ring-0 focus-visible:border-black transition-all shadow-none"
                            />
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="flex items-center gap-1 bg-zinc-100 p-1 border border-zinc-200">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${statusFilter === 'all' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'}`}
                            >
                                Todos ({clients.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`px-4 py-2 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${statusFilter === 'active' ? 'bg-[#00CC6A] text-black' : 'text-zinc-600 hover:text-black'}`}
                            >
                                Ativos ({activeCount})
                            </button>
                            <button
                                onClick={() => setStatusFilter('onboarding')}
                                className={`px-4 py-2 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${statusFilter === 'onboarding' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'}`}
                            >
                                Onboarding ({onboardingCount})
                            </button>
                        </div>
                    </div>

                    {/* CLIENT CARDS GRID — Nobibecode Executive Command Center */}
                    {loading ? (
                        <div className="flex justify-center py-20 bg-white border border-zinc-200">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-[#00CC6A]" />
                                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Carregando carteira de clientes...</span>
                            </div>
                        </div>
                    ) : filteredClients.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredClients.map((client) => {
                                const clientProjects = reiProjects.filter(p => p.clientEmail?.toLowerCase() === client.email?.toLowerCase() || p.clientCompany?.toLowerCase() === client.company?.toLowerCase());
                                return (
                                    <div
                                        key={client.id}
                                        className="bg-white border border-zinc-200 p-6 hover:border-zinc-900 transition-colors group"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            {/* Left: Company & Identity */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-800">
                                                    {client.logo_url ? (
                                                        <img src={client.logo_url} alt={client.name} className="w-8 h-8 object-contain" />
                                                    ) : (
                                                        <Building2 className="text-[#00CC6A] h-6 w-6" strokeWidth={2} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-base font-black uppercase tracking-tight text-zinc-900">
                                                            {client.name}
                                                        </h3>
                                                        {client.status === 'active' || !client.status ? (
                                                            <span className="font-mono text-[10px] font-bold bg-[#00CC6A] text-black px-2 py-0.5 uppercase tracking-wider">
                                                                ● ATIVO
                                                            </span>
                                                        ) : client.status === 'onboarding' ? (
                                                            <span className="font-mono text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 uppercase tracking-wider">
                                                                ONBOARDING
                                                            </span>
                                                        ) : (
                                                            <span className="font-mono text-[10px] font-bold border border-zinc-300 text-zinc-500 px-2 py-0.5 uppercase tracking-wider">
                                                                INATIVO
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-600">
                                                        {client.company && (
                                                            <span className="font-mono font-medium text-zinc-900">
                                                                {client.company}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1 text-zinc-500">
                                                            <Mail size={12} /> {client.email}
                                                        </span>
                                                        {client.city && (
                                                            <span className="flex items-center gap-1 text-zinc-500">
                                                                <MapPin size={12} /> {client.city}{client.state ? `, ${client.state}` : ''}
                                                            </span>
                                                        )}
                                                        {client.segment && (
                                                            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 border border-zinc-200">
                                                                <Briefcase size={11} /> {client.segment}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Toolbar */}
                                            <div className="flex items-center gap-2 self-end lg:self-center">
                                                {client.website && (
                                                    <a
                                                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="h-9 px-3 border border-zinc-200 hover:border-black text-zinc-700 hover:text-black font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors bg-white"
                                                    >
                                                        <Globe size={13} /> SITE <ExternalLink size={11} />
                                                    </a>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/rei?search=${encodeURIComponent(client.email)}`)}
                                                    className="h-9 px-3 border border-zinc-200 hover:border-black rounded-none font-mono text-xs uppercase tracking-wider gap-1.5 text-zinc-800 bg-white"
                                                >
                                                    <Zap size={13} className="text-[#00CC6A]" /> REI ({clientProjects.length})
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/clients/edit/${client.id}`)}
                                                    className="h-9 px-3 border border-zinc-200 hover:border-black rounded-none font-mono text-xs uppercase tracking-wider gap-1.5 text-zinc-800 bg-white"
                                                >
                                                    <Edit2 size={13} /> EDITAR
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(client.id, client.name)}
                                                    className="h-9 w-9 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-colors border border-transparent hover:border-red-200"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Linked REI Projects Preview if any */}
                                        {clientProjects.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-3">
                                                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">PROJETOS ATIVOS:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {clientProjects.map(proj => (
                                                        <span key={proj.id} className="font-mono text-[11px] bg-zinc-900 text-white px-2 py-0.5 border border-zinc-800">
                                                            {proj.type.toUpperCase()} ({proj.quarter}/{proj.year}) — Proxima: {new Date(proj.nextReiDate).toLocaleDateString('pt-BR')}
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
                        <div className="py-24 text-center bg-white border border-zinc-200 p-8">
                            <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                            <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Nenhum cliente encontrado para os filtros selecionados
                            </p>
                        </div>
                    )}
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default AdminClients;
