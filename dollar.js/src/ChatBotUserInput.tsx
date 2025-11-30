import React, { useState, type FormEvent } from 'react';
import type { UserInputProps } from './ChatBotTypes';

const UserInput: React.FC<UserInputProps> = ({ onSend, disabled }) => {
    const [input, setInput] = useState<string>('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if(trimmedInput && !disabled) {
            onSend(trimmedInput);
            setInput('');
        }
    };

    return (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={disabled ? "AI is responding..." : "Ask me about your finances..."} 
                    disabled={disabled} 
                    className={`
                        flex-grow p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white border-gray-300'}
                    `} 
                />
                <button 
                    type="submit" 
                    disabled={disabled || !input.trim()} 
                    className={`
                        px-5 py-3 text-white font-semibold rounded-lg transition-opacity duration-150
                        ${disabled || !input.trim()
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                        }
                    `} 
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default UserInput;