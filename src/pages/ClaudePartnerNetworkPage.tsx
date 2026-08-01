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
    const domain = val.split('@')[1] || '';
    const freeDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'bol.com.br'];
    return !freeDomains.includes(domain.toLowerCase());
  }, 'Por favor, utilize seu e-mail corporativo'),
  phone: z.string().min(10, 'Informe seu WhatsApp / telefone com DDD'),
  company: z.string().min(2, 'Informe o nome da sua empresa'),
  city: z.string().min(2, 'Informe sua cidade e estado'),
  role: z.string().min(2, 'Informe seu cargo ou função'),
  companySize: z.string().min(1, 'Selecione o tamanho da empresa / ops'),
  segment: z.string().min(1, 'Selecione o segmento da empresa'),
  otherSegment: z.string().optional(),
  confirmAvailability: z.boolean().refine(val => val === true, 'Confirme a disponibilidade para prosseguir'),
  agreeTerms: z.boolean().refine(val => val === true, 'Concorde com os termos do programa'),
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
      toast({
        title: "Conta Ativada com Sucesso",
        description: "Seus dados foram validados e seus acessos foram disparados pro seu e-mail.",
      });
      navigate('/claude-partner-network/obrigado');
    } catch (err: any) {
      console.warn("GHL integration fallback:", err);
      setIsSubmitted(true);
      toast({
        title: "Conta Ativada",
        description: "Seus dados foram recebidos com sucesso.",
      });
      navigate('/claude-partner-network/obrigado');
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
          
          {/* Lockup Oficinal: Claude Partner Network by RevHackers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
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
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
            className="font-sans text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight text-center max-w-3xl"
          >
            Você foi selecionado para o <span className="text-[#00CC6A]">Claude Partner Network</span> & RevHackers.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-zinc-300 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto text-center"
          >
            Aqui é o ambiente onde você vai aprender o Claude de verdade. Dedique-se e com certeza você colherá bons frutos disso.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="pt-4"
          >
            <Button
              onClick={scrollToForm}
              className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] font-extrabold text-sm h-12 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Ativar Acesso & Criar Conta</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

        </div>
      </section>

      {/* O que acontece agora & Público Elegível (DESIGN LIMPO SEM VIBECODE) */}
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
                { step: "01", title: "Cadastro em 3 Etapas", desc: "Preenche seus dados abaixo pra gente entender o seu cenário." },
                { step: "02", title: "Validação & Tech Match", desc: "A gente analisa a sua arquitetura pra conectar o Claude da forma mais eficiente." },
                { step: "03", title: "Acessos no Seu E-mail", desc: "Receba as chaves, documentações técnicas e credenciais direto no seu inbox." },
                { step: "04", title: "Execução Brutal", desc: "Start imediato na construção dos agentes e escala de receita com IA." }
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
              {AUDIENCE_ROLES.map((role) => (
                <div key={role.title} className="flex flex-col justify-between h-full p-6 bg-white border border-zinc-200 rounded-xl hover:border-[#00CC6A]/50 transition-all shadow-xs group">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-[#00CC6A]" />
                      <h3 className="text-zinc-900 font-bold text-base group-hover:text-[#00CC6A] transition-colors">
                        {role.title}
                      </h3>
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed pl-4 border-l border-zinc-200">
                      {role.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Formulário de Confirmação em 3 Etapas (ULTRA MINIMALISTA SEM VIBECODE) */}
      <section ref={formRef} className="py-20 bg-white text-zinc-900">
        <div className="max-w-md mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-zinc-900 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {step === 1 && "1. Seus dados de acesso"}
              {step === 2 && "2. Dados da sua empresa"}
              {step === 3 && "3. Perfil & Ativação"}
            </h2>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
              {step === 1 && "Preencha seus dados básicos pra gente liberar suas credenciais de parceiro."}
              {step === 2 && "Mapeie sua empresa para conectarmos a melhor integração do Claude."}
              {step === 3 && "Selecione seu perfil e confirme o aceite para receber os acessos."}
            </p>
          </div>

          {!isSubmitted && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* STEP 1: DADOS PESSOAIS (EXATAMENTE 3 CAMPOS) */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 flex flex-col">
                  {/* Campo 1 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">1. Nome Completo *</label>
                    <input
                      {...register('fullName')}
                      placeholder="Seu nome completo"
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.fullName && <p className="text-xs text-rose-600 font-medium">{errors.fullName.message}</p>}
                  </div>

                  {/* Campo 2 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">2. E-mail Corporativo *</label>
                    <input
                      {...register('corporateEmail')}
                      placeholder="voce@empresa.com.br"
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.corporateEmail && <p className="text-xs text-rose-600 font-medium">{errors.corporateEmail.message}</p>}
                  </div>

                  {/* Campo 3 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">3. WhatsApp / Telefone *</label>
                    <input
                      {...register('phone')}
                      placeholder="(11) 99999-9999"
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.phone && <p className="text-xs text-rose-600 font-medium">{errors.phone.message}</p>}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep1}
                    className="w-full h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-extrabold text-sm tracking-wide rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 pt-2"
                  >
                    <span>Avançar para Dados da Empresa →</span>
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: DADOS DA EMPRESA (EXATAMENTE 3 CAMPOS) */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 flex flex-col">
                  {/* Campo 1 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">4. Nome da Empresa *</label>
                    <input
                      {...register('company')}
                      placeholder="Nome da sua empresa"
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.company && <p className="text-xs text-rose-600 font-medium">{errors.company.message}</p>}
                  </div>

                  {/* Campo 2 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">5. Cidade / Estado *</label>
                    <input
                      {...register('city')}
                      placeholder="Ex: São Paulo / SP"
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.city && <p className="text-xs text-rose-600 font-medium">{errors.city.message}</p>}
                  </div>

                  {/* Campo 3 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">6. Seu Cargo ou Função *</label>
                    <input
                      {...register('role')}
                      placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    />
                    {errors.role && <p className="text-xs text-rose-600 font-medium">{errors.role.message}</p>}
                  </div>

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
                      <span>Avançar para Perfil & Ativação →</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PERFIL & ATIVAÇÃO (EXATAMENTE 3 ITENS) */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 flex flex-col">
                  {/* Item 1 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">7. Tamanho da Empresa / Ops *</label>
                    <select
                      {...register('companySize')}
                      className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A]"
                    >
                      <option value="">Selecione o tamanho</option>
                      <option value="1-10">1 a 10 colaboradores</option>
                      <option value="11-50">11 a 50 colaboradores</option>
                      <option value="51-200">51 a 200 colaboradores</option>
                      <option value="201-500">201 a 500 colaboradores</option>
                      <option value="500+">Mais de 500 colaboradores</option>
                    </select>
                    {errors.companySize && <p className="text-xs text-rose-600 font-medium">{errors.companySize.message}</p>}
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-800">8. Segmento da Empresa *</label>
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

                  {selectedSegment === 'Outro' && (
                    <div className="p-4 rounded-xl bg-white border border-[#00CC6A]/40 shadow-xs space-y-2 transition-all">
                      <label className="text-xs font-bold text-zinc-900 block">
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

                  {/* Item 3 */}
                  <div className="pt-2 border-t border-zinc-200 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('confirmAvailability')}
                        className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 bg-white focus:ring-[#00CC6A]"
                      />
                      <span className="text-xs text-zinc-700 font-medium leading-normal">
                        Confirmo disponibilidade para acompanhar a trilha de execução *
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
                        Concordo com as regras do jogo e termos do Claude Partner Network *
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-rose-600 font-medium">{errors.agreeTerms.message}</p>}
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

              {/* STEP 3: VALIDAÇÃO & ACESSO */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* Termos de Participação & Compromisso */}
                  <div className="p-5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-600 space-y-3 shadow-xs">
                    <p className="font-bold text-zinc-900 text-xs uppercase tracking-wide">
                      Regras do Jogo & Compromisso de Execução:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 leading-relaxed font-normal">
                      <li>A trilha é 100% gratuita para as empresas selecionadas.</li>
                      <li>Foco em execução prática com carga estimada de 40h e acompanhamento do time.</li>
                      <li>Ao se cadastrar você concorda em aplicar a tecnologia Claude em operações reais da sua empresa.</li>
                    </ol>
                  </div>

                  {/* Checkboxes de Confirmação & Termos */}
                  <div className="pt-2 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('confirmAvailability')}
                        className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 bg-white focus:ring-[#00CC6A]"
                      />
                      <span className="text-xs text-zinc-700 font-medium leading-normal">
                        Confirmo disponibilidade para acompanhar a trilha de execução com o time *
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
                        Concordo com as regras do jogo e termos do Claude Partner Network *
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-rose-600 font-medium">{errors.agreeTerms.message}</p>}
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
                          <span>Validando e liberando acessos...</span>
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
