'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { processSteps } from '@/data/services';

export default function ProcessFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
    // offset explanation: 
    // "start center" -> Animation starts when the top of container hits the center of screen
    // "end center" -> Animation ends when the bottom of container hits the center of screen
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const particleY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="features" className="py-32 relative bg-[#161616] overflow-hidden border-t border-[#262626]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-[#D4AF37] font-mono tracking-widest uppercase text-sm mb-4">The Engine</h2>
          <p className="text-4xl md:text-6xl font-['Playfair_Display'] font-semibold text-[#F5F5F4]">
            How Deal-Dost Secures Your Future
          </p>
        </div>

        <div ref={containerRef} className="relative space-y-4 md:space-y-0 py-10">
          
          {/* THE ENERGY PATH SYSTEM (Desktop Only) */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] hidden md:block">
            {/* 1. Faint Base Line */}
            <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full" />
            
            {/* 2. Glowing Trail (Grows downwards over time) */}
            <motion.div 
              style={{ scaleY: smoothProgress, originY: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/20 via-[#D4AF37]/80 to-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] rounded-full"
            />
            
            {/* 3. The Orb Particle itself */}
            <motion.div
              style={{ top: particleY }}
              className="absolute left-1/2 -translate-x-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_#ffffff,0_0_30px_#D4AF37,0_0_50px_#D4AF37] z-20"
            />
          </div>

          {processSteps.map((step, index) => {
            const isLeft = step.position === 'left';
            const isLast = index === processSteps.length - 1;

            return (
              <div key={index} className={`flex flex-col md:flex-row items-center w-full min-h-[160px] ${isLeft ? 'md:justify-start' : 'md:justify-end'} relative p-4 group`}>
                
                {/* Center Node dot for Desktop */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-10 pointer-events-none">

                  {/* Glow Burst */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: [0.8, 1.4, 1], opacity: [0.6, 1, 0] }}
                    viewport={{ once: false, margin: "1000% 0px -50% 0px" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute inset-[0px] bg-[#D4AF37] rounded-full blur-[3px]"
                  />

                  {/* Main Dot (Micro Pulse + Persistent Soft Glow) */}
                  <motion.div
                    initial={{ scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(212,175,55,0.3)', boxShadow: '0 0 0px rgba(212,175,55,0)' }}
                    whileInView={{ 
                      scale: [1, 1.15, 1], 
                      backgroundColor: ['transparent', '#ffffff', '#D4AF37'], 
                      borderColor: ['rgba(212,175,55,0.3)', '#ffffff', '#D4AF37'], 
                      boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 20px #ffffff', '0 0 12px rgba(212,175,55,0.4)']
                    }}
                    viewport={{ once: false, margin: "1000% 0px -50% 0px" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-4 h-4 border-2 rounded-full relative z-10"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 80, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 1.4, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full md:w-[45%] relative group ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}`}
                >
                  {/* Exact Center Glow Trigger (Triggers exactly when orb hits node) */}
                  <motion.div
                    initial={{ boxShadow: '0 0 30px rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.2)' }}
                    whileInView={{ 
                      boxShadow: [
                        '0 0 30px rgba(212,175,55,0.15)', 
                        '0 0 80px rgba(212,175,55,0.7)', 
                        isLast ? '0 0 60px rgba(212,175,55,0.6)' : '0 0 30px rgba(212,175,55,0.15)'
                      ], 
                      borderColor: [
                        'rgba(212,175,55,0.2)', 
                        'rgba(212,175,55,0.8)', 
                        isLast ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.2)'
                      ] 
                    }}
                    viewport={{ once: false, margin: "1000% 0px -50% 0px" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full h-full bg-[#0D0D0D] p-8 md:p-12 rounded-2xl border hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:border-[#D4AF37]/60 transition-colors duration-500 ease-out cursor-pointer"
                  >
                    <div className="text-[#D4AF37] text-4xl font-['Playfair_Display'] mb-4 font-medium pointer-events-none [text-shadow:0_0_10px_rgba(212,175,55,0.2)]">
                      0{index + 1}
                    </div>
                    <h3 className="text-2xl font-['Playfair_Display'] font-semibold tracking-wide text-[#F5F5F4] mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-[#A3A3A3] text-sm leading-relaxed relative z-10">{step.description}</p>
                  </motion.div>
                </motion.div>
                
              </div>
            );
          })}
        </div>
      </div>

      {/* Residual Energy Transition Glow */}
      <motion.div
        initial={{ opacity: 0.1 }}
        whileInView={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
        className="absolute bottom-0 left-[10%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent shadow-[0_0_40px_rgba(212,175,55,0.5)] pointer-events-none z-20"
      />
    </section>
  );
}
