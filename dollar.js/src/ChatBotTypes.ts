export type Sender = 'user' | 'bot';

export interface Message {
    id: string;
    sender: Sender;
    content: string;
    timestamp: number;
}

export interface UserInputProps {
    onSend: (message: string) => void;
    disabled: boolean;
}

export interface MessageListProps {
    messages: Message[];
    loading: boolean;
}