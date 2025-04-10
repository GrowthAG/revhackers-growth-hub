
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { MessageSquare, Share2, Users, Zap, Calendar, Video, BookOpen, Trophy, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comunidade = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
            alt="Comunidade RevHackers"
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
            <a href="https://academy.revhackers.com.br/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="text-revgreen border-revgreen hover:bg-revgreen hover:text-black"
              >
                Faça parte
              </Button>
            </a>
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
            <h2 className="text-3xl font-bold text-center mb-6">Benefícios exclusivos para membros</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Uma plataforma completa para profissionais de Revenue Operations, Marketing e Vendas 
              acelerarem o crescimento de suas carreiras e negócios.
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
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Meetups exclusivos</h3>
                    <p className="text-gray-600">
                      Encontros presenciais e online para trocar experiências com os melhores profissionais do mercado.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-revgreen rounded-full flex items-center justify-center">
                    <Video className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Bootcamps especializados</h3>
                    <p className="text-gray-600">
                      Treinamentos intensivos para desenvolver habilidades práticas de RevOps, Marketing e Vendas B2B.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-revgreen rounded-full flex items-center justify-center">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Biblioteca de recursos</h3>
                    <p className="text-gray-600">
                      Acesso a templates, playbooks e ferramentas desenvolvidas por especialistas para acelerar seus resultados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Mais vantagens para sua carreira</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                  <Trophy className="h-6 w-6 text-revgreen" />
                </div>
                <h3 className="text-xl font-bold mb-3">Mentorias exclusivas</h3>
                <p className="text-gray-600">
                  Sessões individuais com líderes de mercado para orientação de carreira e negócios.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-revgreen" />
                </div>
                <h3 className="text-xl font-bold mb-3">Networking estratégico</h3>
                <p className="text-gray-600">
                  Conexões qualificadas com profissionais de empresas líderes de mercado e startups inovadoras.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-revgreen" />
                </div>
                <h3 className="text-xl font-bold mb-3">Oportunidades de carreira</h3>
                <p className="text-gray-600">
                  Acesso privilegiado a vagas e projetos com empresas parceiras da comunidade RevHackers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Junte-se à comunidade RevHackers</h2>
            <p className="text-xl mb-12">
              Faça parte do maior hub de profissionais de RevOps, Marketing e Vendas B2B do Brasil e acelere seus resultados.
            </p>
            
            <a href="https://academy.revhackers.com.br/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="default"
                size="lg"
                className="bg-revgreen text-black hover:brightness-110"
              >
                Faça parte agora
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Comunidade;
