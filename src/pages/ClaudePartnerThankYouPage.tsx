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

          {/* Card de Confirmação & Ativação de Acesso High-Tech */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-xl mx-auto mt-6 bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-left space-y-6"
          >
            {/* Header do Card */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00CC6A] animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Acesso Liberado & Ativo</span>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">Claude 3.5 Sonnet</span>
            </div>

            {/* Saudação */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Seja bem-vindo ao Claude Partner Network & RevHackers
              </h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal">
                Sua empresa agora faz parte do grupo selecionado pela <strong className="text-white font-bold">RevHackers & Anthropic</strong> para dominar a construção de agentes autônomos de IA e arquitetura de receitas B2B.
              </p>
            </div>

            {/* Grid de Detalhes da Conta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-black/50 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Status da Operação</span>
                <span className="text-xs font-bold text-[#00CC6A] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00CC6A]" /> Credenciais Liberadas
                </span>
              </div>

              <div className="bg-black/50 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Engenharia de IA</span>
                <span className="text-xs font-bold text-white">Claude 3.5 & Agentes Autônomos</span>
              </div>
            </div>

            {/* Botão de Acesso Direto ao Portal */}
            <div className="pt-2">
              <a
                href="https://eulerapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-xs sm:text-sm h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Entrar no Portal Euler App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2ª DOBRA: Próximos Passos (HEADLINES CENTRALIZADAS — ZERO PILL BADGES) */}
      <section className="py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <h2 className="text-zinc-900 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              O que acontece agora
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Próximas etapas após o envio da sua aplicação para o Claude Partner Network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Verifique seu E-mail",
                desc: "Procure pelo e-mail com remetente RevHackers & Anthropic. Cheque a caixa de entrada do seu e-mail corporativo."
              },
              {
                step: "02",
                title: "Entrar no Portal Euler App",
                desc: "Clique no botão de acesso direto no e-mail para validar credenciais e acessar o ambiente oficial."
              },
              {
                step: "03",
                title: "Start na Trilha Prática",
                desc: "Prepare-se para construir agentes autônomos de IA e aplicar em operações reais de receita."
              }
            ].map((item) => (
              <div
                key={item.step}
                className="p-5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all space-y-2"
              >
                <span className="text-zinc-400 font-sans font-semibold text-xs tracking-wider block">
                  {item.step} / Passo
                </span>
                <h3 className="text-zinc-900 font-bold text-base tracking-tight">
                  {item.title}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
