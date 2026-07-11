'use client';

import { motion } from 'framer-motion';
import DealDostLogo from '@/components/shared/DealDostLogo';

interface MobileHeroProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export default function MobileHero({ onOpenAuth }: MobileHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0D0D0D] px-6 py-24">
      {/* Background Shift Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatOne {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatTwo {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-50px, 40px) scale(0.85); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob-one {
          animation: floatOne 15s ease-in-out infinite;
        }
        .animate-blob-two {
          animation: floatTwo 18s ease-in-out infinite;
        }
      `}} />

      {/* Floating Light Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[-15%] w-[80vw] h-[80vw] rounded-full bg-[#D4AF37]/15 blur-[80px] animate-blob-one" />
        <div className="absolute bottom-[10%] right-[-15%] w-[90vw] h-[90vw] rounded-full bg-[#D4AF37]/8 blur-[100px] animate-blob-two" />
      </div>

      {/* Main Content Area */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col justify-center items-center gap-10 z-10 w-full"
      >
        {/* Branding */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <div className="w-8 h-8 border border-[#D4AF37]/35 rounded-[8px] flex items-center justify-center bg-black/45 shadow-[0_0_10px_rgba(212,175,55,0.15)] p-[5px]">
            <DealDostLogo className="w-full h-full" />
          </div>
          <span className="font-garet font-extrabold text-lg tracking-wider text-[#F5F5F4]">
            DealDost <span className="font-light text-[#D4AF37]">AI</span>
          </span>
        </motion.div>

        {/* Headings */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="font-['Playfair_Display'] font-extrabold text-3xl leading-[1.3] text-[#F5F5F4] max-w-sm mx-auto">
            Turn Deals into <br />
            <span className="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]">
              Binding Contracts
            </span>
          </h1>
          <p className="font-inter text-sm text-[#A3A3A3] max-w-xs mx-auto leading-relaxed">
            Secure your agreements instantly with AI-powered legal protection.
          </p>
        </motion.div>

        {/* Chat Preview Card */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-sm rounded-xl border border-[#D4AF37]/15 bg-[#050505]/95 shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-[#161616]/80">
            <div className="w-7 h-7 rounded-[6px] border border-[#D4AF37]/20 flex items-center justify-center bg-[#111111] p-[5px]">
              <svg className="w-full h-full text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3V21" />
                <path d="M9 21H15" />
                <path d="M5 6H19" />
                <path d="M5 6L2 14H8L5 6Z" />
                <path d="M19 6L16 14H22L19 6Z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[#F5F5F4] font-inter font-semibold text-xs leading-none">DealDost Assistant</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1 h-1 rounded-full bg-[#22c55e] shadow-[0_0_4px_#22c55e]" />
                <span className="text-[#A3A3A3] text-[9px] uppercase tracking-wider font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#222222] border border-white/10 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%] text-left">
                <p className="text-white text-xs font-inter leading-relaxed">
                  Bhai 20k mein website bana do, 10 din mein, 50% advance.
                </p>
                <div className="text-right mt-1.5 opacity-40">
                  <span className="text-[#A3A3A3] text-[8px] uppercase font-semibold">02:43 PM</span>
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start gap-2 max-w-[90%] text-left">
              <div className="w-6 h-6 shrink-0 rounded-[6px] border border-[#D4AF37]/20 flex items-center justify-center bg-[#111111] mt-0.5 p-[4px]">
                <svg className="w-full h-full text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3V21" />
                  <path d="M9 21H15" />
                  <path d="M5 6H19" />
                  <path d="M5 6L2 14H8L5 6Z" />
                  <path d="M19 6L16 14H22L19 6Z" />
                </svg>
              </div>
              <div className="bg-[#151515] border border-[#D4AF37]/25 rounded-2xl rounded-tl-sm px-3.5 py-2.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#D4AF37]/10 blur-2xl rounded-full pointer-events-none" />
                <p className="text-white text-xs font-inter leading-relaxed relative z-10">
                  Got it. Extracting terms: ₹20,000 total, 10 days timeline, 50% upfront.
                </p>
                <div className="text-right mt-1.5 opacity-40 relative z-10">
                  <span className="text-[#A3A3A3] text-[8px] uppercase font-semibold">02:43 PM</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Actions */}
        <motion.div variants={itemVariants} className="w-full max-w-sm flex flex-col items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative group cursor-pointer"
            onClick={() => onOpenAuth?.('signup')}
          >
            {/* Outline decorative ring */}
            <div className="absolute inset-[-4px] border border-[#D4AF37]/40 rounded-[14px] pointer-events-none" />
            
            <button className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#E5C048] text-black font-extrabold uppercase tracking-widest text-[12px] font-inter rounded-lg shadow-[0_4px_15px_rgba(212,175,55,0.35)] transition-colors duration-300">
              Sign Up Free
            </button>
          </motion.div>

          <button
            onClick={() => onOpenAuth?.('login')}
            className="text-xs font-inter text-[#A3A3A3] hover:text-white transition-colors py-1"
          >
            Already have an account? <span className="text-[#D4AF37] font-semibold underline decoration-[#D4AF37]/30 decoration-2">Log In</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Sticky Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="flex flex-col items-center gap-1 text-[#D4AF37]/75 mt-8 pointer-events-none"
      >
        <span className="text-[9px] font-inter uppercase tracking-[0.25em]">Scroll Down</span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs"
        >
          ↓
        </motion.span>
      </motion.div>
    </div>
  );
}
