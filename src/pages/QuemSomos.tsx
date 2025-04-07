
import PageLayout from '@/components/layout/PageLayout';
import ContactFormSection from '@/components/home/ContactFormSection';
import HeroSection from '@/components/quem-somos/HeroSection';
import HistorySection from '@/components/quem-somos/HistorySection';
import TimelineSection from '@/components/quem-somos/TimelineSection';
import PrinciplesSection from '@/components/quem-somos/PrinciplesSection';
import TestimonialsSection from '@/components/quem-somos/TestimonialsSection';
import CTASection from '@/components/quem-somos/CTASection';

const QuemSomos = () => {
  return (
    <PageLayout>
      <HeroSection />
      <HistorySection />
      <TimelineSection />
      <PrinciplesSection />
      <TestimonialsSection />
      <ContactFormSection />
      <CTASection />
    </PageLayout>
  );
};

export default QuemSomos;
