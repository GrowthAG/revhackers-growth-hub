
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { FileText, Book, BookOpen, BarChart3, PlaySquare, FileSpreadsheet, Search, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Section from '@/components/ui/Section';
import { Input } from '@/components/ui/input';
import MaterialModal from '@/components/shared/MaterialModal';
import SEO from '@/components/shared/SEO';
import DarkHeroSection from '@/components/shared/DarkHeroSection';
import BookingModal from '@/components/shared/BookingModal';
import { removeEmojis } from '@/utils/stringUtils';
// import { materialsData } from '@/data/materialsData'; // REMOVED: Usage of static data disabled.

// Icon map for dynamic icon rendering
const IconMap: Record<string, React.ElementType> = {
  FileText,
  Book,
  BookOpen,
  BarChart3,
  PlaySquare,
  FileSpreadsheet
};

const Materiais = () => {
  const [showForm, setShowForm] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [apiMaterials, setApiMaterials] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Buscar materiais do Supabase com timeout
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de rede')), 10000)
        );

        const fetchPromise = supabase
          .from('materials')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;

        if (data) {
          setApiMaterials(data);

        }
      } catch (err: any) {
        console.warn('⚠️ [DATABASE] Falha ao buscar materiais (usando offline/static):', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Pure Database Data - filter out materials with Google Drive links (invalid)
  const materials = apiMaterials.filter(m => {
    const link = (m.link_material || '').toLowerCase();
    return !link.includes('docs.google.com') && !link.includes('drive.google.com');
  });

  const handleDownloadClick = (material: any) => {
    setSelectedMaterial(material);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    toast({
      title: "Material disponível!",
      description: "Seu download está sendo preparado e foi enviado para seu email.",
    });
    setShowForm(false);
  };

  const categories = ['Todos', ...Array.from(new Set(materials.map(m => m.material_type || m.type).filter(Boolean)))];

  const filteredMaterials = materials.filter(material => {
    const title = material.material_name || material.title || '';
    const type = material.material_type || material.type || '';
    const description = material.description || '';

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || type === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout>
      <SEO
        title="Materiais Gratuitos para Escalar Vendas B2B"
        description="Frameworks, checklists, playbooks e templates gratuitos para escalar sua operação de revenue B2B. Conteúdo exclusivo para gestores de vendas e RevOps no Brasil."
        canonical="https://revhackers.com.br/materiais"
        breadcrumbs={[
          { name: "Home", url: "https://revhackers.com.br/" },
          { name: "Materiais", url: "https://revhackers.com.br/materiais" }
        ]}
      />
      <DarkHeroSection
        eyebrow="Materiais"
        title={
          <>
            Copie os frameworks de RevOps e IA{' '}
            <span className="text-[#00CC6A]">que usamos para escalar operações B2B.</span>
          </>
        }
        subtitle="Blueprints de arquitetura, scripts de automação e templates de Go-To-Market prontos para rodar no seu CRM hoje."
        searchPlaceholder="BUSCAR MATERIAIS..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Content Section (White Background) */}
      <section className="bg-white min-h-screen relative pb-24">
        

        <div className="container-custom relative z-10 pt-12">

          {loading ? (
            <div className="text-center py-20">
              <div className="mx-auto w-12 h-12 rounded-lg border-2 border-zinc-100 border-t-black animate-spin mb-4"></div>
              <p className="text-xxs font-bold uppercase tracking-tight text-zinc-400">Carregando Hub...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-200 bg-zinc-50/50 max-w-2xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-zinc-300" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-zinc-900">Nenhum material encontrado</h3>
              <p className="text-zinc-500 text-xxs font-bold uppercase tracking-tight">Tente ajustar seus termos de busca.</p>
              <Button
                variant="link"
                className="text-black uppercase text-xxs font-bold tracking-tight mt-6 hover:text-revgreen transition-colors"
                onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMaterials.map((material, index) => {
                const type = material.material_type || material.type || "Geral";
                const IconComponent = IconMap[type] || FileText;
                const title = material.material_name || material.title || "Sem título";

                return (
                  <div
                    key={index}
                    className="group"
                    onClick={() => {
                      // Generate slug from title and navigate to landing page
                      const slug = (material.slug || title)
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');
                      navigate(`/materiais/${slug}`);
                    }}
                  >
                    <div className="h-full flex flex-col p-8 rounded-xl border border-zinc-200 bg-white shadow-sm hover:-translate-y-1 transition-all duration-500 relative cursor-pointer group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-2xs font-bold uppercase tracking-tight text-black bg-white px-2 py-1 rounded-sm border border-zinc-200">
                          {type}
                        </span>
                        <IconComponent className="h-5 w-5 text-zinc-200 group-hover:text-black transition-all duration-500" />
                      </div>

                      <h3
                        className="text-base md:text-lg font-bold text-zinc-900"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(removeEmojis(title)) }}
                      ></h3>

                      <div
                        className="text-xxs text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed mb-8 flex-1 line-clamp-4"
                        dangerouslySetInnerHTML={{
                          __html: material.description ? (material.description.substring(0, 150) + (material.description.length > 150 ? '...' : '')) : ''
                        }}
                      />

                      <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                        <span className="text-xxs font-bold text-black uppercase tracking-tight transition-all flex items-center group-hover:gap-2">
                          Baixar Material
                          <ArrowRight className="ml-2 h-3 w-3 transition-all" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. CTA Footer */}
      <div className="py-24 bg-white border-t border-zinc-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
                Identificou a Dor?
              </h2>
              <p className="text-xl text-zinc-500 font-bold tracking-tight leading-relaxed">
                Pare de ler teoria. Aplique para que nossa Engenharia audite o seu funil e conecte seu CRM à ferramentas de IA.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                size="lg"
                onClick={() => setIsBookingOpen(true)}
                className="bg-black text-white hover:bg-revgreen hover:text-black font-bold tracking-wider uppercase px-10 h-11 rounded-lg text-xs transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-revgreen/20"
              >
                Auditar Minha Operação
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MaterialModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        material={selectedMaterial}
        onSuccess={handleFormSubmit}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </PageLayout>
  );
};

export default Materiais;
