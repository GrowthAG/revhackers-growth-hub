
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import CasesSection from '@/components/home/CasesSection';
import BlogSection from '@/components/home/BlogSection';
import DiagnosticSection from '@/components/home/DiagnosticSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <ServicesSection />
      <CasesSection />
      <TestimonialsSection />
      <BlogSection />
      <DiagnosticSection />
    </PageLayout>
  );
};

export default Index;
