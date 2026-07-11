'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DealDostLogo from '@/components/shared/DealDostLogo';
import { generateContractBody } from '@/data/ContractTemplate';
import { downloadContractPDF, copyContractToClipboard } from '@/utils/ExportUtils';
import { useChat } from '@/hooks/useChat';
import { useContracts } from '@/hooks/useContracts';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { 
  Check, 
  AlertTriangle, 
  Edit3, 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  MapPin, 
  CheckCircle,
  X,
  Lock,
  Sparkles,
  Clipboard,
  Download,
  AlertCircle,
  ChevronLeft,
  Plus
} from 'lucide-react';

const StampPaperHeader = () => (
  <div className="border-b-4 border-double border-[#D4AF37] pb-6 mb-8 text-center relative overflow-hidden select-none">
    {/* Geometric seal watermark */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-dashed border-[#D4AF37]/10 flex items-center justify-center pointer-events-none font-bold text-[6px] tracking-widest text-[#D4AF37]/10 uppercase select-none">
      DealDost AI Legal
    </div>
    
    <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-4">
      <span>GOVERNMENT OF INDIA</span>
      <span>SPECIAL LEGAL AGREEMENT</span>
    </div>
    
    <div className="border border-[#D4AF37]/30 rounded-xl p-5 bg-[#D4AF37]/5 flex flex-col items-center justify-center relative">
      <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center mb-2">
        <div className="w-16 h-16 rounded-full border border-dashed border-[#D4AF37]/20 flex flex-col items-center justify-center">
          <span className="text-[7px] uppercase tracking-[0.15em] text-[#8C7323] font-bold leading-tight">DealDost</span>
          <span className="text-[6px] uppercase tracking-[0.1em] text-[#8C7323] font-bold">Legal Seal</span>
        </div>
      </div>
      <span className="text-[9px] font-bold text-gray-700 font-serif">DealDost Legal Seal</span>
      
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-left font-mono text-[7px] text-gray-400">
        SEC: DD-2026-AI<br/>
        REF: {Date.now().toString(16).toUpperCase().substring(0, 8)}
      </div>
    </div>
  </div>
);

export default function ChatWorkspace() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview'>('chat');

  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error, 
    extractedTerms, 
    conversationId,
    contractReady,
    setContractReady,
    activeContract, 
    setActiveContract,
    localTerms, 
    setLocalTerms,
    viewMode, 
    setViewMode,
    rightPanelSize, 
    setRightPanelSize,
    inputText, 
    setInputText,
    userNotes, 
    setUserNotes,
    approvalChecked, 
    setApprovalChecked,
    clearChat
  } = useChat();

  const { user } = useAuth();

  const { 
    generateContract, 
    updateContract, 
    isGenerating: isGeneratingContract, 
    isSaving, 
    error: contractError 
  } = useContracts();

  // Contract Preview State
  const [contractBody, setContractBody] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  // Checklist Preview Panel States
  const [editingField, setEditingField] = useState<string | null>(null);

  // Field Edit Form States
  const [tempSideA, setTempSideA] = useState('');
  const [tempSideB, setTempSideB] = useState('');
  const [tempAmount, setTempAmount] = useState<number | null>(null);
  const [tempCurrency, setTempCurrency] = useState('INR');
  const [tempPayTerms, setTempPayTerms] = useState('');
  const [tempDeadline, setTempDeadline] = useState('');
  const [tempScope, setTempScope] = useState('');
  const [tempLocation, setTempLocation] = useState('India');

  const scrollRef = useRef<HTMLDivElement>(null);
  const isContractVisible = contractReady || !!activeContract;

  // Auto-switch tab on mobile when contract is ready
  useEffect(() => {
    if (isMobile && isContractVisible) {
      setActiveMobileTab('preview');
    }
  }, [isContractVisible, isMobile]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Update fallbacks for copy and preview
  useEffect(() => {
    if (localTerms) {
      setContractBody(generateContractBody({
        parties: localTerms.parties,
        payment: { 
          amount: localTerms.payment.amount ? String(localTerms.payment.amount) : '', 
          currency: localTerms.payment.currency, 
          terms: localTerms.payment.terms 
        },
        deadline: localTerms.deadline,
        scope: localTerms.scope
      }));
    }
  }, [localTerms]);

  const handleSend = async (messageContent?: string) => {
    const textToSend = messageContent || inputText;
    if (!textToSend.trim()) return;

    setInputText('');
    await sendMessage(textToSend);
  };

  const handleCopy = async () => {
    const textToCopy = activeContract ? activeContract.content.markdown : contractBody;
    const success = await copyContractToClipboard(textToCopy);
    if (success) {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleGenerateFinalContract = async () => {
    if (!conversationId || !localTerms) return;
    try {
      const contract = await generateContract({ 
        conversationId, 
        type: 'custom', 
        terms: localTerms,
        description: userNotes || undefined 
      });
      setActiveContract(contract);
      setViewMode('document');
      setRightPanelSize('full');
      setShowNotesPanel(false);
    } catch (err) {
      console.error('Failed to generate final contract', err);
    }
  };

  const startEditingField = (field: string) => {
    if (!localTerms) return;
    setEditingField(field);
    if (field === 'parties') {
      setTempSideA(localTerms.parties?.sideA || '');
      setTempSideB(localTerms.parties?.sideB || '');
    } else if (field === 'payment') {
      setTempAmount(localTerms.payment?.amount);
      setTempCurrency(localTerms.payment?.currency || 'INR');
      setTempPayTerms(localTerms.payment?.terms || '');
    } else if (field === 'deadline') {
      setTempDeadline(localTerms.deadline || '');
    } else if (field === 'scope') {
      setTempScope(localTerms.scope || '');
    } else if (field === 'location') {
      setTempLocation(localTerms.location || 'India');
    }
  };

  const saveFieldEdit = (field: string) => {
    if (!localTerms) return;
    const updated = { ...localTerms };
    if (field === 'parties') {
      updated.parties = { sideA: tempSideA, sideB: tempSideB };
    } else if (field === 'payment') {
      updated.payment = { amount: tempAmount, currency: tempCurrency, terms: tempPayTerms };
    } else if (field === 'deadline') {
      updated.deadline = tempDeadline;
    } else if (field === 'scope') {
      updated.scope = tempScope;
    } else if (field === 'location') {
      updated.location = tempLocation;
    }
    setLocalTerms(updated);
    setEditingField(null);
  };

  const startEditing = (section: any) => {
    if (!section.editable) return;
    setEditingSectionId(section.id);
    setEditContent(section.content);
  };

  const editingSection = activeContract?.content.sections.find((sec: any) => sec.id === editingSectionId);
  const isDirty = editingSection && editingSection.content !== editContent;

  const saveEditing = async () => {
    if (!activeContract || !editingSectionId || !isDirty) {
      setEditingSectionId(null);
      return;
    }
    
    const updatedSections = activeContract.content.sections.map((sec: any) => 
      sec.id === editingSectionId ? { ...sec, content: editContent } : sec
    );

    try {
      const contract = await updateContract(activeContract._id, { sections: updatedSections });
      setActiveContract(contract);
      setEditingSectionId(null);
    } catch (err) {
      console.error('Failed to save section edits', err);
    }
  };

  // Checklist indicator helper
  const getFieldStatus = (field: string) => {
    if (!localTerms) return 'missing';
    if (field === 'parties') {
      return (localTerms.parties?.sideA && localTerms.parties?.sideB) ? 'valid' : 'missing';
    } else if (field === 'payment') {
      return (localTerms.payment?.amount) ? 'valid' : 'missing';
    } else if (field === 'deadline') {
      return localTerms.deadline ? 'valid' : 'missing';
    } else if (field === 'scope') {
      return localTerms.scope ? 'valid' : 'missing';
    } else if (field === 'location') {
      return localTerms.location ? 'valid' : 'missing';
    }
    return 'missing';
  };

  return (
    <div className="flex w-full h-full bg-[#050505] overflow-hidden">
        
      {/* 1. LEFT PANEL: CHAT INTERFACE */}
      <div className={`flex flex-col h-full relative border-r border-white/5 transition-all duration-500 shrink-0 ${
        isMobile
          ? activeMobileTab === 'chat' ? 'w-full' : 'hidden w-0 opacity-0 pointer-events-none'
          : isContractVisible && rightPanelSize === 'split' 
            ? 'w-1/2 md:w-[45%] lg:w-[40%]' 
            : rightPanelSize === 'full' 
              ? 'hidden w-0 opacity-0 pointer-events-none' 
              : 'w-full'
      }`}>
        
        {/* Chat Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between pl-16 md:pl-6 pr-6 bg-[#0D0D0D]/40 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-2">
            <DealDostLogo className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
              Chat Assistant
            </span>
          </div>
          {isMobile && isContractVisible && (
            <button
              onClick={() => setActiveMobileTab('preview')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 transition-all uppercase tracking-wider font-sans ml-auto mr-2 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Terms
            </button>
          )}
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#A3A3A3] hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5 uppercase tracking-wider font-sans"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              New Chat
            </button>
          )}
        </div>
        
        {/* Messages / Welcome View Container */}
        <div 
            ref={scrollRef}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-10 custom-scrollbar pb-[120px] sm:pb-[140px]"
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
                <div className="mb-5 sm:mb-8 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                    <DealDostLogo className="w-9 h-9 sm:w-12 sm:h-12" />
                </div>
                
                <h2 className="text-2xl sm:text-4xl font-['Playfair_Display'] font-semibold mb-3 sm:mb-6 text-white tracking-tight leading-tight">
                    <span className="text-[#D4AF37]">DealDost AI</span>
                </h2>
                <p className="text-[#A3A3A3] text-xs sm:text-sm mb-6 sm:mb-10 max-w-md font-['Inter'] hidden sm:block">
                    Describe your deal in any language (Hinglish/English) and watch our AI extract terms into a professional legal contract.
                </p>
                <p className="text-[#A3A3A3] text-xs mb-6 font-['Inter'] sm:hidden">
                    Describe your deal and let AI draft the contract.
                </p>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                    {[
                        "I'm building a website for Rahul",
                        "Logo design deal of 5000 inr",
                        "App development with 1 month deadline",
                        "Open the Contract preview panel"
                    ].map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => handleSend(prompt)}
                            className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-[#D4AF37]/30 transition-all duration-300 text-[11px] sm:text-xs text-[#A3A3A3] hover:text-white font-['Inter'] text-left group flex items-center gap-2 sm:gap-3"
                        >
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#D4AF37]/40 group-hover:bg-[#D4AF37] transition-colors shrink-0" />
                            <span className="line-clamp-2">{prompt}</span>
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
                            {msg.role === 'ai' ? <DealDostLogo className="w-5 h-5" /> : (user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?')}
                        </div>
                        
                        <div className={`max-w-[85%] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl font-['Inter'] text-[13px] sm:text-[14px] leading-relaxed relative ${
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
          {(error || contractError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-28 left-0 right-0 flex justify-center px-6 z-30"
            >
              <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-xl px-5 py-3 text-red-400 text-xs font-['Inter'] flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{(error || contractError || '').includes('429') || (error || contractError || '').includes('quota') ? 'AI quota exceeded — please wait a moment and try again.' : (error || contractError)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INPUT BAR */}
        <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center pointer-events-none px-3 sm:px-6">
            <div className="w-full max-w-2xl bg-[#161616]/90 backdrop-blur-3xl border border-white/10 rounded-[22px] sm:rounded-[28px] p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto flex items-end gap-2 focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] transition-all duration-300">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Talk to DealDost"
                className="flex-1 bg-transparent text-white placeholder:text-[#A3A3A3]/60 resize-none outline-none py-3 sm:py-4 px-3 sm:px-4 text-[13px] sm:text-[14px] font-['Inter'] leading-relaxed max-h-[160px] min-h-[44px] sm:min-h-[52px] custom-scrollbar"
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

      {/* 2. RIGHT PANEL: LIVE CONTRACT PREVIEW / INTERACTIVE TERMS CHECKLIST */}
      <AnimatePresence>
        {isContractVisible && (
            <motion.div 
                initial={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
                animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                exit={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`${
                  isMobile 
                    ? 'fixed inset-0 w-full h-full bg-[#0D0D0D] z-30' 
                    : 'flex-1 h-full bg-[#0D0D0D] relative border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]'
                } flex flex-col z-20`}
            >
                {/* Preview Toolbar */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0D0D0D]/50 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-2">
                        {isMobile ? (
                            <button 
                                onClick={() => setActiveMobileTab('chat')}
                                className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3] hover:text-white transition-all uppercase tracking-[0.15em] font-sans"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Chat
                            </button>
                        ) : viewMode === 'document' && activeContract ? (
                            <button 
                                onClick={() => {
                                    setViewMode('checklist');
                                    setRightPanelSize('split');
                                }}
                                className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3] hover:text-white transition-all uppercase tracking-[0.15em] font-sans"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Chat
                            </button>
                        ) : (
                            <>
                                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] ${activeContract ? 'bg-green-500 animate-pulse' : 'bg-[#D4AF37]'}`} />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                                    {activeContract ? 'Active Draft Saved' : 'Interactive Terms Review'}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {viewMode === 'document' && activeContract ? (
                            <>
                                <button 
                                    onClick={handleCopy}
                                    className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-[11px] font-bold text-white transition-all border border-white/5 flex items-center gap-2"
                                >
                                    {copyFeedback ? (
                                        <><span className="text-[#D4AF37]">Copied!</span></>
                                    ) : (
                                        <><Clipboard className="w-3.5 h-3.5" /> Copy</>
                                    )}
                                </button>
                                <button 
                                    onClick={() => downloadContractPDF(activeContract, `Deal_with_${localTerms?.parties?.sideB || 'Unknown'}.pdf`)}
                                    className="bg-[#D4AF37] hover:bg-[#FFF1BA] px-4 py-2 rounded-lg text-[11px] font-bold text-black transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                                >
                                    <Download className="w-3.5 h-3.5" /> Export PDF
                                </button>
                            </>
                        ) : (
                            activeContract && (
                                <button 
                                    onClick={() => {
                                        setViewMode('document');
                                        setRightPanelSize('full');
                                    }}
                                    className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> View Final Contract
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#050505] relative">
                    {viewMode === 'document' && activeContract ? (
                        /* Stamp Paper Contract canvas (Full page View) */
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-[#FAF9F6] text-[#1A1A1A] p-6 sm:p-12 md:p-16 min-h-[1000px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-sm relative selection:bg-[#D4AF37]/30 max-w-3xl mx-auto"
                        >
                            <StampPaperHeader />

                            {/* Legal Watermark */}
                            <div className="absolute top-44 right-20 text-[60px] font-['Playfair_Display'] text-black/[0.03] pointer-events-none select-none -rotate-12 uppercase font-black">
                                Drafted by DealDost AI
                            </div>

                            <div className="max-w-xl mx-auto font-serif">
                                <div className="space-y-6">
                                    <h1 className="text-2xl font-bold mb-8 text-center">{activeContract.title}</h1>
                                    {activeContract.content.sections
                                        .filter((section: any) => !/signature|witness|execut/i.test(section.title))
                                        .map((section: any) => (
                                            <div key={section.id} className="relative group/section pb-4 border-b border-black/5 last:border-0">
                                                <h5 className="font-bold text-black mb-2">{section.title}</h5>
                                                
                                                {editingSectionId === section.id ? (
                                                    <div className="flex flex-col gap-3">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full h-32 bg-white border border-[#D4AF37]/50 rounded-lg p-4 text-sm text-black focus:outline-none focus:border-[#D4AF37] font-serif shadow-inner animate-fade-in"
                                                        />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <button 
                                                                onClick={() => setEditingSectionId(null)} 
                                                                className="px-4 py-1.5 text-xs text-black/50 hover:text-black disabled:opacity-50"
                                                                disabled={isSaving}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={saveEditing} 
                                                                disabled={!isDirty || isSaving}
                                                                className="px-4 py-1.5 bg-[#D4AF37] text-black text-xs font-bold rounded hover:bg-[#E5C048] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all min-w-[80px] justify-center"
                                                            >
                                                                {isSaving ? (
                                                                    <><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                                                                ) : isDirty ? (
                                                                    'Save'
                                                                ) : (
                                                                    'Saved'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <p className="whitespace-pre-wrap text-[14px] leading-[1.8]">{section.content}</p>
                                                        {section.editable && (
                                                            <button 
                                                                onClick={() => startEditing(section)}
                                                                className="absolute top-0 right-0 opacity-0 group-hover/section:opacity-100 transition-opacity p-2 text-[#D4AF37] bg-white rounded-md shadow-md"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                {/* Premium Signature Blocks on Screen */}
                                <div className="mt-16 border-t border-black/10 pt-8 font-sans">
                                    <h4 className="text-xs font-bold text-black uppercase tracking-wider text-center mb-8">Signature &amp; Acknowledgement</h4>
                                    <div className="grid grid-cols-2 gap-12 text-[#1A1A1A] max-w-xl mx-auto">
                                        <div className="flex flex-col gap-4">
                                            <span className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Party A (Client)</span>
                                            <span className="text-xs font-bold border-b border-black/20 pb-1 h-7 text-black">
                                                {localTerms?.parties?.sideA || 'Client'}
                                            </span>
                                            <span className="text-[8px] text-black/40 uppercase tracking-widest font-mono font-semibold">Signature &amp; Date</span>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <span className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Party B (Provider)</span>
                                            <span className="text-xs font-bold border-b border-black/20 pb-1 h-7 text-black">
                                                {localTerms?.parties?.sideB || 'Service Provider'}
                                            </span>
                                            <span className="text-[8px] text-black/40 uppercase tracking-widest font-mono font-semibold">Signature &amp; Date</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-20 border-t border-black/10 pt-8 flex gap-8">
                                <div className="text-[10px] uppercase tracking-wider text-black/40">
                                    Status: <span className="font-bold italic text-green-700">Final Contract</span>
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-black/40">
                                    Powered by: <span className="font-bold text-black">DealDost AI</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Interactive Terms Checklist Preview (Prior to contract generation, or when in split mode editing) */
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="max-w-2xl mx-auto flex flex-col gap-6"
                        >
                            {/* Checklist Header */}
                            <div className="text-left mb-4">
                                <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-white mb-2 tracking-tight">
                                    Verify Extracted Deal Terms
                                </h3>
                                <p className="text-[#A3A3A3] text-sm font-['Inter'] leading-relaxed">
                                    Confirm or correct the extracted values below. Once approved, DealDost AI will compile a professionally formatted contract.
                                </p>
                            </div>

                            {/* Missing Fields Alerts Banner */}
                            {localTerms?.missingFields?.length > 0 && (
                                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 flex gap-4 items-start animate-pulse">
                                    <AlertTriangle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5 font-sans">
                                            Awaiting Deal Details
                                        </h4>
                                        <p className="text-xs text-[#A3A3A3] font-['Inter'] leading-relaxed">
                                            The AI is still negotiating or missing details for: <span className="text-[#D4AF37] font-semibold">{localTerms.missingFields.join(', ')}</span>. You can edit them manually below or continue typing details in the chat.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Checklist Cards Container */}
                            <div className="flex flex-col gap-4 font-sans">
                                
                                {/* 1. PARTIES CARD */}
                                <div className={`p-6 rounded-2xl transition-all duration-300 border ${
                                    editingField === 'parties'
                                    ? 'bg-[#161616]/90 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37]">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-none mb-1">Contracting Parties</h4>
                                                <p className="text-[10px] text-[#A3A3A3] leading-none uppercase tracking-wider font-semibold">Client &amp; Service Provider</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                getFieldStatus('parties') === 'valid'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {getFieldStatus('parties')}
                                            </span>
                                            {editingField !== 'parties' && (
                                                <button 
                                                    onClick={() => startEditingField('parties')}
                                                    className="p-1 text-[#A3A3A3] hover:text-white transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingField === 'parties' ? (
                                        <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Party A (Client)</label>
                                                    <input 
                                                        type="text" 
                                                        value={tempSideA}
                                                        onChange={(e) => setTempSideA(e.target.value)}
                                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                        placeholder="Client full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Party B (Provider)</label>
                                                    <input 
                                                        type="text" 
                                                        value={tempSideB}
                                                        onChange={(e) => setTempSideB(e.target.value)}
                                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                        placeholder="Provider full name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs text-[#A3A3A3] hover:text-white">Cancel</button>
                                                <button onClick={() => saveFieldEdit('parties')} className="px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:brightness-110">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                                <span className="text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold block mb-0.5">Party A (Client)</span>
                                                <span className="text-xs text-white font-medium">{localTerms?.parties?.sideA || <span className="text-[#D4AF37]/50 italic">Not extracted yet</span>}</span>
                                            </div>
                                            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                                <span className="text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold block mb-0.5">Party B (Provider)</span>
                                                <span className="text-xs text-white font-medium">{localTerms?.parties?.sideB || <span className="text-[#D4AF37]/50 italic">Not extracted yet</span>}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 2. PAYMENT CARD */}
                                <div className={`p-6 rounded-2xl transition-all duration-300 border ${
                                    editingField === 'payment'
                                    ? 'bg-[#161616]/90 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37]">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-none mb-1">Payment Schedule</h4>
                                                <p className="text-[10px] text-[#A3A3A3] leading-none uppercase tracking-wider font-semibold">Compensation &amp; Terms</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                getFieldStatus('payment') === 'valid'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {getFieldStatus('payment')}
                                            </span>
                                            {editingField !== 'payment' && (
                                                <button 
                                                    onClick={() => startEditingField('payment')}
                                                    className="p-1 text-[#A3A3A3] hover:text-white transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingField === 'payment' ? (
                                        <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Amount</label>
                                                    <input 
                                                        type="number" 
                                                        value={tempAmount === null ? '' : tempAmount}
                                                        onChange={(e) => setTempAmount(e.target.value ? Number(e.target.value) : null)}
                                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                        placeholder="Contract budget"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Currency</label>
                                                    <input 
                                                        type="text" 
                                                        value={tempCurrency}
                                                        onChange={(e) => setTempCurrency(e.target.value)}
                                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                        placeholder="e.g. INR, USD"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Payment Milestones / Schedule</label>
                                                <textarea 
                                                    value={tempPayTerms}
                                                    onChange={(e) => setTempPayTerms(e.target.value)}
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] h-20 resize-none"
                                                    placeholder="e.g. 50% upfront, 50% on completion"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs text-[#A3A3A3] hover:text-white">Cancel</button>
                                                <button onClick={() => saveFieldEdit('payment')} className="px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:brightness-110">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 mt-2">
                                            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                                <span className="text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold">Total Budget</span>
                                                <span className="text-xs text-white font-semibold">{localTerms?.payment?.amount ? `${localTerms.payment.amount} ${localTerms.payment.currency || 'INR'}` : <span className="text-[#D4AF37]/50 italic">Not extracted</span>}</span>
                                            </div>
                                            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                                <span className="text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold block mb-1">Milestone Details</span>
                                                <span className="text-xs text-white font-medium">{localTerms?.payment?.terms || <span className="text-[#D4AF37]/50 italic">No schedule specified</span>}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 3. DEADLINE CARD */}
                                <div className={`p-6 rounded-2xl transition-all duration-300 border ${
                                    editingField === 'deadline'
                                    ? 'bg-[#161616]/90 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37]">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-none mb-1">Project Deadline</h4>
                                                <p className="text-[10px] text-[#A3A3A3] leading-none uppercase tracking-wider font-semibold">Delivery Target</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                getFieldStatus('deadline') === 'valid'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {getFieldStatus('deadline')}
                                            </span>
                                            {editingField !== 'deadline' && (
                                                <button 
                                                    onClick={() => startEditingField('deadline')}
                                                    className="p-1 text-[#A3A3A3] hover:text-white transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingField === 'deadline' ? (
                                        <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                                            <div>
                                                <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Deadline Date / Duration</label>
                                                <input 
                                                    type="text" 
                                                    value={tempDeadline}
                                                    onChange={(e) => setTempDeadline(e.target.value)}
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                    placeholder="e.g. 2 weeks, Friday, Oct 12"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs text-[#A3A3A3] hover:text-white">Cancel</button>
                                                <button onClick={() => saveFieldEdit('deadline')} className="px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:brightness-110">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 mt-2">
                                            <span className="text-xs text-white font-medium">{localTerms?.deadline || <span className="text-[#D4AF37]/50 italic">No deadline extracted yet</span>}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 4. SCOPE CARD */}
                                <div className={`p-6 rounded-2xl transition-all duration-300 border ${
                                    editingField === 'scope'
                                    ? 'bg-[#161616]/90 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37]">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-none mb-1">Scope of Work</h4>
                                                <p className="text-[10px] text-[#A3A3A3] leading-none uppercase tracking-wider font-semibold">Deliverables &amp; Tasks</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                getFieldStatus('scope') === 'valid'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {getFieldStatus('scope')}
                                            </span>
                                            {editingField !== 'scope' && (
                                                <button 
                                                    onClick={() => startEditingField('scope')}
                                                    className="p-1 text-[#A3A3A3] hover:text-white transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingField === 'scope' ? (
                                        <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                                            <div>
                                                <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Project Scope</label>
                                                <textarea 
                                                    value={tempScope}
                                                    onChange={(e) => setTempScope(e.target.value)}
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] h-28 resize-none"
                                                    placeholder="Detail the work to be completed..."
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs text-[#A3A3A3] hover:text-white">Cancel</button>
                                                <button onClick={() => saveFieldEdit('scope')} className="px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:brightness-110">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 mt-2">
                                            <p className="text-xs text-white leading-relaxed font-medium whitespace-pre-wrap">{localTerms?.scope || <span className="text-[#D4AF37]/50 italic">No scope details extracted yet</span>}</p>
                                        </div>
                                    )}
                                </div>

                                {/* 5. LOCATION CARD */}
                                <div className={`p-6 rounded-2xl transition-all duration-300 border ${
                                    editingField === 'location'
                                    ? 'bg-[#161616]/90 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37]">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-none mb-1">Governing Location</h4>
                                                <p className="text-[10px] text-[#A3A3A3] leading-none uppercase tracking-wider font-semibold">Jurisdiction &amp; Venue</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                getFieldStatus('location') === 'valid'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {getFieldStatus('location')}
                                            </span>
                                            {editingField !== 'location' && (
                                                <button 
                                                    onClick={() => startEditingField('location')}
                                                    className="p-1 text-[#A3A3A3] hover:text-white transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingField === 'location' ? (
                                        <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                                            <div>
                                                <label className="text-[10px] uppercase text-[#A3A3A3] font-bold block mb-1">Governing Venue / Region</label>
                                                <input 
                                                    type="text" 
                                                    value={tempLocation}
                                                    onChange={(e) => setTempLocation(e.target.value)}
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                    placeholder="e.g. California, India"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs text-[#A3A3A3] hover:text-white">Cancel</button>
                                                <button onClick={() => saveFieldEdit('location')} className="px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:brightness-110">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 mt-2">
                                            <span className="text-xs text-white font-medium">{localTerms?.location || "India"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Notes Box */}
                            <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 mt-4">
                                <label className="text-xs font-bold text-white uppercase tracking-wider mb-2 block font-sans">
                                    Include Additional Notes / Clauses
                                </label>
                                <textarea
                                    value={userNotes}
                                    onChange={(e) => setUserNotes(e.target.value)}
                                    placeholder="Add any penalty clauses, governing rules, or custom remarks here..."
                                    className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-xl p-4 text-[#F5F5F4] placeholder:text-[#A3A3A3]/40 focus:outline-none focus:border-[#D4AF37]/40 transition-colors font-['Inter'] text-xs leading-relaxed resize-none custom-scrollbar"
                                />
                            </div>

                            {/* Approval Gate Checkbox */}
                            <div className="mt-8 p-5 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-start gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.02)]">
                                <button 
                                    onClick={() => setApprovalChecked(!approvalChecked)}
                                    className="mt-0.5 focus:outline-none shrink-0"
                                >
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                        approvalChecked 
                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                                        : 'border-white/20 hover:border-[#D4AF37]/50'
                                    }`}>
                                        {approvalChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                </button>
                                <div>
                                    <h5 className="text-xs font-bold text-white mb-0.5 font-sans">Verify and Lock Deal Details</h5>
                                    <p className="text-xs text-[#A3A3A3] font-['Inter'] leading-relaxed">
                                        I verify that these deal terms are correct and complete. This unlocks the contract engine to draft the binding legal contract.
                                    </p>
                                </div>
                            </div>

                            {/* Approval Button Action */}
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={handleGenerateFinalContract}
                                    disabled={!approvalChecked || isGeneratingContract}
                                    className="w-full py-4 bg-gradient-to-tr from-[#D4AF37] to-[#E5C048] hover:to-[#FFF1BA] text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3"
                                >
                                    {isGeneratingContract ? (
                                        <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Drafting AI Contract...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4" /> Generate Final Contract</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
