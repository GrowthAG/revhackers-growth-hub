
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import CasesSection from '@/components/home/CasesSection';
import BlogSection from '@/components/home/BlogSection';
import DiagnosticSection from '@/components/home/DiagnosticSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersSection from '@/components/home/PartnersSection';
import JourneySection from '@/components/home/JourneySection';

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <PartnersSection />
      <JourneySection />
      <ServicesSection />
      <DiagnosticSection />
      <CasesSection />
      <TestimonialsSection />
      <BlogSection />
    </PageLayout>
  );
};

export default Index;
