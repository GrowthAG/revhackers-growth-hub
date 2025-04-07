
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersSection from '@/components/home/PartnersSection';
import JourneySection from '@/components/home/JourneySection';
import BenefitsSection from '@/components/home/BenefitsSection';
import FAQSection from '@/components/home/FAQSection';
import StatsSection from '@/components/home/StatsSection';
import QuoteSection from '@/components/home/QuoteSection';
import ContactFormSection from '@/components/home/ContactFormSection';

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <StatsSection />
      <BenefitsSection />
      <ServicesSection />
      <JourneySection />
      <PartnersSection />
      <TestimonialsSection />
      <QuoteSection />
      <FAQSection />
      <ContactFormSection />
    </PageLayout>
  );
};

export default Index;
