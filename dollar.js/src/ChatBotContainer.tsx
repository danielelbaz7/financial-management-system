import React, { useState, useCallback } from 'react';
import type { Message } from "./ChatBotTypes";
import MessageList from './MessageList';
import UserInput from './ChatBotUserInput';

const ChatbotContainer: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSendMessage = useCallback(async (input: string) => {
        if(!input.trim() || loading) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setLoading(true);

        try {
            //Implement AI backend call
            throw new Error("Placeholder Error");
        } catch (error) {
            console.error("API error: ", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                timestamp: Date.now() + 1,
                content: "Sorry, an error occured. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }, [messages, loading]);

    return (
        <div className="flex flex-col h-[550px] w-full max-w-lg mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
            <header className="p-3 bg-blue-600 text-white font-bold text-lg text-center shadow-md">
                AI Finance Assistant
            </header>

            <MessageList messages={messages} loading={loading} />

            <UserInput
                onSend={handleSendMessage}
                disabled={loading}
            />
        </div>
    );
};

export default ChatbotContainer;