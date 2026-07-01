'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Sliders, Bell, Mail, Lock, Camera, ChevronRight, Globe, ShieldCheck } from 'lucide-react';

type SettingsTab = 'profile' | 'account' | 'security' | 'preferences' | 'notifications';

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [contractTone, setContractTone] = useState<'strict' | 'balanced' | 'flexible'>('balanced');

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
      <div className="flex h-full">
        {/* LEFT SIDEBAR (SETTINGS NAV) */}
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

        {/* RIGHT CONTENT PANEL */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-16">
          <div className="max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-10">
                  <header>
                    <h3 className="text-3xl font-['Playfair_Display'] font-semibold text-white mb-2">Profile Information</h3>
                    <p className="text-[#A3A3A3] text-sm font-['Inter']">Update your personal details and how you appear on the platform.</p>
                  </header>

                  <div className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8C7323] p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.15)] transition-shadow duration-500 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]">
                          <div className="w-full h-full rounded-full bg-[#0D0D0D] flex items-center justify-center overflow-hidden">
                            <span className="text-2xl font-bold text-[#D4AF37]">JD</span>
                          </div>
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 rounded-full bg-[#D4AF37] text-black shadow-lg hover:scale-110 transition-transform">
                          <Camera className="w-3 h-3 stroke-[3px]" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white font-semibold">Profile Photo</h4>
                        <p className="text-[#A3A3A3] text-xs">JPG, PNG or WEBP. Max 2MB.</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">Full Name</label>
                        <input type="text" defaultValue="Jane Doe" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">Role / Profession</label>
                        <input type="text" defaultValue="Creative Entrepreneur" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                          <input type="email" defaultValue="jane@dealdost.ai" className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-10">
                  <header>
                    <h3 className="text-3xl font-['Playfair_Display'] font-semibold text-white mb-2">Security Settings</h3>
                    <p className="text-[#A3A3A3] text-sm font-['Inter']">Manage your credentials and enhance your account protection.</p>
                  </header>

                  <div className="space-y-8">
                    {/* Password Fields */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                          <input type="password" placeholder="••••••••" className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">New Password</label>
                          <input type="password" placeholder="Min. 8 chars" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">Confirm New Password</label>
                          <input type="password" placeholder="Re-type password" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* 2FA Toggle */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Two-Factor Authentication</h4>
                          <p className="text-[#A3A3A3] text-xs">Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${is2FAEnabled ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: is2FAEnabled ? 26 : 4 }}
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div key="preferences" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-10">
                  <header>
                    <h3 className="text-3xl font-['Playfair_Display'] font-semibold text-white mb-2">Workspace Preferences</h3>
                    <p className="text-[#A3A3A3] text-sm font-['Inter']">Customize your AI's behavior and default legal parameters.</p>
                  </header>

                  <div className="space-y-8">
                    {/* Default Contract Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">Default Contract Template</label>
                      <select className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all appearance-none cursor-pointer">
                        <option value="nda">Non-Disclosure Agreement (NDA)</option>
                        <option value="msa">Master Service Agreement (MSA)</option>
                        <option value="freelance">Freelance Contract</option>
                      </select>
                    </div>

                    {/* AI Tone Selection */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest pl-1">AI Legal Tone</label>
                      <div className="grid grid-cols-3 gap-4">
                        {(['strict', 'balanced', 'flexible'] as const).map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setContractTone(tone)}
                            className={`px-4 py-4 rounded-xl border transition-all text-sm font-['Inter'] capitalize ${
                              contractTone === tone 
                                ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' 
                                : 'bg-white/[0.03] border-white/5 text-[#A3A3A3] hover:border-white/20'
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#A3A3A3] pl-1 italic">
                        * {contractTone === 'strict' ? 'Focuses on maximum liability protection.' : contractTone === 'balanced' ? 'Standard professional legal balance.' : 'Focuses on deal speed and collaboration.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button Footer */}
            <footer className="mt-16 pt-8 border-t border-white/5">
              <button className="w-full md:w-auto px-10 py-4 bg-[#D4AF37] hover:bg-[#C5A059] text-black font-bold text-sm uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95">
                Save Changes
              </button>
            </footer>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
