import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ChevronRight } from 'lucide-react';
import DownloadForm from '@/components/shared/download-form';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';

const getSlugFromTitle = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

export default function MaterialLanding() {
    const { slug } = useParams<{ slug: string }>();
    const [showForm, setShowForm] = useState(false);
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchFromDatabase = async () => {
            try {
                const { data, error } = await supabase
                    .from('materials')
                    .select('*')
                    .eq('published', true);

                if (error) throw error;

                if (data) {
                    // Find material by matching slug
                    const dbMaterial = data.find((m: any) => {
                        const materialSlug = (m.slug || m.title || '')
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-');
                        return materialSlug === slug;
                    });

                    if (dbMaterial) {
                        setMaterial({
                            id: dbMaterial.id,
                            title: dbMaterial.title || dbMaterial.material_name,
                            headline: dbMaterial.title?.split(':')[0] || dbMaterial.material_name,
                            subheadline: dbMaterial.description?.substring(0, 100),
                            description: dbMaterial.description,
                            type: dbMaterial.type || dbMaterial.material_type || 'Material',
                            downloadLink: dbMaterial.link_material || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching material:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFromDatabase();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
                <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-4">Material não encontrado</h1>
                <p className="text-zinc-500 mb-8">O link pode estar incorreto ou o material foi removido.</p>
                <Link to="/materiais" className="text-zinc-900 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    Ver todos os materiais
                </Link>
            </div>
        );
    }

    return (
        <PageLayout>
            <SEO
                title={((material.headline || material.title || '').replace(/<[^>]*>/g, '')).substring(0, 60)}
                description={(material.description || material.subheadline || 'Material gratuito RevHackers').replace(/<[^>]*>/g, '').substring(0, 160)}
                canonical={`https://revhackers.com.br/materiais/${slug}`}
            />
            {/* Hero Section - Black Standard Hero */}
            <section className="relative py-20 md:py-28 bg-black border-b border-zinc-900">
                <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
                    <h1 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight text-center max-w-3xl mx-auto">
                        {(material.headline || material.title || '').replace(/<[^>]*>/g, '')}
                    </h1>
                    <p className="text-zinc-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center">
                        {(material.subheadline || material.description || '').replace(/<[^>]*>/g, '').substring(0, 150)}
                    </p>
                    {!showForm && (
                        <div className="pt-2 flex justify-center">
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] font-extrabold text-sm sm:text-base h-12 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Baixar Gratuitamente →</span>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Content / Form Section — Fundo 100% Branco Puro */}
            <section className="py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
                <div className="max-w-md mx-auto px-6">
                    {showForm && (
                        <div className="bg-zinc-50/70 border border-zinc-200/80 p-8 rounded-xl space-y-6">
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-zinc-950 tracking-tight">Acesse o material</h3>
                                <p className="text-xs text-zinc-500">Preencha seus dados para liberar o download imediato</p>
                            </div>
                            <DownloadForm
                                materialId={material.id}
                                materialType={material.type}
                                onSubmit={() => {}}
                                linkMaterial={material.downloadLink}
                            />
                        </div>
                    )}
                </div>
            </section>
        </PageLayout>
    );
}
