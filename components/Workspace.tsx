'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import DealDostLogo from './DealDostLogo';
import LogoutModal from './LogoutModal';
import ContractWorkspace from './ContractWorkspace';
import ChatWorkspace from './ChatWorkspace';
import DocsWorkspace from './DocsWorkspace';
import HistoryWorkspace from './HistoryWorkspace';
import SettingsWorkspace from './SettingsWorkspace';

interface WorkspaceProps {
  onLogout: () => void;
}

const SIDEBAR_ITEMS = [
  { id: 'chat', label: 'Chat With AI', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'contracts', label: 'Contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'docs', label: 'Documents', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
  { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

const ACTION_CARDS = [
  { id: 1, title: 'Generate NDA', desc: 'Instantly create a secure Non-Disclosure Agreement.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 2, title: 'Create MSA', desc: 'Draft a Master Service Agreement for extensive deals.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 3, title: 'Start Escrow', desc: 'Secure funds safely while deliverables are met.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 4, title: 'Draft Agreement', desc: 'Start from scratch with a guided custom contract.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 5, title: 'Review Contract', desc: 'Upload a PDF and let AI identify loopholes.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 6, title: 'Legal Insights', desc: 'Analyze past contracts & clauses securely.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
];

export default function Workspace({ onLogout }: WorkspaceProps) {
  const [activeView, setActiveView] = useState('chat');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Parent variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const viewVariants = {
    hidden: { opacity: 0, x: 10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  useEffect(() => {
    const w = window as any;
    document.body.style.overflow = 'hidden';
    w.lenis?.stop();
    
    return () => {
      document.body.style.overflow = '';
      w.lenis?.start();
    };
  }, []);

  return (
    <motion.div
      id="app-ui"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex bg-[#050505] text-[#F5F5F4] overflow-hidden"
    >
      {/* Dynamic Background Blur / Glow Effect behind the main UI */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#D4AF37]/5 blur-[200px] pointer-events-none -z-10" />

      {/* LEFT SIDEBAR */}
      <motion.aside 
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-[260px] border-r border-white/5 bg-[#0D0D0D]/60 backdrop-blur-3xl flex flex-col pt-8 pb-6 px-4 z-10 shrink-0"
      >
        <div className="flex items-center gap-3 px-3 mb-10">
          <DealDostLogo className="w-8 h-8" />
          <h1 className="font-['Playfair_Display'] font-bold text-2xl tracking-wide select-none">
            DealDost <span className="font-light text-[#D4AF37]">AI</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1 mt-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] transition-all duration-300 ${
                activeView === item.id 
                  ? 'bg-white/10 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10' 
                  : 'text-[#A3A3A3] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <svg className={`w-5 h-5 ${activeView === item.id ? 'text-[#D4AF37]' : 'opacity-60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile Card */}
        <div className="mt-auto border-t border-white/5 pt-4">
          <div 
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer group ${
              activeView === 'settings' 
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                : 'bg-white/5 border-white/5 hover:border-[#D4AF37]/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] flex items-center justify-center font-bold text-black transition-all ${
              activeView === 'settings' ? 'shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-105' : 'shadow-[0_0_10px_rgba(212,175,55,0.3)]'
            }`}>
              JD
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className={`text-sm font-semibold truncate transition-colors ${activeView === 'settings' ? 'text-[#D4AF37]' : ''}`}>Jane Doe</span>
              <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider font-mono">Premium Plan</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLogoutModalOpen(true);
              }}
              className="text-[#A3A3A3] hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main data-lenis-prevent="true" className="flex-1 flex flex-col relative overflow-hidden h-screen">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={viewVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-full h-full"
          >
            {activeView === 'contracts' && <ContractWorkspace />}
            {activeView === 'docs' && <DocsWorkspace onNavigate={setActiveView} />}
            {activeView === 'history' && <HistoryWorkspace />}
            {activeView === 'settings' && <SettingsWorkspace />}
            {activeView === 'chat' && <ChatWorkspace />}
          </motion.div>
        </AnimatePresence>

      </main>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={onLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </motion.div>
  );
}
