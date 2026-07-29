
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Database, Zap, Bot } from 'lucide-react';

const services = [
  {
    icon: Bot,
    title: 'IA + Vendas',
    desc: 'Seu SDR manda 200 emails genéricos por dia. Nós colocamos IA para enviar a mensagem certa, pro decisor certo, na hora que ele abre o LinkedIn.',
    result: '3x mais respostas qualificadas em 30 dias',
    link: '/servicos/tracao-midia-paga',
  },
  {
    icon: Database,
    title: 'CRM Inteligente',
    desc: 'Seu CRM tem 12.000 contatos e ninguém sabe quem é lead quente. Nós organizamos, pontuamos e priorizamos — o vendedor só abre o que vai fechar.',
    result: 'Pipeline limpo e acionável em 14 dias',
    link: '/servicos/ecossistema-crm',
  },
  {
    icon: Zap,
    title: 'Automação B2B',
    desc: 'Seu closer gasta 4 horas por dia em follow-up manual. Nós automatizamos. Ele só entra na ligação para fechar negócio.',
    result: '70% menos trabalho operacional por vendedor',
    link: '/servicos/automacao-inteligente',
  },
  {
    icon: Cpu,
    title: 'Treinamento Operacional',
    desc: 'Não entregamos um PDF e sumimos. Sentamos junto com a equipe e ensinamos a operar a estratégia na vida real. Com dados, não com achismo.',
    result: 'Equipe autônoma operando o sistema em 21 dias',
    link: '/servicos/founder-led-growth',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const ServicesSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="py-20 bg-zinc-50 border-b border-zinc-200"
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header — Hormozi: confrontação direta */}
        <div className="mb-14 max-w-2xl">
          <motion.p
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-3"
          >
            Como funciona
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-zinc-900 text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-4"
          >
            Você contratou SDRs, comprou ferramentas e postou no LinkedIn por 6 meses.{' '}
            <span className="text-zinc-400">Quanto disso virou receita auditada?</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-zinc-500 text-base leading-relaxed"
          >
            Nós não vendemos horas de consultoria. Nós instalamos 4 sistemas que encontram e fecham receita travada na sua operação.
          </motion.p>
        </div>

        {/* Grid 2x2 — Cards limpos, fundo branco */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={3 + i}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                <Link
                  to={service.link}
                  onClick={scrollToTop}
                  className="group flex flex-col h-full p-6 bg-white border border-zinc-200 rounded-xl hover:border-[#00CC6A]/30 hover:shadow-sm transition-all"
                >
                  {/* Ícone — sem sparkles, sem emojis */}
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00CC6A]/10 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-600 group-hover:text-[#00CC6A] transition-colors" strokeWidth={1.5} />
                  </div>

                  {/* Título */}
                  <h3 className="text-zinc-900 font-bold text-base mb-2 group-hover:text-[#00CC6A] transition-colors">
                    {service.title}
                  </h3>

                  {/* Descrição — Hormozi: plain language, número + verbo */}
                  <p className="text-zinc-500 text-sm leading-relaxed flex-1 mb-4">
                    {service.desc}
                  </p>

                  {/* Resultado concreto — Hormozi: dream outcome quantificado */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <span className="text-xs font-mono font-semibold text-[#00CC6A]">
                      {service.result}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#00CC6A] transition-colors" strokeWidth={1.5} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;
