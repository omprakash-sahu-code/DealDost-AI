'use client';
import { motion } from 'framer-motion';
import { LegalService } from '@/data/services';

export default function ServiceCard({ service, index, onOpenAuth }: { service: LegalService, index: number, onOpenAuth?: (mode: 'login' | 'signup') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -6 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#161616]/80 backdrop-blur-xl group p-8 rounded-xl border border-white/5 hover:border-[#D4AF37] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-300 ease-out relative overflow-hidden flex flex-col h-full cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-[#D4AF37]/10" />

      <div className="flex justify-start items-start mb-6">
        <div className="text-[#D4AF37] text-xs font-mono tracking-widest uppercase border border-[#D4AF37]/30 px-2 py-1 rounded bg-[#0D0D0D]/50">Reliability: {service.reliability.toFixed(1)}/5.0</div>
      </div>
      
      <h3 className="text-3xl font-['Playfair_Display'] mb-4 group-hover:text-[#D4AF37] transition-colors font-semibold text-[#F5F5F4]">{service.title}</h3>
      <p className="text-sm text-[#A3A3A3] mb-8 leading-relaxed">{service.description}</p>
      
      <ul className="mb-0 space-y-2 border-t border-white/5 pt-6 flex-grow">
        {service.features.map((feature, i) => (
          <li key={i} className="text-xs text-[#F5F5F4] flex items-center gap-2 font-medium">
            <span className="text-[#D4AF37]">✦</span> {feature}
          </li>
        ))}
      </ul>
      
      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
        <div className="text-2xl font-bold font-['Playfair_Display'] text-[#F5F5F4]">{service.price}</div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenAuth?.('signup');
          }}
          className="px-6 py-3 sm:px-8 sm:py-3.5 bg-white/5 border border-white/10 hover:bg-[#D4AF37] group-hover:animate-gold-glow hover:text-black hover:border-[#D4AF37] transition-all font-bold text-xs uppercase tracking-widest rounded whitespace-nowrap"
        >
          Generate Draft
        </motion.button>
      </div>
    </motion.div>
  );
}
