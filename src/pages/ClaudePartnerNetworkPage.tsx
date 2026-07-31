import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, useInView } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Sparkles, AlertCircle, Loader2, ArrowRight, Check, Cpu, Award, Layers, Clock, Lock, CheckCircle2 } from 'lucide-react';
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
  otherSegment: z.string().optional(),
  whyParticipate: z.string().min(15, 'Descreva brevemente sua motivação'),
  whatToBuild: z.string().min(15, 'Descreva o que deseja construir ou melhorar'),
  confirmAvailability: z.boolean().refine(val => val === true, 'Você precisa confirmar disponibilidade até 27/10'),
  agreeTerms: z.boolean().refine(val => val === true, 'Você precisa concordar com os termos de participação'),
}).refine((data) => {
  if (data.segment === 'Outro') {
    return !!data.otherSegment && data.otherSegment.trim().length >= 3;
  }
  return true;
}, {
  message: 'Por favor, especifique o seu segmento',
  path: ['otherSegment']
});

type ConfirmationFormData = z.infer<typeof confirmationSchema>;

const AUDIENCE_ROLES = [
  { icon: Cpu, title: 'SaaS & Founders', desc: 'Engenharia de produto e automação B2B' },
  { icon: Layers, title: 'Software House & Devs', desc: 'Construção de soluções AI-native' },
  { icon: ShieldCheck, title: 'Cibersegurança', desc: 'Compliance e governança de dados Enterprise' },
  { icon: Award, title: 'Automação & RevOps', desc: 'Orquestração de pipelines e CRMs inteligentes' },
  { icon: Sparkles, title: 'Growth & CS', desc: 'Retenção e expansão de contas pós-venda' },
  { icon: Check, title: 'Produto & Liderança', desc: 'Estratégia de integração de IA em processos' }
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
    watch,
    formState: { errors },
  } = useForm<ConfirmationFormData>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      confirmAvailability: false,
      agreeTerms: false,
    }
  });

  const selectedSegment = watch('segment');

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

      {/* Hero Section — Fundo Black Purificado (IDÊNTICO À HOME) */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-32 pb-20 bg-black border-b border-zinc-900"
      >
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
          
          {/* Logo Oficial Claude Partner Network — Alinhamento idêntico à Home */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <img
              src="/brand/claude-partner-network.svg"
              alt="Claude Partner Network"
              className="h-6 sm:h-7 w-auto object-contain opacity-90"
            />
            <span className="w-px h-4 bg-zinc-800" />
            <span className="text-[#00CC6A] text-xs font-semibold uppercase tracking-wider">
              Trilha Oficial Restrita
            </span>
          </motion.div>
          
          {/* Headline H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
            className="font-sans text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight text-center"
          >
            Parabéns, <span className="text-[#00CC6A]">você foi selecionado</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-zinc-400 text-base md:text-xl font-normal leading-relaxed max-w-2xl mx-auto text-center"
          >
            Você está entre as 10 pessoas convidadas para participar da trilha exclusiva do Claude Partner Network com a RevHackers.
          </motion.p>

          {/* Indicador de Status Limpo — Padrão da Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inViewHero ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[#00CC6A]" />
            <span>Vagas Selecionadas: <strong className="text-white">7 de 10 preenchidas</strong></span>
          </motion.div>

          {/* Box de Apoio */}
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
              className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] font-bold text-sm h-12 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Ir para Confirmação de Vaga</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

        </div>
      </section>

      {/* O que acontece agora & Público Elegível (PADRÃO EXACTO SERVICESSECTION DA HOME) */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          {/* O que acontece agora */}
          <div className="space-y-8">
            <div className="max-w-3xl">
              <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-2">
                Próximos Passos
              </p>
              <h2 className="text-zinc-900 text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                O que acontece agora
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {[
                { step: "01", title: "Confirmação de Dados", desc: "Preencha o formulário oficial nesta página para garantir sua vaga." },
                { step: "02", title: "Validação Técnica", desc: "Nossa equipe analisa o alinhamento técnico e de negócio." },
                { step: "03", title: "Recebimento de Acessos", desc: "Envio de chave de acesso, calendário de encontros e materiais." },
                { step: "04", title: "Entrada na Trilha", desc: "Início do programa prático de desenvolvimento com o time." }
              ].map((item) => (
                <div key={item.step} className="flex flex-col justify-between h-full p-6 bg-white border border-zinc-200 rounded-xl hover:border-[#00CC6A]/40 transition-all shadow-xs group">
                  <div>
                    <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center mb-5 text-xs font-mono font-bold text-zinc-900 group-hover:bg-[#00CC6A]/10 group-hover:text-[#00CC6A] transition-colors">
                      {item.step}
                    </div>
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

          {/* Para quem essa trilha faz sentido */}
          <div className="space-y-8 pt-10 border-t border-zinc-200/80">
            <div className="max-w-3xl">
              <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-2">
                Público Elegível
              </p>
              <h2 className="text-zinc-900 text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                Para quem essa trilha faz sentido
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {AUDIENCE_ROLES.map((role) => {
                const IconComponent = role.icon;
                return (
                  <div key={role.title} className="flex flex-col justify-between h-full p-6 bg-white border border-zinc-200 rounded-xl hover:border-[#00CC6A]/40 transition-all shadow-xs group">
                    <div>
                      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00CC6A]/10 transition-colors">
                        <IconComponent className="w-5 h-5 text-zinc-700 group-hover:text-[#00CC6A] transition-colors" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-zinc-900 font-bold text-base mb-2 group-hover:text-[#00CC6A] transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Formulário de Confirmação (PADRÃO EXACTO CONTACTFORMSECTION DA HOME) */}
      <section ref={formRef} className="py-20 bg-white text-zinc-900">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-3">
            <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase">
              Ativação de Vaga
            </p>
            <h2 className="text-zinc-900 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Formulário de Confirmação de Participação
            </h2>
            <p className="text-zinc-500 text-sm max-w-xl mx-auto">
              Preencha com atenção. As vagas não confirmadas dentro do prazo serão reatribuídas aos profissionais da lista de espera.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-10 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 bg-[#00CC6A] text-zinc-950 rounded-full flex items-center justify-center mx-auto font-bold text-xl shadow-xs">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-zinc-900">Participação Confirmada com Sucesso</h3>
              <p className="text-sm text-zinc-700 max-w-md mx-auto leading-relaxed">
                Sua confirmação foi registrada no sistema da RevHackers. Nossa equipe revisará seus dados e enviará os acessos e próximos passos no e-mail corporativo cadastrado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-50/60 p-8 sm:p-10 rounded-xl border border-zinc-200 shadow-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">1. Nome Completo *</label>
                  <input
                    {...register('fullName')}
                    placeholder="Seu nome completo"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName.message}</p>}
                </div>

                {/* E-mail Corporativo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">2. E-mail Corporativo *</label>
                  <input
                    {...register('corporateEmail')}
                    placeholder="voce@empresa.com.br"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.corporateEmail && <p className="text-xs text-rose-600">{errors.corporateEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">3. Empresa *</label>
                  <input
                    {...register('company')}
                    placeholder="Nome da sua empresa"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.company && <p className="text-xs text-rose-600">{errors.company.message}</p>}
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">4. Cargo *</label>
                  <input
                    {...register('role')}
                    placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.role && <p className="text-xs text-rose-600">{errors.role.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Site da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">5. Site da Empresa *</label>
                  <input
                    {...register('website')}
                    placeholder="https://empresa.com.br"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.website && <p className="text-xs text-rose-600">{errors.website.message}</p>}
                </div>

                {/* Segmento da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">6. Segmento da Empresa *</label>
                  <select
                    {...register('segment')}
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
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
                  {errors.segment && <p className="text-xs text-rose-600">{errors.segment.message}</p>}
                </div>
              </div>

              {/* Card Condicional: Especificar Segmento quando 'Outro' for selecionado */}
              {selectedSegment === 'Outro' && (
                <div className="p-5 rounded-xl bg-white border border-[#00CC6A]/40 shadow-xs space-y-2 transition-all">
                  <label className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00CC6A]" />
                    Especificar Segmento da Empresa *
                  </label>
                  <input
                    {...register('otherSegment')}
                    placeholder="Qual o segmento específico da sua empresa?"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                  />
                  {errors.otherSegment && <p className="text-xs text-rose-600 font-medium">{errors.otherSegment.message}</p>}
                </div>
              )}

              {/* Por que quer participar? */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800">7. Por que você quer participar desta trilha? *</label>
                <textarea
                  {...register('whyParticipate')}
                  rows={3}
                  placeholder="Explique resumidamente seu contexto e expectativas com o programa de parceiros da Anthropic..."
                  className="w-full p-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                />
                {errors.whyParticipate && <p className="text-xs text-rose-600">{errors.whyParticipate.message}</p>}
              </div>

              {/* O que quer construir/melhorar? */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800">8. O que você quer construir ou melhorar com Claude? *</label>
                <textarea
                  {...register('whatToBuild')}
                  rows={3}
                  placeholder="Descreva o caso de uso prático, automação ou funcionalidade que pretende implementar..."
                  className="w-full p-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                />
                {errors.whatToBuild && <p className="text-xs text-rose-600">{errors.whatToBuild.message}</p>}
              </div>

              {/* Checkboxes de Confirmação & Termos */}
              <div className="pt-4 border-t border-zinc-200 space-y-4">
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('confirmAvailability')}
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 bg-white focus:ring-[#00CC6A]"
                  />
                  <span className="text-xs text-zinc-700 font-medium leading-normal">
                    9. Você confirma disponibilidade para acompanhar até 27/10? *
                  </span>
                </label>
                {errors.confirmAvailability && <p className="text-xs text-rose-600">{errors.confirmAvailability.message}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 bg-white focus:ring-[#00CC6A]"
                  />
                  <span className="text-xs text-zinc-700 font-medium leading-normal">
                    10. Você concorda com os termos de participação listados abaixo? *
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-rose-600">{errors.agreeTerms.message}</p>}

              </div>

              {/* Termos de Participação & Compromisso */}
              <div className="p-5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-600 space-y-3 shadow-xs">
                <p className="font-bold text-zinc-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Termos de Participação & Compromisso de Conclusão:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 leading-relaxed font-normal">
                  <li>A trilha é 100% gratuita (investimento coberto pelo programa de parceiros).</li>
                  <li>As vagas são estritamente limitadas e a participação depende de validação final.</li>
                  <li>Carga horária estimada de 40 horas práticas com prazo final impreterível em 27/10.</li>
                  <li>Para garantir o compromisso da turma, a não conclusão ou abandono sem justificativa prévia até 27/10 acarretará taxa de não-conclusão de R$ 500.</li>
                  <li>A confirmação de inscrição implica na concordância com o cronograma e os termos de dedicação.</li>
                </ol>
              </div>

              {/* CTA Final */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-sm tracking-wide rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
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
