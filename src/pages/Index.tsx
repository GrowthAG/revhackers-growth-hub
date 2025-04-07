
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import DiagnosticSection from '@/components/home/DiagnosticSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersSection from '@/components/home/PartnersSection';
import JourneySection from '@/components/home/JourneySection';
import BenefitsSection from '@/components/home/BenefitsSection';
import FAQSection from '@/components/home/FAQSection';
import StatsSection from '@/components/home/StatsSection';
import QuoteSection from '@/components/home/QuoteSection';
import ContactFormSection from '@/components/home/ContactFormSection';
import CasesSection from '@/components/home/CasesSection';

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <PartnersSection />
      <StatsSection />
      <BenefitsSection />
      <JourneySection />
      <ServicesSection />
      <CasesSection />
      <QuoteSection />
      <TestimonialsSection />
      <DiagnosticSection />
      <ContactFormSection />
      <FAQSection />
    </PageLayout>
  );
};

export default Index;
