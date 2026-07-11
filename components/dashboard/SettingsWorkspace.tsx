'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Sliders, Bell, Mail, Lock, Camera, ChevronRight, ChevronDown, Globe, ShieldCheck, Eye, EyeOff, Sparkles, Info, BarChart3, AlertTriangle, CreditCard, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type SettingsTab = 'profile' | 'account' | 'security' | 'preferences' | 'usage' | 'billing';

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'usage', label: 'Check Usage', icon: BarChart3 },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
];

export default function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user, refreshUser } = useAuth();
  
  // Settings Form States
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaultContractType, setDefaultContractType] = useState<'nda' | 'msa' | 'freelance' | 'rental'>('nda');
  const [aiTone, setAiTone] = useState<'strict' | 'balanced' | 'flexible'>('balanced');
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('hinglish');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Usage Panel States
  const [usageData, setUsageData] = useState<{
    role: 'free' | 'premium';
    used: number;
    limit: number | null;
    remaining: number | null;
    dailyUsage: { date: string; count: number }[];
    recentGenerations: { id: string; title: string; createdAt: string }[];
  } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  // Billing States
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [tabNavOpen, setTabNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Fetch usage data when activeTab becomes 'usage'
  useEffect(() => {
    if (activeTab === 'usage') {
      const fetchUsage = async () => {
        setIsLoadingUsage(true);
        setUsageError(null);
        try {
          const res = await fetch('/api/user/usage');
          if (!res.ok) throw new Error('Failed to fetch usage analytics');
          const data = await res.json();
          setUsageData(data);
        } catch (err: any) {
          setUsageError(err.message || 'An error occurred');
        } finally {
          setIsLoadingUsage(false);
        }
      };
      fetchUsage();
    }
  }, [activeTab]);

  // Sync inputs with user object
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.preferences) {
        setDefaultContractType(user.preferences.defaultContractType || 'nda');
        setAiTone(user.preferences.aiTone || 'balanced');
        setLanguage(user.preferences.language || 'hinglish');
      }
    }
  }, [user]);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'DD';
    const parts = nameStr.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // 1. Save profile name if it changed
      if (name.trim() && name !== user?.name) {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to update profile name');
      }

      // 2. Save password if filled
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword) {
          throw new Error('Current and new passwords are required');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters long');
        }
        const res = await fetch('/api/user/password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update password');
        
        // Clear password fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      // 3. Save preferences if they changed
      const prefsChanged = 
        defaultContractType !== user?.preferences?.defaultContractType ||
        aiTone !== user?.preferences?.aiTone ||
        language !== user?.preferences?.language;
      
      if (prefsChanged) {
        const res = await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defaultContractType, aiTone, language }),
        });
        if (!res.ok) throw new Error('Failed to update workspace preferences');
      }

      // Refresh AuthContext user details
      await refreshUser();
      setSaveMessage({ text: 'Changes saved successfully!', isError: false });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('[Settings Save] Error:', err);
      setSaveMessage({ text: err.message || 'Failed to save changes.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRole = async (targetRole: 'free' | 'premium') => {
    setIsUpdatingRole(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/user/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update plan');
      await refreshUser();
      setSaveMessage({ text: `Successfully switched to ${targetRole} plan!`, isError: false });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('[Billing Change] Error:', err);
      setSaveMessage({ text: err.message || 'Failed to switch plan.', isError: true });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden"
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* MOBILE: Page-level header with inline dropdown */}
        {isMobile ? (
          <div className="border-b border-white/5 bg-[#0D0D0D]/40 backdrop-blur-3xl shrink-0">
            {/* Tappable header showing active tab */}
            <button
              onClick={() => setTabNavOpen(!tabNavOpen)}
              className="w-full flex items-center justify-between px-4 pl-14 py-4"
            >
              <div className="flex items-center gap-2.5">
                {(() => {
                  const activeTabData = SETTINGS_TABS.find(t => t.id === activeTab);
                  const ActiveIcon = activeTabData?.icon || Sliders;
                  return (
                    <>
                      <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                        <ActiveIcon className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-sm font-semibold text-white font-['Inter']">
                        {activeTabData?.label || 'Settings'}
                      </span>
                    </>
                  );
                })()}
              </div>
              <ChevronDown className={`w-4 h-4 text-[#A3A3A3] transition-transform duration-200 ${tabNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Inline accordion dropdown */}
            <AnimatePresence>
              {tabNavOpen && (
                <motion.nav
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="px-4 py-2 space-y-0.5">
                    {SETTINGS_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setTabNavOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-['Inter'] transition-all ${
                            isActive
                              ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                              : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'opacity-60'}`} />
                          <span className="font-medium">{tab.label}</span>
                          {isActive && <Check className="w-3.5 h-3.5 ml-auto text-[#D4AF37]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* DESKTOP: Original left sidebar nav */
          <aside className="w-64 border-r border-white/5 bg-[#0D0D0D]/40 backdrop-blur-3xl flex flex-col py-10 px-6 shrink-0">
            <h2 className="text-2xl font-['Playfair_Display'] font-semibold text-white mb-8 px-2">Settings</h2>
            <nav className="flex flex-col gap-2">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                        : 'text-[#A3A3A3] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'opacity-60'}`} />
                    <span className="font-medium">{tab.label}</span>
                    {isActive && <motion.div layoutId="activeTabIndicator" className="ml-auto w-1 h-4 bg-[#D4AF37] rounded-full" />}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* RIGHT CONTENT PANEL */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-12 lg:p-16 pb-24">
          <div className="max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6 sm:space-y-10">
                  <header>
                    <h3 className="text-xl sm:text-3xl font-['Playfair_Display'] font-semibold text-white mb-1 sm:mb-2">Profile Information</h3>
                    <p className="text-[#A3A3A3] text-xs sm:text-sm font-['Inter']">Update your personal details and how you appear on the platform.</p>
                  </header>

                  <div className="space-y-6 sm:space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="relative group">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.15)] transition-shadow duration-500 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]">
                          <div className="w-full h-full rounded-full bg-[#0D0D0D] flex items-center justify-center overflow-hidden">
                            <span className="text-lg sm:text-2xl font-bold text-[#D4AF37]">{user ? getInitials(name || user.name) : 'DD'}</span>
                          </div>
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-full bg-[#D4AF37] text-black shadow-lg hover:scale-110 transition-transform">
                          <Camera className="w-3 h-3 stroke-[3px]" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white font-semibold text-sm sm:text-base">Profile Photo</h4>
                        <p className="text-[#A3A3A3] text-xs">JPG, PNG or WEBP. Max 2MB.</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">Full Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all font-sans" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">Role / Profession</label>
                        <input type="text" defaultValue="Creative Entrepreneur" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all font-sans" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                          <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white/70 focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all cursor-not-allowed font-sans" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6 sm:space-y-10">
                  <header>
                    <h3 className="text-xl sm:text-3xl font-['Playfair_Display'] font-semibold text-white mb-1 sm:mb-2">Security Settings</h3>
                    <p className="text-[#A3A3A3] text-xs sm:text-sm font-['Inter']">Manage your credentials and enhance your account protection.</p>
                  </header>

                  <div className="space-y-8">
                    {/* Password Fields */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                          <input 
                            type={showCurrentPassword ? 'text' : 'password'} 
                            placeholder="Enter current password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all font-sans" 
                          />
                          <button 
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">New Password</label>
                          <div className="relative">
                            <input 
                              type={showNewPassword ? 'text' : 'password'} 
                              placeholder="Min. 8 chars" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all font-sans" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">Confirm New Password</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? 'text' : 'password'} 
                              placeholder="Re-type password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all font-sans" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div key="preferences" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6 sm:space-y-10">
                  <header>
                    <h3 className="text-xl sm:text-3xl font-['Playfair_Display'] font-semibold text-white mb-1 sm:mb-2">Workspace Preferences</h3>
                    <p className="text-[#A3A3A3] text-xs sm:text-sm font-['Inter']">Customize your AI's behavior and default legal parameters.</p>
                  </header>

                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-4 flex gap-4 items-start">
                    <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5 font-sans">
                        AI Configuration
                      </h4>
                      <p className="text-xs text-[#A3A3A3] font-['Inter'] leading-relaxed">
                        These settings directly control how DealDost AI extracts terms and drafts your final contracts. Changes here will apply to all new chats.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Default Contract Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">Default Contract Template</label>
                      <div className="relative">
                        <select 
                          value={defaultContractType}
                          onChange={(e) => setDefaultContractType(e.target.value as any)}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all appearance-none cursor-pointer font-sans"
                        >
                          <option value="nda" className="bg-[#0D0D0D] text-white">Non-Disclosure Agreement (NDA)</option>
                          <option value="msa" className="bg-[#0D0D0D] text-white">Master Service Agreement (MSA)</option>
                          <option value="freelance" className="bg-[#0D0D0D] text-white">Freelance Contract</option>
                          <option value="rental" className="bg-[#0D0D0D] text-white">Rental Agreement</option>
                        </select>
                      </div>
                    </div>

                    {/* AI Tone Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">AI Legal Tone</label>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {(['strict', 'balanced', 'flexible'] as const).map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setAiTone(tone)}
                            className={`px-4 py-4 rounded-xl border transition-all text-sm font-['Inter'] capitalize ${
                              aiTone === tone 
                                ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' 
                                : 'bg-white/[0.03] border-white/5 text-[#A3A3A3] hover:border-white/20'
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#A3A3A3] pl-1 italic">
                        * {aiTone === 'strict' ? 'Focuses on maximum liability protection.' : aiTone === 'balanced' ? 'Standard professional legal balance.' : 'Focuses on deal speed and collaboration.'}
                      </p>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1 font-mono">AI Interaction Language</label>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {(['en', 'hi', 'hinglish'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-4 py-4 rounded-xl border transition-all text-sm font-['Inter'] capitalize ${
                              language === lang 
                                ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' 
                                : 'bg-white/[0.03] border-white/5 text-[#A3A3A3] hover:border-white/20'
                            }`}
                          >
                            {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Hinglish'}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#A3A3A3] pl-1 italic">
                        * The language the AI uses when talking to you in the chat workspace.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'usage' && (
                <motion.div key="usage" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6 sm:space-y-10">
                  <header>
                    <h3 className="text-xl sm:text-3xl font-['Playfair_Display'] font-semibold text-white mb-1 sm:mb-2">Usage & Credits</h3>
                    <p className="text-[#A3A3A3] text-xs sm:text-sm font-['Inter']">Monitor your contract generation activity and limits.</p>
                  </header>

                  {isLoadingUsage ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                      <p className="text-[#A3A3A3] text-sm font-['Inter']">Loading your usage details...</p>
                    </div>
                  ) : usageError ? (
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm font-['Inter']">
                      Failed to load usage data: {usageError}
                    </div>
                  ) : usageData ? (
                    <div className="space-y-8">
                      {/* Plan Status Warning */}
                      {usageData.role === 'free' && usageData.used >= 10 && (
                        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex gap-4 items-start">
                          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-white font-['Inter']">Monthly Limit Reached</h4>
                            <p className="text-[#A3A3A3] text-xs font-['Inter'] leading-relaxed">
                              You have generated {usageData.used} of your {usageData.limit} contract allowance. Upgrade to Premium to lift this ceiling.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-0.5 font-mono">Current Plan</h4>
                            <p className="text-2xl font-['Playfair_Display'] font-semibold text-white capitalize">{usageData.role} Tier</p>
                          </div>
                          <p className="text-[#A3A3A3] text-xs font-['Inter']">
                            {usageData.role === 'free' ? 'Standard contract models, 10 limits/mo' : 'Unlimited generations, custom tones & models'}
                          </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-0.5 font-mono">Contracts Generated</h4>
                            <p className="text-2xl font-['Playfair_Display'] font-semibold text-white">
                              {usageData.used} <span className="text-sm font-sans text-[#A3A3A3] font-normal">/ {usageData.limit || 'Unlimited'}</span>
                            </p>
                          </div>
                          {/* Sleek Progress Bar */}
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                usageData.role === 'premium' 
                                  ? 'w-full bg-[#D4AF37]' 
                                  : usageData.used >= 10 
                                    ? 'bg-red-500' 
                                    : 'bg-[#D4AF37]'
                              }`}
                              style={{ width: usageData.role === 'premium' ? '100%' : `${Math.min(100, (usageData.used / 10) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-[#A3A3A3] italic pl-0.5">
                            Resets on the 1st of next month.
                          </p>
                        </div>
                      </div>

                      {/* Custom SVG Bar Chart */}
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-white font-['Inter']">Daily Generations (Last 7 Days)</h4>
                          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">Analytics</span>
                        </div>

                        <div className="w-full overflow-x-auto custom-scrollbar">
                          <div className="min-w-[500px] h-[220px] flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#D4AF37" />
                                  <stop offset="100%" stopColor="#8C7323" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>

                              {/* Draw Chart Grid Lines */}
                              <line x1="40" y1="30" x2="560" y2="30" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                              <line x1="40" y1="95" x2="560" y2="95" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                              <line x1="40" y1="160" x2="560" y2="160" stroke="white" strokeOpacity="0.1" />

                              {/* Render Bar Elements */}
                              {usageData.dailyUsage.map((day, i) => {
                                const maxVal = Math.max(...usageData.dailyUsage.map(d => d.count), 5);
                                const barWidth = 44;
                                const spacing = 68;
                                const startX = 48;
                                const x = startX + i * spacing;
                                const barHeight = (day.count / maxVal) * 130;
                                const y = 160 - barHeight;

                                return (
                                  <g key={i} className="group">
                                    {/* Column hover highlight */}
                                    <rect 
                                      x={x - 8} 
                                      y={20} 
                                      width={barWidth + 16} 
                                      height={155} 
                                      rx={8} 
                                      fill="white" 
                                      fillOpacity="0" 
                                      className="hover:fill-opacity-[0.02] cursor-pointer transition-all duration-200" 
                                    />
                                    {/* Actual Data Bar */}
                                    {barHeight > 0 && (
                                      <rect 
                                        x={x} 
                                        y={y} 
                                        width={barWidth} 
                                        height={barHeight} 
                                        rx={6} 
                                        fill="url(#barGradient)" 
                                        className="transition-all duration-300"
                                      />
                                    )}
                                    {/* Number Value Label */}
                                    <text 
                                      x={x + barWidth / 2} 
                                      y={y - 8} 
                                      textAnchor="middle" 
                                      className="fill-[#D4AF37] text-xs font-semibold font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                      {day.count}
                                    </text>
                                    {/* Date Label */}
                                    <text 
                                      x={x + barWidth / 2} 
                                      y={185} 
                                      textAnchor="middle" 
                                      className="fill-[#A3A3A3] text-[10px] font-sans group-hover:fill-white transition-colors duration-200"
                                    >
                                      {day.date}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Recent Generations Log */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white font-['Inter']">Recent Generations</h4>
                        <div className="rounded-2xl border border-white/5 overflow-hidden">
                          {usageData.recentGenerations.length === 0 ? (
                            <div className="p-8 text-center text-[#A3A3A3] text-xs font-['Inter'] bg-white/[0.01]">
                              No contracts generated yet.
                            </div>
                          ) : (
                            <div className="divide-y divide-white/5 bg-white/[0.01]">
                              {usageData.recentGenerations.map((gen) => (
                                <div key={gen.id} className="p-4 flex justify-between items-center">
                                  <div className="space-y-1 pr-4">
                                    <p className="text-sm font-medium text-white truncate max-w-md font-sans">{gen.title}</p>
                                    <p className="text-[10px] text-[#A3A3A3] font-mono">
                                      {new Date(gen.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Generated
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div key="billing" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6 sm:space-y-10">
                  <header>
                    <h3 className="text-xl sm:text-3xl font-['Playfair_Display'] font-semibold text-white mb-1 sm:mb-2">Billing & Plan</h3>
                    <p className="text-[#A3A3A3] text-xs sm:text-sm font-['Inter']">Manage your subscription, pricing, and view invoice history.</p>
                  </header>

                  {/* Plan Comparison Grid */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-white font-['Inter']">Subscription Plans</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Free Plan */}
                      <div className={`p-6 rounded-2xl bg-white/[0.03] border transition-all duration-300 flex flex-col justify-between ${
                        user?.role !== 'premium' 
                          ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                          : 'border-white/5'
                      }`}>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-0.5 font-mono">Free Tier</p>
                              <h5 className="text-xl font-semibold text-white mt-1">Standard</h5>
                            </div>
                            <span className="text-2xl font-bold text-[#D4AF37] font-['Playfair_Display']">₹0 <span className="text-xs font-sans text-[#A3A3A3] font-normal">/ mo</span></span>
                          </div>
                          <p className="text-[#A3A3A3] text-xs leading-relaxed">
                            Perfect for freelancers getting started with basic deal negotiations.
                          </p>
                          <ul className="space-y-2.5 pt-2">
                            {['10 Contracts / Month', 'Standard AI Legal Engine', 'Web Export & Share Links'].map((feat, i) => (
                              <li key={i} className="text-xs text-[#F5F5F4] flex items-center gap-2 font-medium">
                                <span className="text-[#D4AF37]">✦</span> {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-6">
                          <button
                            disabled={user?.role !== 'premium' || isUpdatingRole}
                            onClick={() => handleToggleRole('free')}
                            className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-white/5 disabled:hover:text-white"
                          >
                            {user?.role !== 'premium' ? 'Current Plan' : 'Downgrade to Free (Test)'}
                          </button>
                        </div>
                      </div>

                      {/* Premium Plan */}
                      <div className={`p-6 rounded-2xl bg-white/[0.03] border transition-all duration-300 flex flex-col justify-between ${
                        user?.role === 'premium' 
                          ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                          : 'border-white/5'
                      }`}>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-0.5 font-mono">Premium Tier</p>
                              <h5 className="text-xl font-semibold text-white mt-1">DealDost Pro</h5>
                            </div>
                            <span className="text-2xl font-bold text-[#D4AF37] font-['Playfair_Display']">₹1,499 <span className="text-xs font-sans text-[#A3A3A3] font-normal">/ mo</span></span>
                          </div>
                          <p className="text-[#A3A3A3] text-xs leading-relaxed">
                            For agencies and creators who need unlimited scaling and advanced dispute protections.
                          </p>
                          <ul className="space-y-2.5 pt-2">
                            {['Unlimited Contract Generations', 'Advanced AI Legal Tones (Strict/Flexible)', 'Milestone Escrow Integration', 'Custom Legal Clauses'].map((feat, i) => (
                              <li key={i} className="text-xs text-[#F5F5F4] flex items-center gap-2 font-medium">
                                <span className="text-[#D4AF37]">✦</span> {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-6">
                          <button
                            disabled={user?.role === 'premium' || isUpdatingRole}
                            onClick={() => handleToggleRole('premium')}
                            className="w-full py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:bg-white/5 disabled:text-white disabled:cursor-not-allowed"
                          >
                            {user?.role === 'premium' ? 'Current Plan' : 'Upgrade to Premium (Test)'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pay-As-You-Go Section */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-semibold text-white font-['Inter']">Pay-As-You-Go Single Drafts</h4>
                      <span className="text-[10px] text-[#A3A3A3] italic">Available without a subscription</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <h5 className="text-sm font-semibold text-white font-sans">Idea Protection (NDA)</h5>
                        <p className="text-2xl font-bold text-[#D4AF37] font-['Playfair_Display']">₹499</p>
                        <p className="text-[10px] text-[#A3A3A3] leading-relaxed">One-time generation fee. Standard NDA with global validity.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <h5 className="text-sm font-semibold text-white font-sans">Master Service Agreement (MSA)</h5>
                        <p className="text-2xl font-bold text-[#D4AF37] font-['Playfair_Display']">₹999</p>
                        <p className="text-[10px] text-[#A3A3A3] leading-relaxed">One-time generation fee. Complete freelance & agency contract terms.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <h5 className="text-sm font-semibold text-white font-sans">Milestone Escrow Fee</h5>
                        <p className="text-2xl font-bold text-[#D4AF37] font-['Playfair_Display']">1.5% <span className="text-[10px] font-normal text-[#A3A3A3]">per deal</span></p>
                        <p className="text-[10px] text-[#A3A3A3] leading-relaxed">Charged upon verification & release of milestone payouts.</p>
                      </div>
                    </div>
                  </div>

                  {/* Mock Billing Ledger */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white font-['Inter']">Billing History</h4>
                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                      <div className="divide-y divide-white/5 bg-white/[0.01]">
                        {/* Show standard invoices */}
                        <div className="p-4 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">Invoice #INV-2983</p>
                            <p className="text-[#A3A3A3] font-mono">July 09, 2026</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-semibold text-white">{user?.role === 'premium' ? '₹1,499' : '₹0'}</p>
                            <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Paid</span>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">Invoice #INV-2102</p>
                            <p className="text-[#A3A3A3] font-mono">June 09, 2026</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-semibold text-white">{user?.role === 'premium' ? '₹1,499' : '₹0'}</p>
                            <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Paid</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button Footer */}
            {activeTab !== 'usage' && activeTab !== 'billing' ? (
              <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto px-10 py-4 bg-[#D4AF37] hover:bg-[#C5A059] text-black font-bold text-sm uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>

                {saveMessage && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-semibold font-['Inter'] ${saveMessage.isError ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {saveMessage.text}
                  </motion.span>
                )}
              </footer>
            ) : (
              saveMessage && (
                <div className="mt-8 flex justify-start">
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-semibold font-['Inter'] ${saveMessage.isError ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {saveMessage.text}
                  </motion.span>
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
}
