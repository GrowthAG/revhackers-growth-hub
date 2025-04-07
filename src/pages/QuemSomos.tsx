
import PageLayout from '@/components/layout/PageLayout';
import BookingWidget from '@/components/shared/BookingWidget';
import HeroSection from '@/components/quem-somos/HeroSection';
import HistorySection from '@/components/quem-somos/HistorySection';
import TimelineSection from '@/components/quem-somos/TimelineSection';
import ValuesSection from '@/components/quem-somos/ValuesSection';
import CTASection from '@/components/quem-somos/CTASection';

const QuemSomos = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Nossa História */}
      <HistorySection />

      {/* Timeline Section */}
      <TimelineSection />

      {/* Nossos Valores */}
      <ValuesSection />

      {/* Agendamento */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <BookingWidget />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </PageLayout>
  );
};

export default QuemSomos;
