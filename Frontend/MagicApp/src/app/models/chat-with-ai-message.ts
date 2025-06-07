export interface ChatWithAiMessage {
    userId: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}