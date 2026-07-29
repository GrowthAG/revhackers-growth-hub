
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
      className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-32 pb-20 bg-white"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Headline — Outfit display, grande, limpa */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-display text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] font-extrabold text-zinc-900 mb-6 leading-[1.08] tracking-tight text-center text-balance"
        >
          Escale suas vendas.{' '}
          <span className="text-[#00CC6A]">
            Simplifique a operação.
          </span>
        </motion.h1>

        {/* Subheadline — Inter, 18-20px, leve */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="font-body text-zinc-500 mb-10 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto text-center"
        >
          A única assessoria B2B que unifica Processos, Automações, IA e CRM. Abandone a força bruta operacional e conquiste previsibilidade via Engenharia de Receita.
        </motion.p>

        {/* CTAs — Botões com rounded-lg, estilo Funnels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-3 mb-14 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-bold text-sm h-12 px-7 w-full sm:w-auto rounded-lg transition-colors">
            <Link to={buildBookingUrl('homepage', 'hero_primary')} onClick={scrollToTop}>
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 font-medium text-sm h-12 px-7 w-full sm:w-auto rounded-lg transition-colors">
            <Link to="/cases" onClick={scrollToTop}>
              Ver resultados
            </Link>
          </Button>
        </motion.div>

        {/* Métricas — Limpas, separadas por linha, fonte mono nos números */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          className="flex justify-center items-center gap-0 w-full max-w-xl"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="flex flex-col items-center px-6 sm:px-8 py-2">
                {typeof stat.value === 'number' ? (
                  <NumberTicker 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix} 
                    className="text-zinc-900 font-mono font-bold text-2xl sm:text-3xl leading-none tracking-tight" 
                  />
                ) : (
                  <span className="text-zinc-900 font-mono font-bold text-2xl sm:text-3xl leading-none tracking-tight">
                    {stat.value}
                  </span>
                )}
                <span className="text-zinc-400 text-xs font-medium mt-2 text-center">
                  {stat.label}
                </span>
              </div>
              {i < stats.length - 1 && <div className="w-px h-10 bg-zinc-200" />}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;