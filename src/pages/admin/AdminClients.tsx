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
    Sparkles,
    ExternalLink,
    MapPin,
    Briefcase,
    ArrowLeft,
    Clock
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
                {/* Header — 100% Nobibecode Compliance */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1">
                            <button
                                onClick={() => navigate('/admin')}
                                className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft size={13} /> Dashboard
                            </button>
                            <span>/</span>
                            <span className="text-zinc-900 font-bold">Clientes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Carteira de Clientes
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {clients.length} contas
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gestão operacional de contas B2B, projetos REI e histórico sob contrato.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => navigate('/admin/clients/novo')}
                            className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-semibold tracking-wide shadow-xs gap-2 flex items-center transition-all border border-zinc-200"
                        >
                            <Plus size={15} className="text-[#00CC6A]" /> Novo Cliente
                        </Button>
                    </div>
                </div>

                {/* Metric Cards — 100% Zinc Scale + #00CC6A */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-2">
                            <span className="text-xs font-medium text-zinc-500">Total de Contas</span>
                            <Building2 size={15} className="text-zinc-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold text-zinc-900 tabular-nums">{clients.length}</span>
                            <span className="text-xs text-zinc-400 font-medium">empresas</span>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-2">
                            <span className="text-xs font-medium text-zinc-500">Operações Ativas</span>
                            <div className="w-2 h-2 rounded-full bg-[#00CC6A]"></div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#00CC6A] tabular-nums">{activeCount}</span>
                            <span className="text-xs text-zinc-500 font-medium">em execução</span>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-2">
                            <span className="text-xs font-medium text-zinc-500">Em Onboarding</span>
                            <Clock size={15} className="text-zinc-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-zinc-900 tabular-nums">{onboardingCount}</span>
                            <span className="text-xs text-zinc-500 font-medium">em setup</span>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-2">
                            <span className="text-xs font-medium text-zinc-500">Projetos REI</span>
                            <Sparkles size={15} className="text-[#00CC6A]" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-zinc-900 tabular-nums">{reiProjects.length}</span>
                            <span className="text-xs text-zinc-400 font-medium">vinculados</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shadow-xs p-2 rounded-xl border border-zinc-200/80">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Filtrar por cliente, empresa ou segmento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-12 h-9 bg-white border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:ring-offset-0 transition-all shadow-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                            <kbd className="font-sans text-[10px] text-zinc-400 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">⌘K</kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'all' ? 'bg-zinc-950 text-white border border-zinc-950' : 'text-zinc-600 hover:text-zinc-900'}`}
                        >
                            Todos ({clients.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'active' ? 'bg-[#00CC6A] text-black border border-[#00CC6A]' : 'text-zinc-600 hover:text-zinc-900'}`}
                        >
                            Ativos ({activeCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('onboarding')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'onboarding' ? 'bg-zinc-900 text-white border border-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
                        >
                            Onboarding ({onboardingCount})
                        </button>
                    </div>
                </div>

                {/* Table View */}
                {loading ? (
                    <div className="flex justify-center items-center py-20 bg-white border border-zinc-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-[#00CC6A]" />
                            <span className="text-xs text-zinc-500 font-medium">Carregando carteira de clientes...</span>
                        </div>
                    </div>
                ) : filteredClients.length > 0 ? (
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/50 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-4">Cliente & Empresa</th>
                                        <th className="py-3.5 px-4">Contato</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Projetos REI</th>
                                        <th className="py-3.5 px-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                                    {filteredClients.map((client) => {
                                        const clientProjects = reiProjects.filter(p =>
                                            p.clientEmail?.toLowerCase() === client.email?.toLowerCase() ||
                                            p.clientCompany?.toLowerCase() === client.company?.toLowerCase()
                                        );
                                        return (
                                            <tr
                                                key={client.id}
                                                className="hover:bg-white shadow-sm/80 transition-colors group"
                                            >
                                                {/* Cliente & Empresa */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-200 text-white font-semibold text-xs">
                                                            {client.logo_url ? (
                                                                <img src={client.logo_url} alt={client.name} className="w-5 h-5 object-contain" />
                                                            ) : (
                                                                client.name.substring(0, 2).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-zinc-900 flex items-center gap-2">
                                                                {client.name}
                                                                {client.segment && (
                                                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                                        {client.segment}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {client.company && (
                                                                <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
                                                                    {client.company}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contato */}
                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-0.5 text-[11px]">
                                                        <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                                                            <Mail size={12} className="text-zinc-400" />
                                                            <span>{client.email}</span>
                                                        </div>
                                                        {client.website && (
                                                            <a
                                                                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                                                            >
                                                                <Globe size={12} />
                                                                <span>{client.website.replace(/^https?:\/\//, '')}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status — 100% Permitted Colors: #00CC6A or Zinc */}
                                                <td className="py-3.5 px-4">
                                                    {client.status === 'active' || !client.status ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#00CC6A] text-black">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span> ATIVO
                                                        </span>
                                                    ) : client.status === 'onboarding' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-zinc-900 text-white">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00CC6A]"></span> ONBOARDING
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                                                            INATIVO
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Projetos REI */}
                                                <td className="py-3.5 px-4">
                                                    {clientProjects.length > 0 ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-mono font-bold">
                                                                {clientProjects.length} REI
                                                            </span>
                                                            <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[150px]">
                                                                {clientProjects[0].type}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-zinc-400 font-normal">Sem REI ativo</span>
                                                    )}
                                                </td>

                                                {/* Ações */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/admin/rei?search=${encodeURIComponent(client.email)}`)}
                                                            className="h-8 px-2.5 rounded-md hover:bg-zinc-100 text-zinc-700 text-[11px] font-mono font-bold gap-1 border border-zinc-200 bg-white"
                                                            title="Ver Projetos REI"
                                                        >
                                                            <Sparkles size={13} className="text-[#00CC6A]" /> REI
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/admin/clients/edit/${client.id}`)}
                                                            className="h-8 w-8 p-0 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white"
                                                            title="Editar Cliente"
                                                        >
                                                            <Edit2 size={13} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(client.id, client.name)}
                                                            className="h-8 w-8 p-0 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 border border-zinc-200 bg-white"
                                                            title="Remover"
                                                        >
                                                            <Trash2 size={13} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="py-16 text-center bg-white border border-zinc-200 rounded-xl p-8">
                        <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Nenhum cliente encontrado</p>
                        <p className="text-xs text-zinc-400 mt-1">Tente buscar por outro termo ou ajuste os filtros.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminClients;
