import React, { useState } from 'react';
import {
  Trophy,
  Lock,
  CheckCircle2,
  Share2,
  Sparkles,
  ShieldCheck,
  Sprout,
  Bike,
  Sun,
  Droplets,
  Salad,
  Flame,
  Wind,
  Globe,
  X,
  ExternalLink,
} from 'lucide-react';
import { Badge, BadgeRarity } from '../types';
import { soundManager } from '../utils/audio';

interface BadgeCollectionProps {
  badges: Badge[];
  onShareBadge: (badge: Badge) => void;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  badges,
  onShareBadge,
}) => {
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filteredBadges = badges.filter((b) => {
    const matchesRarity = filterRarity === 'all' || b.rarity === filterRarity;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'unlocked' && Boolean(b.unlockedAt)) ||
      (filterStatus === 'locked' && !b.unlockedAt);
    return matchesRarity && matchesStatus;
  });

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  const handleInspectBadge = (badge: Badge) => {
    soundManager.playClick();
    setSelectedBadge(badge);
  };

  function getRarityBadgeStyle(rarity: BadgeRarity) {
    switch (rarity) {
      case 'common':
        return {
          border: 'border-neutral-700/80',
          bg: 'bg-neutral-900/60',
          glow: 'group-hover:border-neutral-500',
          badgeText: 'text-neutral-300',
          tag: 'Common',
        };
      case 'rare':
        return {
          border: 'border-sky-800/80',
          bg: 'bg-sky-950/20',
          glow: 'group-hover:border-sky-500',
          badgeText: 'text-sky-300',
          tag: 'Rare',
        };
      case 'epic':
        return {
          border: 'border-purple-800/80',
          bg: 'bg-purple-950/20',
          glow: 'group-hover:border-purple-500',
          badgeText: 'text-purple-300',
          tag: 'Epic',
        };
      case 'legendary':
        return {
          border: 'border-amber-700/80',
          bg: 'bg-amber-950/20',
          glow: 'group-hover:border-amber-400',
          badgeText: 'text-amber-300',
          tag: 'Legendary',
        };
      case 'planetary_guardian':
        return {
          border: 'border-emerald-600/90 shadow-lg shadow-emerald-500/20',
          bg: 'bg-gradient-to-b from-emerald-950/40 to-teal-950/40',
          glow: 'group-hover:border-emerald-400 group-hover:shadow-emerald-500/30',
          badgeText: 'text-emerald-300',
          tag: 'Planetary Tier',
        };
    }
  }

  function getBadgeIcon(iconName: string, isUnlocked: boolean) {
    const className = `h-7 w-7 ${isUnlocked ? 'text-emerald-400' : 'text-neutral-500'}`;
    switch (iconName) {
      case 'Sprout':
        return <Sprout className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Bike':
        return <Bike className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Salad':
        return <Salad className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      default:
        return <Trophy className={className} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Hall of Custodians
          </span>
          <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white mt-0.5">
            Collectible Virtual Badges
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Permanent tokens awarded for sustained ecological habits and planetary impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300">
            <span className="font-medium text-emerald-400 font-mono tabular-nums">{unlockedCount}</span> /{' '}
            <span className="font-mono tabular-nums">{badges.length}</span> Collected
          </div>
        </div>
      </div>

      {/* Rarity & Status Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Rarity filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-900/80 rounded-xl border border-neutral-800/80 scrollbar-none">
          {[
            { id: 'all', label: 'All Rarities' },
            { id: 'common', label: 'Common' },
            { id: 'rare', label: 'Rare' },
            { id: 'epic', label: 'Epic' },
            { id: 'legendary', label: 'Legendary' },
            { id: 'planetary_guardian', label: 'Planetary Tier' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRarity(tab.id)}
              className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterRarity === tab.id
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 rounded-lg border border-neutral-800/80">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('unlocked')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'unlocked' ? 'bg-emerald-500/20 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilterStatus('locked')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'locked' ? 'bg-neutral-800 text-neutral-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const style = getRarityBadgeStyle(badge.rarity);
          const isUnlocked = Boolean(badge.unlockedAt);
          const progressPercent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => handleInspectBadge(badge)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.glow}`}
            >
              {/* Top Row: Rarity tag and unlock indicator */}
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${style.badgeText}`}>
                  {style.tag}
                </span>

                {isUnlocked ? (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Unlocked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Locked</span>
                  </div>
                )}
              </div>

              {/* Center Emblem Visual */}
              <div className="my-4 flex justify-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/90 shadow-inner group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {badge.image ? (
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className={`h-full w-full object-cover ${!isUnlocked && 'grayscale opacity-60'}`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    getBadgeIcon(badge.icon, isUnlocked)
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Badge Details */}
              <div className="text-center">
                <h3 className="font-['Outfit'] text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {badge.name}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar (if locked) or Reward XP (if unlocked) */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-semibold">+{badge.rewardXp} XP Awarded</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareBadge(badge);
                      }}
                      className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white transition-colors"
                    >
                      <Share2 className="h-3 w-3" />
                      <span>Share</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                      <span>Progress</span>
                      <span>
                        {badge.progress} / {badge.maxProgress} {badge.unit}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-emerald-900/80 bg-[#0b1410] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Big Emblem */}
              <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-neutral-900 shadow-xl overflow-hidden mb-4">
                {selectedBadge.image ? (
                  <img
                    src={selectedBadge.image}
                    alt={selectedBadge.name}
                    className={`h-full w-full object-cover ${!selectedBadge.unlockedAt && 'grayscale opacity-60'}`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  getBadgeIcon(selectedBadge.icon, Boolean(selectedBadge.unlockedAt))
                )}
              </div>

              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                {selectedBadge.rarity.replace('_', ' ').toUpperCase()} BADGE
              </span>
              <h3 className="font-['Outfit'] text-2xl font-bold text-white mt-1">
                {selectedBadge.name}
              </h3>
              <p className="text-xs font-semibold text-emerald-300 mt-0.5">
                "{selectedBadge.title}"
              </p>

              {/* Lore quote box */}
              <div className="mt-4 w-full rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 text-left">
                <span className="text-[11px] font-mono text-neutral-400 block mb-1 uppercase tracking-wider">
                  Custodial Lore
                </span>
                <p className="text-xs italic text-neutral-300 leading-relaxed font-serif">
                  "{selectedBadge.lore}"
                </p>
              </div>

              {/* Objective & Status */}
              <div className="mt-4 w-full text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Unlock Requirement</span>
                  <span className="font-medium text-neutral-200 text-right max-w-[240px]">
                    {selectedBadge.description}
                  </span>
                </div>

                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Status</span>
                  <span className="font-medium">
                    {selectedBadge.unlockedAt ? (
                      <span className="text-emerald-400">Unlocked & Verified</span>
                    ) : (
                      <span className="text-amber-400 font-mono">
                        {selectedBadge.progress} / {selectedBadge.maxProgress} {selectedBadge.unit}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between pb-1">
                  <span className="text-neutral-400">Reward Yield</span>
                  <span className="font-mono font-semibold text-emerald-400">+{selectedBadge.rewardXp} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="flex-1 rounded-lg border border-neutral-800 py-2.5 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Close
                </button>
                {selectedBadge.unlockedAt && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = selectedBadge;
                      setSelectedBadge(null);
                      onShareBadge(b);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Badge</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
