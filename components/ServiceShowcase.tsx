'use client';
import { motion } from 'framer-motion';
import { legalServices } from '@/data/services';
import ServiceCard from './ServiceCard';

export default function ServiceShowcase({ onOpenAuth }: { onOpenAuth?: (mode: 'login' | 'signup') => void }) {
  return (
    <div id="pricing" className="max-w-7xl mx-auto px-6 py-32 relative z-20">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h2 className="text-[#D4AF37] font-mono tracking-widest uppercase text-sm mb-4">Instant Legal Architecture</h2>
        <p className="text-4xl md:text-6xl font-['Playfair_Display'] font-semibold text-[#F5F5F4]">
          Contracts Built for the <br />
          <span className="italic text-white/50">Creator Economy</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {/* Subtle background glow behind the grid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#D4AF37]/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
        
        {legalServices.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} onOpenAuth={onOpenAuth} />
        ))}
      </div>
      
    </div>
  );
}
