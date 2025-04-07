
import BookingWidget from '@/components/shared/BookingWidget';
import PageLayout from '@/components/layout/PageLayout';

const BookingPage = () => {
  return (
    <PageLayout>
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Agende uma conversa com nossa equipe
            </h1>
            <p className="text-lg text-gray-700">
              Obrigado por entrar em contato! Agora você pode escolher o melhor horário para conversarmos sobre suas necessidades.
            </p>
          </div>
          
          <div className="mt-10">
            <BookingWidget />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
