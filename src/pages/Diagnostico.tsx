import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { ArrowUpRight, BarChart2, Globe, TrendingUp, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/shared/SEO';

const DiagnosticoGateway = () => {
  const navigate = useNavigate();

  const diagnostics = [
    {
      id: 'growth',
      title: 'Diagnóstico 360º de Growth',
      description: 'Avaliação completa dos canais de aquisição, retenção, tração e métricas de receita.',
      badge: 'POPULAR',
      icon: TrendingUp,
      path: '/score',
    },
    {
      id: 'revenue',
      title: 'Diagnóstico CRM & Revenue Ops',
      description: 'Mapeamento de gargalos no pipeline comercial, SLA de vendas e automações com IA.',
      badge: 'REVOPS',
      icon: BarChart2,
      path: '/score-revenue',
    },
    {
      id: 'founder',
      title: 'Diagnóstico de Autoridade do Fundador',
      description: 'Análise preditiva de presença digital, Social Selling e autoridade no LinkedIn.',
      badge: 'FOUNDER',
      icon: User,
      path: '/score-founder',
    },
    {
      id: 'site',
      title: 'Diagnóstico de Site & Landing Page',
      description: 'Auditoria de taxa de conversão (CRO), velocidade, SEO e infraestrutura digital.',
      badge: 'CRO',
      icon: Globe,
      path: '/score-site',
    },
  ];

  return (
    <PageLayout>
      <SEO title="Central de Diagnósticos GrowthHub" description="Descubra onde estão os vazamentos na sua operação B2B com diagnósticos gratuitos de Growth, CRM, Founder e Site." canonical="https://revhackers.com.br/diagnostico" />
      
      <section className="bg-zinc-950 py-24 md:py-32 relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#00CC6A] text-black inline-flex items-center gap-1.5">
              <Sparkles size={13} /> GROWTHHUB INTELLIGENCE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Central de Diagnósticos Preditivos
          </h1>

          <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Avalie a maturidade da sua operação B2B em 1 minuto. Nossa IA calcula os vazamentos financeiros e entrega seu plano de ação imediato.
          </p>
        </div>
      </section>

      <section className="py-20 bg-zinc-50/50 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnostics.map((diag) => {
              const Icon = diag.icon;
              return (
                <div
                  key={diag.id}
                  onClick={() => navigate(diag.path)}
                  className="group cursor-pointer bg-white border border-zinc-200/80 rounded-2xl p-8 hover:border-zinc-300 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center border border-zinc-800">
                        <Icon size={22} className="text-[#00CC6A]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {diag.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-black tracking-tight leading-snug">
                      {diag.title}
                    </h3>

                    <p className="text-xs md:text-sm text-zinc-500 font-normal leading-relaxed">
                      {diag.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-black">
                    <span>Iniciar Diagnóstico Gratuito</span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all">
                      <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-[#00CC6A]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default DiagnosticoGateway;
