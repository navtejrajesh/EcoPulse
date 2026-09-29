import React from 'react';
import { Sparkles, Trophy, ArrowUpRight, Leaf, Shield } from 'lucide-react';
import { UserProfile, Habit, Badge } from '../types';

interface TerrariumWidgetProps {
  user: UserProfile;
  habits: Habit[];
  badges: Badge[];
  onViewBadges: () => void;
  onOpenShare: () => void;
}

export const TerrariumWidget: React.FC<TerrariumWidgetProps> = ({
  user,
  habits,
  badges,
  onViewBadges,
  onOpenShare,
}) => {
  const completedTodayCount = habits.filter((h) => h.completedToday).length;
  const totalHabitsCount = habits.length;
  const completionRatio = totalHabitsCount > 0 ? completedTodayCount / totalHabitsCount : 0;

  // Level XP math (e.g. 500 XP per level)
  const xpInCurrentLevel = user.xp % 500;
  const xpNeeded = 500;
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  // Next badge to unlock
  const nextBadge = badges.find((b) => !b.unlockedAt) || badges[0];
  const unlockedBadgesCount = badges.filter((b) => b.unlockedAt).length;

  // Vitality calculation
  const vitalityScore = Math.min(100, Math.round(50 + completionRatio * 40 + (user.streak > 3 ? 10 : user.streak * 3)));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-900/50 bg-gradient-to-b from-[#0e1f18] via-[#091510] to-[#070f0c] p-6 lg:p-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Living Biome Artwork */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div className="relative group">
            {/* Pulsing ring aura */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-lg transition duration-700 group-hover:scale-105" />

            <div className="relative h-56 w-56 sm:h-64 sm:w-64 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/60 bg-emerald-950">
              <img
                src="/src/assets/images/ecopulse_biome_terrarium_1790695684215.jpg"
                alt="EcoPulse Living Biosphere Terrarium"
                className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Status pill overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Living Terrarium</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">{vitalityScore}% Health</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Thrives with each sustainable habit you complete</span>
          </div>
        </div>

        {/* Right: User Stats, Level Progression & Highlights */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  Personal Environmental Sentinel
                </span>
                <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Welcome back, {user.name}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  <span>Share Impact</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Level & XP Bar */}
            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 font-mono font-bold text-emerald-400 text-xs">
                    {user.level}
                  </div>
                  <span className="font-semibold text-neutral-200">Level {user.level} Guardian</span>
                </div>
                <span className="font-mono text-neutral-400 text-xs">
                  {xpInCurrentLevel} / {xpNeeded} XP to Lv.{user.level + 1}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Cumulative Environmental Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400 font-medium">CO₂ Prevented</span>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-400 tabular-nums">
                {user.totalCo2Kg.toFixed(1)} <span className="text-xs font-normal text-neutral-400">kg</span>
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400 font-medium">Water Conserved</span>
              <p className="mt-1 font-mono text-lg font-bold text-teal-400 tabular-nums">
                {user.totalWaterL} <span className="text-xs font-normal text-neutral-400">L</span>
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400 font-medium">Plastic Diverted</span>
              <p className="mt-1 font-mono text-lg font-bold text-amber-400 tabular-nums">
                {user.totalWasteItems} <span className="text-xs font-normal text-neutral-400">items</span>
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400 font-medium">Badges Owned</span>
              <p className="mt-1 font-mono text-lg font-bold text-purple-400 tabular-nums">
                {unlockedBadgesCount} <span className="text-xs font-normal text-neutral-400">/ {badges.length}</span>
              </p>
            </div>
          </div>

          {/* Next Badge Teaser Card */}
          {nextBadge && (
            <div
              onClick={onViewBadges}
              className="cursor-pointer flex items-center justify-between rounded-xl border border-emerald-950 bg-emerald-950/20 p-3.5 hover:bg-emerald-950/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-300">Next Unlockable Badge</span>
                    <span className="font-mono text-[10px] text-neutral-400">+{nextBadge.rewardXp} XP</span>
                  </div>
                  <p className="text-sm font-bold text-white">{nextBadge.name}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs text-neutral-300">
                  {nextBadge.progress}/{nextBadge.maxProgress} {nextBadge.unit}
                </span>
                <span className="block text-[11px] text-emerald-400 font-medium">View Badges →</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
