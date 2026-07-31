import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Loader2, Award, Cpu, BookOpen, Layers, Check } from 'lucide-react';
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

  return (
    <PageLayout headerVariant="light">
      <SEO
        title="Claude Partner Network | Confirmação de Seleção RevHackers"
        description="Trilha exclusiva do Claude Partner Network com a RevHackers e Anthropic."
        canonical="https://revhackers.com.br/claude-partner-network"
      />

      {/* Hero Section — Design Oficial RevHackers */}
      <Section variant="light" className="pt-32 pb-20 bg-white border-b border-zinc-200/80">
        <div className="container-custom max-w-4xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#00CC6A]" /> Anthropic x RevHackers Partner Program
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
            Parabéns, você foi selecionado
          </h1>

          <p className="text-lg sm:text-xl font-medium text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            Você está entre as 10 pessoas convidadas para participar da trilha exclusiva do Claude Partner Network com a RevHackers.
          </p>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/90 max-w-3xl mx-auto text-sm text-zinc-600 text-left space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-[#00CC6A] shrink-0" />
              <span>Trilha Oficial & Restrita do Ecossistema Anthropic</span>
            </div>
            <p className="leading-relaxed text-zinc-600">
              Essa é uma trilha oficial da Anthropic, gratuita e restrita ao programa de parceiros. Ela foi criada para pessoas que querem aprender Claude na prática e aplicar isso em negócio real.
            </p>
          </div>

        </div>
      </Section>

      {/* O que é o Programa & Pilares da Trilha */}
      <Section variant="light" className="py-20 bg-zinc-50/60 border-b border-zinc-200/80">
        <div className="container-custom max-w-5xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
              Capacitação de Elite
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              Engenharia de IA Prática com Claude 3.5 Sonnet
            </h3>
            <p className="text-sm text-zinc-500">
              Conheça os 3 pilares de desenvolvimento e implementação que você dominará durante a trilha:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                <Cpu className="w-5 h-5 text-[#00CC6A]" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">Anthropic Academy & Certificação</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Acesso aos módulos de certificação oficial (CCF-A), governança de dados enterprise e arquiteturas avançadas de RAG e agentes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                <Layers className="w-5 h-5 text-[#00CC6A]" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">Deploy em Produção Real</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Construção de fluxos de trabalho nativos em IA aplicados diretamente à sua operação comercial, CRM, suporte ou produto B2B.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                <Award className="w-5 h-5 text-[#00CC6A]" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">Mentoria Técnica RevHackers</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Acompanhamento com os arquitetos de engenharia de receita da RevHackers para validar prompts, chamadas de API e modelos.
              </p>
            </div>
          </div>

        </div>
      </Section>

      {/* O que acontece agora + Quem deve participar */}
      <Section variant="light" className="py-20 bg-white border-b border-zinc-200/80">
        <div className="container-custom max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* O que acontece agora */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
                Próximos Passos
              </h2>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                O que acontece agora
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { step: "01", title: "Você confirma seus dados", desc: "Preencha o formulário oficial de validação nesta página." },
                { step: "02", title: "A RevHackers valida sua participação", desc: "Nossa equipe analisa o alinhamento técnico do seu negócio." },
                { step: "03", title: "Você recebe as próximas instruções", desc: "Envio de chave de acesso, calendário de encontros e materiais." },
                { step: "04", title: "Você entra na trilha", desc: "Início do programa prático de desenvolvimento e aceleração." }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-xs font-mono font-bold text-zinc-950 bg-[#00CC6A] px-2.5 py-1 rounded-md shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Para quem essa trilha faz sentido */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
                Público Elegível
              </h2>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                Para quem essa trilha faz sentido
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AUDIENCE_ROLES.map((role) => (
                <div key={role.title} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                    <Check className="w-3.5 h-3.5 text-[#00CC6A] shrink-0" />
                    <span>{role.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal pl-5">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* Formulário de Confirmação */}
      <Section variant="light" className="py-20 bg-zinc-50/50">
        <div className="container-custom max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
              Ativação da Vaga
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Formulário de Confirmação de Participação
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              Preencha com atenção. As vagas não confirmadas dentro do prazo serão reatribuídas aos profissionais da lista de espera.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-10 rounded-2xl bg-white border border-zinc-200 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-[#00CC6A] text-zinc-950 rounded-full flex items-center justify-center mx-auto font-bold text-2xl shadow-xs">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-zinc-900">Participação Confirmada com Sucesso</h3>
              <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Sua confirmação foi registrada no sistema da RevHackers. Nossa equipe revisará seus dados e enviará os acessos e próximos passos no e-mail corporativo cadastrado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-zinc-200 shadow-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">1. Nome Completo *</label>
                  <input
                    {...register('fullName')}
                    placeholder="Seu nome completo"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
                  />
                  {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName.message}</p>}
                </div>

                {/* E-mail Corporativo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">2. E-mail Corporativo *</label>
                  <input
                    {...register('corporateEmail')}
                    placeholder="voce@empresa.com.br"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
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
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
                  />
                  {errors.company && <p className="text-xs text-rose-600">{errors.company.message}</p>}
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">4. Cargo *</label>
                  <input
                    {...register('role')}
                    placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
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
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
                  />
                  {errors.website && <p className="text-xs text-rose-600">{errors.website.message}</p>}
                </div>

                {/* Segmento da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">6. Segmento da Empresa *</label>
                  <select
                    {...register('segment')}
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
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

              {/* Por que quer participar? */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800">7. Por que você quer participar desta trilha? *</label>
                <textarea
                  {...register('whyParticipate')}
                  rows={3}
                  placeholder="Explique resumidamente seu contexto e expectativas com o programa de parceiros da Anthropic..."
                  className="w-full p-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
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
                  className="w-full p-3.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white text-zinc-900"
                />
                {errors.whatToBuild && <p className="text-xs text-rose-600">{errors.whatToBuild.message}</p>}
              </div>

              {/* Checkboxes de Confirmação & Termos */}
              <div className="pt-4 border-t border-zinc-200 space-y-4">
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('confirmAvailability')}
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 focus:ring-[#00CC6A]"
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
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 focus:ring-[#00CC6A]"
                  />
                  <span className="text-xs text-zinc-700 font-medium leading-normal">
                    10. Você concorda com os termos de participação listados abaixo? *
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-rose-600">{errors.agreeTerms.message}</p>}

              </div>

              {/* Termos de Participação */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-2">
                <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Termos de Participação:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-500 leading-relaxed">
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
                className="w-full h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-bold text-sm tracking-wide rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
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
      </Section>
    </PageLayout>
  );
}
