import { Loader2, X, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToneModalStep } from '../types';

interface ToneModalProps {
    isOpen: boolean;
    onClose: () => void;
    step: ToneModalStep;
    setStep: (step: ToneModalStep) => void;
    newToneName: string;
    setNewToneName: (name: string) => void;
    newToneTranscript: string;
    setNewToneTranscript: (transcript: string) => void;
    generatedPrompt: string;
    setGeneratedPrompt: (prompt: string) => void;
    isAnalyzing: boolean;
    onAnalyze: () => void;
    onSave: () => void;
}

export function ToneModal({
    isOpen,
    onClose,
    step,
    setStep,
    newToneName,
    setNewToneName,
    newToneTranscript,
    setNewToneTranscript,
    generatedPrompt,
    setGeneratedPrompt,
    isAnalyzing,
    onAnalyze,
    onSave,
}: ToneModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg shadow-sm border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white shadow-sm/50">
                    <h3 className="text-tiny font-semibold text-black uppercase tracking-[0.2em]">Calibration Hub</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 'initial' && (
                        <div className="space-y-3">
                            <p className="text-sm text-zinc-500 mb-6">Selecione o método de calibração do seu tom de voz.</p>
                            <button
                                onClick={() => setStep('paste')}
                                className="w-full flex items-center justify-between p-5 border border-zinc-100 hover:border-black hover:bg-white shadow-sm transition-all text-left group"
                            >
                                <div className="flex-1">
                                    <h4 className="text-mini font-semibold text-black uppercase tracking-widest leading-none mb-1">Engenharia de Estilo</h4>
                                    <p className="text-xxs text-zinc-400 font-bold uppercase tracking-wider">Analise sua escrita original</p>
                                </div>
                                <div className="w-1.5 h-1.5 bg-zinc-200 group-hover:bg-black transition-colors" />
                            </button>
                            <button
                                onClick={() => {
                                    setStep('describe');
                                    setGeneratedPrompt('');
                                }}
                                className="w-full flex items-center justify-between p-5 border border-zinc-100 hover:border-black hover:bg-white shadow-sm transition-all text-left group"
                            >
                                <div className="flex-1">
                                    <h4 className="text-mini font-semibold text-black uppercase tracking-widest leading-none mb-1">Configuração Manual</h4>
                                    <p className="text-xxs text-zinc-400 font-bold uppercase tracking-wider">Defina diretrizes de comportamento</p>
                                </div>
                                <div className="w-1.5 h-1.5 bg-zinc-200 group-hover:bg-black transition-colors" />
                            </button>
                        </div>
                    )}

                    {step === 'paste' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Exemplo de Texto</label>
                            <textarea
                                className="w-full h-40 p-4 bg-white shadow-sm border-none outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Cole aqui um e-mail, artigo ou mensagem que represente o tom desejado..."
                                value={newToneTranscript}
                                onChange={(e) => setNewToneTranscript(e.target.value)}
                            />
                            <Button
                                className="w-full h-12 bg-black text-white font-bold mt-4 hover:bg-zinc-800 transition-all font-semibold uppercase tracking-widest text-tiny"
                                disabled={!newToneTranscript || isAnalyzing}
                                onClick={onAnalyze}
                            >
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : 'Analisar Estilo'}
                            </Button>
                        </div>
                    )}

                    {step === 'describe' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nome do Estilo</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-white shadow-sm border-none outline-none focus:ring-2 focus:ring-black text-sm"
                                placeholder="Ex: Consultivo, Amigável, etc."
                                value={newToneName}
                                onChange={(e) => setNewToneName(e.target.value)}
                            />
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mt-4">Diretrizes</label>
                            <textarea
                                className="w-full h-32 p-4 bg-white shadow-sm border-none outline-none focus:ring-2 focus:ring-black text-sm"
                                placeholder="Descreva como a IA deve se comportar..."
                                value={generatedPrompt}
                                onChange={(e) => setGeneratedPrompt(e.target.value)}
                            />
                            <Button
                                className="w-full h-12 bg-black text-white font-bold mt-4"
                                disabled={!newToneName || !generatedPrompt}
                                onClick={onSave}
                            >
                                SALVAR ESTILO
                            </Button>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center text-[#00CC6A] mx-auto mb-4">
                                <Cpu className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-900">Estilo Analisado!</h4>
                            <p className="text-sm text-zinc-500">Capturamos a essência do seu tom. Dê um nome a ele para salvar:</p>
                            <input
                                type="text"
                                className="w-full p-4 bg-white shadow-sm border-none outline-none focus:ring-2 focus:ring-[#00CC6A] text-sm mt-4"
                                placeholder="Ex: Meu Tom Profissional"
                                value={newToneName}
                                onChange={(e) => setNewToneName(e.target.value)}
                            />
                            <div className="p-4 bg-white shadow-sm text-tiny text-zinc-400 text-left mt-4 border border-zinc-100 max-h-32 overflow-y-auto italic">
                                {generatedPrompt}
                            </div>
                            <Button
                                className="w-full h-12 bg-black text-white font-semibold uppercase tracking-widest text-tiny mt-6"
                                disabled={!newToneName}
                                onClick={onSave}
                            >
                                Salvar e Aplicar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
