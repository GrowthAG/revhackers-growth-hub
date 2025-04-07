
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { MessageSquare, Share2, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comunidade = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white relative">
        {/* Faded cover image */}
        <div className="absolute inset-0 z-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1540304453527-62f979142a17" 
            alt="Comunidade background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Comunidade RevHackers</h1>
            <p className="text-xl text-gray-300 mb-8">
              Conecte-se com outros profissionais de Revenue Operations, Marketing e Vendas.
              Compartilhe experiências, aprenda e cresça junto com nossa comunidade.
            </p>
            <Button size="lg" className="text-white bg-revgreen hover:bg-revgreen/90">
              Participar agora
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Por que participar da nossa comunidade?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4 flex justify-center">🎓</div>
                <h3 className="text-xl font-bold mb-3">Aprendizado contínuo</h3>
                <p className="text-gray-600">
                  Acesso a conteúdos exclusivos, webinars e discussões com especialistas do mercado.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4 flex justify-center">🔄</div>
                <h3 className="text-xl font-bold mb-3">Networking</h3>
                <p className="text-gray-600">
                  Conecte-se com profissionais do setor e amplie sua rede de contatos.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4 flex justify-center">💡</div>
                <h3 className="text-xl font-bold mb-3">Insights valiosos</h3>
                <p className="text-gray-600">
                  Descubra tendências, ferramentas e estratégias que estão transformando o mercado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">Como funciona nossa comunidade</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Uma plataforma exclusiva para profissionais de Revenue Operations, Marketing e Vendas 
              compartilharem conhecimento e acelerarem o crescimento de seus negócios.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
                  alt="Comunidade RevHackers" 
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-revgreen rounded-full flex items-center justify-center">
                    <MessageSquare className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Fóruns de discussão</h3>
                    <p className="text-gray-600">
                      Participe de conversas temáticas sobre os principais desafios e soluções da área de RevOps.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-revgreen rounded-full flex items-center justify-center">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Eventos exclusivos</h3>
                    <p className="text-gray-600">
                      Webinars, workshops e encontros online com profissionais renomados do mercado.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-revgreen rounded-full flex items-center justify-center">
                    <Share2 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Recursos compartilhados</h3>
                    <p className="text-gray-600">
                      Biblioteca com templates, guias e ferramentas para otimizar seus processos de RevOps.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-revgreen rounded-full flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Networking direcionado</h3>
                    <p className="text-gray-600">
                      Conecte-se com profissionais do seu setor para trocar experiências e oportunidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-900 to-black text-white relative">
        <div className="absolute inset-0 z-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca" 
            alt="RevHackers community" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Faça parte da nossa comunidade</h2>
            <p className="text-xl mb-10">
              Junte-se a profissionais de todo o Brasil e transforme sua carreira e resultados
            </p>
            
            <Button size="lg" className="text-white bg-revgreen hover:bg-revgreen/90 px-10">
              Participar agora
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Comunidade;
