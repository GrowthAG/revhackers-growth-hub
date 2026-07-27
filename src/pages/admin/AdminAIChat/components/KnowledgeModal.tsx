import { X, BrainCircuit, Loader2, FileText, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface KnowledgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    filenames: string[];
}

export function KnowledgeModal({ isOpen, onClose, isLoading, filenames }: KnowledgeModalProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl shadow-sm border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#00CC6A]/10">
                            <BrainCircuit className="w-5 h-5 text-[#00CC6A]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900">Base de Conhecimento</h3>
                            <p className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Documentos indexados para este agente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-8 h-8 text-zinc-200 animate-spin" />
                            <p className="text-sm text-zinc-400 font-medium italic">Sincronizando com o Cérebro...</p>
                        </div>
                    ) : filenames.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {filenames.map((name, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-white shadow-sm border border-zinc-100 hover:border-[#00CC6A]/20 transition-all group">
                                    <div className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-[#00CC6A] transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-mini font-bold text-zinc-700 truncate">{name}</p>
                                        <p className="text-xxs text-zinc-400 uppercase tracking-widest mt-0.5">Disponível em Tempo Real</p>
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        <div className="px-2 py-1 bg-[#00CC6A]/10 text-2xs font-semibold text-[#00CC6A] uppercase border border-[#00CC6A]/20">Indexado</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Bot className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                            <h4 className="text-sm font-bold text-zinc-400 italic">Este agente ainda não possui documentos configurados.</h4>
                            <p className="text-tiny text-zinc-400 max-w-xs mx-auto mt-2">
                                Adicione arquivos na base de conhecimento ou vincule este agente a uma livraria para habilitar o RAG.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white shadow-sm border-t border-zinc-100 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/knowledge')}
                        className="text-tiny font-semibold uppercase tracking-widest border-zinc-200 bg-white hover:bg-black hover:text-white transition-all h-10 px-6"
                    >
                        Gerenciar Conhecimento
                    </Button>
                </div>
            </div>
        </div>
    );
}
