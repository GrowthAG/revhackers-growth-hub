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

  // Dynamic Contextual Greeting based on user behavior on the current page (ZERO EMOJIS)
  const getContextualMessages = (pathname: string): Message[] => {
    const saved = getStoredIdentity();
    const displayName = saved?.firstName || (saved?.name ? saved.name.split(' ')[0] : '');

    if (saved?.email && displayName) {
      return [
        { sender: 'ai', text: `Fala, ${displayName}! Bom te ver de volta por aqui no site da RevHackers.`, timestamp: 'Agora' },
        { sender: 'ai', text: 'Como posso acelerar a geracao de demanda e a infraestrutura da sua empresa hoje?', timestamp: 'Agora' }
      ];
    }
    if (saved?.email) {
      return [
        { sender: 'ai', text: 'Fala! Que bom te ver de volta por aqui.', timestamp: 'Agora' },
        { sender: 'ai', text: 'Como posso ajudar sua operacao de GTM Engineering hoje?', timestamp: 'Agora' }
      ];
    }

    if (pathname.includes('/blog') || pathname.includes('/artigo')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Vi que voce esta analisando nossos artigos e estrategias de GTM.', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para liberar o chat ao vivo e tirar duvidas tecnicas sobre este artigo:', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/materiais') || pathname.includes('/material')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. O que esta achando dos nossos materiais de Revenue & GTM Engineering?', timestamp: 'Agora' },
        { sender: 'ai', text: 'Digite seu e-mail corporativo abaixo para desbloquear o chat e te ajudarmos a escolher o melhor playbook:', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/servicos') || pathname.includes('/cases')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Analisando nossos 4 motores de GTM e cases como Wysion (1.000+ reunioes) e Heineken (+30%)?', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para tirar duvidas direto sobre ROI e implementacao em 30 dias:', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/diagnostico') || pathname.includes('/score')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Pronto para rodar o Diagnostico Preditivo da sua operacao B2B?', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para liberar a analise de vazamentos e falar com nosso time:', timestamp: 'Agora' }
      ];
    }

    return [
      { sender: 'ai', text: 'Fala! Giulliano aqui, fundador da RevHackers.', timestamp: 'Agora' },
      { sender: 'ai', text: 'Antes de comecarmos nossa conversa tecnica, digite seu e-mail corporativo para liberar o chat ao vivo:', timestamp: 'Agora' }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(() => getContextualMessages(location.pathname));

  // Automatically close modal and update context when user navigates to another page
  useEffect(() => {
    setIsOpen(false);
    if (!emailCaptured) {
      setMessages(getContextualMessages(location.pathname));
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
          text: `E-mail registrado no nosso CRM! Como posso ajudar sua operacao B2B com GTM Engineering hoje?`,
          timestamp: 'Agora'
        }
      ]);
      setLoading(false);
    }
  };

  const [showPills, setShowPills] = useState(true);
  const [extractedData, setExtractedData] = useState<{ company?: string; crm?: string; role?: string; linkedin?: string }>({});

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Hide pills when user sends a message
    setShowPills(false);

    const userMsg: Message = { sender: 'user', text, timestamp: 'Agora' };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setLoading(true);
    setIsTyping(true);

    // Humanized Typing Delay Simulation (1.8s to 2.2s)
    setTimeout(() => {
      let aiReply = "Fala! Giulliano aqui. Nossa Engenharia de GTM conecta Midia Paga (Google, Meta e LinkedIn Ads) diretamente ao seu CRM com funis de alta conversao. Quer agendar uma auditoria tecnica de 30 minutos pra ver na pratica?";
      
      const lower = text.toLowerCase().trim();
      const utmParams = { ...getPersistedUtmParams(), ...captureUtmParams() };

      // 0. AI Extraction: Detect LinkedIn URL or Profile
      const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
      if (linkedinMatch || lower.includes('linkedin.com')) {
        const detectedLinkedin = linkedinMatch ? linkedinMatch[0] : text.trim();
        setExtractedData(prev => ({ ...prev, linkedin: detectedLinkedin }));
        
        // Background CRM Sync
        if (email) {
          sendToGHL({
            email,
            customFields: { linkedin: detectedLinkedin, ...utmParams },
            tags: ['ai_chat_linkedin_captured', 'gtm_engineering']
          }, 'lead_capture').catch(() => {});
        }

        aiReply = "Show! Guardei seu perfil do LinkedIn no nosso CRM. Qual e o principal desafio da sua operacao comercial hoje?";
      }
      // 1. AI Extraction: Detect CRM Tool
      const crmMatch = lower.match(/(hubspot|rd station|pipedrive|salesforce|activecampaign|zoho|bitrix|exact sales|ghl)/i);
      if (crmMatch) {
        const detectedCrm = crmMatch[0].toUpperCase();
        setExtractedData(prev => ({ ...prev, crm: detectedCrm }));
        
        // Background CRM Sync
        if (email) {
          sendToGHL({
            email,
            customFields: { crm_atual: detectedCrm, ...utmParams },
            tags: ['ai_chat_crm_captured', 'gtm_engineering']
          }, 'lead_capture').catch(() => {});
        }

        aiReply = `Perfeito! O ${detectedCrm} e excelente quando integrado a nossa Engenharia de GTM. Conseguimos instalar automacoes de qualificacao com IA e roteamento inteligente diretamente nele. Qual e o nome da sua empresa?`;
      } 
      // 2. AI Extraction: Detect Company Name or Role
      else if (lower.includes('empresa') || lower.includes('trabalho na') || lower.includes('sou da') || lower.includes('minha empresa')) {
        const cleanedCompany = text.replace(/(minha empresa e|sou da|trabalho na|empresa|e a)/gi, '').trim();
        if (cleanedCompany.length > 1) {
          setExtractedData(prev => ({ ...prev, company: cleanedCompany }));
          
          // Background CRM Sync
          if (email) {
            sendToGHL({
              email,
              companyName: cleanedCompany,
              customFields: { ...utmParams },
              tags: ['ai_chat_company_captured', 'gtm_engineering']
            }, 'lead_capture').catch(() => {});
          }

          aiReply = `Excelente! Analisando o modelo da ${cleanedCompany}, o maior ganho costuma vir da aceleracao de pipeline com automacoes entre Midia Paga e CRM. Qual e o seu cargo na empresa hoje?`;
        }
      }
      else if (lower.includes('ceo') || lower.includes('founder') || lower.includes('sócio') || lower.includes('socio') || lower.includes('diretor') || lower.includes('head') || lower.includes('gerente') || lower.includes('coordenador') || lower.includes('vendedor') || lower.includes('sdr')) {
        const roleMatch = text.trim();
        setExtractedData(prev => ({ ...prev, role: roleMatch }));

        // Background CRM Sync
        if (email) {
          sendToGHL({
            email,
            customFields: { cargo: roleMatch, ...utmParams },
            tags: ['ai_chat_role_captured', 'gtm_engineering']
          }, 'lead_capture').catch(() => {});
        }

        aiReply = `Otimo falar com quem esta no comando da operacao! O GTM Engineering e exatamente desenhado para lideres que precisam de previsibilidade de receita e ROI acelerado. Quer agendar nossa Auditoria de Vazamento de Receita de 30 min em /booking?`;
      }
      // 3. Intent Matching
      else if (lower.includes('nome') || lower.includes('quem e') || lower.includes('quem eh') || lower.includes('quem fala') || lower.includes('quem voce')) {
        aiReply = "Eu sou a IA do Giulliano Alves, fundador da RevHackers. Posso te ajudar a entender nossa Engenharia de GTM ou agendar uma auditoria tecnica de receita de 30 min. Como posso ajudar sua empresa hoje?";
      } else if (lower.includes('ola') || lower.includes('oi') || lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('boa noite') || lower.includes('tudo bem')) {
        aiReply = "Fala! Tudo otimo por aqui. Como posso ajudar sua operacao B2B com GTM Engineering hoje?";
      } else if (lower.includes('como funciona') || lower.includes('o que voces fazem') || lower.includes('como eh')) {
        aiReply = "Nossa Engenharia de GTM instala 4 motores acionaveis na sua empresa em 30 dias: 1. Midia Paga (Midia Paga & Social Selling), 2. Funis de Agendamento, 3. Arquitetura de CRM e 4. Automacao B2B. Quer ver um exemplo real?";
      } else if (lower.includes('gtm') || lower.includes('engenharia')) {
        aiReply = "Boa pergunta! O GTM Engineering substitui aquela consultoria teorica de slides por 4 sistemas instalados na sua operacao: Engenharia de Vendas, Arquitetura de CRM, Automacao B2B e Habilitacao do time comercial em ate 30 dias.";
      } else if (lower.includes('case') || lower.includes('resultado') || lower.includes('wysion') || lower.includes('heineken')) {
        aiReply = "Te dar 2 exemplos praticos: na Wysion (Software House), estruturamos a geracao de demanda e geramos 1.000+ reunioes qualificadas. Na Heineken, aumentamos o sell-out em 30%. Qual e o setor da sua empresa?";
      } else if (lower.includes('custo') || lower.includes('preco') || lower.includes('quanto') || lower.includes('valor')) {
        aiReply = "Trabalhamos com foco total em ROI acelerado e contrato por marcos de entrega. O caminho padrao que fazemos com todos os clientes e comecar pela Auditoria de Vazamento de Receita de 30 min sem custo.";
      } else if (lower.includes('agendar') || lower.includes('time') || lower.includes('falar') || lower.includes('reuniao')) {
        aiReply = "Excelente! Voce pode agendar direto na minha agenda corporativa pelo link /booking. Nosso time tecnico analisa seus gargalos antes da chamada.";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply, timestamp: 'Agora' }]);
      setLoading(false);
    }, 1800);
  };

  const topicPills = [
    "O que e GTM Engineering?",
    "Como funciona a Auditoria?",
    "Cases Reais (1000+ Reunioes)",
    "Agendar com o Time"
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: [1, 1.025, 1]
            }}
            transition={{
              scale: {
                duration: 2.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 cursor-pointer group select-none"
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
                  Converse com Giulliano
                </span>
                <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse inline-block shrink-0" />
                  Founder IA • Online
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Video Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[560px] max-h-[85vh] bg-white text-zinc-950 rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            {/* Header com Foto Oficial do Founder - Enquadramento Perfeito h-44 */}
            <div className="relative h-44 bg-zinc-900 overflow-hidden shrink-0 border-b border-zinc-100">
              <img
                src="/uploads/giulliano-linkedin-profile.png"
                alt="Giulliano Alves"
                className="w-full h-full object-cover object-[center_15%] filter brightness-95"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-zinc-700 hover:text-zinc-950 border border-zinc-200 flex items-center justify-center transition-colors z-20 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Live Founder Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                <span className="text-[11px] font-bold text-zinc-900 tracking-tight">Giulliano Alves • Founder</span>
              </div>
            </div>

            {/* Area de Conversa com Autoscroll e Overflow Perfeito */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0 text-xs leading-relaxed font-sans bg-zinc-50/50 scroll-smooth">
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

              {/* Animated Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-zinc-500 border border-zinc-200/90 p-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-sm">
                    <span className="text-[11px] font-medium text-zinc-500 mr-1">Giulliano digitando</span>
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {emailCaptured && showPills && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {topicPills.map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(pill)}
                      className="text-[11px] bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 transition-all text-left shadow-xs font-medium"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-zinc-100 bg-white shrink-0">
              {!emailCaptured ? (
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <div className="relative flex items-center">
                    <Input
                      type="email"
                      placeholder="Digite seu e-mail corporativo..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-zinc-50 border-zinc-200 text-zinc-900 text-xs h-10 pr-12 rounded-xl placeholder:text-zinc-400 focus:border-[#00CC6A]"
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
