'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync initial mode when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setError('');
      setIsAuthenticating(false);
    }
  }, [isOpen, initialMode]);

  // Prevent background scrolling properly with Lenis
  useEffect(() => {
    // We cast window to any to access the lenis instance exposed in SmoothScroll
    const w = window as any;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      w.lenis?.stop();
    } else {
      document.body.style.overflow = '';
      w.lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      w.lenis?.start();
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setIsAuthenticating(true);
    
    // Basic validation passed, simulate success
    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1200); // 1.2s delay for entry animation to feel real
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-[12px]"
            onClick={onClose}
          />

          {/* Modal Panel Container */}
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.96, 
                filter: 'blur(6px)' 
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                filter: 'blur(0px)' 
              }}
              exit={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.96, 
                filter: 'blur(6px)' 
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="relative w-full max-w-[400px] p-7 md:p-8 rounded-[18px] bg-white/[0.05] backdrop-blur-[16px] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Icon */}
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors p-1"
                aria-label="Close Modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="text-center mb-8 mt-2">
                <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-2 tracking-tight">
                  Welcome to DealDost
                </h2>
                <p className="text-sm font-['Inter'] text-[#A3A3A3] leading-relaxed">
                  Secure your deals with AI-powered contracts
                </p>
              </div>

              {/* Form Content Wrapper for smooth mode transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-['Inter']">
                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-[#EDEDED] text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300"
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-[#EDEDED] text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300"
                        required
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <p className="text-red-400 text-xs text-center mt-1">{error}</p>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      disabled={isAuthenticating}
                      whileHover={{ scale: isAuthenticating ? 1 : 1.02, filter: isAuthenticating ? 'none' : 'drop-shadow(0 0 15px rgba(212,175,55,0.4))' }}
                      whileTap={{ scale: isAuthenticating ? 1 : 0.98 }}
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-[#E5C048] text-[#0D0D0D] font-bold text-[15px] py-3.5 rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.2)] mt-3 transition-all tracking-wide disabled:opacity-80 flex items-center justify-center gap-2"
                      type="submit"
                    >
                      {isAuthenticating ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        mode === 'signup' ? 'Create Account' : 'Login'
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </AnimatePresence>

              {/* Toggle Mode */}
              <div className="mt-7 text-center">
                <p className="text-sm font-['Inter'] text-[#8A8A8A]">
                  {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                  <button 
                    onClick={toggleMode}
                    className="text-[#D4AF37] font-semibold hover:text-[#E5C048] hover:underline underline-offset-4 transition-colors focus:outline-none"
                  >
                    {mode === 'signup' ? 'Login' : 'Sign Up'}
                  </button>
                </p>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
