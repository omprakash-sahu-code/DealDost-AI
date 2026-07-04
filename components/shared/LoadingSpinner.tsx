'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading Canvas...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
      <div className="relative mb-6">
        {/* Animated outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border border-dashed border-[#D4AF37]/30"
        />
        {/* Spinning gold gradient arc */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-16 h-16 rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-l-2 border-l-[#D4AF37]"
        />
        {/* Glowing center shield icon */}
        <div className="absolute inset-2 rounded-full bg-[#050505] flex items-center justify-center border border-white/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <Shield className="w-5 h-5 text-[#D4AF37] animate-pulse" />
        </div>
      </div>
      
      <p className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.25em] animate-pulse text-center max-w-[200px]">
        {message}
      </p>
    </div>
  );
}
