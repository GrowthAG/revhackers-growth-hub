import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ModernTechnicalBackground from '@/components/shared/ModernTechnicalBackground';

const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 min-h-[90vh] flex flex-col justify-center items-center border-b border-white/10 overflow-hidden bg-black text-center">
      {/* Modern Hacker Aesthetic Background */}
      <ModernTechnicalBackground />

      <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
        <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-4">
          Quem Somos
        </p>
        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center">
          Não entregamos apresentações de slides. Instalamos sistemas de engenharia de receita.
        </h1>
        <p className="text-zinc-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center mb-8">
          Combinamos engenharia de dados, IA e estratégia Go-To-Market para transformar vendas B2B. Claude Partner, Google for Startups, Funnels Partner.
        </p>

        {/* Buttons - Single as requested */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
          <Button asChild className="bg-white text-black h-11 px-8 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-revgreen hover:text-black transition-all duration-300">
            <Link to="/diagnostico" onClick={scrollToTop}>
              Conhecer a Metodologia //
            </Link>
          </Button>
        </div>

        {/* Expertise Pillars - Minimalist */}
        <div className="w-full mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-zinc-500 tracking-wide uppercase">
            <span>Geração de Demanda</span>
            <span className="hidden md:inline text-zinc-800">•</span>
            <span>Automação & CRM</span>
            <span className="hidden md:inline text-zinc-800">•</span>
            <span>CRO & Analytics</span>
            <span className="hidden md:inline text-zinc-800">•</span>
            <span>RevOps</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;