'use client';
import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import DealDostLogo from './DealDostLogo';

export default function Navbar({ onOpenAuth }: { onOpenAuth: (mode: 'login'|'signup') => void }) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const [isActivated, setIsActivated] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Syncs activation exactly with the Hero Canvas CTA threshold (~50%)
  useEffect(() => {
    const unsub = smoothProgress.on('change', (latest) => {
      if (latest >= 0.48 && !isActivated) setIsActivated(true);
      else if (latest < 0.45 && isActivated) setIsActivated(false);
    });
    return () => unsub();
  }, [smoothProgress, isActivated]);

  // Scroll Spy to track active section
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let current = 'home';
          // Added final-cta to track the bottom section
          const visualOrderReversed = ['final-cta', 'features', 'pricing', 'home'];
          
          for (const id of visualOrderReversed) {
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
              // Offset threshold slightly higher to match natural scroll flow
              if (rect.top <= 250) {
                current = id;
                break;
              }
            }
          }
          
          setActiveSection((prev) => (prev !== current ? current : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check once on mount
    
    // Poll for the first 3 seconds to catch any layout shifts (e.g., after loading screen disappears)
    const intervalId = setInterval(handleScroll, 500);
    setTimeout(() => clearInterval(intervalId), 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(intervalId);
    };
  }, []);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    
    // Offset of ~100px so sections aren't hidden under the navbar
    const y = element.getBoundingClientRect().top + window.scrollY - 100;
    
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(y, {
        duration: 1.2,
        // Cinematic easeInOutCubic: fast acceleration, smooth deceleration
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const LINKS = ['Home', 'Pricing', 'Features', 'Login'];

  // Helper render function for Links to keep Layer 1 & 2 DRY
  const renderLinks = (prefix: string) => (
    <div className="flex items-center gap-7 text-sm font-inter font-medium text-[#F5F5F4]/70">
      {LINKS.map((link) => {
        const linkId = link.toLowerCase();
        // Since we only spy on the first three, we treat login independently or just never 'active'
        const isActive = activeSection === linkId;

        return (
          <motion.a 
            key={`${prefix}-${link}`}
            href={`#${linkId}`}
            onClick={(e) => {
              if (linkId !== 'login') {
                handleScrollTo(e, linkId);
              } else {
                e.preventDefault();
                onOpenAuth?.('login');
              }
            }}
            whileHover="hover"
            initial="rest"
            animate={isActive ? "hover" : "rest"}
            className="relative cursor-pointer"
          >
            <motion.span 
              variants={{
                rest: { color: 'rgba(245, 245, 244, 0.7)', y: 0 },
                hover: { color: '#D4AF37', y: -2 }
              }}
              transition={{ duration: 0.2 }}
              className="block transition-colors"
            >
              {link}
            </motion.span>
            <motion.div
              variants={{
                rest: { scaleX: 0, opacity: 0 },
                hover: { scaleX: 1, opacity: 1 }
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute -bottom-1.5 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center"
            />
          </motion.a>
        );
      })}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-20 pointer-events-none">
      
      {/* LAYER 1: Early Navigation (No Background, No Logo, Right-Aligned) */}
      <AnimatePresence>
        {!isActivated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="absolute inset-0 w-full px-6 py-5 flex items-center justify-end pointer-events-auto"
          >
            <div className="hidden md:flex items-center gap-8">
              {renderLinks('l1')}

              <motion.button 
                whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 16px rgba(212,175,55,0.6))' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuth?.('signup')}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="px-6 py-2.5 bg-[#D4AF37] text-black font-inter font-semibold text-sm tracking-widest uppercase rounded-full shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                Sign Up
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* LAYER 2: Activated Navbar (Glass Panel + Brand Logo + Links) */}
      <AnimatePresence>
        {isActivated && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 w-full bg-black/30 backdrop-blur-lg border-b border-white/5 py-4 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center justify-between"
          >
            {/* Left: Brand Logo (Appears ONLY in Layer 2) */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={(e) => handleScrollTo(e, 'final-cta')}
            >
              <DealDostLogo className="w-5 h-5" />
              <span className={`font-garet font-extrabold text-lg md:text-xl tracking-wide transition-all duration-700 ${activeSection === 'final-cta' ? 'drop-shadow-[0_0_12px_rgba(212,175,55,0.8)] text-[#F5F5F4]' : 'text-[#F5F5F4]'}`}>
                DealDost <span className="font-light text-[#D4AF37]">AI</span>
              </span>
            </div>

            {/* Right: Links & CTA */}
            <div className="hidden md:flex items-center gap-8">
              {renderLinks('l2')}

              <motion.button 
                whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 16px rgba(212,175,55,0.6))' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuth?.('signup')}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="px-6 py-2.5 bg-[#D4AF37] text-black font-inter font-semibold text-sm tracking-widest uppercase rounded-full shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                Sign Up
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      
    </div>
  );
}
