import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ARTIFACT_REGEX } from '../constants';
import type { Artifact, Message, Session, Tone } from '../types';
import { extractTextFromFile, readImageAsBase64 } from './useFileExtraction';

export interface UseChatActionsParams {
    currentSession: Session | null;
    setCurrentSession: (session: Session | null) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    input: string;
    setInput: (input: string) => void;
    setLoading: (loading: boolean) => void;
    loading: boolean;
    isLoadingGlobal: boolean;
    selectedAgentId: string;
    selectedModel: string;
    selectedTone: string;
    tones: Tone[];
    refreshAI: () => void;
    setActiveArtifact: (artifact: Artifact | null) => void;
    setIsArtifactPanelOpen: (open: boolean) => void;
    attachedFile: File | null;
    setAttachedFile: (file: File | null) => void;
    attachedPreview: string | null;
    setAttachedPreview: (preview: string | null) => void;
}

export interface UseChatActionsReturn {
    handleSendMessage: (overrideText?: string) => Promise<void>;
    handleFileSelect: (file: File | undefined) => void;
}

export function useChatActions(params: UseChatActionsParams): UseChatActionsReturn {
    const navigate = useNavigate();

    const handleSendMessage = useCallback(async (overrideText?: string) => {
        const messageText = overrideText || params.input;
        if (!messageText.trim() && !params.attachedFile) return;
        if (params.loading || params.isLoadingGlobal) return;

        toast.dismiss();

        let finalContent = messageText.trim();
        const userMsg: Message = { role: 'user', content: finalContent };

        if (params.attachedFile) {
            try {
                if (params.attachedFile.type.startsWith('image/')) {
                    const base64 = await readImageAsBase64(params.attachedFile);
                    userMsg.image_url = base64;
                    finalContent = `[IMAGEM ANEXADA: ${params.attachedFile.name}]\n\n${finalContent || 'Analise a imagem acima.'}`;
                } else {
                    const fileText = await extractTextFromFile(params.attachedFile);
                    finalContent = `[DOCUMENTO ANEXADO NA CONVERSA: ${params.attachedFile.name}]\n\n${fileText}\n\n-------------------\n\nPERGUNTA DO USUÁRIO: ${finalContent || 'Analise o documento acima.'}`;
                }
            } catch (err) {
                console.error('File extraction error:', err);
                toast.error('Erro ao processar arquivo anexado.');
                return;
            }
        }
        userMsg.content = finalContent;
        userMsg.content = finalContent;

        const displayUserMsg: Message = {
            role: 'user',
            content: messageText.trim(),
            fileName: params.attachedFile?.name,
            preview: params.attachedPreview,
            image_url: userMsg.image_url,
        };

        params.setMessages(prev => [...prev, displayUserMsg]);
        if (!overrideText) params.setInput('');
        params.setAttachedFile(null);
        params.setAttachedPreview(null);
        params.setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            let sessionId = params.currentSession?.id;

            if (!sessionId && user) {
                const { data: newSession, error: sessionError } = await supabase
                    .from('chat_sessions')
                    .insert({
                        user_id: user.id,
                        agent_id: params.selectedAgentId === 'default' ? null : params.selectedAgentId,
                        title: userMsg.content.slice(0, 50) + (userMsg.content.length > 50 ? '...' : ''),
                    })
                    .select()
                    .single();

                if (sessionError) throw sessionError;
                sessionId = newSession.id;
                params.setCurrentSession({
                    id: newSession.id,
                    agentId: params.selectedAgentId,
                    title: newSession.title,
                    messages: [],
                    lastMessageAt: new Date(),
                });
                params.refreshAI();
                navigate(`/admin/ai-chat?agent=${params.selectedAgentId || 'default'}&session=${sessionId}`, { replace: true });
            }

            if (sessionId) {
                await supabase.from('chat_messages').insert({
                    session_id: sessionId,
                    role: 'user',
                    content: userMsg.content,
                });
            }

            const { data: chatData, error: chatError } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agentId: params.selectedAgentId || 'default',
                    messages: [...params.messages, userMsg],
                    sessionId: sessionId,
                    model: params.selectedModel,
                    tone: params.tones.find(t => t.id === params.selectedTone)?.prompt || '',
                }
            });

            if (chatError) throw chatError;

            if (!chatData?.success) {
                console.error('[CHAT ERROR]', chatData?.error);
                throw new Error(chatData?.error || 'Erro desconhecido do servidor.');
            }

            const botMsg: Message = {
                role: 'assistant',
                content: chatData.response,
                respondingModel: chatData.respondingModel,
            };
            params.setMessages(prev => [...prev, botMsg]);

            const match = (chatData.response || '').match(ARTIFACT_REGEX);
            if (match) {
                const [_, type, title, content] = match;
                const newArtifact: Artifact = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: type as any,
                    title: title.trim(),
                    content: content.trim(),
                };
                params.setActiveArtifact(newArtifact);
                params.setIsArtifactPanelOpen(true);
            }

            if (sessionId) {
                await supabase.from('chat_messages').insert({
                    session_id: sessionId,
                    role: 'assistant',
                    content: botMsg.content,
                });
            }
            params.refreshAI();
        } catch (error: any) {
            console.error('Error in chat workflow:', error);

            let errorMessage = 'Desculpe, ocorreu um erro na comunicação.';

            try {
                if (error.context && typeof error.context.json === 'function') {
                    const body = await error.context.json();
                    if (body.error) errorMessage = body.error;
                } else if (error.message && error.message.includes('non-2xx')) {
                    errorMessage = 'O servidor da IA (Edge Function) retornou um erro inesperado. Verifique se as chaves API estão corretas e se a função foi deployada.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
            } catch (e) {
                console.error('Failed to extract error details:', e);
                errorMessage = error.message || 'Erro na Edge Function.';
            }

            params.setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Erro Detalhado:** ${errorMessage}` }]);
            toast.error('Falha na Conexão', {
                description: errorMessage,
            });
        } finally {
            params.setLoading(false);
        }
    }, [params, navigate]);

    const handleFileSelect = useCallback((file: File | undefined) => {
        if (!file) {
            params.setAttachedFile(null);
            params.setAttachedPreview(null);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Máximo 10MB.');
            return;
        }
        params.setAttachedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => params.setAttachedPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            params.setAttachedPreview(null);
        }
    }, [params]);

    return { handleSendMessage, handleFileSelect };
}
