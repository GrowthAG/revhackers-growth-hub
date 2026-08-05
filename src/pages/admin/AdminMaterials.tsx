import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Trash2, FileText, Search, Download, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { materialsData } from '@/data/materialsData';
import { migrateMaterials } from '@/services/migrationService';
import { contentGcpAdapter } from '@/api/adapters/content-gcp';

const AdminMaterials = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchMaterials(); }, []);

    const fetchMaterials = async () => {
        try {
            const data = await contentGcpAdapter.getMaterials();
            if (data && data.length > 0) {
                setMaterials(data);
            } else {
                // Fallback para materialsData se GCP retornar vazio
                setMaterials(materialsData);
            }
        } catch {
            setMaterials(materialsData);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir este material?')) return;
        try {
            await contentGcpAdapter.deleteMaterial(id);
        } catch (err) {
            console.error('Erro ao deletar material', err);
        }
        toast.success('Material removido');
        setMaterials(materials.filter(m => m.id !== id));
    };

    const handleMigrate = async () => {
        toast.loading('Importando materiais oficiais...', { id: 'migrate' });
        try {
            const { success, failed } = await migrateMaterials();
            toast.success(`${success} importados com sucesso!`, { id: 'migrate' });
            fetchMaterials();
        } catch (error) {
            toast.error(String(error), { id: 'migrate' });
        }
    };

    const filtered = materials.filter(m =>
        (m.title || m.material_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.material_type || m.type || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.category || '').toLowerCase().includes(search.toLowerCase())
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
                            <span className="text-zinc-900">MATERIAIS</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Materiais & Frameworks B2B
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {filtered.length} DISPONÍVEIS
                            </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-500 mt-1">
                            Arsenal de vendas, guias operacionais, automações de IA e mídias de apoio.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleMigrate}
                            className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold h-9 px-3 gap-1.5 rounded-lg shadow-xs"
                        >
                            <Download size={14} /> Restaurar Oficiais
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/materials/new')}
                            className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-semibold shadow-xs gap-2 flex items-center transition-all border border-zinc-200"
                        >
                            <Plus size={15} className="text-[#00CC6A]" /> Novo Material
                        </Button>
                    </div>
                </div>

                {/* Control Bar: Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shadow-xs p-2 rounded-xl border border-zinc-200/80">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por título, categoria ou tipo..."
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
                            onClick={() => navigate(`/admin/materials/edit/${item.id}`)}
                            className="bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all p-5 shadow-xs flex flex-col justify-between cursor-pointer group space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                                        {item.type || item.material_type || item.category || 'FRAMEWORK'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#00CC6A] text-black">
                                        ● Publicado
                                    </span>
                                </div>

                                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black line-clamp-2 leading-snug">
                                    {item.title || item.material_name || 'Sem título'}
                                </h3>

                                {item.category && (
                                    <span className="text-xs text-zinc-500 font-medium block">
                                        Categoria: {item.category}
                                    </span>
                                )}
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                                <span className="font-mono text-[11px]">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Oficial'}
                                </span>

                                <div className="flex items-center gap-2">
                                    {(item.link_material || item.material_url) && (
                                        <a
                                            href={item.link_material || item.material_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                                            title="Abrir Link do Material"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminMaterials;
