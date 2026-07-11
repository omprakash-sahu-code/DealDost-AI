'use client';
import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import DealDostLogo from '@/components/shared/DealDostLogo';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function Navbar({ onOpenAuth }: { onOpenAuth: (mode: 'login'|'signup') => void }) {
  const { scrollYProgress, scrollY } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const [isActivated, setIsActivated] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileScrolled, setMobileScrolled] = useState(false);

  // Syncs activation exactly with the Hero Canvas CTA threshold (~50%) for desktop
  useEffect(() => {
    if (isMobile) return;
    const unsub = smoothProgress.on('change', (latest) => {
      if (latest >= 0.48 && !isActivated) setIsActivated(true);
      else if (latest < 0.45 && isActivated) setIsActivated(false);
    });
    return () => unsub();
  }, [smoothProgress, isActivated, isMobile]);

  // Track scroll position on mobile for background transition
  useEffect(() => {
    if (!isMobile) return;
    const unsub = scrollY.on('change', (latest) => {
      setMobileScrolled(latest > 50);
    });
    return () => unsub();
  }, [scrollY, isMobile]);

  // Scroll Spy to track active section
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let current = 'home';
          const visualOrderReversed = ['final-cta', 'features', 'pricing', 'home'];
          
          for (const id of visualOrderReversed) {
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
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
    
    const y = element.getBoundingClientRect().top + window.scrollY - 100;
    
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(y, {
        duration: 1.2,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleMobileLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Let menu close animation play before scrolling
    setTimeout(() => {
      const element = document.getElementById(id);
      if (!element) return;
      
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.scrollTo(y, { duration: 1.2 });
      } else {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 200);
  };

  const LINKS = ['Home', 'Pricing', 'Features', 'Login'];

  const renderLinks = (prefix: string) => (
    <div className="flex items-center gap-7 text-sm font-inter font-medium text-[#F5F5F4]/70">
      {LINKS.map((link) => {
        const linkId = link.toLowerCase();
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

  // Responsive Mobile Navbar View
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-20 pointer-events-auto">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full h-20 px-6 flex items-center justify-between transition-all duration-300 ${
            mobileScrolled 
              ? 'bg-[#0D0D0D]/85 backdrop-blur-lg border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
              : 'bg-transparent'
          }`}
        >
          {/* Logo & Title */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={(e) => handleMobileLinkClick(e, 'home')}
          >
            <DealDostLogo className="w-5 h-5" />
            <span className="font-garet font-extrabold text-lg tracking-wide text-[#F5F5F4]">
              DealDost <span className="font-light text-[#D4AF37]">AI</span>
            </span>
          </div>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center bg-black/35 backdrop-blur-sm text-[#F5F5F4] active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </motion.nav>

        {/* Mobile Menu Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[110] bg-[#0D0D0D]/98 backdrop-blur-xl flex flex-col justify-between px-6 py-8"
            >
              {/* Header row inside Drawer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <DealDostLogo className="w-5 h-5" />
                  <span className="font-garet font-extrabold text-lg tracking-wide text-[#F5F5F4]">
                    DealDost <span className="font-light text-[#D4AF37]">AI</span>
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center bg-black/30 text-[#F5F5F4] active:scale-95 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Links list */}
              <div className="flex flex-col items-center gap-8 text-2xl font-inter font-semibold my-auto">
                <a href="#home" onClick={(e) => handleMobileLinkClick(e, 'home')} className="text-[#F5F5F4]/80 active:text-[#D4AF37] hover:text-[#D4AF37] transition-colors">Home</a>
                <a href="#pricing" onClick={(e) => handleMobileLinkClick(e, 'pricing')} className="text-[#F5F5F4]/80 active:text-[#D4AF37] hover:text-[#D4AF37] transition-colors">Pricing</a>
                <a href="#features" onClick={(e) => handleMobileLinkClick(e, 'features')} className="text-[#F5F5F4]/80 active:text-[#D4AF37] hover:text-[#D4AF37] transition-colors">Features</a>
                <a href="#login" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onOpenAuth?.('login'); }} className="text-[#F5F5F4]/80 active:text-[#D4AF37] hover:text-[#D4AF37] transition-colors">Login</a>
              </div>

              {/* Sign Up Action Button at bottom */}
              <div className="w-full">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onOpenAuth?.('signup'); }}
                  className="w-full py-4 bg-[#D4AF37] text-black font-inter font-extrabold text-xs tracking-[0.2em] uppercase rounded-lg shadow-[0_4px_15px_rgba(212,175,55,0.3)] active:scale-[0.98] transition-transform"
                >
                  Sign Up Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop Navbar View
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
            {/* Left: Brand Logo */}
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
