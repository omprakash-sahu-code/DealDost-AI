'use client';

import { motion } from 'framer-motion';
import { FilePlus, MessageSquare, RefreshCw, Clock, Inbox } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'generate' | 'chat' | 'update';
  title: string;
  description: string;
  timestamp: string;
}

interface HistorySection {
  label: string;
  items: HistoryItem[];
}

const MOCK_HISTORY: HistorySection[] = [
  {
    label: 'Today',
    items: [
      { id: '1', type: 'generate', title: 'NDA Generated', description: 'Generated a Non-Disclosure Agreement for "Project X"', timestamp: '2 mins ago' },
      { id: '2', type: 'chat', title: 'Legal Consultation', description: 'Asked about IP protection clauses in India', timestamp: '1 hour ago' },
    ]
  },
  {
    label: 'Yesterday',
    items: [
      { id: '3', type: 'update', title: 'Contract Updated', description: 'Revised payment milestones for Freelance Agreement', timestamp: 'Yesterday, 4:30 PM' },
      { id: '4', type: 'generate', title: 'MSA Drafted', description: 'Created a Master Service Agreement for "Studio Alpha"', timestamp: 'Yesterday, 11:15 AM' },
    ]
  },
  {
    label: 'Earlier',
    items: [
      { id: '5', type: 'chat', title: 'Escrow Inquiry', description: 'Discussed secure payment releases with AI', timestamp: 'Mar 25, 2:00 PM' },
    ]
  }
];

const getIcon = (type: HistoryItem['type']) => {
  switch (type) {
    case 'generate': return <FilePlus className="w-4 h-4 text-[#D4AF37]" />;
    case 'chat': return <MessageSquare className="w-4 h-4 text-[#D4AF37]" />;
    case 'update': return <RefreshCw className="w-4 h-4 text-[#D4AF37]" />;
  }
};

export default function HistoryWorkspace() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  if (MOCK_HISTORY.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 mx-auto">
            <Inbox className="w-10 h-10 text-[#A3A3A3]/30" />
          </div>
          <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-white mb-3">No Activity Yet</h3>
          <p className="text-[#A3A3A3] font-['Inter'] text-sm leading-relaxed">
            Your actions will appear here once you start using DealDost AI.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-['Playfair_Display'] font-semibold text-white mb-2">Activity <span className="text-[#D4AF37]">History</span></h2>
          <p className="text-[#A3A3A3] text-sm font-['Inter'] tracking-wide">A timeline of your legal interactions and generations.</p>
        </div>

        {/* Timeline Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {MOCK_HISTORY.map((section) => (
            <div key={section.label} className="relative">
              {/* Section Label */}
              <h4 className="text-xs font-bold font-['Inter'] text-[#D4AF37] uppercase tracking-[0.2em] mb-6 pl-10 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                {section.label}
              </h4>

              {/* Items List */}
              <div className="space-y-4 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

                {section.items.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="group relative pl-10"
                  >
                    {/* Item Dot/Icon Container */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full bg-[#0D0D0D] border border-white/10 flex items-center justify-center z-10 group-hover:border-[#D4AF37]/50 transition-colors">
                      {getIcon(item.type)}
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl group-hover:bg-white/[0.04] group-hover:border-white/10 group-hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h5 className="text-base font-semibold text-white group-hover:text-[#D4AF37] transition-colors">{item.title}</h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </div>
                      </div>
                      <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-2xl">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
