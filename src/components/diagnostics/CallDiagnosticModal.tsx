import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar, ClipboardCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CallDiagnosticModalProps {
 isOpen: boolean;
 onClose: () => void;
 source?: string;
}

export const CallDiagnosticModal = ({ isOpen, onClose, source = 'diagnostic' }: CallDiagnosticModalProps) => {
 const [step, setStep] = useState<'form' | 'calendar' | 'success'>('form');
 const [isSubmitting, setIsSubmitting] = useState(false);

 const handleFormSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);

 // Simulating data persistence / webhook capture
 // In a real scenario, we would call an API here
 setTimeout(() => {
 setIsSubmitting(false);
 setStep('calendar');
 }, 1500);
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-white/95 backdrop-blur-xl"
 />

 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-2xl bg-white rounded-none shadow-sm overflow-hidden border border-zinc-200"
 >
 {/* Header Context */}
 <div className="p-8 md:p-12 border-b border-zinc-100 flex justify-between items-start">
 <div className="space-y-2">
 <span className="text-xs font-sans font-bold text-zinc-500 ">DEBRIEFING // QUALIFICAÇÃO</span>
 <h2 className="text-3xl md:text-2xl md:text-3xl font-bold text-black leading-none italic ">
 {step === 'form' ? 'Contexto de Negócio' : step === 'calendar' ? 'Seleção de Agenda' : 'Confirmado'}
 </h2>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors rounded-full">
 <X className="w-6 h-6 text-black" />
 </button>
 </div>

 <div className="p-8 md:p-12">
 <AnimatePresence mode="wait">
 {step === 'form' && (
 <motion.form
 key="form"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 onSubmit={handleFormSubmit}
 className="space-y-8"
 >
 <div className="space-y-6">
 <div className="space-y-4">
 <Label className="text-xs font-bold text-zinc-500">Qual o faturamento mensal aproximado da operação?</Label>
 <Input required placeholder="Ex: R$ 100k - 500k" className="rounded-none border-0 border-b border-zinc-100 px-0 h-14 bg-transparent focus:border-black text-lg font-bold placeholder:text-zinc-200" />
 </div>
 <div className="space-y-4">
 <Label className="text-xs font-bold text-zinc-500">Qual o maior gargalo técnico identificado hoje?</Label>
 <Input required placeholder="Ex: Baixa conversão no tráfego pago" className="rounded-none border-0 border-b border-zinc-100 px-0 h-14 bg-transparent focus:border-black text-lg font-bold placeholder:text-zinc-200" />
 </div>
 <div className="space-y-4">
 <Label className="text-xs font-bold text-zinc-500">Quem é o tomador de decisão que participará da call?</Label>
 <Input required placeholder="Nome e Cargo" className="rounded-none border-0 border-b border-zinc-100 px-0 h-14 bg-transparent focus:border-black text-lg font-bold placeholder:text-zinc-200" />
 </div>
 </div>

 <div className="pt-8">
 <Button
 type="submit"
 disabled={isSubmitting}
 className="w-full h-20 bg-white text-zinc-900 hover:bg-zinc-50 font-bold text-xs transition-all duration-500"
 >
 {isSubmitting ? 'VALIDANDO_CONTEXTO...' : 'LIBERAR AGENDAMENTO'} <ArrowRight className="ml-4 w-5 h-5" />
 </Button>
 </div>
 </motion.form>
 )}

 {step === 'calendar' && (
 <motion.div
 key="calendar"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="space-y-8 text-center"
 >
 <div className="bg-zinc-50 p-8 border border-zinc-100">
 <p className="text-zinc-500 font-medium leading-relaxed mb-8 italic">
 Dados qualificados com sucesso. Agora, escolha o melhor horário para nossa sessão de 30 minutos.
 </p>

 <a
 href="https://cal.com/revhackers/diagnostico"
 target="_blank"
 rel="noopener noreferrer"
 onClick={() => setTimeout(() => setStep('success'), 2000)}
 className="flex items-center justify-center gap-4 w-full h-20 bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-50 transition-all duration-500"
 >
 <Calendar className="w-5 h-5" /> ABRIR CALENDÁRIO OFICIAL
 </a>
 </div>
 <p className="text-xs text-zinc-500 font-bold ">
 * VOCÊ SERÁ REDIRECIONADO PARA O CAL.COM
 </p>
 </motion.div>
 )}

 {step === 'success' && (
 <motion.div
 key="success"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="space-y-12 text-center py-12"
 >
 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
 <ClipboardCheck className="w-10 h-10 text-zinc-900" />
 </div>
 <div className="space-y-4">
 <h3 className="text-2xl md:text-3xl font-bold text-black italic ">Solicitação Enviada</h3>
 <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
 Seu debriefing foi pré-agendado. Verifique seu e-mail para a confirmação final e link da sala.
 </p>
 </div>
 <Button
 onClick={onClose}
 className="px-12 h-16 border-2 border-black bg-transparent text-black hover:bg-white hover:text-zinc-900 font-bold text-xs transition-all"
 >
 FECHAR DIAGNÓSTICO
 </Button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 </div>
 );
};
