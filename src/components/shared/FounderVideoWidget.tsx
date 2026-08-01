import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitPublicDiagnostic } from '@/api/publicDiagnostic';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const FOUNDER_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-4336-large.mp4";

const FounderVideoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Olá! Sou a IA do Giulliano, Founder da RevHackers. 🚀',
      timestamp: 'Agora'
    },
    {
      sender: 'ai',
      text: 'Antes de começarmos nossa conversa técnica, digite seu e-mail corporativo para liberar o chat ao vivo.',
      timestamp: 'Agora'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await submitPublicDiagnostic(
        { email, name: email.split('@')[0], source: 'founder_ai_chat' },
        { source: 'founder_video_widget', type: 'ai_chat_lead' },
        0,
        { level: "Lead", description: "Interação no Chat IA Founder", action: "Chat", color: "green" },
        'ai_chat_lead'
      );
    } catch (err) {
      console.warn("Email capture warning:", err);
    } finally {
      setEmailCaptured(true);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: email, timestamp: 'Agora' },
        {
          sender: 'ai',
          text: 'E-mail registrado! Como posso ajudar sua operação B2B com GTM Engineering hoje?',
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

    setTimeout(() => {
      let aiReply = "Nossa Engenharia de GTM conecta Mídia Paga (Google, Meta e LinkedIn Ads) a funis de alta conversão. Deseja agendar uma auditoria técnica de 30 minutos?";
      
      const lower = text.toLowerCase();
      if (lower.includes('gtm') || lower.includes('engenharia')) {
        aiReply = "O GTM Engineering substitui a consultoria teórica tradicional por 4 sistemas acionáveis: Engenharia de Vendas, Arquitetura de CRM, Automação B2B e Habilitação Operacional em 30 dias.";
      } else if (lower.includes('case') || lower.includes('resultado') || lower.includes('wysion') || lower.includes('heineken')) {
        aiReply = "Na Wysion (Software House B2B), geramos mais de 1.000 reuniões qualificadas via mídia paga e funis de agendamento. Na Heineken, aumentamos o sell-out em 30%.";
      } else if (lower.includes('custo') || lower.includes('preco') || lower.includes('quanto')) {
        aiReply = "Trabalhamos com modelo de contrato por marcos de entrega e ROI acelerado. O primeiro passo é uma Auditoria de Vazamento de Receita sem custo.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply, timestamp: 'Agora' }]);
      setLoading(false);
    }, 600);
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
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 cursor-pointer group select-none"
          >
            <div className="bg-zinc-950 text-white border border-zinc-800 p-2 pr-5 rounded-full shadow-2xl flex items-center gap-3 hover:border-zinc-700 hover:scale-105 transition-all">
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
                    src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694f308542bb1c3d633bdbfb.png"
                    alt="Giulliano"
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00CC6A] border-2 border-zinc-950 rounded-full" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white flex items-center gap-1 leading-tight">
                  Giulliano <Sparkles className="w-3 h-3 text-[#00CC6A]" />
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
            {/* Header com Vídeo do Founder */}
            <div className="relative h-44 bg-zinc-900 overflow-hidden shrink-0">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src={FOUNDER_VIDEO_URL}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover filter brightness-90"
                />
              ) : (
                <img
                  src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694f308542bb1c3d633bdbfb.png"
                  alt="Giulliano"
                  className="w-full h-full object-cover"
                />
              )}

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
