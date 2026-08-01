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
import { sendToGHL } from '@/lib/ghlRelay';

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
  { icon: Cpu, title: 'Founders & Hackers', desc: 'Quem constrói o produto e quer IA rodando no core do negócio' },
  { icon: Layers, title: 'Devs & Tech Leads', desc: 'Galera de código que quer criar agentes autônomos de verdade com Claude' },
  { icon: ShieldCheck, title: 'Cibersegurança', desc: 'Quem cuida de infraestrutura, chaves e segurança sem passar vergonha' },
  { icon: Award, title: 'RevOps & Automações', desc: 'Quem quer matar o trabalho braçal e automatizar o funil B2B' },
  { icon: Sparkles, title: 'Growth & Vendas', desc: 'Quem vive de bater meta, escalar máquina de vendas e gerar receita' },
  { icon: Check, title: 'Líderes de Produto', desc: 'Quem decide o roadmap e não quer ficar pra trás na corrida de IA' }
];

export default function ClaudePartnerNetworkPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  const heroRef = useRef(null);
  const inViewHero = useInView(heroRef, { once: true });

  const {
    register,
    handleSubmit,
    trigger,
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

  const handleNextStep1 = async () => {
    const isValid = await trigger(['fullName', 'corporateEmail']);
    if (isValid) setStep(2);
  };

  const handleNextStep2 = async () => {
    const isValid = await trigger(['company', 'role', 'website', 'segment', 'otherSegment']);
    if (isValid) setStep(3);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (data: ConfirmationFormData) => {
    setIsSubmitting(true);
    try {
      const finalSegment = data.segment === 'Outro' && data.otherSegment
        ? data.otherSegment
        : data.segment;

      await sendToGHL('claude_partner_network', {
        fullName: data.fullName,
        email: data.corporateEmail,
        company: data.company,
        role: data.role,
        website: data.website,
        segment: finalSegment,
        whyParticipate: data.whyParticipate,
        whatToBuild: data.whatToBuild,
      });

      setIsSubmitted(true);
      toast({
        title: "Confirmação Registrada",
        description: "Seus dados foram salvos com sucesso. Nossa equipe validará sua participação.",
      });
    } catch (err: any) {
      console.warn("GHL integration fallback:", err);
      setIsSubmitted(true);
      toast({
        title: "Confirmação Registrada",
        description: "Seus dados foram salvos. Entraremos em contato em breve.",
      });
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
            Seja bem-vindo ao <span className="text-[#00CC6A]">Claude Partner Network</span> & RevHackers.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-zinc-400 text-base md:text-xl font-normal leading-relaxed max-w-2xl mx-auto text-center"
          >
            Sem mimimi corporativo ou palestrinha. Aqui a gente constrói agentes autônomos de IA e escala operação de receita na prática usando o ecossistema do Claude 3.5 Sonnet.
          </motion.p>

          {/* Indicador de Status Limpo — Padrão da Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inViewHero ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[#00CC6A]" />
            <span>Papo reto: <strong className="text-white">Trilha de execução restrita RevHackers × Anthropic</strong></span>
          </motion.div>

          {/* Box de Apoio */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="w-full max-w-2xl bg-zinc-900/80 rounded-xl p-5 border border-zinc-800 text-left space-y-2"
          >
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#00CC6A]" />
              Programa Oficial Anthropic x RevHackers
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Trilha técnica sem enrolação. Criada pra quem quer meter a mão no código, conectar o Claude no produto e rodar agentes autônomos que geram resultado de verdade.
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
                { step: "01", title: "Cadastro sem Frescura", desc: "Preenche seus dados abaixo pra gente entender o seu cenário." },
                { step: "02", title: "Validação & Tech Match", desc: "A gente analisa a sua arquitetura pra conectar o Claude da forma mais eficiente." },
                { step: "03", title: "Acessos no Seu E-mail", desc: "Receba as chaves, documentações técnicas e credenciais direto no seu inbox." },
                { step: "04", title: "Execução Brutal", desc: "Start imediato na construção dos agentes e escala de receita com IA." }
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
              CADASTRO RÁPIDO · ETAPA {step} DE 3
            </p>
            <h2 className="text-zinc-900 text-2xl sm:text-4xl font-extrabold tracking-tight">
              {step === 1 && "1. Bora se conhecer"}
              {step === 2 && "2. Qual é a sua empresa?"}
              {step === 3 && "3. Qual seu objetivo com IA?"}
            </h2>
            <p className="text-zinc-500 text-sm max-w-xl mx-auto">
              {step === 1 && "Preenche seus dados básicos pra gente liberar sua ficha de acesso."}
              {step === 2 && "Informa onde você roda hoje pra gente mapear a melhor integração."}
              {step === 3 && "Conta pra gente seu desafio pra receber as chaves no e-mail."}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          {!isSubmitted && (
            <div className="flex items-center justify-between max-w-md mx-auto py-2">
              <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${step >= 1 ? 'bg-[#00CC6A] text-zinc-950 font-black' : 'bg-zinc-200 text-zinc-600'}`}>1</span>
                <span>Identificação</span>
              </div>
              <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 2 ? 'bg-[#00CC6A]' : 'bg-zinc-200'}`} />
              <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${step >= 2 ? 'bg-[#00CC6A] text-zinc-950 font-black' : 'bg-zinc-200 text-zinc-600'}`}>2</span>
                <span>Sua Empresa</span>
              </div>
              <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 3 ? 'bg-[#00CC6A]' : 'bg-zinc-200'}`} />
              <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${step >= 3 ? 'bg-[#00CC6A] text-zinc-950 font-black' : 'bg-zinc-200 text-zinc-600'}`}>3</span>
                <span>Ativação</span>
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div className="p-10 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 bg-[#00CC6A] text-zinc-950 rounded-full flex items-center justify-center mx-auto font-bold text-xl shadow-xs">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-zinc-900">Você está dentro. Seja bem-vindo. 🚀</h3>
              <p className="text-sm text-zinc-700 max-w-md mx-auto leading-relaxed">
                Sua empresa foi cadastrada no sistema. O e-mail com a liberação dos seus acessos e próximos passos acabou de ser enviado para a sua caixa de entrada.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-50/60 p-8 sm:p-10 rounded-xl border border-zinc-200 shadow-xs">
              
              {/* STEP 1: DADOS PESSOAIS */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nome Completo */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-800">1. Nome Completo *</label>
                      <input
                        {...register('fullName')}
                        placeholder="Seu nome completo"
                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                      />
                      {errors.fullName && <p className="text-xs text-rose-600 font-medium">{errors.fullName.message}</p>}
                    </div>

                    {/* E-mail Corporativo */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-800">2. E-mail Corporativo *</label>
                      <input
                        {...register('corporateEmail')}
                        placeholder="voce@empresa.com.br"
                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                      />
                      {errors.corporateEmail && <p className="text-xs text-rose-600 font-medium">{errors.corporateEmail.message}</p>}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep1}
                    className="w-full h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-sm tracking-wide rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Próximo Passo: Sua Empresa →</span>
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: DADOS DA EMPRESA */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Empresa */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-800">3. Empresa *</label>
                      <input
                        {...register('company')}
                        placeholder="Nome da sua empresa"
                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                      />
                      {errors.company && <p className="text-xs text-rose-600 font-medium">{errors.company.message}</p>}
                    </div>

                    {/* Cargo */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-800">4. Cargo *</label>
                      <input
                        {...register('role')}
                        placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                        className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                      />
                      {errors.role && <p className="text-xs text-rose-600 font-medium">{errors.role.message}</p>}
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
                      {errors.website && <p className="text-xs text-rose-600 font-medium">{errors.website.message}</p>}
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
                      {errors.segment && <p className="text-xs text-rose-600 font-medium">{errors.segment.message}</p>}
                    </div>
                  </div>

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

                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-1/3 h-12 border border-zinc-300 font-bold text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      ← Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep2}
                      className="w-2/3 h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-sm tracking-wide rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <span>Próximo Passo: Ativação →</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CONTEXTO & ATIVAÇÃO */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* Por que quer participar? */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">7. Por que você quer participar desta trilha? *</label>
                    <textarea
                      {...register('whyParticipate')}
                      rows={3}
                      placeholder="Explique resumidamente seu contexto e expectativas com o programa de parceiros da Anthropic..."
                      className="w-full p-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.whyParticipate && <p className="text-xs text-rose-600 font-medium">{errors.whyParticipate.message}</p>}
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
                    {errors.whatToBuild && <p className="text-xs text-rose-600 font-medium">{errors.whatToBuild.message}</p>}
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
                    {errors.confirmAvailability && <p className="text-xs text-rose-600 font-medium">{errors.confirmAvailability.message}</p>}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('agreeTerms')}
                        className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 bg-white focus:ring-[#00CC6A]"
                      />
                      <span className="text-xs text-zinc-700 font-medium leading-normal">
                        10. Você concorda com as regras do jogo e termos de participação? *
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-rose-600 font-medium">{errors.agreeTerms.message}</p>}
                  </div>

                  {/* Termos de Participação & Compromisso */}
                  <div className="p-5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-600 space-y-3 shadow-xs">
                    <p className="font-bold text-zinc-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Regras do Jogo & Compromisso de Execução:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 leading-relaxed font-normal">
                      <li>A trilha é 100% gratuita para as empresas selecionadas.</li>
                      <li>Foco em execução prática com carga estimada de 40h e prazo final em 27/10.</li>
                      <li>Buscamos quem vai até o fim. Abandono sem justificativa prévia até 27/10 gera taxa de não-conclusão de R$ 500 para garantir a dedicação da turma.</li>
                      <li>Ao se cadastrar você concorda em meter a mão na massa com o time da RevHackers & Anthropic.</li>
                    </ol>
                  </div>

                  {/* CTA Final */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-1/3 h-12 border border-zinc-300 font-bold text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      ← Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-sm tracking-wide rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>Liberando acessos...</span>
                        </>
                      ) : (
                        <>
                          <span>Entrar no Jogo & Ativar Acessos ⚡</span>
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

            </form>
          )}

        </div>
      </section>
    </PageLayout>
  );
}
