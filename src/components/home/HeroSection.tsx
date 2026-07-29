
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { buildBookingUrl } from '@/utils/utm';

import { NumberTicker } from '@/components/ui/NumberTicker';

const stats = [
  { value: 47, suffix: '+',    label: 'Empresas B2B' },
  { value: 48, prefix: 'R$', suffix: 'M+', label: 'Em vendas geradas' },
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
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Headline — tamanho Funnels: 2.25rem mobile, 3rem desktop */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-sans text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center text-balance"
        >
          Escale suas vendas.{' '}
          <span className="text-[#00CC6A]">
            Simplifique a operação.
          </span>
        </motion.h1>

        {/* Subheadline — 1rem / 1.125rem, normal weight */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="text-zinc-400 mb-8 text-base md:text-lg font-normal leading-relaxed max-w-xl mx-auto text-center"
        >
          A única assessoria B2B que unifica Processos, Automações, IA e CRM para transformar sua operação comercial em uma máquina de receita previsível.
        </motion.p>

        {/* CTAs — rounded-lg, tamanho médio */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-3 mb-12 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-semibold text-sm h-11 px-6 w-full sm:w-auto rounded-lg transition-colors">
            <Link to={buildBookingUrl('homepage', 'hero_primary')} onClick={scrollToTop}>
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-medium text-sm h-11 px-6 w-full sm:w-auto rounded-lg transition-colors">
            <Link to="/cases" onClick={scrollToTop}>
              Ver resultados
            </Link>
          </Button>
        </motion.div>

        {/* Métricas — Estilo Funnels: números mono, labels pequenos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.28, ease: 'easeOut' }}
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