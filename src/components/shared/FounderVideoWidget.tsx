import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitPublicDiagnostic } from '@/api/publicDiagnostic';
import { sendToGHL } from '@/lib/ghlRelay';
import { captureUtmParams, getPersistedUtmParams } from '@/utils/utm';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const FOUNDER_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-4336-large.mp4";

// Persistent Lead Identity Recovery (localStorage)
const getStoredIdentity = () => {
  try {
    const raw = localStorage.getItem('rev_lead_identity');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const FounderVideoWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  
  const initialIdentity = getStoredIdentity();
  const [email, setEmail] = useState<string>(initialIdentity?.email || '');
  const [emailCaptured, setEmailCaptured] = useState<boolean>(!!initialIdentity?.email);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Do NOT render widget on admin or internal REI routes
  const isAdminRoute = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/rei') || 
    location.pathname.startsWith('/rei-onboarding');

  if (isAdminRoute) {
    return null;
  }

  // Dynamic Contextual Greeting based on user behavior on the current page (ZERO EMOJIS)
  const getContextualMessages = (pathname: string): Message[] => {
    const saved = getStoredIdentity();
    const displayName = saved?.firstName || (saved?.name ? saved.name.split(' ')[0] : '');

    if (saved?.email && displayName) {
      return [
        { sender: 'ai', text: `Fala, ${displayName}! Bom te ver de volta por aqui no site da RevHackers.`, timestamp: 'Agora' },
        { sender: 'ai', text: 'Como posso acelerar a geração de demanda e a infraestrutura da sua empresa hoje?', timestamp: 'Agora' }
      ];
    }
    if (saved?.email) {
      return [
        { sender: 'ai', text: 'Fala! Que bom te ver de volta por aqui.', timestamp: 'Agora' },
        { sender: 'ai', text: 'Como posso ajudar sua operação de GTM Engineering hoje?', timestamp: 'Agora' }
      ];
    }

    if (pathname.includes('/blog') || pathname.includes('/artigo')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Vi que você está analisando nossos artigos de Engenharia de GTM.', timestamp: 'Agora' },
        { sender: 'ai', text: 'Quer tirar dúvidas sobre como aplicar essa estratégia de conteúdo e mídia na sua empresa?', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/materiais') || pathname.includes('/ferramentas') || pathname.includes('/calculator')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Precisa de ajuda para interpretar os números da calculadora ou escolher o melhor playbook?', timestamp: 'Agora' },
        { sender: 'ai', text: 'Me conta: qual é a meta de receita da sua empresa para os próximos 90 dias?', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/servicos') || pathname.includes('/cases')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Analisando nossos 4 motores de GTM e cases como Wysion (1.000+ reuniões) e Heineken (+30%)?', timestamp: 'Agora' },
        { sender: 'ai', text: 'Quer saber como implementamos essa mesma máquina no seu CRM em até 30 dias?', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/diagnostico') || pathname.includes('/score')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Pronto para rodar a Auditoria Preditiva da sua operação B2B?', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para liberar a análise de vazamentos e falar com nosso time:', timestamp: 'Agora' }
      ];
    }

    return [
      { sender: 'ai', text: 'Fala! Sou o Giulliano, fundador da RevHackers.', timestamp: 'Agora' },
      { sender: 'ai', text: 'Me conta: qual é o maior desafio ou gargalo da sua empresa hoje para gerar demanda e escalar vendas B2B?', timestamp: 'Agora' }
    ];
  };

  // Floating trigger button text depending on current page
  const getFloatingLabel = (pathname: string): string => {
    if (pathname.includes('/blog') || pathname.includes('/artigo')) return '💬 Dúvidas sobre este Artigo?';
    if (pathname.includes('/materiais') || pathname.includes('/ferramentas') || pathname.includes('/calculator')) return '🧮 Ajuda com Calculadoras';
    if (pathname.includes('/cases') || pathname.includes('/servicos')) return '🎯 Ver Cases & Motores de GTM';
    return 'Converse com Giulliano';
  };

  // Initial pills per page category
  const getPagePills = (pathname: string): string[] => {
    if (pathname.includes('/blog') || pathname.includes('/artigo')) {
      return ["📊 Auditoria de GTM", "🚀 Ver Cases B2B", "💬 Falar com Giulliano"];
    }
    if (pathname.includes('/materiais') || pathname.includes('/ferramentas') || pathname.includes('/calculator')) {
      return ["📈 Interpretar Resultado", "📊 Auditoria de Funil", "💬 Falar com Giulliano"];
    }
    if (pathname.includes('/cases') || pathname.includes('/servicos')) {
      return ["🍺 Case Heineken (+30%)", "💻 Case Wysion (1k calls)", "📅 Agendar 30 min em /booking"];
    }
    return [
      "📊 Rodar Auditoria de Receita",
      "🎯 Ver Cases (Heineken, Anhembi)",
      "💬 Falar com Especialista"
    ];
  };

  const [messages, setMessages] = useState<Message[]>(() => getContextualMessages(location.pathname));
  const [conversationalStep, setConversationalStep] = useState<number>(0);

  // Automatically close modal and update context when user navigates to another page
  useEffect(() => {
    setIsOpen(false);
    if (!emailCaptured) {
      setMessages(getContextualMessages(location.pathname));
      setActivePills(getPagePills(location.pathname));
      setConversationalStep(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    const utmParams = { ...getPersistedUtmParams(), ...captureUtmParams() };
    const extractedName = email.split('@')[0];
    const firstName = extractedName.split('.')[0];

    // Store in localStorage for persistent recognition across pages & sessions
    try {
      localStorage.setItem('rev_lead_identity', JSON.stringify({
        email,
        name: extractedName,
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        capturedAt: new Date().toISOString()
      }));
    } catch (e) {}

    try {
      // 1. Submit to GCP API / Supabase
      await submitPublicDiagnostic(
        { email, name: extractedName, source: 'founder_ai_chat', company: 'Lead Chat' },
        { source: 'founder_video_widget', type: 'ai_chat_lead', ...utmParams },
        0,
        { level: "Lead", description: "Interação no Chat IA Founder", action: "Chat", color: "green" },
        'lead_capture'
      );

      // 2. Direct GHL Relay Integration with UTM mapping & Tag
      await sendToGHL({
        email,
        name: extractedName,
        source: 'founder_video_widget',
        tags: ['founder_ai_chat', 'video_widget_lead', 'gtm_engineering'],
        customFields: {
          fonte_do_lead: 'Founder AI Video Widget',
          ...utmParams
        }
      }, 'lead_capture');

    } catch (err) {
      console.warn("GHL/GCP integration warning:", err);
    } finally {
      setEmailCaptured(true);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: email, timestamp: 'Agora' },
        {
          sender: 'ai',
          text: `Perfeito, e-mail registrado com sucesso! Como posso te ajudar a aprofundar sua estratégia de GTM hoje?`,
          timestamp: 'Agora'
        }
      ]);
      setLoading(false);
    }
  };

  const [showPills, setShowPills] = useState(true);
  const [extractedData, setExtractedData] = useState<{ company?: string; crm?: string; role?: string; linkedin?: string }>({});

  const [activePills, setActivePills] = useState<string[]>([
    "📊 Rodar Auditoria de Receita",
    "🎯 Ver Cases (Heineken, Anhembi)",
    "💬 Falar com Especialista"
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setShowPills(false);

    const userMsg: Message = { sender: 'user', text, timestamp: 'Agora' };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setLoading(true);
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = "";
      let newPills: string[] = [];
      const lower = text.toLowerCase().trim();

      if (!emailCaptured) {
        if (lower.includes("especialista") || lower.includes("humano") || lower.includes("time") || lower.includes("giulliano")) {
          aiReply = "Show! Sou o Giulliano, fundador da RevHackers. Eu conduzo pessoalmente a sessão técnica de 30 min sem custo para analisar vazamentos de receita no seu CRM.\n\nPara eu te direcionar com precisão: qual é o nome da sua empresa e qual o seu CRM atual?";
          newPills = ["🟢 Usamos HubSpot / Pipedrive", "🔴 Não temos CRM ainda", "📅 Agendar Sessão em /booking"];
          setConversationalStep(1);
        } else if (lower.includes("auditoria") || lower.includes("diagnostico") || lower.includes("score") || lower.includes("vazamento")) {
          aiReply = "Excelente! Nossa auditoria analisa 4 pilares: Mídia Paga, Qualificação, Automação e CRM.\n\nQual é a principal dor da sua empresa hoje no funil?";
          newPills = ["🎯 Falta de Leads Qualificados", "⏳ Demora no Atendimento (SLA)", "📊 Perda no Fechamento Comercial"];
          setConversationalStep(1);
        } else if (lower.includes("case") || lower.includes("heineken") || lower.includes("wysion") || lower.includes("anhembi") || lower.includes("cruzeiro")) {
          aiReply = "Excelente! Na Heineken aumentamos o sell-out em 30%, na Wysion geramos +1.000 reuniões qualificadas em software B2B, e na Anhembi Morumbi otimizamos a atração de alunos.\n\nQual é o segmento da sua empresa para eu te mostrar os números mais próximos do seu mercado?";
          newPills = ["💻 Software & SaaS B2B", "🏭 Indústria / Grande Conta", "🎓 Educação / Serviços", "📖 Ver Todos os Cases no Site"];
          setConversationalStep(1);
        } else if (lower.includes("software") || lower.includes("saas") || lower.includes("indústria") || lower.includes("educação") || lower.includes("serviços") || lower.includes("hubspot") || lower.includes("pipedrive")) {
          aiReply = "Perfeito! Nesse segmento, nossa Engenharia de GTM conecta Mídia Paga B2B + Qualificação por IA direto no seu CRM, gerando pipeline previsível em 30 a 90 dias.\n\nDigite seu e-mail corporativo abaixo para liberarmos o estudo de viabilidade completo da sua empresa:";
          newPills = [];
          setConversationalStep(2);
        } else if (lower.includes("ver todos os cases") || lower.includes("site")) {
          aiReply = "Você pode acessar nossa página oficial de cases em /cases para ver todos os estudos de viabilidade completos. Digite seu e-mail corporativo abaixo para receber a apresentação executiva:";
          newPills = [];
          setConversationalStep(2);
        } else if (conversationalStep === 0) {
          aiReply = "Entendi o seu cenário! Na RevHackers nós instalamos os 4 motores de GTM no seu CRM em até 30 dias: Mídia Paga B2B, Funis de Conversão, CRM com IA e Automação Comercial.\n\nMe conta: qual é o segmento da sua empresa e o tamanho da sua equipe comercial?";
          newPills = ["💻 Software B2B (1-5 pessoas)", "🏭 Indústria / Serviços (6-20 pessoas)", "🚀 Escala (+20 pessoas)"];
          setConversationalStep(1);
        } else if (conversationalStep === 1) {
          aiReply = "Excelente! Tenho um estudo de viabilidade e arquitetura de receita muito alinhado com a sua operação.\n\nDigite seu e-mail corporativo abaixo para salvarmos seu diagnóstico e te enviar a análise completa:";
          newPills = [];
          setConversationalStep(2);
        } else {
          aiReply = "Digite seu e-mail corporativo abaixo para liberar o atendimento consultivo ao vivo e agendamento de 30 min:";
          newPills = [];
        }
      } else {
        if (lower.includes('como funciona') || lower.includes('o que voces fazem')) {
          aiReply = "Nossa Engenharia de GTM instala 4 motores acionáveis na sua empresa em 30 dias: 1. Mídia Paga B2B, 2. Funis de Agendamento, 3. Arquitetura de CRM com IA e 4. Automação Comercial.";
        } else if (lower.includes('case') || lower.includes('resultado') || lower.includes('heineken') || lower.includes('wysion')) {
          aiReply = "Na Wysion geramos 1.000+ reuniões qualificadas em software B2B, na Heineken aumentamos o sell-out em 30% e na Anhembi otimizamos a atração. Você pode ver todos em /cases.";
        } else {
          aiReply = "Excelente ponto! Você também pode agendar uma sessão de 30 minutos direto na nossa agenda corporativa em /booking para ver os motores rodando na prática.";
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply, timestamp: 'Agora' }]);
      if (newPills.length > 0) {
        setActivePills(newPills);
        setShowPills(true);
      } else {
        setShowPills(false);
      }
      setLoading(false);
    }, 1800);
  };

  const handlePillClickBeforeEmail = (pillText: string) => {
    if (pillText.includes("/booking")) {
      window.location.href = "/booking";
      return;
    }
    if (pillText.includes("/cases")) {
      window.location.href = "/cases";
      return;
    }
    handleSendMessage(pillText);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 sm:bottom-10 right-6 sm:right-8 z-50 cursor-pointer group select-none"
          >
            <div className="bg-zinc-950 text-white border border-zinc-800/90 p-2 pr-5 rounded-full shadow-2xl flex items-center gap-3 hover:border-zinc-700 hover:scale-105 transition-all">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#00CC6A]/80 shadow-[0_0_10px_rgba(0,204,106,0.3)] shrink-0 bg-zinc-900 flex items-center justify-center">
                {!videoError ? (
                  <video
                    src={FOUNDER_VIDEO_URL}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/uploads/giulliano-linkedin-profile.png"
                    alt="Giulliano Alves"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-white leading-tight">
                  {getFloatingLabel(location.pathname)}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse inline-block shrink-0" />
                  Founder RevHackers • Online
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[580px] max-h-[85vh] bg-white text-zinc-950 rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-20 bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#00CC6A] shrink-0 bg-zinc-900">
                  <img
                    src="/uploads/giulliano-linkedin-profile.png"
                    alt="Giulliano Alves"
                    className="w-full h-full object-cover object-[center_15%]"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00CC6A] border-2 border-zinc-950" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    Giulliano Alves
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00CC6A] animate-pulse inline-block shrink-0" />
                    Founder RevHackers • Online agora
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0 text-xs sm:text-sm leading-relaxed font-sans bg-zinc-50/50 scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl break-words ${
                      msg.sender === 'user'
                        ? 'bg-[#00CC6A] text-zinc-950 font-bold rounded-tr-xs shadow-xs'
                        : 'bg-white text-zinc-900 border border-zinc-200/90 rounded-tl-xs shadow-sm font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-zinc-500 border border-zinc-200/90 p-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-sm">
                    <span className="text-xs font-medium text-zinc-600 mr-1">Giulliano digitando</span>
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {showPills && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {activePills.map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => emailCaptured ? handleSendMessage(pill) : handlePillClickBeforeEmail(pill)}
                      className="text-xs sm:text-sm bg-white hover:bg-zinc-100 text-zinc-800 hover:text-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 transition-all text-left shadow-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-zinc-100 bg-white shrink-0 space-y-2">
              {!emailCaptured && conversationalStep < 2 ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Responda ou digite sua dúvida aqui..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 text-xs sm:text-sm h-10 rounded-xl placeholder:text-zinc-400 focus:border-[#00CC6A]"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputText.trim()}
                    className="h-10 w-10 bg-[#00CC6A] text-black hover:bg-[#00b35e] font-bold rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : !emailCaptured && conversationalStep >= 2 ? (
                <>
                  <form onSubmit={handleEmailSubmit} className="space-y-2">
                    <div className="relative flex items-center">
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail corporativo para liberar..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-zinc-50 border-zinc-200 text-zinc-900 text-xs sm:text-sm h-10 pr-12 rounded-xl placeholder:text-zinc-400 focus:border-[#00CC6A]"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-1.5 top-1.5 h-7 w-8 bg-[#00CC6A] text-black hover:bg-[#00b35e] font-bold rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                      >
                        {loading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                  <button
                    onClick={() => window.location.href = "/booking"}
                    className="w-full text-xs font-bold text-zinc-700 hover:text-zinc-950 py-2 flex items-center justify-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00CC6A]" />
                    Prefere agendar reunião? Agendar Sessão de 30 min
                  </button>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Pergunte sobre GTM, Cases, ROI..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 text-xs h-10 rounded-xl placeholder:text-zinc-400 focus:border-[#00CC6A] flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !inputText.trim()}
                    className="h-10 w-10 bg-[#00CC6A] text-black hover:bg-[#00b35e] rounded-xl shrink-0 border-none font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FounderVideoWidget;
