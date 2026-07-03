'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';

const StampPaperHeader = () => (
  <div className="border-b-4 border-double border-[#D4AF37] pb-6 mb-8 text-center relative overflow-hidden select-none">
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

export default function SharedContractPage() {
  const params = useParams();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedContract() {
      try {
        const res = await fetch(`/api/contracts/${contractId}/shared-view`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Unable to load this contract.');
          return;
        }
        
        setContract(data.contract);
      } catch (err) {
        setError('Failed to connect to the server.');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (contractId) fetchSharedContract();
  }, [contractId]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-2 border-dashed border-[#D4AF37]/20 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#D4AF37]/5">
              <Shield className="w-6 h-6 text-[#D4AF37] animate-pulse" />
            </div>
          </motion.div>
          <p className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Error / Forbidden State
  if (error || !contract) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
            {error?.includes('not publicly') ? (
              <Lock className="w-10 h-10 text-red-400" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-400" />
            )}
          </div>
          <h2 className="text-3xl font-['Playfair_Display'] font-semibold text-white mb-3">Access Restricted</h2>
          <p className="text-[#A3A3A3] text-sm font-['Inter'] leading-relaxed mb-8">
            {error || 'This contract is no longer available or sharing has been disabled by the owner.'}
          </p>
          <a 
            href="/"
            className="inline-block px-8 py-3 bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
          >
            Go to DealDost AI
          </a>
        </motion.div>
      </div>
    );
  }

  // Success — Render the shared contract
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Shield className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-['Playfair_Display'] font-semibold text-lg group-hover:text-[#D4AF37] transition-colors">DealDost AI</span>
        </a>
        
        <div className="flex items-center gap-3">
          <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-3 h-3" />
            Secured Read-Only Draft
          </span>
        </div>
      </header>

      {/* Document Canvas */}
      <div className="flex justify-center items-start p-8 md:p-12 min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#FAF9F6] text-[#1A1A1A] p-12 md:p-16 max-w-3xl w-full shadow-2xl rounded-sm selection:bg-[#D4AF37]/30 font-serif min-h-[1000px] flex flex-col justify-between relative"
        >
          <div>
            {/* Stamp Paper Header */}
            <StampPaperHeader />

            {/* Legal Watermark */}
            <div className="absolute top-44 right-20 text-[60px] font-['Playfair_Display'] text-black/[0.03] pointer-events-none select-none -rotate-12 uppercase font-black">
              Drafted by DealDost AI
            </div>

            <div className="max-w-xl mx-auto font-serif">
              <h1 className="text-2xl font-bold mb-8 text-center text-black leading-snug">{contract.title}</h1>
              
              <div className="text-[#1A1A1A] text-sm md:text-base leading-relaxed space-y-6">
                {contract.content.sections
                  .filter((section: any) => !/signature|witness|execut/i.test(section.title))
                  .map((section: any) => (
                    <div key={section.id} className="pb-4 border-b border-black/5 last:border-0">
                      <h5 className="font-bold text-black mb-2 font-['Inter']">{section.title}</h5>
                      <p className="whitespace-pre-wrap">{section.content}</p>
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
                      {contract.terms?.parties?.sideA || contract.terms?.parties?.split(/\s+and\s+/i)[0]?.trim() || 'Client'}
                    </span>
                    <span className="text-[8px] text-black/40 uppercase tracking-widest font-mono font-semibold">Signature &amp; Date</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Party B (Provider)</span>
                    <span className="text-xs font-bold border-b border-black/20 pb-1 h-7 text-black">
                      {contract.terms?.parties?.sideB || contract.terms?.parties?.split(/\s+and\s+/i)[1]?.trim() || 'Service Provider'}
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
              Status: <span className="font-bold italic text-green-700">{contract.status}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-black/40">
              Powered by: <span className="font-bold text-black">DealDost AI</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-[#A3A3A3] text-xs font-['Inter']">
          This document was generated and secured by <a href="/" className="text-[#D4AF37] hover:underline">DealDost AI</a>. It is provided for viewing purposes only.
        </p>
      </footer>
    </div>
  );
}
