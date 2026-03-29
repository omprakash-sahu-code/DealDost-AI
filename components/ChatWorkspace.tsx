'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DealDostLogo from './DealDostLogo';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Draft an NDA",
  "Explain contract clauses",
  "Review my agreement",
  "Identify legal risks"
];

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(7)}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (messageContent?: string) => {
    const textToSend = messageContent || inputText;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: textToSend,
          sessionId: sessionId 
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.details || data.error || 'Failed to get response from AI');
      }

      const aiMessage: Message = { 
          role: 'ai', 
          content: data.response || 'AI provided an empty response.'
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = { 
          role: 'ai', 
          content: `Connection Error: ${error.message}. Please ensure the n8n workflow is active.` 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#050505]">
      
      {/* Messages / Welcome View Container */}
      <div 
        ref={scrollRef}
        data-lenis-prevent="true"
        className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar pb-[140px]"
      >
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            /* WELCOME VIEW (INITIAL STATE) */
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center mt-[-50px]"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-8 p-4 rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/10"
              >
                <DealDostLogo className="w-12 h-12" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-semibold mb-6 text-white tracking-tight leading-tight">
                How can I help with <br />
                your <span className="text-[#D4AF37]">deal</span> today?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-[#D4AF37]/30 transition-all duration-300 text-sm text-[#A3A3A3] hover:text-white font-['Inter'] text-left group flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40 group-hover:bg-[#D4AF37] transition-colors" />
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* CHAT BUBBLES VIEW */
            <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto w-full flex flex-col gap-8"
            >
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                    {/* Avatar */}
                    {msg.role === 'ai' ? (
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)] shrink-0 mt-1">
                            <DealDostLogo className="w-5 h-5" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] flex items-center justify-center font-bold text-black text-[10px] shrink-0 mt-1">
                            JD
                        </div>
                    )}
                    
                    {/* Bubble */}
                    <div className={`max-w-[80%] px-5 py-4 rounded-2xl font-['Inter'] text-[15px] leading-relaxed relative ${
                        msg.role === 'ai' 
                        ? 'bg-[#111] border border-white/5 text-[#F5F5F4] rounded-tl-none' 
                        : 'bg-white/5 border border-white/10 text-white rounded-tr-none'
                    }`}>
                        {msg.content}
                    </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                        <DealDostLogo className="w-5 h-5 opacity-50" />
                    </div>
                    <div className="bg-[#111] border border-white/5 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" />
                    </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INPUT BAR (Fixed at bottom) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none px-8"
      >
        <div className="w-full max-w-3xl bg-[#161616]/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto flex items-end gap-2 focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] transition-all duration-300">
          
          <button className="p-4 text-[#A3A3A3] hover:text-[#D4AF37] hover:bg-white/5 rounded-xl transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <textarea
            data-lenis-prevent="true"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your deal, terms, or ask a question..."
            className="flex-1 bg-transparent text-[#F5F5F4] placeholder:text-[#A3A3A3]/60 resize-none outline-none py-4 px-2 text-[15px] font-['Inter'] leading-relaxed max-h-[160px] min-h-[50px] custom-scrollbar overflow-y-auto"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
            }}
          />

          <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-4 bg-gradient-to-tr from-[#D4AF37] to-[#E5C048] hover:to-[#FFF1BA] text-black rounded-2xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shrink-0 transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </motion.div>

    </div>
  );
}
