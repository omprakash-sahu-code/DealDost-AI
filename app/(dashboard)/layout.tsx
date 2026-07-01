'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Disable scrolling for dashboard
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#D4AF37]/5 blur-[200px] pointer-events-none -z-10" />

      <Sidebar />

      <main data-lenis-prevent="true" className="flex-1 flex flex-col relative overflow-hidden h-screen">
        <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
      </main>
    </motion.div>
  );
}
