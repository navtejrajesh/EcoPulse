import React from 'react';
import { Volume2, VolumeX, Flame, Share2, Bot } from 'lucide-react';
import { UserProfile } from '../types';

export type NavTabType = 'dashboard' | 'habits' | 'badges' | 'leaderboards' | 'tips' | 'share' | 'ai';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  user: UserProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
  onOpenShare,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/80 bg-[#09120e]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover:scale-105 transition-transform">
              <span className="text-base font-bold">EP</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="font-['Outfit'] text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              EcoPulse
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'habits'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Daily Habits
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'badges'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveTab('leaderboards')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'leaderboards'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Leaderboards
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Wisdom & Tips
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'share'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Share Studio
          </button>
          {/* Ask AI Tab */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-cyan-400/90 hover:text-cyan-200 hover:bg-cyan-950/30'
            }`}
          >
            <Bot className="h-4 w-4 text-cyan-400" />
            <span>Ask AI</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Quick Profile Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick AI button for medium screens */}
          <button
            onClick={() => setActiveTab('ai')}
            className="flex lg:hidden items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition-colors"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </button>

          {/* Quick Streak Indicator */}
          <div
            title={`${user.streak}-day streak active`}
            className="flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono tabular-nums">{user.streak}d</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute environmental audio' : 'Enable audio'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Share Trigger */}
          <button
            onClick={onOpenShare}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500/60 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>

          {/* Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-sm">{user.avatar}</span>
            <span className="hidden lg:inline font-medium max-w-[90px] truncate">{user.name}</span>
            <span className="font-mono text-emerald-400 text-[11px] font-semibold">Lv.{user.level}</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="flex lg:hidden overflow-x-auto border-t border-neutral-900/80 px-4 py-2 gap-2 text-xs scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'habits', label: 'Habits' },
          { id: 'badges', label: 'Badges' },
          { id: 'leaderboards', label: 'Leaderboard' },
          { id: 'tips', label: 'Wisdom' },
          { id: 'ai', label: '✨ Ask AI' },
          { id: 'share', label: 'Share' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
