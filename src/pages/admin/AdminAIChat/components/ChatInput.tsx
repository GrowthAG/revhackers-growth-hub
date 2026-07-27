import { useRef } from 'react';
import { Plus, X, FileText, Feather, Trash2, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Tone } from '../types';

interface ChatInputProps {
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: () => void;
    loading: boolean;
    attachedFile: File | null;
    attachedPreview: string | null;
    onFileChange: (file: File | undefined) => void;
    onClearAttachment: () => void;
    tones: Tone[];
    selectedTone: string;
    onSelectTone: (id: string) => void;
    isStyleMenuOpen: boolean;
    onToggleStyleMenu: () => void;
    onCreateTone: () => void;
    onEditTone: (tone: Tone, e: React.MouseEvent) => void;
    onDeleteTone: (id: string, e: React.MouseEvent) => void;
}

export function ChatInput({
    input,
    onInputChange,
    onSubmit,
    loading,
    attachedFile,
    attachedPreview,
    onFileChange,
    onClearAttachment,
    tones,
    selectedTone,
    onSelectTone,
    isStyleMenuOpen,
    onToggleStyleMenu,
    onCreateTone,
    onEditTone,
    onDeleteTone,
}: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="p-6 bg-white/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto mb-4">
                {attachedFile && (
                    <div className="flex items-center gap-3 p-2 bg-white shadow-sm border border-zinc-200 w-fit animate-in fade-in slide-in-from-bottom-2">
                        {attachedPreview ? (
                            <img src={attachedPreview} className="w-10 h-10 object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-zinc-200 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-zinc-500" />
                            </div>
                        )}
                        <div className="flex flex-col pr-4">
                            <span className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">
                                {attachedFile.name}
                            </span>
                            <span className="text-xxs text-zinc-400 font-medium uppercase tracking-widest">
                                Pendente
                            </span>
                        </div>
                        <button
                            onClick={onClearAttachment}
                            className="p-1 hover:bg-zinc-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                )}
            </div>

            <div className="max-w-3xl mx-auto relative flex items-end gap-2 p-2 bg-white border border-black transition-all">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        onFileChange(file);
                    }}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-zinc-400 hover:text-black hover:bg-white shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Plus className="w-4 h-4" />
                </Button>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleStyleMenu}
                        className={cn(
                            "h-10 w-10 transition-all",
                            selectedTone !== 'normal'
                                ? "text-[#00CC6A] bg-[#00CC6A]/10 shadow-sm"
                                : "text-zinc-400 hover:text-black hover:bg-white shadow-sm"
                        )}
                    >
                        <Feather className="w-4 h-4" />
                    </Button>

                    {isStyleMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={onToggleStyleMenu} />
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white shadow-sm border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                                <div className="px-3 py-2 border-b border-zinc-50 mb-1 flex justify-between items-center">
                                    <span className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Estilos de Resposta</span>
                                    <button
                                        onClick={onCreateTone}
                                        className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {tones.map((tone) => (
                                        <div
                                            key={tone.id}
                                            onClick={() => {
                                                onSelectTone(tone.id);
                                                toast.success(`Estilo: ${tone.label}`);
                                            }}
                                            className={cn(
                                                "group w-full flex items-center justify-between p-2.5 transition-all mb-0.5 cursor-pointer",
                                                selectedTone === tone.id
                                                    ? "bg-black text-white font-bold"
                                                    : "hover:bg-white shadow-sm text-zinc-600"
                                            )}
                                        >
                                            <span className="text-xs truncate">{tone.label}</span>
                                            <div className="flex items-center gap-1">
                                                {!tone.predefined && (
                                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => onEditTone(tone, e)}
                                                            className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-black"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => onDeleteTone(tone.id, e)}
                                                            className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedTone === tone.id && <div className="w-1.5 h-1.5 bg-[#00CC6A] ml-1" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <textarea
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSubmit();
                        }
                    }}
                    placeholder="Comando ou Pergunta..."
                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-0 shadow-none resize-none max-h-32 min-h-[40px] py-2 text-body placeholder:text-zinc-400 font-medium"
                    rows={1}
                />

                <Button
                    onClick={onSubmit}
                    disabled={(!input.trim() && !attachedFile) || loading}
                    className={cn(
                        "h-11 px-8 uppercase text-xs font-medium tracking-widest transition-all",
                        (input.trim() || attachedFile)
                            ? "bg-black text-white hover:bg-zinc-800 shadow-sm"
                            : "bg-white text-zinc-400 cursor-not-allowed border border-black"
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : "Enviar"}
                </Button>
            </div>
        </div>
    );
}
