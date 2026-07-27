import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import type { Artifact, AdminAIChatProps } from './types';
import { useChatSession } from './hooks/useChatSession';
import { useTones } from './hooks/useTones';
import { useChatActions } from './hooks/useChatActions';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { ArtifactPanel } from './components/ArtifactPanel';
import { KnowledgeModal } from './components/KnowledgeModal';
import { ToneModal } from './components/ToneModal';

const AdminAIChat = ({ embed = false }: AdminAIChatProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const session = useChatSession();
    const tones = useTones();

    // Local UI state for the composer
    const [input, setInput] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedPreview, setAttachedPreview] = useState<string | null>(null);

    // Artifact panel state
    const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
    const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);

    // Header/model menu state
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

    // Knowledge modal state
    const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

    const { handleSendMessage, handleFileSelect } = useChatActions({
        currentSession: session.currentSession,
        setCurrentSession: session.setCurrentSession,
        messages: session.messages,
        setMessages: session.setMessages,
        input,
        setInput: (v: string) => setInput(v),
        setLoading: session.setLoading,
        loading: session.loading,
        isLoadingGlobal: session.isLoadingGlobal,
        selectedAgentId: session.selectedAgentId,
        selectedModel: session.selectedModel,
        selectedTone: tones.selectedTone,
        tones: tones.tones,
        refreshAI: session.refreshAI,
        setActiveArtifact,
        setIsArtifactPanelOpen,
        attachedFile,
        setAttachedFile: (f: File | null) => setAttachedFile(f),
        attachedPreview,
        setAttachedPreview: (p: string | null) => setAttachedPreview(p),
    });

    // Handle initial query from Hub
    useEffect(() => {
        const query = searchParams.get('q');
        if (query && session.messages.length === 0 && !session.loading && !session.isLoadingGlobal) {
            handleSendMessage(query);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('q');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, session.messages.length, session.loading, session.isLoadingGlobal]);

    const ChatContent = (
        <div className={cn(
            "flex overflow-hidden bg-white",
            embed ? "h-full" : "h-[calc(100vh-64px)]"
        )}>
            {/* Chat Section */}
            <div className={cn(
                "flex flex-col flex-1 min-w-0 transition-all duration-500",
                isArtifactPanelOpen ? "lg:flex-[0.5] border-r border-zinc-100" : "flex-1"
            )}>
                <ChatHeader
                    embed={embed}
                    selectedModel={session.selectedModel}
                    onSelectModel={session.setSelectedModel}
                    selectedAgentName={session.selectedAgentName}
                    agentKnowledgeCount={session.agentKnowledgeCount}
                    onOpenKnowledgeModal={() => setIsKnowledgeModalOpen(true)}
                    isModelMenuOpen={isModelMenuOpen}
                    onToggleModelMenu={() => setIsModelMenuOpen(o => !o)}
                    onNewChat={session.handleNewChat}
                />

                <ChatMessages messages={session.messages} />

                <ChatInput
                    input={input}
                    onInputChange={setInput}
                    onSubmit={() => handleSendMessage()}
                    loading={session.loading}
                    attachedFile={attachedFile}
                    attachedPreview={attachedPreview}
                    onFileChange={handleFileSelect}
                    onClearAttachment={() => {
                        setAttachedFile(null);
                        setAttachedPreview(null);
                    }}
                    tones={tones.tones}
                    selectedTone={tones.selectedTone}
                    onSelectTone={tones.setSelectedTone}
                    isStyleMenuOpen={tones.isStyleMenuOpen}
                    onToggleStyleMenu={() => tones.setIsStyleMenuOpen(o => !o)}
                    onCreateTone={tones.openToneModal}
                    onEditTone={tones.handleEditTone}
                    onDeleteTone={tones.handleDeleteTone}
                />
            </div>

            {/* Artifact Side Panel */}
            {isArtifactPanelOpen && (
                <ArtifactPanel
                    artifact={activeArtifact}
                    onClose={() => setIsArtifactPanelOpen(false)}
                />
            )}

            {/* Knowledge Discovery Modal */}
            <KnowledgeModal
                isOpen={isKnowledgeModalOpen}
                onClose={() => setIsKnowledgeModalOpen(false)}
                isLoading={session.isLoadingKnowledge}
                filenames={session.agentKnowledgeFilenames}
            />

            {/* Tone creation Modal */}
            <ToneModal
                isOpen={tones.isToneModalOpen}
                onClose={tones.closeToneModal}
                step={tones.toneModalStep}
                setStep={tones.setToneModalStep}
                newToneName={tones.newToneName}
                setNewToneName={tones.setNewToneName}
                newToneTranscript={tones.newToneTranscript}
                setNewToneTranscript={tones.setNewToneTranscript}
                generatedPrompt={tones.generatedPrompt}
                setGeneratedPrompt={tones.setGeneratedPrompt}
                isAnalyzing={tones.isAnalyzing}
                onAnalyze={() => tones.handleAnalyzeTone(supabase)}
                onSave={tones.handleSaveTone}
            />
        </div>
    );

    if (embed) {
        return ChatContent;
    }

    return (
        <AdminLayout>
            {ChatContent}
        </AdminLayout>
    );
};

export default AdminAIChat;
