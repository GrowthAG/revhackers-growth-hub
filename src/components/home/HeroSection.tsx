
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { buildBookingUrl } from '@/utils/utm';

import { NumberTicker } from '@/components/ui/NumberTicker';

const stats = [
  { value: 47, suffix: '+',    label: 'empresas B2B' },
  { value: 48, prefix: 'R$', suffix: 'M+', label: 'em vendas geradas' },
  { prefix: 'NPS ', value: 94, label: 'satisfação de clientes' },
];

const HeroSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden border-b border-zinc-800/80 pt-36 pb-24 bg-[#09090b] text-white selection:bg-[#00CC6A] selection:text-black"
    >
      {/* Grid Cyber Background & Radial Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b20_1px,transparent_1px),linear-gradient(to_bottom,#18181b20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00CC6A]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-auto mb-auto">

        {/* Badge superior (Micro Label Tech) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex justify-center mb-8 relative z-10"
        >
          <div className="inline-flex items-center gap-3 border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
            <span className="font-mono text-3xs font-black tracking-[0.25em] text-zinc-300 uppercase">
              REVENUE OPERATIONS // B2B ARCHITECTURE
            </span>
          </div>
        </motion.div>

        {/* Headline com posicionamento RevOps */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.02] tracking-tighter w-full max-w-5xl mx-auto text-center text-balance relative z-10"
        >
          Escale as suas vendas. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00CC6A] via-[#00E577] to-white">
            Simplifique a operação.
          </span>
        </motion.h1>

        {/* Subheadline — Dark High-End */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="text-zinc-400 mb-10 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto text-center relative z-10"
        >
          A única assessoria estratégica B2B que unifica <strong className="text-white font-semibold">Processos, Automações, IA e CRM</strong>.<br className="hidden md:block"/>
          Abandone a força bruta operacional e conquiste previsibilidade via Engenharia de Receita pura.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto px-6 sm:px-0"
        >
          <Button asChild size="lg" className="bg-[#00CC6A] text-black hover:bg-[#00E577] font-black uppercase tracking-[0.2em] text-xs h-14 px-8 w-full sm:w-auto rounded-xl shadow-lg shadow-[#00CC6A]/20 transition-all duration-300 group/btn">
            <Link to={buildBookingUrl('homepage', 'hero_primary')} onClick={scrollToTop}>
              Auditar Minha Operação
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-bold uppercase tracking-[0.2em] text-xs h-14 px-8 w-full sm:w-auto rounded-xl backdrop-blur-md transition-all">
            <Link to="/cases" onClick={scrollToTop}>
              Ver Resultados Reais
            </Link>
          </Button>
        </motion.div>

        {/* Social proof - Metricas estilo Terminal / Console */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.40, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl p-6 rounded-2xl w-full max-w-3xl shadow-2xl relative"
        >
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00CC6A]/40 to-transparent" />
          
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center justify-center p-3 relative">
              {typeof stat.value === 'number' ? (
                <NumberTicker 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  prefix={stat.prefix} 
                  className="text-white font-mono font-black text-3xl leading-none tracking-tight" 
                />
              ) : (
                <span className="text-white font-mono font-black text-3xl leading-none tracking-tight">
                  {stat.value}
                </span>
              )}
              <span className="font-mono text-3xs font-semibold text-zinc-400 uppercase tracking-widest mt-2.5 text-center block">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;