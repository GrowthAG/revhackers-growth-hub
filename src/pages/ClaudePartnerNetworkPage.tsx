import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const domain = (val.split('@')[1] || '').toLowerCase();
    const freeDomains = [
      'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'bol.com.br',
      'icloud.com', 'me.com', 'mac.com', 'live.com', 'msn.com',
      'uol.com.br', 'ig.com.br', 'terra.com.br', 'ymail.com', 'aol.com',
      'protonmail.com', 'proton.me', 'zoho.com', 'mail.com'
    ];
    if (freeDomains.includes(domain)) return false;
    if (domain.endsWith('.me') || domain === 'me.com') return false;
    return true;
  }, 'Por favor, utilize seu e-mail corporativo (e-mails pessoais como iCloud, .me, Gmail, etc. não são aceitos)'),
  phone: z.string().min(10, 'Informe seu WhatsApp / telefone com DDD'),
  company: z.string().min(2, 'Informe o nome da sua empresa'),
  city: z.string().min(2, 'Informe sua cidade e estado'),
  role: z.string().min(2, 'Informe seu cargo ou função'),
  companySize: z.string().min(1, 'Selecione o tamanho da empresa / ops'),
  segment: z.string().min(1, 'Selecione o segmento da empresa'),
  otherSegment: z.string().optional(),
  confirmAvailability: z.preprocess(
    (val) => (Array.isArray(val) ? val.includes(true) || val.includes('true') || val.includes('on') : Boolean(val)),
    z.boolean().refine(val => val === true, 'Confirme a disponibilidade para prosseguir')
  ),
  agreeTerms: z.preprocess(
    (val) => (Array.isArray(val) ? val.includes(true) || val.includes('true') || val.includes('on') : Boolean(val)),
    z.boolean().refine(val => val === true, 'Concorde com os termos do programa')
  ),
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
  const navigate = useNavigate();
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
    const isValid = await trigger(['fullName', 'corporateEmail', 'phone']);
    if (isValid) setStep(2);
  };

  const handleNextStep2 = async () => {
    const isValid = await trigger(['company', 'city', 'role']);
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
        phone: data.phone,
        company: data.company,
        city: data.city,
        role: data.role,
        companySize: data.companySize,
        segment: finalSegment,
      });

      setIsSubmitted(true);
      const secureToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      toast({
        title: "Conta Ativada com Sucesso",
        description: "Defina sua senha a seguir para concluir a ativação do seu perfil.",
      });
      window.location.href = `/auth/setup-password?email=${encodeURIComponent(data.corporateEmail)}&token=${secureToken}`;
    } catch (err: any) {
      console.warn("GHL integration fallback:", err);
      setIsSubmitted(true);
      const fallbackToken = Math.random().toString(36).substring(2, 15);
      window.location.href = `/auth/setup-password?email=${encodeURIComponent(data.corporateEmail)}&token=${fallbackToken}`;
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

      {/* Hero Section (HOMEPAGE HERO 100% VISUAL CLONE) */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 bg-black border-b border-zinc-900"
      >
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* Lockup Compacto Oficial: Claude Partner Network by RevHackers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center justify-center gap-2.5 mb-6 py-1.5 px-4 rounded-full bg-zinc-900/80 border border-zinc-800"
          >
            <img
              src="/brand/claude-partner-network.svg"
              alt="Claude Partner Network"
              className="h-4 sm:h-4.5 w-auto object-contain"
            />
            <span className="text-zinc-500 font-medium text-xs">by</span>
            <img
              src="/brand/revhackers-wordmark-white.png"
              alt="REVHACKERS"
              className="h-3 sm:h-3.5 w-auto object-contain"
            />
          </motion.div>
          
          {/* Headline H1 (EXACT SAME AS HOME HERO) */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
            className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center max-w-4xl"
          >
            Você foi selecionado para o <span className="text-[#00CC6A]">Claude Partner Network</span> & RevHackers.
          </motion.h1>

          {/* Subheadline (EXACT SAME AS HOME HERO) */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="text-zinc-400 mb-8 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center"
          >
            Aqui é o ambiente onde você vai aprender o Claude de verdade. Dedique-se e com certeza você colherá bons frutos disso.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.14, ease: 'easeOut' }}
          >
            <Button
              onClick={scrollToForm}
              className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-semibold text-sm h-11 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Ativar Acesso & Criar Conta</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* O que acontece agora & Público Elegível (VARIEDADE DE LAYOUT — ZERO CARDS DUPLICADOS E EMPILHADOS) */}
      <section className="py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          
          {/* 1. O que acontece agora (Horizontal Pipeline / Timeline Limpa — Sem Cards Box) */}
          <div className="space-y-10">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h2 className="text-zinc-900 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                O que acontece agora
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                Do cadastro inicial à liberação das credenciais de parceiro no ambiente oficial do Claude.
              </p>
            </div>

            {/* Step Pipeline Horizontal com Linhas Superiores e Zero Caixas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Cadastro em 3 Etapas", desc: "Preenche seus dados essenciais pra gente liberar suas credenciais de acesso." },
                { step: "02", title: "Validação & Tech Match", desc: "A gente analisa a sua arquitetura pra conectar o Claude da forma mais eficiente." },
                { step: "03", title: "Acessos no Seu E-mail", desc: "Receba as chaves, documentações técnicas e credenciais direto no seu inbox." },
                { step: "04", title: "Execução de Alta Performance", desc: "Start imediato na construção dos agentes e escala de receita com IA." }
              ].map((item) => (
                <div key={item.step} className="border-t border-zinc-200 pt-5 space-y-2">
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

          {/* 2. Para quem essa trilha faz sentido (Lista de 2 Colunas com Marcadores — Sem Cards Box) */}
          <div className="space-y-10 pt-12 border-t border-zinc-200/80">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h2 className="text-zinc-900 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Para quem essa trilha foi construída
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                Desenhado exclusivamente para lideranças de tecnologia, produto, receita e automação de negócios B2B.
              </p>
            </div>

            {/* Lista Minimalista 2 Colunas com Marcadores e Divisores de Linha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
              {AUDIENCE_ROLES.map((role) => (
                <div key={role.title} className="flex items-start gap-3 border-b border-zinc-100 pb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-2 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="text-zinc-900 font-bold text-sm sm:text-base tracking-tight">
                      {role.title}
                    </h3>
                    <p className="text-zinc-500 text-xs leading-relaxed font-normal">
                      {role.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Formulário de Confirmação em 3 Etapas (PADRÃO OURO DARK GLASSMORPHISM REVHACKERS) */}
      <section ref={formRef} className="py-24 bg-black text-white border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00CC6A]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-lg mx-auto px-6 space-y-8 relative z-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20 mx-auto">
              <Sparkles className="w-3 h-3" /> FORMULÁRIO DE SELEÇÃO OFICIAL
            </div>
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              {step === 1 && "1. Seus dados de acesso"}
              {step === 2 && "2. Dados da sua empresa"}
              {step === 3 && "3. Perfil & Ativação"}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              {step === 1 && "Preencha seus dados básicos pra gente liberar suas credenciais de parceiro."}
              {step === 2 && "Mapeie sua empresa para conectarmos a melhor integração do Claude."}
              {step === 3 && "Selecione seu perfil e confirme o aceite para receber os acessos."}
            </p>
          </div>

          {!isSubmitted && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-2xl text-white">
              
              {/* STEP 1: DADOS PESSOAIS */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 flex flex-col">
                  {/* Campo 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">1. Nome Completo *</label>
                    <input
                      {...register('fullName')}
                      placeholder="Seu nome completo"
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    />
                    {errors.fullName && <p className="text-xs text-rose-500 font-medium">{errors.fullName.message}</p>}
                  </div>

                  {/* Campo 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">2. E-mail Corporativo *</label>
                    <input
                      {...register('corporateEmail')}
                      placeholder="voce@empresa.com.br"
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    />
                    {errors.corporateEmail && <p className="text-xs text-rose-500 font-medium">{errors.corporateEmail.message}</p>}
                  </div>

                  {/* Campo 3 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">3. WhatsApp / Telefone *</label>
                    <input
                      {...register('phone')}
                      placeholder="(11) 99999-9999"
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    />
                    {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone.message}</p>}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep1}
                    className="w-full h-11 bg-[#00CC6A] hover:bg-[#00B35D] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#00CC6A]/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Avançar para Dados da Empresa →</span>
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: DADOS DA EMPRESA */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 flex flex-col">
                  {/* Campo 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">4. Nome da Empresa *</label>
                    <input
                      {...register('company')}
                      placeholder="Nome da sua empresa"
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    />
                    {errors.company && <p className="text-xs text-rose-500 font-medium">{errors.company.message}</p>}
                  </div>

                  {/* Campo 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">5. Cidade / Estado *</label>
                    <input
                      {...register('city')}
                      placeholder="Ex: São Paulo / SP"
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    />
                    {errors.city && <p className="text-xs text-rose-500 font-medium">{errors.city.message}</p>}
                  </div>

                  {/* Campo 3 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">6. Seu Cargo ou Função *</label>
                    <input
                      {...register('role')}
                      placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    />
                    {errors.role && <p className="text-xs text-rose-500 font-medium">{errors.role.message}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-1/3 h-11 border border-zinc-800 bg-zinc-950 font-medium text-xs text-zinc-400 hover:text-white rounded-xl"
                    >
                      ← Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep2}
                      className="w-2/3 h-11 bg-[#00CC6A] hover:bg-[#00B35D] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#00CC6A]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Avançar para Perfil & Ativação →</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PERFIL & ATIVAÇÃO */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 flex flex-col">
                  {/* Item 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">7. Tamanho da Empresa / Ops *</label>
                    <select
                      {...register('companySize')}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
                    >
                      <option value="">Selecione o tamanho</option>
                      <option value="1-10">1 a 10 colaboradores</option>
                      <option value="11-50">11 a 50 colaboradores</option>
                      <option value="51-200">51 a 200 colaboradores</option>
                      <option value="201-500">201 a 500 colaboradores</option>
                      <option value="500+">Mais de 500 colaboradores</option>
                    </select>
                    {errors.companySize && <p className="text-xs text-rose-500 font-medium">{errors.companySize.message}</p>}
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">8. Segmento da Empresa *</label>
                    <select
                      {...register('segment')}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-sm focus:outline-none focus:border-[#00CC6A] focus:ring-1 focus:ring-[#00CC6A] transition-all"
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
                    {errors.segment && <p className="text-xs text-rose-500 font-medium">{errors.segment.message}</p>}
                  </div>

                  {selectedSegment === 'Outro' && (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 transition-all">
                      <label className="text-xs font-semibold text-zinc-300 block">
                        Especificar Segmento da Empresa *
                      </label>
                      <input
                        {...register('otherSegment')}
                        placeholder="Qual o segmento específico da sua empresa?"
                        className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:border-[#00CC6A]"
                      />
                      {errors.otherSegment && <p className="text-xs text-rose-500 font-medium">{errors.otherSegment.message}</p>}
                    </div>
                  )}

                  {/* Item 3 */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('confirmAvailability')}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-[#00CC6A] focus:ring-[#00CC6A] accent-[#00CC6A]"
                      />
                      <span className="text-xs text-zinc-400 font-normal leading-normal">
                        Confirmo disponibilidade para acompanhar a trilha de execução *
                      </span>
                    </label>
                    {errors.confirmAvailability && <p className="text-xs text-rose-500 font-medium">{errors.confirmAvailability.message}</p>}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('agreeTerms')}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-[#00CC6A] focus:ring-[#00CC6A] accent-[#00CC6A]"
                      />
                      <span className="text-xs text-zinc-400 font-normal leading-normal">
                        Concordo com as regras do jogo e termos do Claude Partner Network *
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-rose-500 font-medium">{errors.agreeTerms.message}</p>}
                  </div>

                  {/* CTA Final */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-1/3 h-11 border border-zinc-800 bg-zinc-950 font-medium text-xs text-zinc-400 hover:text-white rounded-xl"
                    >
                      ← Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 h-11 bg-[#00CC6A] hover:bg-[#00B35D] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#00CC6A]/20 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Validando e liberando...</span>
                        </>
                      ) : (
                        <>
                          <span>Validar & Ativar Acessos →</span>
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
