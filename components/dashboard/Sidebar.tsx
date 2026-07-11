'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DealDostLogo from '@/components/shared/DealDostLogo';
import LogoutModal from '@/components/auth/LogoutModal';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const SIDEBAR_ITEMS = [
  { id: 'chat', label: 'Chat With AI', href: '/dashboard/chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'contracts', label: 'Contracts', href: '/dashboard/contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'docs', label: 'Documents', href: '/dashboard/documents', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
  { id: 'history', label: 'History', href: '/dashboard/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    await logout();
  };

  const getInitials = (name: string) => {
    if (!name) return 'DD';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderContent = () => (
    <>
      <div className="flex items-center justify-between px-3 mb-10">
        <div className="flex items-center gap-3">
          <DealDostLogo className="w-8 h-8" />
          <h1 className="font-['Playfair_Display'] font-bold text-2xl tracking-wide select-none">
            DealDost <span className="font-light text-[#D4AF37]">AI</span>
          </h1>
        </div>
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-[#A3A3A3] hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1 mt-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] transition-all duration-300 ${
                isActive
                  ? 'bg-white/10 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10' 
                  : 'text-[#A3A3A3] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <svg className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'opacity-60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="mt-auto border-t border-white/5 pt-4">
        <div 
          onClick={() => {
            router.push('/dashboard/settings');
            if (isMobile) setIsOpen(false);
          }}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer group ${
            pathname === '/dashboard/settings' 
              ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
              : 'bg-white/5 border-white/5 hover:border-[#D4AF37]/30'
          }`}
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] flex items-center justify-center font-bold text-black transition-all ${
            pathname === '/dashboard/settings' ? 'shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-105' : 'shadow-[0_0_10px_rgba(212,175,55,0.3)]'
          }`}>
            {user ? getInitials(user.name) : 'DD'}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className={`text-sm font-semibold truncate transition-colors ${pathname === '/dashboard/settings' ? 'text-[#D4AF37]' : ''}`}>{user?.name || 'Loading...'}</span>
            <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider font-mono">
              {user?.role === 'premium' ? 'Premium Plan' : 'Free Plan'}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLogoutModalOpen(true);
            }}
            className={`text-[#A3A3A3] hover:text-white p-1 transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-3.5 left-4 z-40 w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center bg-[#050505]/80 backdrop-blur-md text-[#F5F5F4] active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Collapsible Mobile Drawer */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Dark overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                />

                {/* Sliding Sidebar drawer */}
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-[260px] border-r border-white/5 bg-[#0D0D0D]/95 backdrop-blur-xl flex flex-col pt-8 pb-6 px-4 z-[120] h-screen"
                >
                  {renderContent()}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Permanent Desktop Sidebar */
        <motion.aside 
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="w-[260px] border-r border-white/5 bg-[#0D0D0D]/60 backdrop-blur-3xl flex flex-col pt-8 pb-6 px-4 z-10 shrink-0 h-screen sticky top-0"
        >
          {renderContent()}
        </motion.aside>
      )}

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={handleLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </>
  );
}
