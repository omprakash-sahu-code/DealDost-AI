'use client';

import { motion } from 'framer-motion';
import { Search, Plus, FileText, Filter, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';

type DocType = 'All' | 'NDA' | 'MSA';

interface DocsWorkspaceProps {
  onNavigate: (sectionId: string) => void;
}

export default function DocsWorkspace({ onNavigate }: DocsWorkspaceProps) {
  const [activeFilter, setActiveFilter] = useState<DocType>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden"
    >
      {/* TOP BAR */}
      <motion.div 
        variants={itemVariants}
        className="px-8 py-6 border-b border-white/5 flex items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] group-focus-within:text-[#D4AF37] transition-colors" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm font-['Inter'] focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {(['All', 'NDA', 'MSA'] as DocType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-['Inter'] font-medium transition-all ${
                  activeFilter === type 
                    ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/5 mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-[#A3A3A3] hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-[#A3A3A3] hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => onNavigate('contracts')}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C5A059] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>New Contract</span>
          </button>
        </div>
      </motion.div>

      {/* MAIN CONTENT - EMPTY STATE */}
      <div className="flex-1 overflow-y-auto px-8 py-12 flex flex-col items-center justify-center relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          variants={itemVariants}
          className="relative flex flex-col items-center text-center max-w-sm"
        >
          {/* Visual Asset (Floating Document Stack) */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8 relative"
          >
            {/* Background card stack */}
            <div className="absolute -top-4 -right-4 w-32 h-44 bg-white/[0.02] border border-white/5 rounded-2xl rotate-[12deg] blur-[1px]" />
            <div className="absolute -top-2 -right-2 w-32 h-44 bg-white/[0.03] border border-white/10 rounded-2xl rotate-[6deg]" />
            
            {/* Primary document card */}
            <div className="relative w-32 h-44 bg-white/[0.05] backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col p-4">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full" />
                <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                <div className="h-1.5 w-full bg-white/10 rounded-full" />
                <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
              </div>
              <div className="mt-auto flex justify-end">
                <div className="w-6 h-6 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10" />
              </div>
            </div>

            {/* Subtle light effect behind doc */}
            <div className="absolute inset-0 bg-[#D4AF37]/10 blur-[40px] -z-10" />
          </motion.div>

          <h3 className="text-3xl font-['Playfair_Display'] font-semibold text-white mb-3 tracking-tight">
            No Documents Yet
          </h3>
          <p className="text-[#A3A3A3] font-['Inter'] text-sm leading-relaxed mb-10">
            Start creating your first contract to see it here. All your legal assets will be managed securely in this workspace.
          </p>

          <button 
            onClick={() => onNavigate('chat')}
            className="px-8 py-3.5 bg-transparent border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/5 font-bold text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95"
          >
            Create Your First Contract
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
