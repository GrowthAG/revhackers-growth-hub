
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
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-start text-left">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-sans text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-left text-balance"
        >
          Montamos a sua estrutura de{' '}
          <span className="text-[#00CC6A]">
            GTM Engineer e ABM com Inteligência Artificial.
          </span>
        </motion.h1>

        {/* Subheadline — alinhada à esquerda com a headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="text-zinc-400 mb-4 text-base md:text-lg font-normal leading-relaxed max-w-xl text-left"
        >
          Engenharia de receita B2B que integra CRM, automações e inteligência artificial para escalar operações comerciais sem aumentar headcount.
        </motion.p>

        {/* Hammer line — ≤5 palavras, isolada */}
        {/* Partner logos — abaixo da headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.14, ease: 'easeOut' }}
          className="flex items-center justify-center gap-6 sm:gap-8 mb-8 flex-wrap"
        >
          {/* Claude Partner Network */}
          <img
            src="/brand/claude-partner-badge.png"
            alt="Claude Partner Network"
            className="h-5 sm:h-6 opacity-50 hover:opacity-80 transition-opacity invert"
          />
          <div className="w-px h-4 bg-zinc-700" />
          {/* Google for Startups — texto estilizado com ícone Google */}
          <div className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-white text-xs font-medium tracking-wide">Google for Startups</span>
          </div>
          <div className="w-px h-4 bg-zinc-700" />
          {/* Funnels */}
          <img
            src="/brand/funnels-logo-white.png"
            alt="Funnels Partner"
            className="h-5 sm:h-6 opacity-50 hover:opacity-80 transition-opacity"
          />
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
              Instalar a Auditoria de Escala
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-medium text-sm h-11 px-6 w-full sm:w-auto rounded-lg transition-colors">
            <Link to="/cases" onClick={scrollToTop}>
              Ver resultados reais
            </Link>
          </Button>
        </motion.div>

        {/* Microcopy — Hormozi: objection killer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.26, ease: 'easeOut' }}
          className="text-zinc-600 text-xs font-normal mb-8"
        >
          Sem contrato de 12 meses. Sem taxa de setup. Restam 4 vagas este mês.
        </motion.p>

        {/* Métricas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }}
          className="flex justify-center items-center gap-0 w-full max-w-md border-t border-zinc-800 pt-8"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="flex flex-col items-center px-5 sm:px-7 py-1">
                {typeof stat.value === 'number' ? (
                  <NumberTicker 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix} 
                    className="text-white font-mono font-bold text-xl sm:text-2xl leading-none tracking-tight" 
                  />
                ) : (
                  <span className="text-white font-mono font-bold text-xl sm:text-2xl leading-none tracking-tight">
                    {stat.value}
                  </span>
                )}
                <span className="text-zinc-500 text-[0.7rem] font-medium mt-2 text-center">
                  {stat.label}
                </span>
              </div>
              {i < stats.length - 1 && <div className="w-px h-8 bg-zinc-800" />}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;