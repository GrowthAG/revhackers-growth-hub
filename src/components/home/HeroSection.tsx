
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { buildBookingUrl } from '@/utils/utm';

import { NumberTicker } from '@/components/ui/NumberTicker';

const stats = [
  { value: 47, suffix: '+',    label: 'Empresas B2B' },
  { value: 48, prefix: 'R$', suffix: 'M+', label: 'Pipeline gerado' },
  { prefix: 'NPS ', value: 94, label: 'Satisfação' },
];

const HeroSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 bg-black"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Headline — WHY + HOW (Hormozi) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center"
        >
          Nós não vendemos consultoria.{' '}
          <span className="text-[#00CC6A]">
            Instalamos sua máquina de receita B2B com ABM e IA em 90 dias.
          </span>
        </motion.h1>

        {/* Subheadline — mecanismo + risk reversal */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="text-zinc-400 mb-3 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center"
        >
          Construímos a engenharia de GTM e ABM dentro do seu CRM para colocar seus executivos na mesa das maiores contas do seu setor.
        </motion.p>

        {/* Hammer line — confrontação direta */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
          className="text-zinc-500 text-sm font-normal mb-6 italic text-center"
        >
          Agência vende relatório em PDF. Nós instalamos código e processos que colocam dinheiro em caixa.
        </motion.p>

        {/* Hammer line — ≤5 palavras, isolada */}
        {/* Partner logos — alinhamento óptico milimétrico de baseline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.14, ease: 'easeOut' }}
          className="flex items-center justify-center mb-8 flex-wrap"
        >
          {/* Claude Partner Network */}
          <div className="h-7 flex items-center px-3 sm:px-5">
            <img
              src="/brand/claude-partner-network.svg"
              alt="Claude Partner Network"
              className="h-4.5 sm:h-5 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity block"
            />
          </div>

          <div className="w-px h-4 bg-zinc-800 shrink-0" />

          {/* Meta Business Partner */}
          <div className="h-7 flex items-center px-3 sm:px-5">
            <img
              src="/brand/meta-business-partner.svg"
              alt="Meta Business Partner"
              className="h-4.5 sm:h-5 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity block"
            />
          </div>

          <div className="w-px h-4 bg-zinc-800 shrink-0" />

          {/* Google for Startups */}
          <div className="h-7 flex items-center gap-2 px-3 sm:px-5 opacity-75 hover:opacity-100 transition-opacity select-none">
            <svg className="w-4 h-4 shrink-0 block" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-white text-xs font-semibold tracking-tight whitespace-nowrap leading-none">Google for Startups</span>
          </div>

          <div className="w-px h-4 bg-zinc-800 shrink-0" />

          {/* Funnels Partner */}
          <div className="h-7 flex items-center px-3 sm:px-5">
            <img
              src="/brand/funnels-logo-white.png"
              alt="Funnels Partner"
              className="h-4.5 sm:h-5 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity block"
            />
          </div>
        </motion.div>

        {/* CTAs — Hormozi: Command CTA com consequência */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-3 mb-12 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-semibold text-sm h-11 px-6 w-full sm:w-auto rounded-lg transition-colors">
            <Link to={buildBookingUrl('homepage', 'hero_primary')} onClick={scrollToTop}>
              Instalar Engenharia de Receita
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-medium text-sm h-11 px-6 w-full sm:w-auto rounded-lg transition-colors">
            <Link to="/cases" onClick={scrollToTop}>
              Ver resultados reais
            </Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;