
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Book, BookOpen, BarChart3, PlaySquare, FileSpreadsheet, ExternalLink } from 'lucide-react';
import DownloadForm from '@/components/shared/download-form';
import { useToast } from '@/components/ui/use-toast';
import { getAllMaterials } from '@/api/materials';

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
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const data = await getAllMaterials();
        setMaterials(data);
        console.log('Materials data from API:', data);
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais. Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [toast]);

  const handleDownloadClick = (material: any) => {
    setSelectedMaterial(material);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('download-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormSubmit = () => {
    toast({
      title: "Material disponível!",
      description: "Seu download está sendo preparado e foi enviado para seu email.",
    });
    setShowForm(false);
    console.log(`Material ${selectedMaterial?.materialId} requested for download`);
  };

  const cleanTitle = (title: string) => {
    const div = document.createElement('div');
    div.innerHTML = title;
    return div.textContent || div.innerText || '';
  };

  const getSlugFromTitle = (title: string) => {
    return cleanTitle(title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
  };

  return (
    <PageLayout>
      <section className="pt-32 pb-10 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
            alt="Materiais Gratuitos"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Materiais Gratuitos</h1>
            <p className="text-xl text-gray-300 mb-8">
              Baixe nossos conteúdos exclusivos sobre Revenue Operations, 
              Account Based Marketing e estratégias de crescimento para empresas B2B
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Carregando...
                  </span>
                </div>
                <p className="mt-2 text-gray-600">Carregando materiais...</p>
              </div>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-800">Nenhum material encontrado</h3>
              <p className="text-gray-600 mt-2">Estamos atualizando nossa biblioteca. Por favor, volte mais tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {materials.map((material, index) => {
                const IconComponent = IconMap[material.icon] || FileText;
                const materialSlug = getSlugFromTitle(material.title);
                
                return (
                  <Card key={index} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full flex flex-col">
                    <Link to={`/materiais/${materialSlug}`} className="flex-grow">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-revgreen/10 text-revgreen">
                            {material.type}
                          </span>
                          <IconComponent className="h-6 w-6 text-revgreen" />
                        </div>
                        <CardTitle className="mt-4" dangerouslySetInnerHTML={{ __html: material.title }} />
                      </CardHeader>
                      <CardContent className="pt-6">
                        <CardDescription 
                          className="text-gray-600 mb-4" 
                          dangerouslySetInnerHTML={{ 
                            __html: material.description.substring(0, 150) + (material.description.length > 150 ? '...' : '') 
                          }} 
                        />
                      </CardContent>
                    </Link>
                    <CardFooter className="bg-gray-50 border-t">
                      <Button 
                        className="w-full"
                        variant="default" 
                        onClick={() => navigate(`/materiais/${materialSlug}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
          
          {showForm && selectedMaterial && (
            <div id="download-form" className="mt-16 max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8 border">
              <h2 className="text-2xl font-bold mb-6">
                Preencha seus dados para baixar "{cleanTitle(selectedMaterial.title)}"
              </h2>
              <DownloadForm 
                materialId={selectedMaterial.materialId} 
                materialType={selectedMaterial.type}
                linkMaterial={selectedMaterial.link_material}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="bg-black text-white rounded-xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Precisa de conteúdo personalizado?
                </h2>
                <p className="text-gray-300 mb-6">
                  Entre em contato conosco para solicitar materiais exclusivos 
                  ou uma análise personalizada para seu negócio B2B.
                </p>
                <Button asChild variant="outline" className="border-revgreen text-revgreen hover:bg-revgreen hover:text-black">
                  <a href="/booking">Agendar conversa</a>
                </Button>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
                  alt="Análise personalizada" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Materiais;
