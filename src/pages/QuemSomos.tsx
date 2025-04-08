
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import BookingWidget from '@/components/shared/BookingWidget';
import HeroSection from '@/components/quem-somos/HeroSection';
import HistorySection from '@/components/quem-somos/HistorySection';
import TimelineSection from '@/components/quem-somos/TimelineSection';
import ValuesSection from '@/components/quem-somos/ValuesSection';
import CTASection from '@/components/quem-somos/CTASection';
import ContactForm from '@/components/shared/ContactForm';

const QuemSomos = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

      {/* Contact Form and Agendamento */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-center mb-6">
              Entre em contato para agendar uma conversa
            </h3>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <ContactForm />
            </div>
          </div>
          <BookingWidget />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </PageLayout>
  );
};

export default QuemSomos;
