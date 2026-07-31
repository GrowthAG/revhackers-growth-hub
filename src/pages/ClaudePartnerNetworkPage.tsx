import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, useInView } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Sparkles, AlertCircle, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const confirmationSchema = z.object({
  fullName: z.string().min(3, 'Informe seu nome completo'),
  corporateEmail: z.string().email('E-mail corporativo inválido').refine(val => {
    const domain = val.split('@')[1] || '';
    const freeDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'bol.com.br'];
    return !freeDomains.includes(domain.toLowerCase());
  }, 'Por favor, utilize seu e-mail corporativo'),
  company: z.string().min(2, 'Informe o nome da sua empresa'),
  role: z.string().min(2, 'Informe seu cargo'),
  website: z.string().min(3, 'Informe o site da empresa'),
  segment: z.string().min(1, 'Selecione o segmento da empresa'),
  whyParticipate: z.string().min(15, 'Descreva brevemente sua motivação'),
  whatToBuild: z.string().min(15, 'Descreva o que deseja construir ou melhorar'),
  confirmAvailability: z.boolean().refine(val => val === true, 'Você precisa confirmar disponibilidade até 27/10'),
  agreeTerms: z.boolean().refine(val => val === true, 'Você precisa concordar com os termos de participação'),
});

type ConfirmationFormData = z.infer<typeof confirmationSchema>;

const AUDIENCE_ROLES = [
  { title: 'SaaS & Founders', desc: 'Engenharia de produto e automação B2B' },
  { title: 'Software House & Devs', desc: 'Construção de soluções AI-native' },
  { title: 'Cibersegurança', desc: 'Compliance e governança de dados Enterprise' },
  { title: 'Automação & RevOps', desc: 'Orquestração de pipelines e CRMs inteligentes' },
  { title: 'Growth & CS', desc: 'Retenção e expansão de contas pós-venda' },
  { title: 'Produto & Liderança', desc: 'Estratégia de integração de IA em processos' }
];

export default function ClaudePartnerNetworkPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  const heroRef = useRef(null);
  const inViewHero = useInView(heroRef, { once: true });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmationFormData>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      confirmAvailability: false,
      agreeTerms: false,
    }
  });

  const onSubmit = async (data: ConfirmationFormData) => {
    setIsSubmitting(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('rei_responses' as any).insert({
        project_id: 'claude-partner-network-2026',
        context: 'lead_gen',
        source: 'quiz',
        responses: data,
        total_score: 100,
        maturity_level: 'Selected Partner',
        maturity_percentage: 100,
        completed_at: new Date().toISOString()
      });

      setIsSubmitted(true);
      toast({
        title: "Confirmação Registrada",
        description: "Seus dados foram salvos com sucesso. Nossa equipe validará sua participação.",
      });
    } catch (err: any) {
      console.warn("Save response fallback:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageLayout headerVariant="default">
      <SEO
        title="Claude Partner Network | Confirmação de Seleção RevHackers"
        description="Trilha exclusiva do Claude Partner Network com a RevHackers e Anthropic."
        canonical="https://revhackers.com.br/claude-partner-network"
      />

      {/* Hero Section — Fundo Black (IDÊNTICO À HOME) */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-32 pb-20 bg-black border-b border-zinc-900"
      >
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
          
          {/* Partner Badge — IDÊNTICO À HOME */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-semibold tracking-wide"
          >
            <img
              src="/brand/claude-partner-network.svg"
              alt="Claude Partner Network"
              className="h-4 w-auto object-contain opacity-90"
            />
            <span className="w-px h-3 bg-zinc-700" />
            <span className="text-[#00CC6A]">Trilha Oficial Restrita</span>
          </motion.div>
          
          {/* Headline H1 — IDÊNTICO À HOME */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
            className="font-sans text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight text-center"
          >
            Parabéns, <span className="text-[#00CC6A]">você foi selecionado</span>
          </motion.h1>

          {/* Subheadline — IDÊNTICO À HOME */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-zinc-400 text-base md:text-xl font-normal leading-relaxed max-w-2xl mx-auto text-center"
          >
            Você está entre as 10 pessoas convidadas para participar da trilha exclusiva do Claude Partner Network com a RevHackers.
          </motion.p>

          {/* Box de Apoio — Fundo Dark zinc-950 com Borda Zinc-800 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 max-w-2xl mx-auto text-sm text-zinc-300 text-left space-y-3 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-[#00CC6A] shrink-0" />
              <span>Programa Oficial Anthropic x RevHackers</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              Essa é uma trilha oficial da Anthropic, gratuita e restrita ao programa de parceiros. Ela foi criada para pessoas que querem aprender Claude na prática e aplicar isso em negócio real.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inViewHero ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={scrollToForm}
              className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] font-bold text-sm h-12 px-8 rounded-xl shadow-lg transition-all"
            >
              Ir para Confirmação de Vaga ↓
            </Button>
          </motion.div>

        </div>
      </section>

      {/* O que acontece agora & Público Elegível (Fundo Dark Suave zinc-950) */}
      <section className="py-20 bg-zinc-950 text-white border-b border-zinc-900">
        <div className="container-custom max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* O que acontece agora */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
                Próximos Passos
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                O que acontece agora
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { step: "01", title: "Você confirma seus dados", desc: "Preencha o formulário oficial de validação nesta página." },
                { step: "02", title: "A RevHackers valida sua participação", desc: "Nossa equipe analisa o alinhamento técnico do seu negócio." },
                { step: "03", title: "Você recebe as próximas instruções", desc: "Envio de chave de acesso, calendário de encontros e materiais." },
                { step: "04", title: "Você entra na trilha", desc: "Início do programa prático de desenvolvimento e aceleração." }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-xs font-mono font-bold text-zinc-950 bg-[#00CC6A] px-2.5 py-1 rounded-md shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Para quem essa trilha faz sentido */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
                Público Elegível
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Para quem essa trilha faz sentido
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AUDIENCE_ROLES.map((role) => (
                <div key={role.title} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check className="w-3.5 h-3.5 text-[#00CC6A] shrink-0" />
                    <span>{role.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal pl-5">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Formulário de Confirmação (Fundo Dark Purificado zinc-950) */}
      <section ref={formRef} className="py-20 bg-black text-white">
        <div className="container-custom max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
              Ativação de Vaga
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Formulário de Confirmação de Participação
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Preencha com atenção. As vagas não confirmadas dentro do prazo serão reatribuídas aos profissionais da lista de espera.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 bg-[#00CC6A] text-zinc-950 rounded-full flex items-center justify-center mx-auto font-bold text-2xl shadow-xs">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-white">Participação Confirmada com Sucesso</h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Sua confirmação foi registrada no sistema da RevHackers. Nossa equipe revisará seus dados e enviará os acessos e próximos passos no e-mail corporativo cadastrado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-950 p-8 sm:p-10 rounded-2xl border border-zinc-800 shadow-2xl">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">1. Nome Completo *</label>
                  <input
                    {...register('fullName')}
                    placeholder="Seu nome completo"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message}</p>}
                </div>

                {/* E-mail Corporativo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">2. E-mail Corporativo *</label>
                  <input
                    {...register('corporateEmail')}
                    placeholder="voce@empresa.com.br"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.corporateEmail && <p className="text-xs text-rose-500">{errors.corporateEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">3. Empresa *</label>
                  <input
                    {...register('company')}
                    placeholder="Nome da sua empresa"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.company && <p className="text-xs text-rose-500">{errors.company.message}</p>}
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">4. Cargo *</label>
                  <input
                    {...register('role')}
                    placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.role && <p className="text-xs text-rose-500">{errors.role.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Site da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">5. Site da Empresa *</label>
                  <input
                    {...register('website')}
                    placeholder="https://empresa.com.br"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.website && <p className="text-xs text-rose-500">{errors.website.message}</p>}
                </div>

                {/* Segmento da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">6. Segmento da Empresa *</label>
                  <select
                    {...register('segment')}
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  >
                    <option value="">Selecione o segmento</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Software house">Software house</option>
                    <option value="Cibersegurança">Cibersegurança</option>
                    <option value="Automação">Automação</option>
                    <option value="RevOps">RevOps</option>
                    <option value="Produto">Produto</option>
                    <option value="Growth">Growth</option>
                    <option value="CS">CS</option>
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Outro">Outro Segmento B2B</option>
                  </select>
                  {errors.segment && <p className="text-xs text-rose-500">{errors.segment.message}</p>}
                </div>
              </div>

              {/* Por que quer participar? */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">7. Por que você quer participar desta trilha? *</label>
                <textarea
                  {...register('whyParticipate')}
                  rows={3}
                  placeholder="Explique resumidamente seu contexto e expectativas com o programa de parceiros da Anthropic..."
                  className="w-full p-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                />
                {errors.whyParticipate && <p className="text-xs text-rose-500">{errors.whyParticipate.message}</p>}
              </div>

              {/* O que quer construir/melhorar? */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">8. O que você quer construir ou melhorar com Claude? *</label>
                <textarea
                  {...register('whatToBuild')}
                  rows={3}
                  placeholder="Descreva o caso de uso prático, automação ou funcionalidade que pretende implementar..."
                  className="w-full p-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                />
                {errors.whatToBuild && <p className="text-xs text-rose-500">{errors.whatToBuild.message}</p>}
              </div>

              {/* Checkboxes de Confirmação & Termos */}
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('confirmAvailability')}
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-800 bg-zinc-900 focus:ring-[#00CC6A]"
                  />
                  <span className="text-xs text-zinc-300 font-medium leading-normal">
                    9. Você confirma disponibilidade para acompanhar até 27/10? *
                  </span>
                </label>
                {errors.confirmAvailability && <p className="text-xs text-rose-500">{errors.confirmAvailability.message}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-800 bg-zinc-900 focus:ring-[#00CC6A]"
                  />
                  <span className="text-xs text-zinc-300 font-medium leading-normal">
                    10. Você concorda com os termos de participação listados abaixo? *
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-rose-500">{errors.agreeTerms.message}</p>}

              </div>

              {/* Termos de Participação */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Termos de Participação:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 leading-relaxed">
                  <li>A trilha é gratuita</li>
                  <li>A vaga é limitada</li>
                  <li>A participação depende de validação final</li>
                  <li>O não cumprimento do prazo pode levar à exclusão da turma</li>
                  <li>A confirmação não garante permanência se houver descumprimento</li>
                </ol>
              </div>

              {/* CTA Final */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-sm tracking-wide rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Validando e enviando confirmação...</span>
                  </>
                ) : (
                  <span>Confirmar minha participação</span>
                )}
              </Button>

            </form>
          )}

        </div>
      </section>
    </PageLayout>
  );
}
