'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Next.js Global Runtime Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 selection:bg-[#D4AF37]/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="max-w-md w-full text-center relative border border-white/5 bg-[#0D0D0D]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] rounded-2xl opacity-10 blur-xl pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-[#D4AF37]" />
        </div>

        <h2 className="text-2xl md:text-3xl font-['Playfair_Display'] font-semibold text-white mb-3">
          Something went wrong
        </h2>
        
        <p className="text-[#A3A3A3] text-sm font-['Inter'] leading-relaxed mb-8">
          An unexpected error occurred in the application canvas. Our legal AI engine is standing by to recover the state.
        </p>

        {error?.message && (
          <div className="mb-8 p-3 rounded-lg bg-black/40 border border-white/5 text-left text-xs font-mono text-[#D4AF37]/80 break-all select-all">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-sans">Error Signature</span>
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] hover:brightness-110 active:scale-95 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Recovery
          </button>
          
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Go to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
