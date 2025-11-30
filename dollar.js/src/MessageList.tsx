import React, { useRef, useEffect } from 'react';
import type { MessageListProps } from "./ChatBotTypes"
import MessageBubble from "./MessageBubble";

const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, loading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} {...msg} />
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-xl rounded-tl-none text-sm">
                        <span className="animate-pulse">... AI is thinking</span>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;