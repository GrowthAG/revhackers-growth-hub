
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Book } from 'lucide-react';

const materials = [
  {
    title: "Guia Completo: Revenue Operations para B2B",
    description: "Aprenda como implementar Revenue Operations de forma eficiente em sua empresa e alinhar vendas, marketing e sucesso do cliente.",
    type: "E-book",
    icon: Book,
    downloadLink: "/downloads/ebook-revenue-operations-b2b.pdf",
  },
  {
    title: "Automação de Marketing B2B: Além do básico",
    description: "Descubra estratégias avançadas de automação para aumentar a eficiência e os resultados do seu marketing B2B.",
    type: "Whitepaper",
    icon: FileText,
    downloadLink: "/downloads/whitepaper-automacao-marketing-b2b.pdf",
  },
  {
    title: "Template: Dashboard de Revenue Intelligence",
    description: "Template pronto para você implementar um dashboard de Revenue Intelligence em sua empresa.",
    type: "Template",
    icon: FileText,
    downloadLink: "/downloads/template-dashboard-revenue-intelligence.xlsx",
  },
  {
    title: "Checklist: Implementação de RevOps",
    description: "Lista completa de verificação para implementar RevOps em sua empresa, desde o início até a maturidade.",
    type: "Checklist",
    icon: FileText,
    downloadLink: "/downloads/checklist-implementacao-revops.pdf",
  },
  {
    title: "Relatório: Benchmark de Empresas B2B",
    description: "Dados e insights sobre o desempenho de empresas B2B em diferentes setores.",
    type: "Relatório",
    icon: FileText,
    downloadLink: "/downloads/relatorio-benchmark-empresas-b2b.pdf",
  },
  {
    title: "Webinar: O futuro de Revenue Operations",
    description: "Gravação completa do nosso webinar sobre as tendências e o futuro de Revenue Operations.",
    type: "Webinar",
    icon: FileText,
    downloadLink: "/downloads/webinar-futuro-revenue-operations.mp4",
  }
];

const Downloads = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-10 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Materiais Gratuitos</h1>
            <p className="text-xl text-gray-300 mb-8">
              Baixe nossos conteúdos exclusivos sobre Revenue Operations, 
              automação e estratégias de crescimento B2B
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materials.map((material, index) => (
              <Card key={index} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-revgreen/10 text-revgreen">
                      {material.type}
                    </span>
                    <material.icon className="h-6 w-6 text-revgreen" />
                  </div>
                  <CardTitle className="mt-4">{material.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardDescription className="text-gray-600 mb-4">
                    {material.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Button asChild className="w-full" variant="default">
                    <a href={material.downloadLink} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Gratuito
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
                  ou uma análise personalizada para seu negócio.
                </p>
                <Button asChild variant="outline" className="border-revgreen text-revgreen hover:bg-revgreen hover:text-black">
                  <a href="/contato">Falar com especialista</a>
                </Button>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4" 
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

export default Downloads;
