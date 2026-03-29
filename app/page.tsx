'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeroCanvasAnimation from '@/components/HeroCanvasAnimation';
import ServiceShowcase from '@/components/ServiceShowcase';
import ProcessFeatures from '@/components/ProcessFeatures';
import FinalCTA from '@/components/FinalCTA';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Workspace from '@/components/Workspace';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };
  useEffect(() => {
    // Force the browser to start at the top on refresh to sync Canvas frames
    window.scrollTo(0, 0);
    // Removed scrollBehavior to avoid Lenis conflict
  }, []);

  return (
    <main className="bg-[#0D0D0D] min-h-screen selection:bg-[#D4AF37] selection:text-black">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Navbar onOpenAuth={openAuthModal} />
      
      {/* 1. HERO: The Scroll-Triggered Scale & Chat Transformation */}
      <HeroCanvasAnimation onOpenAuth={openAuthModal} />

      {/* 2. SERVICES: The 'Idea-to-Contract' Catalog */}
      <section className="relative z-10 bg-[#0D0D0D]">
        <ServiceShowcase onOpenAuth={openAuthModal} />
      </section>

      {/* 3. PROCESS: Deep-dive into AI Balancing & Secure Escrow */}
      <ProcessFeatures />

      {/* 4. CLOSING: Final 'Get Started' Call-to-Action */}
      <FinalCTA onOpenAuth={openAuthModal} />
      
            {/* Footer Branding Overlay */}
            <footer className="py-12 text-center border-t border-white/5 bg-[#0D0D0D] relative z-20">
              <p className="text-[#D4AF37] font-['Playfair_Display'] text-2xl opacity-90 tracking-wide mb-3">
                Deal-Dost AI &copy; 2026
              </p>
              <p className="text-white/30 text-[10px] md:text-xs font-['Inter'] tracking-[0.3em] uppercase">
                Precision. Trust. Speed.
              </p>
            </footer>
          </motion.div>
        ) : (
          <Workspace key="workspace" onLogout={() => setIsLoggedIn(false)} />
        )}
      </AnimatePresence>
      
      {/* 5. AUTH MODAL */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsLoggedIn(true)}
        initialMode={authMode}
      />
    </main>
  );
}
