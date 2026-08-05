import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Trash2, BookOpen, Search, ExternalLink, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { contentGcpAdapter } from '@/api/adapters/content-gcp';

export const AdminBlog = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        try {
            const data = await contentGcpAdapter.getBlogArticles();
            if (data && data.length > 0) {
                setPosts(data);
            } else {
                setPosts(staticBlogPosts);
            }
        } catch {
            setPosts(staticBlogPosts);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir este artigo?')) return;
        try {
            await contentGcpAdapter.deleteBlogArticle(id);
        } catch (err) {
            console.error('Erro ao excluir artigo:', err);
        }
        toast.success('Artigo excluído');
        setPosts(posts.filter(p => p.id !== id));
    };

    const filtered = posts.filter(p =>
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
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
                            <span className="text-zinc-900">BLOG</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Gestão de Artigos & Publicações B2B
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {filtered.length} artigos
                            </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-500 mt-1">
                            Central de conteúdo, estratégias de Growth, RevOps e Inteligência B2B.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => navigate('/admin/blog/novo')}
                            className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-semibold shadow-xs gap-2 flex items-center transition-all border border-zinc-200"
                        >
                            <Plus size={15} className="text-[#00CC6A]" /> Novo Artigo
                        </Button>
                    </div>
                </div>

                {/* Control Bar: Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shadow-xs p-2 rounded-xl border border-zinc-200/80">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por título ou categoria..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 h-9 bg-white border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 transition-all shadow-none"
                        />
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(post => (
                        <div
                            key={post.id}
                            onClick={() => navigate(`/blog/${post.slug}`)}
                            className="bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all p-5 shadow-xs flex flex-col justify-between cursor-pointer group space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                                        {post.category || 'GROWTH'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#00CC6A] text-black">
                                        ● Publicado
                                    </span>
                                </div>

                                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black line-clamp-2 leading-snug">
                                    {(post.title || '').replace(/<span>|<\/span>/g, '')}
                                </h3>

                                {post.excerpt && (
                                    <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                                <span className="font-mono text-[11px]">
                                    {post.date ? new Date(post.date).toLocaleDateString('pt-BR') : 'Recent'}
                                </span>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/blog/${post.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                                        title="Ver no site"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                    <button
                                        onClick={(e) => handleDelete(post.id, e)}
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

export default AdminBlog;
