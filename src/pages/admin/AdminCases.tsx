import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Trash2, Briefcase, Search, Download, TrendingUp, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { migrateCases } from '@/services/migrationService';

const AdminCases = () => {
    const [cases, setCases] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchCases(); }, []);

    const fetchCases = async () => {
        const { data, error } = await supabase
            .from('cases')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) toast.error('Erro ao carregar cases');
        else setCases(data || []);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir este case?')) return;
        const { error } = await supabase.from('cases').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            toast.success('Case excluído');
            setCases(cases.filter(c => c.id !== id));
        }
    };

    const handleMigrate = async () => {
        if (!confirm('Importar cases do arquivo estático?')) return;
        toast.loading('Importando...', { id: 'migrate' });
        try {
            const { success, failed } = await migrateCases();
            toast.success(`${success} importados, ${failed} falhas`, { id: 'migrate' });
            fetchCases();
        } catch (error) {
            toast.error(String(error), { id: 'migrate' });
        }
    };

    const filtered = cases.filter(c =>
        c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.case_category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                
                {/* Header SaaS Moderno Benchmark */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                            <button
                                onClick={() => navigate('/admin')}
                                className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft size={13} /> DASHBOARD
                            </button>
                            <span>/</span>
                            <span className="text-zinc-900">CASES</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Cases de Sucesso & Resultados
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {filtered.length} CASES
                            </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-500 mt-1">
                            Vitrine de resultados de crescimento, ROI e transformação de operações B2B.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleMigrate}
                            className="bg-white border-zinc-200 hover:bg-white shadow-sm text-zinc-700 text-xs font-mono font-bold tracking-wider uppercase h-9 px-3 gap-1.5"
                        >
                            <Download size={14} /> MIGRAR ESTÁTICO
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/cases/new')}
                            className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-mono font-bold tracking-wider uppercase shadow-none gap-2 flex items-center transition-all border border-zinc-200"
                        >
                            <Plus size={15} className="text-[#00CC6A]" /> NOVO CASE
                        </Button>
                    </div>
                </div>

                {/* Control Bar: Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shadow-sm p-2 rounded-xl border border-zinc-200">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por cliente ou categoria..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 h-9 bg-white border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 transition-all shadow-none"
                        />
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/admin/cases/edit/${item.id}`)}
                            className="bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all p-5 shadow-xs flex flex-col justify-between cursor-pointer group space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                                        {item.case_category || 'GERAL'}
                                    </span>
                                    {item.published ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00CC6A] text-black">
                                            ● PUBLICADO
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                                            RASCUNHO
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {item.client_logo ? (
                                        <img
                                            src={item.client_logo}
                                            alt={item.client_name}
                                            className="h-8 w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white font-bold text-xs flex items-center justify-center">
                                            {(item.client_name || 'C').substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black truncate">
                                        {item.client_name || 'Cliente'}
                                    </h3>
                                </div>

                                {item.primary_metric && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-white shadow-sm border border-zinc-200/80 px-2.5 py-1 rounded-md">
                                        <TrendingUp size={13} className="text-[#00CC6A]" />
                                        <span>{item.primary_metric}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                                <span className="font-mono text-[11px]">
                                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                </span>

                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white border border-zinc-200 rounded-xl p-8">
                            <Briefcase className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Nenhum case cadastrado</p>
                            <p className="text-xs text-zinc-400 mt-1">Crie um novo case para enriquecer seu portfólio.</p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminCases;
