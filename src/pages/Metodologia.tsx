import { useEffect } from 'react';
import { Database, Layers, Target, Cpu, Network, Lock, Zap, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEO from '@/components/shared/SEO';

const Metodologia = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <SEO
                title="Metodologia RevOps - Como Funciona a Consultoria"
                description="Conheça a metodologia RevHackers: Diagnóstico, Fundação, Growth Loops e Escala. Integramos IA, CRM e automação para eliminar vazamentos de receita em operações B2B."
                canonical="https://revhackers.com.br/metodologia"
                breadcrumbs={[
                    { name: "Home", url: "https://revhackers.com.br/" },
                    { name: "Metodologia", url: "https://revhackers.com.br/metodologia" }
                ]}
                faq={[
                    { question: "Qual é a metodologia da RevHackers?", answer: "A metodologia RevHackers é baseada em 4 pilares: Aquisição Brutal (campanhas B2B com CAC calculado), IA para Filtragem (qualificação automatizada de leads), Automação de Follow-Up (sistemas que perseguem leads 24h) e CRM Vault (configuração blindada de CRM para registrar cada oportunidade)." },
                    { question: "Quanto tempo demora a implementação?", answer: "O ciclo completo de implementação leva de 90 a 120 dias, passando por 4 fases: Diagnóstico Deep Dive, Fundação de Revenue, Growth Loops e Escala & Otimização." }
                ]}
            />
            <Header />

            {/* --- HERO SECTION (BLACK) --- */}
            <section className="bg-black py-24 md:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    {/* Eyebrow */}
                    <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-4">
                        Metodologia
                    </p>

                    {/* Standard Headline H1 */}
                    <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center">
                        Multiplique seu pipeline B2B por 3x em 90 dias <span className="text-[#00CC6A]">sem contratar mais vendedores.</span>
                    </h1>

                    {/* Standard Subheadline */}
                    <p className="text-zinc-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center mb-8">
                        Instalamos a metodologia de Revenue Engineering que integra GTM, RevOps e IA para automatizar 80% das rotinas operacionais de vendas.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button asChild className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-semibold text-sm h-11 px-6 rounded-lg transition-all">
                            <Link to="/booking">Auditar Minha Operação</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- PILLARS GRID (WHITE SECTION) --- */}
            <section className="py-24 bg-white border-t border-zinc-100">
                <div className="container-custom">
                    <div className="text-center mb-20">
                        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
                            A Engenharia da Venda
                        </h2>
                        <p className="text-zinc-600 max-w-2xl mx-auto text-lg leading-relaxed font-semibold tracking-tight">
                            Nós não vendemos "horas de consultoria". Nós montamos esses 4 hardwares na sua operação.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Pillar 1 */}
                        <div className="group p-10 rounded-xl bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Database className="w-5 h-5" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-zinc-900">1. Aquisição Brutal</h3>
                            <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">
                                Operamos campanhas B2B injetando previsibilidade matemática. Extraímos leads do mercado (Inbound/Outbound) com teto calculado de CAC.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="group p-10 rounded-xl bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Network className="w-5 h-5" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-zinc-900">2. IA Filtra Curiosos</h3>
                            <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">
                                Entrou lead sujo? Seus vendedores não falam com ele. Nossa IA de qualificação corta quem não tem verba e agenda quem tem dor real.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="group p-10 rounded-xl bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-zinc-900">3. Automação de Follow-Up</h3>
                            <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">
                                Seu vendedor esqueceu de ligar? O sistema não. Plugamos robôs (Make/n8n) que perseguem o lead com consistência até ele preencher o calendário.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="group p-10 rounded-xl bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-zinc-900">4. CRM Vault (O Cofre)</h3>
                            <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">
                                Nenhuma reunião agendada escapa. Você e seu time operam 100% dentro do CRM configurado por nós para registrar cada ganho de receita.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PROCESS/ROADMAP (WHITE MINIMAL) --- */}
            <section className="py-32 bg-white relative border-t border-zinc-100">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row gap-20 items-start">
                        <div className="md:w-1/3 md:sticky md:top-32">
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
                                Ciclo de<br />Implementação
                            </h2>
                            <p className="text-zinc-500 mb-10 text-lg font-light tracking-tight">
                                Como aplicamos nossa metodologia no seu negócio, passo a passo.
                            </p>
                            <Button asChild className="bg-zinc-100 text-black hover:bg-black hover:text-white border border-zinc-200 hover:border-black transition-all rounded-lg px-8 h-12 text-xs font-bold uppercase tracking-tight shadow-sm">
                                <Link to="/booking">Iniciar Ciclo</Link>
                            </Button>
                        </div>

                        <div className="md:w-2/3 space-y-20 relative border-l border-zinc-200 pl-12 md:pl-20 ml-6 md:ml-0 warning-timeline">
                            {/* Step 1 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-black text-sm font-bold font-sans group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">01</span>
                                <h3 className="text-base md:text-lg font-bold text-zinc-900">Diagnóstico Deep Dive</h3>
                                <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">Mergulhamos nos seus dados atuais, auditamos seu CRM e entrevistamos stakeholders para identificar os gargalos reais de receita.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-sans group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">02</span>
                                <h3 className="text-base md:text-lg font-bold text-zinc-900">Fundação de Revenue</h3>
                                <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">Arrumamos a casa. Limpeza de dados, configuração de tracking correto, definição de ICP e implementação da arquitetura correta de CRM.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-sans group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">03</span>
                                <h3 className="text-base md:text-lg font-bold text-zinc-900">Growth Loops</h3>
                                <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">Implementação das campanhas de aquisição e réguas de nutrição. Início dos testes A/B de conversão e otimização de canais pagos.</p>
                            </div>

                            {/* Step 4 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-sans group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">04</span>
                                <h3 className="text-base md:text-lg font-bold text-zinc-900">Escala & Otimização</h3>
                                <p className="text-sm md:text-base font-normal text-zinc-500 leading-relaxed">Refinamento contínuo baseado em dados de coorte. Expansão para novos canais e automação avançada de retenção.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL (LIGHT) --- */}
            <section className="py-24 bg-zinc-50 border-t border-zinc-200 relative overflow-hidden">
                <div className="container-custom text-center relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
                        Pare de queimar caixa <span className="text-zinc-500 line-through">adivinhando</span>.
                    </h2>
                    <p className="text-sm md:text-base font-normal text-zinc-500 mb-12 max-w-2xl mx-auto tracking-tight">
                        Deixe a IA e o CRM trabalharem suas conversões. Vagas Restritas (Max 3/mês).
                    </p>
                    <Button asChild className="bg-black text-white hover:bg-[#00CC6A] hover:text-black font-semibold text-sm h-11 px-6 rounded-lg uppercase transition-all shadow-sm hover:translate-y-[-2px]">
                        <Link to="/booking">Auditar Minha Operação</Link>
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-xxs font-bold uppercase tracking-tight text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Diagnóstico confidencial e sem compromisso.</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Metodologia;
