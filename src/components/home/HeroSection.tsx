
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { buildBookingUrl } from '@/utils/utm';

import { NumberTicker } from '@/components/ui/NumberTicker';

const stats = [
  { value: 47, suffix: '+',    label: 'EMPRESAS B2B' },
  { value: 48, prefix: 'R$', suffix: 'M+', label: 'EM VENDAS GERADAS' },
  { prefix: 'NPS ', value: 94, label: 'SATISFAÇÃO' },
];

const HeroSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden border-b border-zinc-200 pt-32 pb-20 bg-white"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-auto mb-auto">

        {/* Micro Label — Seca, industrial, sem badge arredondado */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex justify-center mb-8 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00CC6A]" />
            <span className="text-[0.65rem] font-black tracking-[0.25em] text-zinc-900 uppercase">
              REVENUE OPERATIONS // B2B
            </span>
          </div>
        </motion.div>

        {/* Headline — Grande, preta, seca */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-900 mb-6 leading-[1.05] tracking-tight w-full max-w-5xl mx-auto text-center text-balance relative z-10"
        >
          Escale suas vendas.<br />
          Simplifique a operação.
        </motion.h1>

        {/* Subheadline — Limpa, focada, sem excesso */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="text-zinc-500 mb-10 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto text-center relative z-10"
        >
          A única assessoria B2B que unifica <strong className="text-zinc-900 font-bold">Processos, Automações, IA e CRM</strong>. Abandone a força bruta operacional e conquiste previsibilidade via Engenharia de Receita.
        </motion.p>

        {/* CTAs — Botões retos (rounded-none), sem sombra suave */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto px-6 sm:px-0"
        >
          <Button asChild size="lg" className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-black uppercase tracking-[0.2em] text-xs h-14 px-8 w-full sm:w-auto rounded-none border-2 border-black transition-colors">
            <Link to={buildBookingUrl('homepage', 'hero_primary')} onClick={scrollToTop}>
              AUDITAR MINHA OPERAÇÃO
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-50 font-black uppercase tracking-[0.2em] text-xs h-14 px-8 w-full sm:w-auto rounded-none transition-colors">
            <Link to="/cases" onClick={scrollToTop}>
              VER RESULTADOS
            </Link>
          </Button>
        </motion.div>

        {/* Métricas — Secas, sem card, só bordas finas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.40, ease: 'easeOut' }}
          className="flex justify-center items-center border-t border-zinc-200 pt-8 w-full max-w-2xl"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="flex flex-col items-center px-8 py-2">
                {typeof stat.value === 'number' ? (
                  <NumberTicker 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix} 
                    className="text-zinc-900 font-black text-2xl leading-none tracking-tight" 
                  />
                ) : (
                  <span className="text-zinc-900 font-black text-2xl leading-none tracking-tight">
                    {stat.value}
                  </span>
                )}
                <span className="text-[0.6rem] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2.5 text-center block">
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