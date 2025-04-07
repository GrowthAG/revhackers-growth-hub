
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import BookingWidget from '@/components/shared/BookingWidget';
import { MessageSquare, Share2, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comunidade = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Comunidade RevHackers</h1>
            <p className="text-xl text-gray-300 mb-8">
              Conecte-se com outros profissionais de Revenue Operations, Marketing e Vendas.
              Compartilhe experiências, aprenda e cresça junto com nossa comunidade.
            </p>
            <Button variant="outline" size="lg" className="text-revgreen border-revgreen hover:bg-revgreen hover:text-black">
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

      <section className="py-16 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Agende sua demonstração</h2>
            <p className="text-xl mb-12">
              Quer conhecer nossa comunidade por dentro antes de se inscrever?
              Agende uma conversa com nossa equipe.
            </p>
            
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <BookingWidget />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Comunidade;
