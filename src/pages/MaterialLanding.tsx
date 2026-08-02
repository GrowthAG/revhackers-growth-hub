import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import DOMPurify from 'dompurify';
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

const formatHeadlineWithGreen = (text: string) => {
    if (!text) return null;
    const clean = text.replace(/<[^>]*>/g, '');
    if (clean.includes(':')) {
        const parts = clean.split(':');
        return (
            <>
                {parts[0]}: <span className="text-[#00CC6A]">{parts.slice(1).join(':')}</span>
            </>
        );
    }
    const words = clean.split(' ');
    if (words.length >= 4) {
        const main = words.slice(0, Math.ceil(words.length * 0.55)).join(' ');
        const highlight = words.slice(Math.ceil(words.length * 0.55)).join(' ');
        return (
            <>
                {main} <span className="text-[#00CC6A]">{highlight}</span>
            </>
        );
    }
    return <span className="text-white">{clean}</span>;
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
            {/* Hero Section — Fundo Black Purificado */}
            <section className="relative min-h-[50vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 bg-black border-b border-zinc-900">
                <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
                    
                    <span className="text-[#00CC6A] text-xs font-semibold uppercase tracking-wider mb-4">
                        {material.type}
                    </span>

                    <h1 className="font-sans text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white mb-5 leading-[1.15] tracking-tight text-center max-w-3xl mx-auto">
                        {formatHeadlineWithGreen(material.headline)}
                    </h1>

                    <p className="text-zinc-400 mb-6 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center">
                        {material.subheadline}
                    </p>

                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                        <span>Material 100% Gratuito</span>
                        <span>•</span>
                        <span>Download Instantâneo</span>
                    </div>
                </div>
            </section>

            {/* Content & Form Section — Fundo 100% Branco Puro com Contexto Rico */}
            <section className="py-16 md:py-24 bg-white text-zinc-900 border-b border-zinc-200/80">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Coluna Esquerda: Contexto, O que contém o material e Para quem é */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                                    Sobre este {material.type}
                                </h2>
                                <div 
                                    className="text-zinc-600 text-sm md:text-base leading-relaxed space-y-3"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize((material.description || material.subheadline || '').replace(/^<p>|<\/p>$/g, ''))
                                    }}
                                />
                            </div>

                            {/* Destaques e Entregáveis */}
                            <div className="bg-zinc-50/80 border border-zinc-200/80 p-6 rounded-2xl space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                                    O que você vai receber:
                                </h3>
                                <ul className="space-y-3 text-xs sm:text-sm">
                                    <li className="flex items-start gap-3 text-zinc-800 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-[#00CC6A] mt-1.5 shrink-0" />
                                        <span>Metodologia prática e aplicável imediatamente na sua operação B2B.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-zinc-800 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-[#00CC6A] mt-1.5 shrink-0" />
                                        <span>Templates e checklists validados com mais de R$ 50M em pipeline auditado.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-zinc-800 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-[#00CC6A] mt-1.5 shrink-0" />
                                        <span>Acesso direto ao material oficial sem custos ou pegadinhas.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Coluna Direita: Formulário Único de Liberação de Acesso */}
                        <div className="lg:col-span-5 bg-white border border-zinc-200/90 p-8 rounded-2xl shadow-sm space-y-6 sticky top-28">
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-extrabold text-zinc-950 tracking-tight">Liberar Acesso Gratuito</h3>
                                <p className="text-xs text-zinc-500">Informe seu e-mail corporativo para receber o link de download</p>
                            </div>
                            
                            <DownloadForm
                                materialId={material.id}
                                materialType={material.type}
                                onSubmit={() => {}}
                                linkMaterial={material.downloadLink}
                            />
                        </div>

                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
