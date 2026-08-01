
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Section from '@/components/ui/Section';
import { ArrowUpRight, Cpu, Database, LayoutTemplate, LineChart, MessageSquareCode, Search, Zap } from 'lucide-react';
import SEO from '@/components/shared/SEO';

const capabilities = [
  {
    id: "01",
    title: "SDR de Inteligência Artificial",
    description: "Criamos agentes baseados em LLMs avançados para qualificar todos os seus leads. Zero curiosos no caledário dos seus Closers.",
    tech: ["OpenAI API", "Agentic Workflows", "Vector DBs"],
    icon: Cpu,
    slug: "ai-operations"
  },
  {
    id: "02",
    title: "Engenharia de CRM (O Cofre)",
    description: "Infraestrutura comercial blindada e à prova de falhas. Onde seus vendedores não terão desculpas para perder reuniões ou follow-ups.",
    tech: ["CRM Architecture", "Pipeline Logic", "Data Sync"],
    icon: Database,
    slug: "ecossistema-crm"
  },
  {
    id: "03",
    title: "Follow-Up Implacável (Automations)",
    description: "Robôs lógicos que perseguem via Whatsapp/Email leads que esfriaram no funil, 24 horas por dia.",
    tech: ["n8n / Make", "ActiveCampaign", "Webhooks"],
    icon: Zap,
    slug: "automacao-inteligente"
  },
  {
    id: "04",
    title: "Tracionamento B2B (Aquisição)",
    description: "Gestão técnica de tráfego injetando MQLs (Marketing Qualified Leads) qualificados direto na boca do funil.",
    tech: ["Meta Ads", "LinkedIn B2B", "Google Engine"],
    icon: LineChart,
    slug: "tracao-midia-paga"
  },
  {
    id: "05",
    title: "Filtros de Conversão (Site)",
    description: "Tear-down de infraestrutura e interfaces web otimizados 100% para fazer o fundador B2B preencher o formulário.",
    tech: ["CRO Testing", "Next.js", "Analytics"],
    icon: LayoutTemplate,
    slug: "web-conversion"
  },
  {
    id: "06",
    title: "Processos de Founder (Desmame)",
    description: "Aulas e playbooks para tirar o Fundador da rua e criar uma equipe comercial que fecha contrato sem depender dele.",
    tech: ["Playbooks", "Sales SLA", "Handoff"],
    icon: MessageSquareCode,
    slug: "founder-led-growth"
  }
];

const Servicos = () => {
  return (
    <PageLayout>
      <SEO
        title="Consultoria de Revenue Operations & Automação B2B"
        description="Serviços de consultoria em Revenue Operations, IA, CRM e Automação de Vendas B2B em São Paulo e Brasil. Transforme sua operação comercial com a RevHackers."
        canonical="https://revhackers.com.br/servicos"
        breadcrumbs={[
          { name: "Home", url: "https://revhackers.com.br/" },
          { name: "Ecossistema", url: "https://revhackers.com.br/servicos" }
        ]}
        faq={[
          { question: "O que é Revenue Operations (RevOps)?", answer: "Revenue Operations é a metodologia que integra Marketing, Vendas e Customer Success sob uma infraestrutura unificada de dados, automações e processos, eliminando silos e maximizando receita recorrente." },
          { question: "Como funciona a consultoria da RevHackers?", answer: "Realizamos uma auditoria técnica da sua operação B2B, identificamos vazamentos de receita e implementamos automações de IA, CRM e processos para escalar sua operação comercial." },
          { question: "Quais empresas a RevHackers atende?", answer: "Atendemos empresas B2B com operações comerciais complexas que buscam escalar receita através de tecnologia, automação e processos de Revenue Operations." }
        ]}
      />
      {/* Hero Section - Standard Black */}
      <section className="bg-black py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.2] tracking-tight text-center max-w-3xl mx-auto">
            Elimine gargalos de receita conectando <span className="text-[#00CC6A]">CRM, ABM, IA e automações em um único motor de vendas.</span>
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto text-center">
            Engenheiramos toda a infraestrutura de Go-To-Market de ponta a ponta. Unificamos inteligência preditiva, ABM automatizado e CRM para fechar contratos maiores em menos tempo.
          </p>
          <div className="pt-2 flex justify-center">
            <Button asChild className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] font-extrabold text-sm sm:text-base h-12 px-8 rounded-xl shadow-lg transition-all">
              <Link to="/booking">Auditar Minha Operação →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Capabilities Matrix - Fundo 100% Branco Puro (Zero Cinza, Zero Caixas de Ícones) */}
      <section className="py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          {/* Section Header Centralizado */}
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <h2 className="text-zinc-900 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Sistemas de Crescimento Commercial
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Não vendemos serviços avulsos. Entregamos infraestrutura de receita escalável e componível.
            </p>
          </div>

          {/* Grid 3 Colunas Editorial Limpa (Sem caixas de ícones) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <span className="text-zinc-400 font-sans font-semibold text-xs tracking-wider block">
                    {item.id} / SISTEMA
                  </span>
                  <h3 className="text-zinc-900 font-bold text-lg tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-200/60">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tech.map((tech) => (
                      <span key={tech} className="text-[10px] font-semibold text-zinc-600 uppercase bg-white border border-zinc-200 px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/servicos/${item.slug}`}
                    className="inline-flex items-center text-xs font-bold text-zinc-900 uppercase tracking-wider hover:text-zinc-600 transition-colors gap-2"
                  >
                    <span>Explorar Detalhes</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Fundo 100% Branco Puro */}
      <section className="py-20 bg-white text-zinc-900 border-t border-zinc-200/80">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-zinc-900 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Está pronto para a Máquina?
          </h2>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
            Vagas de implementação restritas. Vamos auditar suas finanças e plugar a Automação se houver fit com a RevHackers.
          </p>
          <div className="pt-2">
            <Button asChild className="bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-sm h-11 px-8 rounded-xl shadow-xs transition-all">
              <Link to="/booking">Auditar Minha Operação →</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Servicos;
