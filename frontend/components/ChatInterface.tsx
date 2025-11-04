'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store/chatStore';
import ChatMessage from './ChatMessage';
import { chatApi } from '@/lib/api';

interface ChatInterfaceProps {
  onYearDetected?: (year: number) => void;
}

export default function ChatInterface({ onYearDetected }: ChatInterfaceProps = {}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, error, addMessage, setLoading, setError } = useChatStore();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });
    
    setLoading(true);
    
    try {
      const response = await chatApi.sendMessage(userMessage);
      
      // Check for timeline year marker in response
      const yearMatch = response.answer.match(/\[TIMELINE_YEAR:(\d{4})\]/);
      let cleanAnswer = response.answer;
      
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        cleanAnswer = response.answer.replace(/\[TIMELINE_YEAR:\d{4}\]/, '').trim();
        
        // Notify parent component about detected year
        if (onYearDetected) {
          onYearDetected(year);
        }
      }
      
      // Add assistant response
      addMessage({
        role: 'assistant',
        content: cleanAnswer,
        sources: response.sources,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get response';
      setError(errorMessage);
      
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Portfolio Assistant</h2>
        <p className="text-sm text-blue-100 mt-1">
          Ask me anything about my work, projects, or experience
        </p>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                Ask about my projects, skills, experience, or anything else you'd like to know!
              </p>
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setInput("What AI projects have you built?")}
                  className="block w-full text-left px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  💡 What AI projects have you built?
                </button>
                <button
                  onClick={() => setInput("Tell me about your experience")}
                  className="block w-full text-left px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  📚 Tell me about your experience
                </button>
                <button
                  onClick={() => setInput("What technologies do you work with?")}
                  className="block w-full text-left px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  🛠️ What technologies do you work with?
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">⚠️ {error}</p>
        </div>
      )}
      
      {/* Input Area */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
