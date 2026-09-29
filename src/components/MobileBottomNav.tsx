import React from 'react';
import { Home, CheckSquare, Trophy, Globe, Bot, User, Share2 } from 'lucide-react';
import { NavTabType } from './Navbar';
import { soundManager } from '../utils/audio';

interface MobileBottomNavProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenProfile: () => void;
  userAvatar: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  userAvatar,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'habits' as NavTabType,
      label: 'Habits',
      icon: CheckSquare,
    },
    {
      id: 'badges' as NavTabType,
      label: 'Badges',
      icon: Trophy,
    },
    {
      id: 'ai' as NavTabType,
      label: 'Ask AI',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'leaderboards' as NavTabType,
      label: 'Ranks',
      icon: Globe,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-emerald-950/80 bg-[#07130e]/95 backdrop-blur-lg px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-transform ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white scale-110 shadow-md shadow-emerald-950'
                      : 'bg-emerald-500/20 text-emerald-400 scale-105'
                    : item.highlight
                    ? 'text-cyan-400'
                    : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && !item.highlight && (
                <span className="absolute -top-1 h-1 w-6 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}

        {/* Profile Avatar Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenProfile();
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-neutral-400 hover:text-white transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-base">
            {userAvatar}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
