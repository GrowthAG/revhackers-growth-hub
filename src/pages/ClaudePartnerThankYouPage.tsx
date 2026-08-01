import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function ClaudePartnerThankYouPage() {
  const navigate = useNavigate();

  return (
    <PageLayout headerVariant="default">
      <SEO
        title="Cadastro Confirmado | Claude Partner Network & RevHackers"
        description="Sua solicitação de acesso foi ativada com sucesso. Verifique seu e-mail corporativo."
        canonical="https://revhackers.com.br/claude-partner-network/obrigado"
      />

      {/* 1ª DOBRA: Hero Section Ultra-Minimalista (Fundo Preto) */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center overflow-hidden pt-32 pb-20 bg-black border-b border-zinc-900">
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
          
          {/* Lockup Oficial: Claude Partner Network by RevHackers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center justify-center gap-3 sm:gap-4 mb-2 p-3 px-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-inner"
          >
            <img
              src="/brand/claude-partner-network.svg"
              alt="Claude Partner Network"
              className="h-7 sm:h-9 w-auto object-contain"
            />
            <span className="text-zinc-400 font-medium text-xs sm:text-sm tracking-wide lowercase">by</span>
            <img
              src="/brand/revhackers-wordmark-white.png"
              alt="REVHACKERS"
              className="h-4 sm:h-5 w-auto object-contain"
            />
          </motion.div>

          {/* Headline H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
            className="font-sans text-[2.25rem] sm:text-[3.25rem] md:text-[4rem] font-extrabold text-white leading-[1.1] tracking-tight text-center max-w-2xl"
          >
            Tudo certo, sua conta foi ativada.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto text-center"
          >
            Enviamos a confirmação com os detalhes de acesso diretamente para a caixa de entrada do seu e-mail corporativo.
          </motion.p>

          {/* Botão de Retorno */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="pt-4"
          >
            <Button
              onClick={() => navigate('/')}
              className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] font-extrabold text-sm h-12 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Voltar para o Início</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

        </div>
      </section>

      {/* 2ª DOBRA: Próximos Passos (Fundo Claro SaaS - Padrão Institucional) */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="max-w-2xl">
            <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-2">
              Próximos Passos
            </p>
            <h2 className="text-zinc-900 text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              O que acontece agora
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                step: "01",
                title: "Verifique seu E-mail",
                desc: "Procure pelo e-mail com remetente RevHackers & Anthropic. Cheque a pasta de spam ou promoções por garantia."
              },
              {
                step: "02",
                title: "Ativação de Acessos",
                desc: "Siga as orientações enviadas para validar suas chaves e entrar no ambiente de parceiros."
              },
              {
                step: "03",
                title: "Start na Trilha Prática",
                desc: "Prepare-se para construir agentes autônomos de IA e aplicar em operações reais de receita."
              }
            ].map((item) => (
              <div key={item.step} className="flex flex-col justify-between h-full p-6 bg-white border border-zinc-200 rounded-xl hover:border-[#00CC6A]/50 transition-all shadow-xs group">
                <div>
                  <span className="text-[#00CC6A] text-xs font-mono font-extrabold tracking-widest uppercase block mb-3">
                    PASSO {item.step}
                  </span>
                  <h3 className="text-zinc-900 font-bold text-base mb-2 group-hover:text-[#00CC6A] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
