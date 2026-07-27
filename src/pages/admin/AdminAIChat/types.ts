export interface Message {
    role: 'user' | 'assistant';
    content: string;
    fileName?: string;
    image_url?: string;
    preview?: string;
    respondingModel?: string;
}

export interface Session {
    id: string;
    agentId: string | null;
    title: string;
    messages: Message[];
    lastMessageAt: Date;
    model?: string;
}

export interface Artifact {
    id: string;
    type: 'code' | 'markdown' | 'document' | 'search';
    title: string;
    content: string;
}

export interface Tone {
    id: string;
    label: string;
    prompt: string;
    predefined: boolean;
}

export interface AdminAIChatProps {
    embed?: boolean;
}

export type ToneModalStep = 'initial' | 'paste' | 'describe' | 'preview';

export interface AgentKnowledge {
    count: number;
    filenames: string[];
}
