import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
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

const SEGMENTS = [
  'SaaS',
  'Software house',
  'Cibersegurança',
  'Automação',
  'RevOps',
  'Produto',
  'Growth',
  'CS',
  'Desenvolvimento',
  'Outro Segmento B2B'
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
      // Registrar confirmação via API / Webhook
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

      {/* Hero Section */}
      <Section variant="light" className="pt-28 pb-16 bg-white border-b border-zinc-200/80">
        <div className="container-custom max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#00CC6A]" /> Anthropic x RevHackers Partner Program
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Parabéns, você foi selecionado
          </h1>

          <p className="text-lg md:text-xl font-medium text-zinc-700 max-w-3xl mx-auto leading-relaxed">
            Você está entre as 10 pessoas convidadas para participar da trilha exclusiva do Claude Partner Network com a RevHackers.
          </p>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 max-w-2xl mx-auto text-sm text-zinc-600 text-left space-y-2">
            <p className="font-semibold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00CC6A]" /> Trilha Oficial & Restrita
            </p>
            <p>
              Essa é uma trilha oficial da Anthropic, gratuita e restrita ao programa de parceiros. Ela foi criada para pessoas que querem aprender Claude na prática e aplicar isso em negócio real.
            </p>
          </div>
        </div>
      </Section>

      {/* Etapas & Elegibilidade */}
      <Section variant="light" className="py-16 bg-zinc-50/50 border-b border-zinc-200/80">
        <div className="container-custom max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* O que acontece agora */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-wide text-xs border-b border-zinc-200 pb-2">
              O que acontece agora
            </h2>
            <div className="space-y-4">
              {[
                { step: "01", title: "Você confirma seus dados", desc: "Preencha o formulário oficial de validação abaixo." },
                { step: "02", title: "A RevHackers valida sua participação", desc: "Análise técnica do seu perfil de negócio." },
                { step: "03", title: "Você recebe as próximas instruções", desc: "Acesso ao ambiente de desenvolvimento e chaves." },
                { step: "04", title: "Você entra na trilha", desc: "Início dos acompanhamentos práticos com o time de engenharia." }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
                  <span className="text-xs font-mono font-bold text-[#00CC6A] bg-emerald-50 px-2 py-1 rounded">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{item.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Para quem essa trilha faz sentido */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-wide text-xs border-b border-zinc-200 pb-2">
              Para quem essa trilha faz sentido
            </h2>
            <p className="text-xs text-zinc-500">
              A trilha é direcionada a profissionais e empresas dos seguintes segmentos estratégicos:
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {SEGMENTS.slice(0, 9).map((seg) => (
                <div key={seg} className="p-3 rounded-lg bg-white border border-zinc-200/80 text-center text-xs font-semibold text-zinc-800 flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00CC6A] shrink-0" />
                  <span>{seg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* Formulário de Confirmação */}
      <Section variant="light" className="py-16 bg-white">
        <div className="container-custom max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Formulário de Confirmação e Ativação
            </h2>
            <p className="text-sm text-zinc-500">
              Preencha com atenção. As vagas não confirmadas serão reatribuídas a outros participantes da lista de espera.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-12 h-12 bg-[#00CC6A] text-zinc-950 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Participação Confirmada com Sucesso</h3>
              <p className="text-sm text-zinc-700 max-w-md mx-auto">
                Sua resposta foi registrada. Nossa equipe de engenharia revisará seus dados e enviará os acessos e próximos passos no e-mail corporativo cadastrado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-50/60 p-8 rounded-2xl border border-zinc-200">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">1. Nome Completo *</label>
                  <input
                    {...register('fullName')}
                    placeholder="Seu nome completo"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
                  />
                  {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName.message}</p>}
                </div>

                {/* E-mail Corporativo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">2. E-mail Corporativo *</label>
                  <input
                    {...register('corporateEmail')}
                    placeholder="voce@empresa.com.br"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
                  />
                  {errors.corporateEmail && <p className="text-xs text-rose-600">{errors.corporateEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">3. Empresa *</label>
                  <input
                    {...register('company')}
                    placeholder="Nome da sua empresa"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
                  />
                  {errors.company && <p className="text-xs text-rose-600">{errors.company.message}</p>}
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">4. Cargo *</label>
                  <input
                    {...register('role')}
                    placeholder="Ex: Founder, CTO, VP of Product, Head de RevOps"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
                  />
                  {errors.role && <p className="text-xs text-rose-600">{errors.role.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">5. Site da Empresa *</label>
                  <input
                    {...register('website')}
                    placeholder="https://empresa.com.br"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
                  />
                  {errors.website && <p className="text-xs text-rose-600">{errors.website.message}</p>}
                </div>

                {/* Segmento da Empresa */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-800">6. Segmento da Empresa *</label>
                  <select
                    {...register('segment')}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
                  >
                    <option value="">Selecione o segmento</option>
                    {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
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
                  className="w-full p-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
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
                  className="w-full p-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00CC6A] bg-white"
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
                  <span className="text-xs text-zinc-700 font-medium">
                    9. Você confirma disponibilidade para acompanhar os encontros e etapas até 27/10? *
                  </span>
                </label>
                {errors.confirmAvailability && <p className="text-xs text-rose-600">{errors.confirmAvailability.message}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-1 w-4 h-4 text-[#00CC6A] rounded border-zinc-300 focus:ring-[#00CC6A]"
                  />
                  <span className="text-xs text-zinc-700 font-medium">
                    10. Você concorda com os termos de participação listados abaixo? *
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-rose-600">{errors.agreeTerms.message}</p>}

              </div>

              {/* Termos de Participação */}
              <div className="p-4 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-600 space-y-2">
                <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Termos e Condições da Trilha:
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
                className="w-full h-12 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-bold text-sm tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
