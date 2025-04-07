
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import BookingWidget from '@/components/shared/BookingWidget';

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

            <div className="mt-20">
              <BookingWidget />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Comunidade;
