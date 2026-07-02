'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContracts } from '@/hooks/useContracts';
import { downloadContractPDF } from '@/utils/ExportUtils';

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

export default function ContractWorkspace() {
  const [selectedType, setSelectedType] = useState('nda');
  const [description, setDescription] = useState('');
  const { generateContract, isGenerating, activeContract, setActiveContract, error } = useContracts();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

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
      await generateContract({ type: selectedType, description });
    } catch (err) {
      console.error('Generation failed', err);
    }
  };

  const startEditing = (section: any) => {
    if (!section.editable) return;
    setEditingSectionId(section.id);
    setEditContent(section.content);
  };

  const saveEditing = () => {
    if (!activeContract || !editingSectionId) return;
    
    const updatedSections = activeContract.content.sections.map((sec: any) => 
      sec.id === editingSectionId ? { ...sec, content: editContent } : sec
    );

    setActiveContract({
      ...activeContract,
      content: { ...activeContract.content, sections: updatedSections }
    });

    setEditingSectionId(null);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto px-8 lg:px-12 py-16"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-semibold mb-3 text-[#F5F5F4]">
          Create a <span className="text-[#D4AF37]">Contract</span>
        </h2>
        <p className="text-[#A3A3A3] font-['Inter'] text-lg">
          Generate legally structured agreements in seconds
        </p>
      </motion.div>

      {/* SECTION 1 - Contract Types */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CONTRACT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left flex flex-col gap-3 group ${
              selectedType === type.id 
                ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                : 'bg-white/[0.03] border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`p-2 w-max rounded-lg ${selectedType === type.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-[#A3A3A3] group-hover:text-white transition-colors'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={type.icon} />
              </svg>
            </div>
            <div>
              <h4 className={`text-sm font-bold font-['Inter'] ${selectedType === type.id ? 'text-[#D4AF37]' : 'text-white'}`}>
                {type.name}
              </h4>
              <p className="text-[10px] text-[#A3A3A3] mt-1 line-clamp-2 leading-snug font-medium uppercase tracking-wider uppercase">
                {type.desc}
              </p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* SECTION 2 - Input */}
      <motion.div variants={itemVariants} className="mb-8">
        <textarea
          data-lenis-prevent="true"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your deal in simple terms... (e.g., 'Web design for start-up, $500 milestone based, 2 weeks deadline')"
          className="w-full h-40 bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-[#F5F5F4] placeholder:text-[#A3A3A3]/40 focus:outline-none focus:border-[#D4AF37]/40 transition-colors font-['Inter'] text-sm leading-relaxed resize-none custom-scrollbar shadow-inner"
        />
      </motion.div>

      {/* SECTION 3 - Generate Button */}
      <motion.div variants={itemVariants} className="flex justify-center mb-12">
        <button
          onClick={handleGenerate}
          disabled={!description.trim() || isGenerating}
          className="w-full sm:w-auto px-12 py-4 bg-gradient-to-tr from-[#D4AF37] to-[#E5C048] hover:to-[#FFF1BA] text-black font-bold uppercase tracking-[0.1em] rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>Generating your contract...</span>
            </>
          ) : (
            'Generate Contract'
          )}
        </button>
      </motion.div>

      {/* RESULT AREA */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mb-4 text-center">
            {error}
          </motion.div>
        )}
        {activeContract && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full bg-[#FAF9F6] text-[#1A1A1A] p-12 md:p-16 shadow-2xl relative overflow-hidden rounded-sm"
          >
            {/* Stamp paper dynamic header */}
            <StampPaperHeader />

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
               <h4 className="text-xs font-mono uppercase tracking-[0.3em] text-[#D4AF37] font-bold">{activeContract.title}</h4>
               <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-black/10" />
                 <div className="w-2 h-2 rounded-full bg-black/10" />
                 <div className="w-2 h-2 rounded-full bg-black/10" />
               </div>
            </div>

            <div className="text-[#1A1A1A] font-serif text-sm md:text-base leading-relaxed space-y-6">
              {activeContract.content.sections.map((section: any) => (
                <div key={section.id} className="relative group/section pb-4 border-b border-white/5 last:border-0">
                  <h5 className="font-bold text-[#F5F5F4] mb-2 font-['Inter']">{section.title}</h5>
                  
                  {editingSectionId === section.id ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-32 bg-white border border-[#D4AF37]/50 rounded-lg p-4 text-sm text-black focus:outline-none focus:border-[#D4AF37] font-serif shadow-inner"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingSectionId(null)} className="px-4 py-1.5 text-xs text-black/50 hover:text-black">Cancel</button>
                        <button onClick={saveEditing} className="px-4 py-1.5 bg-[#D4AF37] text-black text-xs font-bold rounded hover:bg-[#E5C048]">Save</button>
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

            <div className="mt-10 pt-6 border-t border-black/10 flex flex-wrap gap-4">
               <button 
                 onClick={() => downloadContractPDF(activeContract, `${activeContract.title.replace(/\s+/g, '_')}.pdf`)}
                 className="px-6 py-2.5 rounded-lg border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-colors"
               >
                 Download PDF
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
