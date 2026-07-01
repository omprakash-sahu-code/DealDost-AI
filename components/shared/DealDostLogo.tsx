'use client';
import { motion } from 'framer-motion';

export default function DealDostLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} shrink-0`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-full h-full text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
      >
        <path d="M12 3V21" />
        <path d="M9 21H15" />
        <path d="M5 6H19" />
        <path d="M5 6L2 14H8L5 6Z" />
        <path d="M19 6L16 14H22L19 6Z" />
      </svg>
    </div>
  );
}
