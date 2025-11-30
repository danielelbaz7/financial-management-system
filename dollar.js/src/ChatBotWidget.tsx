import React, { type ButtonHTMLAttributes, useState } from 'react';
import ChatbotContainer from './ChatBotContainer';

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="mb-4">
                    <ChatbotContainer />
                </div>
            )}

            <button
                onClick={toggleChat}
                className={`
                    flex items-center justify-center
                    w-14 h-14 rounded-full shadow-lg transition-all
                    duration-300
                    text-white
                    ${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                `}
                aria-label={isOpen ? "Close Chatbot" : "Open Financial Chatbot"}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default ChatbotWidget;