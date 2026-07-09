'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FilePlus, MessageSquare, RefreshCw, Clock, Inbox, Download, ChevronRight, History } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useContractWorkspace } from '@/context/ContractWorkspaceContext';

interface HistoryItem {
  id: string;
  action: string;
  type: 'generate' | 'chat' | 'update' | 'export';
  badge: string;
  badgeColor: string;
  title: string;
  timestamp: string;
  resourceType: string;
  resourceId?: string;
}

interface HistorySection {
  label: string;
  items: HistoryItem[];
}

const mapAction = (action: string) => {
  switch (action) {
    case 'contract_generated':
      return { type: 'generate' as const, badge: 'Contract', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
    case 'contract_updated':
      return { type: 'update' as const, badge: 'Updated', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20' };
    case 'contract_exported':
      return { type: 'export' as const, badge: 'Export', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
    case 'chat_started':
      return { type: 'chat' as const, badge: 'Chat', badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/20' };
    default:
      return { type: 'update' as const, badge: 'Activity', badgeColor: 'bg-white/10 text-[#A3A3A3] border-white/10' };
  }
};

const formatTimestamp = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const getIcon = (type: HistoryItem['type']) => {
  switch (type) {
    case 'generate': return <FilePlus className="w-4 h-4 text-amber-400" />;
    case 'chat': return <MessageSquare className="w-4 h-4 text-violet-400" />;
    case 'update': return <RefreshCw className="w-4 h-4 text-blue-400" />;
    case 'export': return <Download className="w-4 h-4 text-emerald-400" />;
  }
};

export default function HistoryWorkspace() {
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { loadConversation } = useChat();
  const { setActiveContract, setViewMode: setContractViewMode } = useContractWorkspace();

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/history?limit=50');
        const data = await res.json();
        
        if (res.ok && data.logs) {
          const grouped = groupLogsByDate(data.logs);
          setSections(grouped);
        }
      } catch (err) {
        console.error('Failed to load history logs', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const groupLogsByDate = (logs: any[]): HistorySection[] => {
    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const earlierItems: HistoryItem[] = [];
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    logs.forEach((log) => {
      const logDate = new Date(log.createdAt);
      const { type, badge, badgeColor } = mapAction(log.action);
      const item: HistoryItem = {
        id: log._id,
        action: log.action,
        type,
        badge,
        badgeColor,
        title: log.description,
        timestamp: formatTimestamp(log.createdAt),
        resourceType: log.resourceType,
        resourceId: log.resourceId,
      };

      if (logDate.toDateString() === now.toDateString()) {
        todayItems.push(item);
      } else if (logDate.toDateString() === yesterday.toDateString()) {
        yesterdayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    });

    const result: HistorySection[] = [];
    if (todayItems.length > 0) result.push({ label: 'Today', items: todayItems });
    if (yesterdayItems.length > 0) result.push({ label: 'Yesterday', items: yesterdayItems });
    if (earlierItems.length > 0) result.push({ label: 'Earlier', items: earlierItems });
    
    return result;
  };

  const handleItemClick = useCallback(async (item: HistoryItem) => {
    if (!item.resourceId) return;

    if (item.action === 'chat_started') {
      // Navigate to chat and load the conversation
      await loadConversation(item.resourceId);
      router.push('/dashboard/chat');
    } else if (['contract_generated', 'contract_updated', 'contract_exported'].includes(item.action)) {
      // Fetch the contract, load it into context, and navigate
      try {
        const res = await fetch(`/api/contracts/${item.resourceId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveContract(data.contract);
          setContractViewMode('preview');
          router.push('/dashboard/contracts');
        }
      } catch (err) {
        console.error('Failed to load contract', err);
      }
    }
  }, [loadConversation, setActiveContract, setContractViewMode, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050505] p-8">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-[#050505]">
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center px-8 bg-[#0D0D0D]/40 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
              Activity Timeline
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
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
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center px-8 bg-[#0D0D0D]/40 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
            Activity Timeline
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full px-8 py-16">
          {/* Page Title */}
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
            {sections.map((section) => (
              <div key={section.label} className="relative">
                {/* Section Label */}
                <h4 className="text-xs font-bold font-['Inter'] text-[#D4AF37] uppercase tracking-[0.2em] mb-6 pl-10 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                  {section.label}
                </h4>

                {/* Items List */}
                <div className="space-y-3 relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

                  {section.items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className={`group relative pl-10 ${item.resourceId ? 'cursor-pointer' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      {/* Item Dot/Icon Container */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full bg-[#0D0D0D] border border-white/10 flex items-center justify-center z-10 group-hover:border-[#D4AF37]/50 transition-colors">
                        {getIcon(item.type)}
                      </div>

                      {/* Content Card */}
                      <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl transition-all duration-300 ${item.resourceId ? 'group-hover:bg-white/[0.04] group-hover:border-white/10 group-hover:-translate-y-0.5' : ''}`}>
                        <div className="flex items-start justify-between gap-4 mb-1.5">
                          <div className="flex-1 min-w-0">
                            {/* Badge + Timestamp Row */}
                            <div className="flex items-center gap-2.5 mb-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[#666] font-mono uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                {item.timestamp}
                              </div>
                            </div>
                            {/* Title */}
                            <h5 className={`text-[15px] font-semibold text-[#E5E5E5] leading-snug truncate ${item.resourceId ? 'group-hover:text-white' : ''}`}>
                              {item.title}
                            </h5>
                          </div>
                          {/* Click Affordance Arrow */}
                          {item.resourceId && (
                            <div className="shrink-0 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
