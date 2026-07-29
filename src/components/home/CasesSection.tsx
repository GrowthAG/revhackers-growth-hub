import { ArrowUpRight, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';
import { useState, useEffect } from 'react';
import { getFeaturedCases, CaseStudy } from '@/api/cases';
import { motion } from 'framer-motion';

const CasesSection = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await getFeaturedCases();
        if (data && data.length > 0) {
          setCases(data);
        }
      } catch (error) {
        console.error("Failed to load featured cases", error);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, []);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Section variant="light" className="bg-white relative py-20 border-t border-zinc-200">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header — Alinhado com a linguagem da Home */}
        <div className="mb-14 max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-3"
          >
            Cases de Sucesso
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-zinc-900 text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-4"
          >
            Mais de R$ 50 milhões em pipeline gerado <span className="text-zinc-400">com redução média de 40% no CAC.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="text-zinc-500 text-base leading-relaxed max-w-2xl mx-auto"
          >
            Resultados auditados em operações B2B que escalaram aquisição, conversão e retenção.
          </motion.p>
        </div>

        {/* Grid de Cases — Cards SaaS limpos */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cases.map((item, index) => {
              const anyItem = item as any;
              const description = anyItem.preview_description || "";

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <Link
                    to={`/cases/${item.slug}`}
                    onClick={scrollToTop}
                    className="group flex flex-col h-full bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    {/* Header do Card com Logo */}
                    <div className="h-44 overflow-hidden bg-zinc-50 flex items-center justify-center border-b border-zinc-100 p-8 relative">
                      <img
                        src={anyItem.client_logo || anyItem.logo}
                        alt={anyItem.title || anyItem.client_name}
                        className="max-w-[160px] max-h-[75px] w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-6 flex-1 flex flex-col bg-white">
                      <span className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-2">
                        {anyItem.case_category || 'Estratégia B2B'}
                      </span>

                      <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-[#00CC6A] transition-colors leading-snug">
                        {anyItem.title || anyItem.client_name}
                      </h3>

                      <p className="text-zinc-500 text-xs leading-relaxed mb-6 flex-1 line-clamp-3">
                        {description}
                      </p>

                      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 group-hover:text-[#00CC6A] transition-colors">
                          Ver Estudo Completo
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-[#00CC6A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Global CTA — Alinhada com os botões da marca */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex justify-center"
        >
          <Link
            to="/cases"
            onClick={scrollToTop}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 bg-zinc-950 text-white hover:bg-black font-semibold text-xs rounded-lg border border-zinc-900 transition-all shadow-xs"
          >
            <span>Ver Todos os Cases</span>
            <ArrowUpRight className="w-4 h-4 text-[#00CC6A]" />
          </Link>
        </motion.div>
      </div>
    </Section>
  );
};

export default CasesSection;
