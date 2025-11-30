import React from 'react';
import type { Message } from "./ChatBotTypes";

const MessageBubble: React.FC<Message> = (message) => {
    const isUser = message.sender === 'user';

    const bubbleClasses = isUser ? 'bg-blue-600 text-white rounded-br-none ml-auto' : 'bg-gray-100 text-gray-800 rounded-tl-none mr-auto'

    return (
        <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-sm transition-all duration-300 ${bubbleClasses}`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
        </div>
    );
};

export default MessageBubble;