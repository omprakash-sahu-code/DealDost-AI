'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileText, Filter, LayoutGrid, List, ChevronLeft, ChevronDown, Copy, Download, Trash2, Check, Clock, Shield, Link2 } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { downloadContractPDF, copyContractToClipboard } from '@/utils/ExportUtils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type DocType = 'All' | 'NDA' | 'MSA' | 'Freelance' | 'Rental';

interface DocsWorkspaceProps {
  onNavigate: (sectionId: string) => void;
}

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

const getContractIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t === 'all') return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  if (t === 'nda') return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
  if (t === 'msa') return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
  if (t === 'freelance') return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
  return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';
};

const formatTimestamp = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 24) return 'Today';
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function DocsWorkspace({ onNavigate }: DocsWorkspaceProps) {
  const { fetchContracts, updateContract, deleteContract, contractsList, isSaving } = useContracts();
  
  // UI states
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DocType>('All');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Section Editing states
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      await fetchContracts();
    } catch (err) {
      console.error('Failed to load contracts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const handleCopy = async () => {
    if (!selectedContract) return;
    const success = await copyContractToClipboard(selectedContract.content.markdown);
    if (success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!selectedContract) return;
    try {
      const res = await fetch(`/api/contracts/${selectedContract._id}/share`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.isShared) {
        const shareUrl = `${window.location.origin}/share/${selectedContract._id}`;
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

  const handleArchive = async () => {
    if (!selectedContract) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedContract.title}"?`);
    if (!confirmDelete) return;

    try {
      await deleteContract(selectedContract._id);
      setViewMode('list');
      setSelectedContract(null);
      await fetchContracts();
    } catch (err) {
      console.error('Failed to delete contract', err);
    }
  };

  const startEditing = (section: any) => {
    if (!section.editable) return;
    setEditingSectionId(section.id);
    setEditContent(section.content);
  };

  const editingSection = selectedContract?.content.sections.find((sec: any) => sec.id === editingSectionId);
  const isDirty = editingSection && editingSection.content !== editContent;

  const saveEditing = async () => {
    if (!selectedContract || !editingSectionId || !isDirty) {
      setEditingSectionId(null);
      return;
    }
    
    const updatedSections = selectedContract.content.sections.map((sec: any) => 
      sec.id === editingSectionId ? { ...sec, content: editContent } : sec
    );

    try {
      const updated = await updateContract(selectedContract._id, { sections: updatedSections });
      if (updated) {
        setSelectedContract(updated);
      }
      setEditingSectionId(null);
      await fetchContracts();
    } catch (err) {
      console.error('Failed to save section edits', err);
    }
  };

  const filteredContracts = contractsList.filter((contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || contract.type.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="w-full h-full bg-[#050505] overflow-hidden flex flex-col relative">
      <AnimatePresence mode="wait">
        
        {/* 1. LIST VIEW OF DOCUMENTS */}
        {viewMode === 'list' && (
          <motion.div
            key="list-view"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* TOP BAR */}
            <motion.div 
              variants={itemVariants}
              className="px-4 md:px-8 pl-14 md:pl-8 py-4 md:py-6 border-b border-white/5 flex flex-col gap-3 sm:gap-6 shrink-0 bg-[#0D0D0D]/40 backdrop-blur-3xl relative z-30"
            >
              {/* Row 1: Search + New Contract */}
              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] group-focus-within:text-[#D4AF37] transition-colors" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..." 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 sm:pl-11 pr-4 text-sm font-['Inter'] text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>

                <button 
                  onClick={() => onNavigate('contracts')}
                  className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C5A059] text-black px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span className="hidden sm:inline">New Contract</span>
                </button>
              </div>

              {/* Row 2: Filters + View Toggle */}
              <div className="flex items-center justify-between gap-3">
                {/* MOBILE: Active badge + Filter dropdown button */}
                {isMobile ? (
                  <>
                    {/* Active filter badge on left */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d={getContractIcon(activeFilter === 'All' ? 'all' : activeFilter)} />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-white font-['Inter'] truncate">
                        {activeFilter === 'All' ? 'All Documents' : activeFilter}
                      </span>
                    </div>

                    {/* Filter dropdown button on right */}
                    <div className="relative" ref={filterRef}>
                      <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-['Inter'] transition-all border ${
                          filterOpen
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                            : 'bg-white/[0.03] border-white/5 text-[#A3A3A3] hover:text-white'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        Filter
                        <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {filterOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-44 bg-[#161616] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                          >
                            {(['All', 'NDA', 'MSA', 'Freelance', 'Rental'] as DocType[]).map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setActiveFilter(type);
                                  setFilterOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-['Inter'] font-medium transition-all ${
                                  activeFilter === type
                                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                    : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d={getContractIcon(type === 'All' ? 'all' : type)} />
                                </svg>
                                <span>{type === 'All' ? 'All Documents' : type}</span>
                                {activeFilter === type && <Check className="w-3.5 h-3.5 ml-auto text-[#D4AF37]" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  /* DESKTOP: Original filter pill strip */
                  <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto flex-1">
                    {(['All', 'NDA', 'MSA', 'Freelance', 'Rental'] as DocType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-['Inter'] font-medium transition-all shrink-0 ${
                          activeFilter === type 
                            ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                            : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {/* View Toggle */}
                <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/5 shrink-0">
                  <button
                    onClick={() => setViewLayout('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewLayout === 'grid' ? 'bg-white/10 text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewLayout('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewLayout === 'list' ? 'bg-white/10 text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-12 relative custom-scrollbar">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                </div>
              ) : filteredContracts.length === 0 ? (
                /* EMPTY STATE */
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
                  <motion.div
                    variants={itemVariants}
                    className="relative flex flex-col items-center text-center max-w-sm"
                  >
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-8 relative"
                    >
                      <div className="absolute -top-4 -right-4 w-32 h-44 bg-white/[0.02] border border-white/5 rounded-2xl rotate-[12deg] blur-[1px]" />
                      <div className="absolute -top-2 -right-2 w-32 h-44 bg-white/[0.03] border border-white/10 rounded-2xl rotate-[6deg]" />
                      <div className="relative w-32 h-44 bg-white/[0.05] backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col p-4">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                          <FileText className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-1.5 w-full bg-white/10 rounded-full" />
                          <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                          <div className="h-1.5 w-full bg-white/10 rounded-full" />
                        </div>
                        <div className="mt-auto flex justify-end">
                          <div className="w-6 h-6 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10" />
                        </div>
                      </div>
                    </motion.div>

                    <h3 className="text-3xl font-['Playfair_Display'] font-semibold text-white mb-3 tracking-tight">
                      No Documents Found
                    </h3>
                    <p className="text-[#A3A3A3] font-['Inter'] text-sm leading-relaxed mb-8">
                      {searchQuery ? "No agreements match your search query." : "Start generating contracts to populate your dashboard secure archives."}
                    </p>

                    {!searchQuery && (
                      <button 
                        onClick={() => onNavigate('chat')}
                        className="px-8 py-3.5 bg-transparent border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/5 font-bold text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95"
                      >
                        Create Contract
                      </button>
                    )}
                  </motion.div>
                </div>
              ) : viewLayout === 'grid' ? (
                /* GRID LAYOUT */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {filteredContracts.map((contract) => (
                    <motion.div
                      key={contract._id}
                      variants={itemVariants}
                      onClick={() => {
                        setSelectedContract(contract);
                        setViewMode('preview');
                      }}
                      className="group bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between h-52 relative overflow-hidden"
                    >
                      {/* Accent glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37] border border-white/5 group-hover:border-[#D4AF37]/30 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d={getContractIcon(contract.type)} />
                            </svg>
                          </div>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                            contract.status === 'final' || contract.status === 'signed' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 mb-2">
                          {contract.title}
                        </h4>
                        <p className="text-xs text-[#A3A3A3] line-clamp-2 leading-relaxed">
                          {contract.terms?.scope || "Custom generated agreement"}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-[#A3A3A3] font-medium font-mono uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 opacity-60" />
                        <span>Updated {formatTimestamp(contract.updatedAt)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* LIST LAYOUT */
                <div className="max-w-5xl mx-auto bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-[#A3A3A3] font-mono">
                    <div className="col-span-6">Agreement Title</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Updated</div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract._id}
                        onClick={() => {
                          setSelectedContract(contract);
                          setViewMode('preview');
                        }}
                        className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <div className="col-span-6 flex items-center gap-3">
                          <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={getContractIcon(contract.type)} />
                          </svg>
                          <span className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                            {contract.title}
                          </span>
                        </div>
                        <div className="col-span-2 text-xs text-[#A3A3A3] font-mono uppercase tracking-wider">
                          {contract.type}
                        </div>
                        <div className="col-span-2">
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            contract.status === 'final' || contract.status === 'signed' 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                        <div className="col-span-2 text-right text-xs text-[#A3A3A3] font-mono">
                          {formatTimestamp(contract.updatedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 2. PREVIEW/DETAIL VIEW OF SINGLE DOCUMENT */}
        {viewMode === 'preview' && selectedContract && (
          <motion.div
            key="preview-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden"
          >
            {/* Sticky Glassmorphic Top Toolbar */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 pl-16 md:pl-8 bg-[#0D0D0D]/80 backdrop-blur-xl shrink-0 z-30">
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedContract(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#A3A3A3] hover:text-white transition-all uppercase tracking-[0.15em] font-sans"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Archives</span>
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
                  onClick={() => downloadContractPDF(selectedContract, `${selectedContract.title.replace(/\s+/g, '_')}.pdf`)}
                  className="bg-white/5 hover:bg-white/10 p-2 sm:px-4 sm:py-2 rounded-lg text-[11px] font-bold text-white transition-all border border-white/5 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={handleArchive}
                  className="bg-red-500/10 hover:bg-red-500/20 p-2 sm:px-4 sm:py-2 rounded-lg text-[11px] font-bold text-red-400 transition-all border border-red-500/20 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
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

                  <div className="max-w-xl mx-auto font-serif">
                    <h1 className="text-2xl font-bold mb-8 text-center text-black leading-snug">{selectedContract.title}</h1>
                    
                    <div className="text-[#1A1A1A] text-sm md:text-base leading-relaxed space-y-6">
                      {selectedContract.content.sections
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
                            {selectedContract.terms?.parties?.sideA || selectedContract.terms?.parties?.split(/\s+and\s+/i)[0]?.trim() || 'Client'}
                          </span>
                          <span className="text-[8px] text-black/40 uppercase tracking-widest font-mono font-semibold">Signature &amp; Date</span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <span className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Party B (Provider)</span>
                          <span className="text-xs font-bold border-b border-black/20 pb-1 h-7 text-black">
                            {selectedContract.terms?.parties?.sideB || selectedContract.terms?.parties?.split(/\s+and\s+/i)[1]?.trim() || 'Service Provider'}
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
                    Status: <span className="font-bold italic text-green-700">{selectedContract.status}</span>
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
