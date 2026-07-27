import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/context/AIContext';
import type { Message, Session } from '../types';

export interface UseChatSessionReturn {
    currentSession: Session | null;
    setCurrentSession: React.Dispatch<React.SetStateAction<Session | null>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoadingGlobal: boolean;
    selectedAgentId: string;
    selectedAgentName: string;
    agentKnowledgeCount: number;
    agentKnowledgeFilenames: string[];
    isLoadingKnowledge: boolean;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    sessions: any[];
    refreshAI: () => void;
    handleNewChat: () => void;
    handleSelectSession: (session: Session) => Promise<void>;
}

export function useChatSession(): UseChatSessionReturn {
    const [searchParams] = useSearchParams();
    const { sessions, isLoadingAI: isLoadingGlobal, refreshAI, selectedAgentId, setSelectedAgentId } = useAI();

    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-5.2');
    const [selectedAgentName, setSelectedAgentName] = useState<string>('');
    const [agentKnowledgeCount, setAgentKnowledgeCount] = useState<number>(0);
    const [agentKnowledgeFilenames, setAgentKnowledgeFilenames] = useState<string[]>([]);
    const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);

    const handleNewChat = () => {
        setCurrentSession(null);
        setMessages([]);
    };

    const handleSelectSession = async (session: Session) => {
        setCurrentSession(session);
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('session_id', session.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages((data || []).map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })));
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        }
    };

    useEffect(() => {
        const agentIdFromUrl = searchParams.get('agent') || 'default';
        const sessionIdFromUrl = searchParams.get('session');

        if (agentIdFromUrl !== selectedAgentId) {
            setSelectedAgentId(agentIdFromUrl);
        }

        if (sessionIdFromUrl) {
            const session = sessions.find(s => s.id === sessionIdFromUrl);
            if (session && session.id !== currentSession?.id) {
                handleSelectSession(session);
            }
        } else if (!sessionIdFromUrl && currentSession) {
            handleNewChat();
        }
    }, [searchParams, sessions]);

    useEffect(() => {
        if (currentSession?.model) {
            setSelectedModel(currentSession.model);
        }
    }, [currentSession]);

    useEffect(() => {
        if (!selectedAgentId || selectedAgentId === 'default') {
            setAgentKnowledgeCount(0);
            setAgentKnowledgeFilenames([]);
            setSelectedAgentName('');
            return;
        }

        const fetchAgentData = async () => {
            setIsLoadingKnowledge(true);
            try {
                const { data: agentData } = await supabase
                    .from('agents')
                    .select('model, name')
                    .eq('id', selectedAgentId)
                    .single();

                if (agentData) {
                    if (agentData.model) setSelectedModel(agentData.model);
                    if (agentData.name) setSelectedAgentName(agentData.name);
                }

                const { data } = await supabase.functions.invoke('agent-documents', {
                    body: { action: 'ping', agentId: selectedAgentId }
                });
                if (data?.success) {
                    setAgentKnowledgeCount(data.documentCount || 0);
                    setAgentKnowledgeFilenames(data.filenames || []);
                }
            } catch (err) {
                console.error('[RAG SYNC] Error:', err);
            } finally {
                setIsLoadingKnowledge(false);
            }
        };

        fetchAgentData();
    }, [selectedAgentId]);

    return {
        currentSession,
        setCurrentSession,
        messages,
        setMessages,
        loading,
        setLoading,
        isLoadingGlobal,
        selectedAgentId,
        selectedAgentName,
        agentKnowledgeCount,
        agentKnowledgeFilenames,
        isLoadingKnowledge,
        selectedModel,
        setSelectedModel,
        sessions,
        refreshAI,
        handleNewChat,
        handleSelectSession,
    };
}
