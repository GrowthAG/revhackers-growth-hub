import { useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARTIFACT_REGEX } from '../constants';
import type { Message } from '../types';
import { ModelIcon } from '../ModelIcon';
import { MODELS } from '../constants';

interface ChatMessagesProps {
    messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatMessageContent = (content: string): string => {
        return (content || '').replace(ARTIFACT_REGEX, (match) => {
            const titleMatch = match.match(/\[ARTIFACT:(?:[^:]+):([^\]]+)\]/i);
            const title = titleMatch ? titleMatch[1] : 'Documento';
            return `\n\n> [!TIP]\n> **${title}** gerado. Veja no painel lateral.\n\n`;
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth space-y-12 bg-white">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-1000">
                    <h2 className="text-4xl font-semibold text-black mb-2 tracking-ultratight uppercase">Como podemos agir hoje?</h2>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-[0.3em]">Selecione um agente ou inicie uma nova inteligência</p>
                </div>
            ) : (
                messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex w-full gap-4 max-w-3xl mx-auto",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex flex-col gap-1 text-body leading-relaxed max-w-[85%]",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "relative px-0 py-2",
                                msg.role === 'user'
                                    ? "bg-transparent text-black font-bold text-right"
                                    : "bg-transparent text-black"
                            )}>
                                {msg.fileName && (
                                    <div className="flex items-center gap-2 mb-2 p-1.5 bg-black/5 border border-black/5 w-fit">
                                        <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                        <span className="text-tiny font-bold text-zinc-700 truncate max-w-[200px]">
                                            {msg.fileName}
                                        </span>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">
                                    {formatMessageContent(msg.content)}
                                </div>

                                {msg.role === 'assistant' && msg.respondingModel && (
                                    <div className="mt-3 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="p-1 bg-white shadow-sm border border-zinc-100">
                                            <ModelIcon
                                                provider={
                                                    MODELS.find(m =>
                                                        m.value === msg.respondingModel ||
                                                        m.value.includes(msg.respondingModel!)
                                                    )?.provider || 'Bot'
                                                }
                                                className="w-2.5 h-2.5"
                                            />
                                        </div>
                                        <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-widest leading-none">
                                            Verified Engine: {msg.respondingModel}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div ref={endRef} />
        </div>
    );
}
