import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getAllMaterials } from '@/api/materials';
import DownloadForm from '@/components/shared/download-form';
import { useToast } from '@/components/ui/use-toast';
const MaterialDetalhe = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const [material, setMaterial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        const materials = await getAllMaterials();

        // Normalize the slug for comparison
        const normalizedSlug = slug?.toLowerCase().replace(/[^\w-]+/g, '-');

        // Find the material that matches the slug
        const foundMaterial = materials.find(item => {
          // Extract a slug from the title
          const itemTitle = typeof item.title === 'string' ? item.title : item.title?.rendered ? item.title.rendered : '';
          const itemSlug = itemTitle.toLowerCase().replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-'); // Replace multiple hyphens with a single one

          return itemSlug === normalizedSlug;
        });
        if (foundMaterial) {
          setMaterial(foundMaterial);
        } else {
          // Material not found, redirect to materials list
          navigate('/materiais');
          toast({
            title: "Material não encontrado",
            description: "O material que você está procurando não foi encontrado.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching material:", error);
        toast({
          title: "Erro ao carregar material",
          description: "Não foi possível carregar o material. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [slug, navigate, toast]);
  const handleDownloadClick = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('download-form')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };
  const handleFormSubmit = () => {
    toast({
      title: "Material disponível!",
      description: "Seu download está sendo preparado e foi enviado para seu email."
    });
    setShowForm(false);
  };
  const cleanHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };
  if (loading) {
    return <PageLayout>
        <div className="container-custom pt-32 pb-16 flex justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Carregando...
              </span>
            </div>
            <p className="mt-2 text-gray-600">Carregando material...</p>
          </div>
        </div>
      </PageLayout>;
  }
  if (!material) {
    return null; // Will redirect in useEffect
  }
  const title = typeof material.title === 'string' ? material.title : material.title?.rendered || '';
  const description = typeof material.description === 'string' ? material.description : material.description?.rendered || '';
  return <PageLayout>
      <section className="pt-32 pb-10 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" alt={cleanHtml(title)} className="w-full h-full object-cover" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex mb-4 items-center px-3 py-1 rounded-full text-xs font-medium bg-revgreen/10 text-revgreen">
              {material.type || 'Material'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" dangerouslySetInnerHTML={{
            __html: title
          }} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          <div className="prose prose-lg mx-auto mb-10">
            <div dangerouslySetInnerHTML={{
            __html: description
          }} />
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" onClick={handleDownloadClick} className="mt-8">
              <Download className="mr-2 h-5 w-5" />
              Baixar Material
            </Button>
          </div>
          
          {showForm && <div id="download-form" className="mt-16 mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8 border">
              <h2 className="text-2xl font-bold mb-6">
                Preencha seus dados para baixar "{cleanHtml(title)}"
              </h2>
              <DownloadForm materialId={material.materialId} materialType={material.type || 'Material'} linkMaterial={material.link_material} onSubmit={handleFormSubmit} />
            </div>}
        </div>
      </section>
    </PageLayout>;
};
export default MaterialDetalhe;