import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Tone, ToneModalStep } from '../types';
import { DEFAULT_TONES, TONE_STORAGE_KEY } from '../constants';

export interface UseTonesReturn {
    tones: Tone[];
    selectedTone: string;
    isStyleMenuOpen: boolean;
    isToneModalOpen: boolean;
    toneModalStep: ToneModalStep;
    newToneName: string;
    newToneTranscript: string;
    generatedPrompt: string;
    isAnalyzing: boolean;
    editingToneId: string | null;
    setSelectedTone: (id: string) => void;
    setIsStyleMenuOpen: (open: boolean) => void;
    openToneModal: () => void;
    closeToneModal: () => void;
    setNewToneName: (name: string) => void;
    setNewToneTranscript: (transcript: string) => void;
    setGeneratedPrompt: (prompt: string) => void;
    setToneModalStep: (step: ToneModalStep) => void;
    handleAnalyzeTone: (supabase: any) => Promise<void>;
    handleSaveTone: () => void;
    handleDeleteTone: (id: string, e: React.MouseEvent) => void;
    handleEditTone: (tone: Tone, e: React.MouseEvent) => void;
}

export function useTones(): UseTonesReturn {
    const [tones, setTones] = useState<Tone[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_TONES;
        const saved = localStorage.getItem(TONE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_TONES;
    });
    const [selectedTone, setSelectedTone] = useState<string>('normal');
    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
    const [isToneModalOpen, setIsToneModalOpen] = useState(false);
    const [toneModalStep, setToneModalStep] = useState<ToneModalStep>('initial');
    const [newToneName, setNewToneName] = useState('');
    const [newToneTranscript, setNewToneTranscript] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [editingToneId, setEditingToneId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TONE_STORAGE_KEY, JSON.stringify(tones));
    }, [tones]);

    const resetToneModal = () => {
        setToneModalStep('initial');
        setNewToneName('');
        setNewToneTranscript('');
        setGeneratedPrompt('');
        setEditingToneId(null);
    };

    const openToneModal = () => {
        setIsToneModalOpen(true);
        setToneModalStep('initial');
        setIsStyleMenuOpen(false);
    };

    const closeToneModal = () => {
        setIsToneModalOpen(false);
        resetToneModal();
    };

    const handleAnalyzeTone = async (supabase: any) => {
        if (!newToneTranscript.trim()) return;
        setIsAnalyzing(true);
        try {
            const { data } = await supabase.functions.invoke('agent-chat', {
                body: {
                    raw_mode: true,
                    model: 'gpt-4o-mini',
                    messages: [{
                        role: 'user',
                        content: `Aja como um linguista especialista. Analise o texto abaixo e extraia as principais diretrizes de TOM DE VOZ, PERSONALIDADE e ESTILO DE ESCRITA. Transforme isso em uma instrução de sistema curta (máximo 300 caracteres) que comece com "Aja como...".\n\nTEXTO:\n"${newToneTranscript}"`
                    }]
                }
            });
            if (data?.success) {
                setGeneratedPrompt(data.response);
                setToneModalStep('preview');
            } else {
                toast.error(data?.error || 'Erro ao analisar tom.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao analisar tom.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveTone = () => {
        if (!newToneName || !generatedPrompt) return;

        if (editingToneId) {
            setTones(tones.map(t =>
                t.id === editingToneId
                    ? { ...t, label: newToneName, prompt: generatedPrompt }
                    : t
            ));
            setEditingToneId(null);
            toast.success('Estilo atualizado!');
        } else {
            const newTone: Tone = {
                id: `custom-${Date.now()}`,
                label: newToneName,
                prompt: generatedPrompt,
                predefined: false,
            };
            setTones([...tones, newTone]);
            setSelectedTone(newTone.id);
            toast.success('Estilo criado!');
        }

        setIsToneModalOpen(false);
        resetToneModal();
        setIsStyleMenuOpen(false);
    };

    const handleDeleteTone = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTones(tones.filter(t => t.id !== id));
        if (selectedTone === id) setSelectedTone('normal');
        toast.success('Estilo removido!');
    };

    const handleEditTone = (tone: Tone, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingToneId(tone.id);
        setNewToneName(tone.label);
        setGeneratedPrompt(tone.prompt);
        setToneModalStep('describe');
        setIsToneModalOpen(true);
        setIsStyleMenuOpen(false);
    };

    return {
        tones,
        selectedTone,
        isStyleMenuOpen,
        isToneModalOpen,
        toneModalStep,
        newToneName,
        newToneTranscript,
        generatedPrompt,
        isAnalyzing,
        editingToneId,
        setSelectedTone,
        setIsStyleMenuOpen,
        openToneModal,
        closeToneModal,
        setNewToneName,
        setNewToneTranscript,
        setGeneratedPrompt,
        setToneModalStep,
        handleAnalyzeTone,
        handleSaveTone,
        handleDeleteTone,
        handleEditTone,
    };
}
