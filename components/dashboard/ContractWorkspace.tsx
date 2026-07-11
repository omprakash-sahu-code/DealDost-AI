'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractWorkspace } from '@/context/ContractWorkspaceContext';
import { useContracts } from '@/hooks/useContracts';
import { downloadContractPDF, copyContractToClipboard } from '@/utils/ExportUtils';
import { Shield, Sparkles, ChevronLeft, Copy, Download, Check, Link2, Plus } from 'lucide-react';

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

const CONTRACT_TYPES = [
  { id: 'nda', name: 'NDA', desc: 'Non-Disclosure Agreement', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'msa', name: 'MSA', desc: 'Master Service Agreement', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'freelance', name: 'Freelance Agreement', desc: 'Contract for independent services', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'rental', name: 'Rental Agreement', desc: 'Lease for residential or commercial property', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
];

const LOADING_MESSAGES = [
  "Initiating deal compiler...",
  "Analyzing parameters...",
  "Drafting legal clauses...",
  "Applying governing law clauses...",
  "Structuring contract sections...",
  "Polishing legal formatting...",
];

export default function ContractWorkspace() {
  const {
    selectedType,
    setSelectedType,
    description,
    setDescription,
    viewMode,
    setViewMode,
    activeContract,
    setActiveContract
  } = useContractWorkspace();

  const { generateContract, updateContract, isGenerating, isSaving, error } = useContracts();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // UX Overhaul States
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Cycle loading messages during contract generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    try {
      const contract = await generateContract({ type: selectedType, description });
      setActiveContract(contract);
      setViewMode('preview');
    } catch (err) {
      console.error('Generation failed', err);
    }
  };

  const handleCopy = async () => {
    if (!activeContract) return;
    const success = await copyContractToClipboard(activeContract.content.markdown);
    if (success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!activeContract) return;
    try {
      const res = await fetch(`/api/contracts/${activeContract._id}/share`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.isShared) {
        const shareUrl = `${window.location.origin}/share/${activeContract._id}`;
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 3000);
      } else if (res.ok && !data.isShared) {
        setShareFeedback(false);
      }
    } catch (err) {
      console.error('Failed to toggle sharing', err);
    }
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

  return (
    <div className="w-full h-full bg-[#050505] overflow-hidden flex flex-col relative">
      
      {/* Contract Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between pl-16 md:pl-8 pr-8 bg-[#0D0D0D]/40 backdrop-blur-xl shrink-0 z-10 w-full">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
            Contract Creator
          </span>
        </div>
      </div>
      
      {/* 1. CINEMATIC FULL-SCREEN LOADING OVERLAY */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="relative flex flex-col items-center max-w-sm w-full text-center">
              {/* Pulsing rotating seal */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-36 h-36 rounded-full border-2 border-dashed border-[#D4AF37]/20 flex items-center justify-center mb-8 relative"
              >
                <div className="absolute inset-2 rounded-full border border-dashed border-[#D4AF37]/10 animate-ping" />
                <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex flex-col items-center justify-center bg-[#D4AF37]/5 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                  <Shield className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                </div>
              </motion.div>

              {/* Progress/Text */}
              <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-white mb-2 tracking-tight">
                Assembling Agreement
              </h3>
              <p className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.2em] min-h-[16px] animate-pulse mb-8">
                {LOADING_MESSAGES[loadingTextIndex]}
              </p>

              {/* Gold Progress Bar */}
              <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FORM VIEW */}
      <AnimatePresence mode="wait">
        {viewMode === 'form' && (
          <motion.div
            key="form-view"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex-1 overflow-y-auto custom-scrollbar py-16"
          >
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-12">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Playfair_Display'] font-semibold mb-2 sm:mb-3 text-[#F5F5F4]">
                  Create a <span className="text-[#D4AF37]">Contract</span>
                </h2>
                <p className="text-[#A3A3A3] font-['Inter'] text-sm sm:text-lg">
                  Generate legally structured agreements in seconds
                </p>
              </motion.div>

              {/* SECTION 1 - Contract Types */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
                {CONTRACT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-3 group ${
                      selectedType === type.id 
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                        : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-1.5 sm:p-2 w-max rounded-lg shrink-0 ${selectedType === type.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-[#A3A3A3] group-hover:text-white transition-colors'}`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={type.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold font-['Inter'] truncate ${selectedType === type.id ? 'text-[#D4AF37]' : 'text-white'}`}>
                        {type.name}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-[#A3A3A3] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 leading-snug font-medium uppercase tracking-wider font-sans hidden sm:block">
                        {type.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>

              {/* SECTION 2 - Input */}
              <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
                <textarea
                  data-lenis-prevent="true"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your deal in simple terms..."
                  className="w-full h-28 sm:h-40 bg-white/[0.03] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-[#F5F5F4] placeholder:text-[#A3A3A3]/40 focus:outline-none focus:border-[#D4AF37]/40 transition-colors font-['Inter'] text-sm leading-relaxed resize-none custom-scrollbar shadow-inner"
                />
              </motion.div>

              {/* SECTION 3 - Generate / View Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                <button
                  onClick={handleGenerate}
                  disabled={!description.trim() || isGenerating}
                  className="w-full sm:w-auto px-12 py-4 bg-gradient-to-tr from-[#D4AF37] to-[#E5C048] hover:to-[#FFF1BA] text-black font-bold uppercase tracking-[0.1em] rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                  Generate Contract
                </button>

                {activeContract && (
                  <button
                    onClick={() => setViewMode('preview')}
                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-[0.1em] rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>View Active Draft</span>
                  </button>
                )}
              </motion.div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mb-4 text-center">
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. PREVIEW VIEW */}
        {viewMode === 'preview' && activeContract && (
          <motion.div
            key="preview-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden"
          >
            {/* Sticky Glassmorphic Top Toolbar */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0D0D0D]/80 backdrop-blur-xl shrink-0 z-30">
              <button
                onClick={() => setViewMode('form')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#A3A3A3] hover:text-white transition-all uppercase tracking-[0.15em] font-sans"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Form</span>
                <span className="sm:hidden">Back</span>
              </button>
              
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={handleShare}
                  className={`p-2 sm:px-4 sm:py-2 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-2 ${
                    shareFeedback
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'
                  }`}
                >
                  {shareFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="bg-white/5 hover:bg-white/10 p-2 sm:px-4 sm:py-2 rounded-lg text-[11px] font-bold text-white transition-all border border-white/5 flex items-center gap-2"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-[#D4AF37] hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadContractPDF(activeContract, `${activeContract.title.replace(/\s+/g, '_')}.pdf`)}
                  className="bg-[#D4AF37] hover:bg-[#FFF1BA] p-2 sm:px-4 sm:py-2 rounded-lg text-[11px] font-bold text-black transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              </div>
            </div>

            {/* Scrollable Document Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar bg-[#050505] flex justify-center items-start">
              {/* Paper Canvas */}
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-[#FAF9F6] text-[#1A1A1A] p-6 sm:p-12 md:p-16 max-w-3xl w-full shadow-2xl rounded-sm selection:bg-[#D4AF37]/30 font-serif min-h-[1000px] flex flex-col justify-between relative"
              >
                <div>
                  {/* Stamp paper dynamic header */}
                  <StampPaperHeader />

                  {/* Legal Watermark */}
                  <div className="absolute top-44 right-20 text-[60px] font-['Playfair_Display'] text-black/[0.03] pointer-events-none select-none -rotate-12 uppercase font-black">
                    Drafted by DealDost AI
                  </div>

                  <div className="max-w-xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8 text-center text-black leading-snug">{activeContract.title}</h1>
                    
                    <div className="text-[#1A1A1A] font-serif text-sm md:text-base leading-relaxed space-y-6">
                      {activeContract.content.sections
                        .filter((section: any) => !/signature|witness|execut/i.test(section.title))
                        .map((section: any) => (
                          <div key={section.id} className="relative group/section pb-4 border-b border-black/5 last:border-0">
                            <h5 className="font-bold text-black mb-2 font-['Inter']">{section.title}</h5>
                            
                            {editingSectionId === section.id ? (
                              <div className="flex flex-col gap-3">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full h-32 bg-white border border-[#D4AF37]/50 rounded-lg p-4 text-sm text-black focus:outline-none focus:border-[#D4AF37] font-serif shadow-inner"
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
                              <div className="relative group/section">
                                <p className="whitespace-pre-wrap">{section.content}</p>
                                {section.editable && (
                                  <button 
                                    onClick={() => startEditing(section)}
                                    className="absolute top-0 right-0 opacity-0 group-hover/section:opacity-100 transition-opacity p-2 text-[#D4AF37] bg-white rounded-md shadow-md"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
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
                            {activeContract.terms?.parties?.sideA || activeContract.terms?.parties?.split(/\s+and\s+/i)[0]?.trim() || 'Client'}
                          </span>
                          <span className="text-[8px] text-black/40 uppercase tracking-widest font-mono font-semibold">Signature &amp; Date</span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <span className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Party B (Provider)</span>
                          <span className="text-xs font-bold border-b border-black/20 pb-1 h-7 text-black">
                            {activeContract.terms?.parties?.sideB || activeContract.terms?.parties?.split(/\s+and\s+/i)[1]?.trim() || 'Service Provider'}
                          </span>
                          <span className="text-[8px] text-black/40 uppercase tracking-widest font-mono font-semibold">Signature &amp; Date</span>
                        </div>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
