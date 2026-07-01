'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function FinalCTA({ onOpenAuth }: { onOpenAuth?: (mode: 'login'|'signup') => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end']
  });

  const fadeUp = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const yMove = useTransform(scrollYProgress, [0, 1], [100, 0]);

  return (
    <section id="final-cta" ref={containerRef} className="py-40 relative bg-[#0D0D0D] min-h-[80vh] flex items-center justify-center overflow-hidden">
      
      {/* Abstract Background Glow for CTA */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#D4AF37]/5 blur-[150px] -z-10 rounded-[100%] pointer-events-none" />

      <motion.div 
        style={{ opacity: fadeUp, y: yMove }}
        className="max-w-3xl mx-auto px-6 text-center z-10"
      >
        <motion.span 
          animate={{ y: [-3, 3, -3], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#D4AF37] font-mono tracking-widest text-xs uppercase block border border-[#D4AF37]/20 rounded-full py-1.5 px-5 w-max mx-auto mb-8 bg-[#D4AF37]/10 backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.15)]"
        >
          Instant Protection
        </motion.span>
        <h2 className="text-5xl md:text-7xl font-['Playfair_Display'] font-semibold text-[#F5F5F4] text-shadow-gold mb-6 tracking-tighter">
          Ready to Close the Deal?
        </h2>
        <p className="text-lg md:text-xl text-[#A3A3A3] font-['Inter'] mb-12 max-w-xl mx-auto leading-relaxed">
          Stop relying on handshake promises. Let Deal-Dost convert your chat into a secure, legally binding contract in under 60 seconds.
        </p>

        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenAuth?.('signup')}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="group relative inline-flex items-center justify-center bg-[#D4AF37] text-black px-12 py-5 font-bold uppercase tracking-[0.2em] text-sm rounded-lg overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] transition-shadow duration-500"
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <span className="relative font-['Inter']">Generate Your First Contract</span>
        </motion.button>
      </motion.div>
    </section>
  );
}
