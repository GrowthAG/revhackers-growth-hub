import type { Tone } from './types';

export interface ModelOption {
    value: string;
    label: string;
    description: string;
    color: string;
    provider: string;
}

export const MODELS: ModelOption[] = [
    { value: 'gpt-5.4', label: 'GPT-5.4 (Web + O3 Reasoning)', description: 'OpenAI • Raciocínio Máximo', color: '#10a37f', provider: 'OpenAI' },
    { value: 'gpt-5.2', label: 'GPT-5.2 (Consultor)', description: 'OpenAI • Especialista B2B', color: '#10a37f', provider: 'OpenAI' },
    { value: 'gpt-4o', label: 'GPT-4o (Padrão)', description: 'OpenAI • Precisão/Custo', color: '#10a37f', provider: 'OpenAI' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'OpenAI • Processamento Veloz', color: '#10a37f', provider: 'OpenAI' },
];

export const DEFAULT_TONES: Tone[] = [
    { id: 'normal', label: 'Normal', prompt: 'Responda normalmente.', predefined: true },
    { id: 'conciso', label: 'Conciso', prompt: 'Seja extremamente conciso e direto. Evite floreios.', predefined: true },
    { id: 'explicativo', label: 'Explicativo', prompt: 'Explique detalhadamente, como se estivesse ensinando.', predefined: true },
    { id: 'formal', label: 'Formal', prompt: 'Use um tom formal e corporativo.', predefined: true },
];

export const ARTIFACT_REGEX = /\[ARTIFACT:(code|markdown|document|search):([^\]]+)\]([\s\S]*?)\[\/ARTIFACT\]/i;

export const TONE_STORAGE_KEY = 'revhackers_custom_tones';
