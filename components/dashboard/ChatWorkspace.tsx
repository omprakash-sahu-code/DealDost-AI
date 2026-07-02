'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DealDostLogo from '@/components/shared/DealDostLogo';
import { generateContractBody } from '@/data/ContractTemplate';
import { downloadContractPDF, copyContractToClipboard } from '@/utils/ExportUtils';
import { useChat } from '@/hooks/useChat';

export default function ChatWorkspace() {
  const { messages, sendMessage, isLoading, error, extractedTerms } = useChat();
  const [inputText, setInputText] = useState('');
  
  // Contract Preview State
  const [contractBody, setContractBody] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (extractedTerms) {
        // Map Gemini terms back to the simple structure used by generateContractBody template
        setContractBody(generateContractBody({
          parties: extractedTerms.parties,
          payment: { 
            amount: extractedTerms.payment.amount ? String(extractedTerms.payment.amount) : '', 
            currency: extractedTerms.payment.currency, 
            terms: extractedTerms.payment.terms 
          },
          deadline: extractedTerms.deadline,
          scope: extractedTerms.scope
        }));
    }
  }, [extractedTerms]);

  const handleSend = async (messageContent?: string) => {
    const textToSend = messageContent || inputText;
    if (!textToSend.trim()) return;

    setInputText('');
    await sendMessage(textToSend);
  };

  const handleCopy = async () => {
    const success = await copyContractToClipboard(contractBody);
    if (success) {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const isContractVisible = !!extractedTerms && (extractedTerms.confidence >= 0.8 || extractedTerms.missingFields?.length === 0);
  return (
    <div className="flex w-full h-full bg-[#050505] overflow-hidden">
        
      {/* 1. LEFT PANEL: CHAT INTERFACE */}
      <div className={`flex-1 flex flex-col h-full relative border-r border-white/5 transition-all duration-700 ${isContractVisible ? 'w-1/2 md:w-[45%] lg:w-[40%]' : 'w-full'}`}>
        
        {/* Messages / Welcome View Container */}
        <div 
            ref={scrollRef}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto px-6 py-10 custom-scrollbar pb-[140px]"
        >
            <AnimatePresence mode="wait">
            {messages.length === 0 ? (
                /* WELCOME VIEW */
                <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl mx-auto h-full flex flex-col justify-center items-center text-center"
                >
                <div className="mb-8 p-4 rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                    <DealDostLogo className="w-12 h-12" />
                </div>
                
                <h2 className="text-4xl font-['Playfair_Display'] font-semibold mb-6 text-white tracking-tight leading-tight">
                    Scale your Business with <span className="text-[#D4AF37]">DealDost AI</span>
                </h2>
                <p className="text-[#A3A3A3] text-sm mb-10 max-w-md font-['Inter']">
                    Describe your deal in any language (Hinglish/English) and watch our AI extract terms into a professional legal contract.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {[
                        "I'm building a website for Rahul",
                        "Logo design deal of 5000 inr",
                        "App development with 1 month deadline",
                        "Writing 5 articles for 2000 rupees"
                    ].map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => handleSend(prompt)}
                            className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-[#D4AF37]/30 transition-all duration-300 text-xs text-[#A3A3A3] hover:text-white font-['Inter'] text-left group flex items-center gap-3"
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
                    className="max-w-2xl mx-auto w-full flex flex-col gap-8"
                >
                {messages.map((msg, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                            msg.role === 'ai' 
                            ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                            : 'bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] text-black text-[10px] font-bold'
                        }`}>
                            {msg.role === 'ai' ? <DealDostLogo className="w-5 h-5" /> : 'JD'}
                        </div>
                        
                        <div className={`max-w-[85%] px-5 py-4 rounded-2xl font-['Inter'] text-[14px] leading-relaxed relative ${
                            msg.role === 'ai' 
                            ? 'bg-[#111] border border-white/5 text-[#F5F5F4] rounded-tl-none' 
                            : 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-white rounded-tr-none'
                        }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)] shrink-0 mt-1">
                            <DealDostLogo className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="bg-[#111] border border-white/5 px-5 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                                <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-bounce" />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]/60 font-medium ml-1">
                                Analyzing terms...
                            </span>
                        </div>
                    </motion.div>
                )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* ERROR BANNER */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-28 left-0 right-0 flex justify-center px-6 z-30"
            >
              <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-xl px-5 py-3 text-red-400 text-xs font-['Inter'] flex items-center gap-3">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="truncate">{error.includes('429') || error.includes('quota') ? 'AI quota exceeded — please wait a moment and try again.' : error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INPUT BAR */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none px-6">
            <div className="w-full max-w-2xl bg-[#161616]/90 backdrop-blur-3xl border border-white/10 rounded-[28px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto flex items-end gap-2 focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] transition-all duration-300">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Talk to DealDost... (e.g., 'Rahul is paying 5k for logo design')"
                className="flex-1 bg-transparent text-white placeholder:text-[#A3A3A3]/60 resize-none outline-none py-4 px-4 text-[14px] font-['Inter'] leading-relaxed max-h-[160px] min-h-[52px] custom-scrollbar"
                rows={1}
            />
            <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] hover:brightness-125 text-black rounded-2xl transition-all shadow-lg disabled:opacity-50 shrink-0 flex items-center justify-center p-0"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
            </button>
            </div>
        </div>
      </div>

      {/* 2. RIGHT PANEL: LIVE CONTRACT PREVIEW */}
      <AnimatePresence>
        {isContractVisible && (
            <motion.div 
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="flex-1 h-full bg-[#0D0D0D] flex flex-col relative border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-20"
            >
                {/* Preview Toolbar */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0D0D0D]/50 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Official Preview</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleCopy}
                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-[11px] font-bold text-white transition-all border border-white/5 flex items-center gap-2"
                        >
                            {copyFeedback ? (
                                <><span className="text-[#D4AF37]">Copied!</span></>
                            ) : (
                                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Copy</>
                            )}
                        </button>
                        <button 
                            onClick={() => downloadContractPDF(contractBody, `Deal_with_${extractedTerms?.parties.sideB || 'Unknown'}.pdf`)}
                            className="bg-[#D4AF37] hover:bg-[#FFF1BA] px-4 py-2 rounded-lg text-[11px] font-bold text-black transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Export PDF
                        </button>
                    </div>
                </div>

                {/* Contract Canvas */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#050505] relative">
                    {/* Paper background with shadow */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-[#FAF9F6] text-[#1A1A1A] p-16 min-h-[1000px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-sm relative selection:bg-[#D4AF37]/30"
                    >
                        {/* Legal Watermark */}
                        <div className="absolute top-20 right-20 text-[60px] font-['Playfair_Display'] text-black/[0.03] pointer-events-none select-none -rotate-12 uppercase font-black">
                            Drafted by DealDost AI
                        </div>

                        <div className="max-w-xl mx-auto font-serif">
                            <pre className="whitespace-pre-wrap font-serif text-[14px] leading-[1.8] text-[#1A1A1A]">
                                {contractBody}
                            </pre>
                        </div>

                        {/* Highlighting extracted fields in the UI (Conceptual) */}
                        <div className="mt-20 border-t border-black/10 pt-8 flex gap-8">
                            <div className="text-[10px] uppercase tracking-wider text-black/40">
                                Status: <span className="text-green-700 font-bold italic">Draft Generated</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-black/40">
                                Powered by: <span className="font-bold text-black">DealDost AI</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
