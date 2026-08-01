import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import DownloadForm from '@/components/shared/download-form';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { materialsData } from '@/data/materialsData';

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

                let foundMaterial: any = null;

                if (data && data.length > 0) {
                    foundMaterial = data.find((m: any) => {
                        const materialSlug = (m.slug || getSlugFromTitle(m.title || m.material_name || ''))
                        return materialSlug === slug;
                    });
                }

                // Fallback to local materialsData if not found in DB
                if (!foundMaterial) {
                    foundMaterial = materialsData.find((m: any) => m.slug === slug || getSlugFromTitle(m.title) === slug);
                }

                if (foundMaterial) {
                    const rawTitle = foundMaterial.title || foundMaterial.material_name || '';
                    const cleanTitle = rawTitle.replace(/<[^>]*>/g, '');
                    setMaterial({
                        id: foundMaterial.id,
                        title: cleanTitle,
                        headline: cleanTitle,
                        subheadline: (foundMaterial.description || '').replace(/<[^>]*>/g, '').substring(0, 160),
                        description: foundMaterial.description,
                        type: foundMaterial.type || foundMaterial.material_type || 'Material',
                        downloadLink: foundMaterial.link_material || foundMaterial.material_url || ''
                    });
                }
            } catch (err) {
                console.warn('Fallback to materialsData for slug:', slug);
                const localMatch = materialsData.find((m: any) => m.slug === slug || getSlugFromTitle(m.title) === slug);
                if (localMatch) {
                    const cleanTitle = (localMatch.title || '').replace(/<[^>]*>/g, '');
                    setMaterial({
                        id: localMatch.id,
                        title: cleanTitle,
                        headline: cleanTitle,
                        subheadline: (localMatch.description || '').replace(/<[^>]*>/g, '').substring(0, 160),
                        description: localMatch.description,
                        type: localMatch.type || localMatch.material_type || 'Material',
                        downloadLink: localMatch.link_material || ''
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFromDatabase();
    }, [slug]);

    if (loading) {
        return (
            <PageLayout>
                <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#00CC6A] rounded-full animate-spin"></div>
                </div>
            </PageLayout>
        );
    }

    if (!material) {
        return (
            <PageLayout>
                <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center px-6 text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-3">Material não encontrado</h1>
                    <p className="text-zinc-400 text-sm mb-8 max-w-md">O material solicitado pode ter sido atualizado ou relocado.</p>
                    <Button asChild className="bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 font-semibold text-xs h-10 px-5 rounded-lg">
                        <Link to="/materiais">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ver todos os materiais
                        </Link>
                    </Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <SEO
                title={material.headline}
                description={material.subheadline || 'Material gratuito RevHackers'}
                canonical={`https://revhackers.com.br/materiais/${slug}`}
            />
            {/* Hero Section — Fundo Black Purificado (EXACT HOMEPAGE HERO BENCHMARK) */}
            <section className="relative min-h-[70vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 bg-black border-b border-zinc-900">
                <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
                    
                    <span className="text-[#00CC6A] text-xs font-semibold uppercase tracking-wider mb-4">
                        {material.type}
                    </span>

                    <h1 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center max-w-3xl mx-auto">
                        {material.headline}
                    </h1>

                    <p className="text-zinc-400 mb-8 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center">
                        {material.subheadline}
                    </p>

                    {!showForm ? (
                        <div>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-semibold text-sm h-11 px-6 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Baixar Material Gratuito →</span>
                            </Button>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500">Preencha o formulário abaixo para liberar seu acesso instantâneo.</p>
                    )}
                </div>
            </section>

            {/* Content / Form Section — Fundo 100% Branco Puro */}
            <section className="py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
                <div className="max-w-md mx-auto px-6">
                    {showForm ? (
                        <div className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-xs space-y-6">
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-zinc-950 tracking-tight">Liberar Acesso</h3>
                                <p className="text-xs text-zinc-500">Informe seu e-mail corporativo para receber o link de download</p>
                            </div>
                            <DownloadForm
                                materialId={material.id}
                                materialType={material.type}
                                onSubmit={() => {}}
                                linkMaterial={material.downloadLink}
                            />
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-sm h-12 px-8 rounded-xl shadow-xs transition-all"
                            >
                                Clique para Baixar Grátis →
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </PageLayout>
    );
}
