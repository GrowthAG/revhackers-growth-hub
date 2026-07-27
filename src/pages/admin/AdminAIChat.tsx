// Re-export from the new modular structure to preserve import paths.
// The component has been split into:
//   - ./AdminAIChat/index.tsx          (entry point)
//   - ./AdminAIChat/types.ts           (TypeScript interfaces)
//   - ./AdminAIChat/constants.ts       (MODELS, DEFAULT_TONES, regexes)
//   - ./AdminAIChat/ModelIcon.tsx      (SVG icon)
//   - ./AdminAIChat/hooks/             (useChatSession, useTones, useChatActions, useFileExtraction)
//   - ./AdminAIChat/components/        (ChatHeader, ChatMessages, ChatInput, ArtifactPanel, KnowledgeModal, ToneModal)
export { default } from './AdminAIChat/index';
export type { AdminAIChatProps } from './AdminAIChat/types';
