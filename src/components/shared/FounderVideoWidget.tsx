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

const FounderVideoWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic Contextual Greeting based on user behavior on the current page
  const getContextualMessages = (pathname: string): Message[] => {
    if (pathname.includes('/blog') || pathname.includes('/artigo')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Vi que você está analisando nossos artigos e estratégias de GTM! 🚀', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para liberar o chat ao vivo e tirar dúvidas técnicas sobre este artigo:', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/materiais') || pathname.includes('/material')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. O que está achando dos nossos materiais de Revenue & GTM Engineering? 📚', timestamp: 'Agora' },
        { sender: 'ai', text: 'Digite seu e-mail corporativo abaixo para desbloquear o chat e te ajudarmos a escolher o melhor playbook:', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/servicos') || pathname.includes('/cases')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Analisando nossos 4 motores de GTM e cases como Wysion (1.000+ reuniões) e Heineken (+30%)? 📈', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para tirar dúvidas direto sobre ROI e implementação em 30 dias:', timestamp: 'Agora' }
      ];
    }
    if (pathname.includes('/diagnostico') || pathname.includes('/score')) {
      return [
        { sender: 'ai', text: 'Fala! Giulliano aqui. Pronto para rodar o Diagnóstico Preditivo da sua operação B2B? ⚡️', timestamp: 'Agora' },
        { sender: 'ai', text: 'Insira seu e-mail corporativo abaixo para liberar a análise de vazamentos e falar com nosso time:', timestamp: 'Agora' }
      ];
    }

    return [
      { sender: 'ai', text: 'Fala! Giulliano aqui, fundador da RevHackers. 🚀', timestamp: 'Agora' },
      { sender: 'ai', text: 'Antes de começarmos nossa conversa técnica, digite seu e-mail corporativo para liberar o chat ao vivo:', timestamp: 'Agora' }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(() => getContextualMessages(location.pathname));

  // Update context when user navigates to another page
  useEffect(() => {
    if (!emailCaptured) {
      setMessages(getContextualMessages(location.pathname));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    const utmParams = { ...getPersistedUtmParams(), ...captureUtmParams() };

    try {
      // 1. Submit to GCP API / Supabase
      await submitPublicDiagnostic(
        { email, name: email.split('@')[0], source: 'founder_ai_chat', company: 'Lead Chat' },
        { source: 'founder_video_widget', type: 'ai_chat_lead', ...utmParams },
        0,
        { level: "Lead", description: "Interação no Chat IA Founder", action: "Chat", color: "green" },
        'lead_capture'
      );

      // 2. Direct GHL Relay Integration with UTM mapping & Tag
      await sendToGHL({
        email,
        name: email.split('@')[0],
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
          text: 'E-mail registrado no nosso CRM! Como posso ajudar sua operação B2B com GTM Engineering hoje?',
          timestamp: 'Agora'
        }
      ]);
      setLoading(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = { sender: 'user', text, timestamp: 'Agora' };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setLoading(true);
    setIsTyping(true);

    // Humanized Typing Delay Simulation (1.8s to 2.4s)
    setTimeout(() => {
      let aiReply = "Fala! Giulliano aqui. Nossa Engenharia de GTM conecta Mídia Paga (Google, Meta e LinkedIn Ads) diretamente ao seu CRM com funis de alta conversão. Quer agendar uma auditoria técnica de 30 minutos pra ver na prática?";
      
      const lower = text.toLowerCase();
      if (lower.includes('gtm') || lower.includes('engenharia')) {
        aiReply = "Boa pergunta! O GTM Engineering substitui aquela consultoria teórica de slides por 4 sistemas instalados na sua operação: Engenharia de Vendas, Arquitetura de CRM, Automação B2B e Habilitação do time comercial em até 30 dias.";
      } else if (lower.includes('case') || lower.includes('resultado') || lower.includes('wysion') || lower.includes('heineken')) {
        aiReply = "Te dar 2 exemplos práticos: na Wysion (Software House), estruturamos a geração de demanda e geramos 1.000+ reuniões qualificadas. Na Heineken, aumentamos o sell-out em 30%. Qual é o setor da sua empresa?";
      } else if (lower.includes('custo') || lower.includes('preco') || lower.includes('quanto') || lower.includes('valor')) {
        aiReply = "Trabalhamos com foco total em ROI acelerado e contrato por marcos de entrega. O caminho padrão que fazemos com todos os clientes é começar pela Auditoria de Vazamento de Receita de 30 min sem custo.";
      } else if (lower.includes('agendar') || lower.includes('time') || lower.includes('falar')) {
        aiReply = "Excelente! Você pode agendar direto na minha agenda corporativa pelo link /booking. Nosso time técnico analisa seus gargalos antes da chamada.";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply, timestamp: 'Agora' }]);
      setLoading(false);
    }, 2000);
  };

  const topicPills = [
    "🚀 O que é GTM Engineering?",
    "📊 Como funciona a Auditoria?",
    "🎯 Cases Reais (1000+ Reuniões)",
    "📅 Agendar com o Time"
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
              scale: 1,
              y: [0, -4, 0]
            }}
            transition={{
              y: {
                duration: 3,
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
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#00CC6A] shrink-0 bg-zinc-900 flex items-center justify-center">
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
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00CC6A] border-2 border-zinc-950 rounded-full" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  Giulliano Alves
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Founder IA • Online</span>
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
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[85vh] bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header com Foto Oficial do Founder - Enquadramento Perfeito h-44 sm:h-48 */}
            <div className="relative h-44 sm:h-48 bg-zinc-900 overflow-hidden shrink-0">
              <img
                src="/uploads/giulliano-linkedin-profile.png"
                alt="Giulliano Alves"
                className="w-full h-full object-cover object-top filter brightness-95"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/60 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Live Founder Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Giulliano // Founder IA</span>
              </div>

              {/* Audio Controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00CC6A]" />}
                </button>
                <button
                  onClick={() => setIsMicActive(!isMicActive)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    isMicActive ? 'bg-[#00CC6A] text-black border-[#00CC6A]' : 'bg-zinc-950/80 text-zinc-300 border-zinc-800'
                  }`}
                >
                  {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Area de Conversa */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[300px] text-xs leading-relaxed font-sans bg-zinc-950/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-white text-zinc-950 font-medium rounded-br-none'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Animated Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 text-zinc-400 border border-zinc-800 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-zinc-400 mr-1">Giulliano digitando</span>
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {emailCaptured && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {topicPills.map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(pill)}
                      className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full border border-zinc-800 transition-all text-left"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-zinc-900 bg-zinc-950 shrink-0">
              {!emailCaptured ? (
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Digite seu e-mail corporativo..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-zinc-900 border-zinc-800 text-white text-xs h-10 pr-10 rounded-xl placeholder:text-zinc-500 focus:border-zinc-700"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-1.5 top-1.5 h-7 w-7 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      {loading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
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
                    className="bg-zinc-900 border-zinc-800 text-white text-xs h-10 rounded-xl placeholder:text-zinc-500 focus:border-zinc-700 flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !inputText.trim()}
                    className="h-10 w-10 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shrink-0"
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
