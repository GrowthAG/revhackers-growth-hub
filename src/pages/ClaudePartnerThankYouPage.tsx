import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export default function ClaudePartnerThankYouPage() {
  const navigate = useNavigate();

  return (
    <PageLayout headerVariant="default">
      <SEO
        title="Cadastro Confirmado | Claude Partner Network & RevHackers"
        description="Sua solicitação de acesso foi ativada com sucesso. Verifique seu e-mail corporativo."
        canonical="https://revhackers.com.br/claude-partner-network/obrigado"
      />

      {/* Hero Section Ultra-Minimalista */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-32 pb-20 bg-black border-b border-zinc-900">
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center space-y-8">
          
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

          {/* Icon Check Minimalista */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-16 h-16 rounded-full bg-[#00CC6A]/10 border border-[#00CC6A]/30 flex items-center justify-center text-[#00CC6A]"
          >
            <CheckCircle2 className="w-8 h-8 text-[#00CC6A]" />
          </motion.div>

          {/* Headline H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="font-sans text-[2.25rem] sm:text-[3rem] font-extrabold text-white leading-[1.1] tracking-tight text-center"
          >
            Tudo certo! Sua conta foi ativada. 🚀
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto text-center"
          >
            Enviamos a confirmação com os detalhes de acesso diretamente para a caixa de entrada do seu e-mail corporativo.
          </motion.p>

          {/* Card de Próximos Passos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-left space-y-6"
          >
            <div className="flex items-center gap-3 text-white font-bold text-sm uppercase tracking-wider text-[#00CC6A]">
              <Mail className="w-4 h-4" /> Próximos Passos Pós-Cadastro
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-[#00CC6A] text-xs font-mono font-extrabold px-2 py-1 bg-[#00CC6A]/10 border border-[#00CC6A]/20 rounded">01</span>
                <div>
                  <h4 className="text-white text-sm font-bold">Verifique sua Caixa de Entrada</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">Procure pelo e-mail com remetente RevHackers & Anthropic. Cheque também a pasta de spam ou promoções por garantia.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#00CC6A] text-xs font-mono font-extrabold px-2 py-1 bg-[#00CC6A]/10 border border-[#00CC6A]/20 rounded">02</span>
                <div>
                  <h4 className="text-white text-sm font-bold">Confirme as Instruções de Ativação</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">Siga os links no e-mail para validar seus acessos e entrar na comunidade de parceiros.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#00CC6A] text-xs font-mono font-extrabold px-2 py-1 bg-[#00CC6A]/10 border border-[#00CC6A]/20 rounded">03</span>
                <div>
                  <h4 className="text-white text-sm font-bold">Start na Trilha Prática</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">Prepare-se para construir agentes autônomos de IA e escalar operações reais de receita.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Botão de Retorno */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="pt-2"
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
    </PageLayout>
  );
}
