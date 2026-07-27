import { Plus, ChevronDown, Feather, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModelIcon } from '../ModelIcon';
import { MODELS } from '../constants';
import type { ModelOption } from '../constants';

interface ChatHeaderProps {
    embed?: boolean;
    selectedModel: string;
    onSelectModel: (modelValue: string) => void;
    selectedAgentName: string;
    agentKnowledgeCount: number;
    onOpenKnowledgeModal: () => void;
    isModelMenuOpen: boolean;
    onToggleModelMenu: () => void;
    onNewChat: () => void;
}

export function ChatHeader({
    embed,
    selectedModel,
    onSelectModel,
    selectedAgentName,
    agentKnowledgeCount,
    onOpenKnowledgeModal,
    isModelMenuOpen,
    onToggleModelMenu,
    onNewChat,
}: ChatHeaderProps) {
    const currentModel: ModelOption | undefined = MODELS.find(m => m.value === selectedModel);

    return (
        <div className="h-24 border-b border-zinc-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
            {!embed && (
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-black flex items-center justify-center text-white shadow-sm">
                        <Feather className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-black tracking-tight uppercase leading-none mb-1.5 flex items-center gap-3">
                            {selectedAgentName || 'RevhackersAI'}
                            <span className="flex w-1.5 h-1.5 bg-[#00CC6A]" />
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-white shadow-sm border border-zinc-100 px-2 py-0.5">
                                <div className="w-2.5 h-2.5 flex items-center justify-center">
                                    <ModelIcon
                                        provider={currentModel?.provider || ''}
                                        className="w-2.5 h-2.5"
                                    />
                                </div>
                                <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest leading-none">
                                    {currentModel?.label} • {currentModel?.provider} ENGINE
                                </span>
                            </div>

                            {agentKnowledgeCount > 0 ? (
                                <button
                                    onClick={onOpenKnowledgeModal}
                                    className="group flex items-center gap-1.5 bg-[#00CC6A]/10 text-[#00CC6A] px-2 py-0.5 border border-[#00CC6A]/20 font-bold hover:bg-[#00CC6A]/20 transition-all text-2xs uppercase tracking-widest"
                                >
                                    <BrainCircuit className="w-2.5 h-2.5" />
                                    {agentKnowledgeCount} DATASET
                                </button>
                            ) : (
                                <span className="text-2xs font-bold text-zinc-300 uppercase tracking-widest">
                                    Zero Data Injection
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                    <Button
                        variant="ghost"
                        onClick={onToggleModelMenu}
                        className="h-9 px-3 gap-2 bg-white shadow-sm border border-zinc-200 hover:bg-zinc-100 transition-all"
                    >
                        <ModelIcon
                            provider={currentModel?.provider || ''}
                            className="w-4 h-4"
                        />
                        <span className="text-xs font-bold text-zinc-700">{currentModel?.label}</span>
                        <ChevronDown
                            className={cn(
                                "w-3.5 h-3.5 text-zinc-400 transition-transform",
                                isModelMenuOpen && "rotate-180"
                            )}
                        />
                    </Button>

                    {isModelMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={onToggleModelMenu} />
                            <div className="absolute right-0 mt-2 w-72 bg-white shadow-sm border border-zinc-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="px-3 py-2 border-b border-zinc-50 mb-1">
                                    <span className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Modelos Disponíveis</span>
                                </div>
                                {MODELS.map((model) => (
                                    <button
                                        key={model.value}
                                        onClick={() => onSelectModel(model.value)}
                                        className={cn(
                                            "w-full flex items-start gap-3 p-3 transition-all mb-1",
                                            selectedModel === model.value
                                                ? "bg-white shadow-sm"
                                                : "hover:bg-white shadow-sm/50"
                                        )}
                                    >
                                        <div className="mt-0.5 p-1.5 bg-white border border-zinc-100 shadow-sm">
                                            <ModelIcon
                                                provider={model.provider}
                                                className="w-4 h-4"
                                                color={model.color}
                                            />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-xs font-bold text-zinc-900 leading-none mb-1">
                                                {model.label}
                                            </span>
                                            <span className="text-xxs font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis w-full text-left">
                                                {model.description}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <Button
                    onClick={onNewChat}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-zinc-100 text-zinc-500"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
