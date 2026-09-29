import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Globe,
  MapPin,
  Medal,
  TrendingUp,
  Share2,
  Users,
} from 'lucide-react';
import { LeaderboardUser, LeagueTier, UserProfile } from '../types';

interface RegionalLeaderboardProps {
  leaderboards: Record<string, LeaderboardUser[]>;
  currentRegion: string;
  onChangeRegion: (region: string) => void;
  user: UserProfile;
  onOpenShare: () => void;
}

export const RegionalLeaderboard: React.FC<RegionalLeaderboardProps> = ({
  leaderboards,
  currentRegion,
  onChangeRegion,
  user,
  onOpenShare,
}) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'allTime'>('weekly');
  const availableRegions = Object.keys(leaderboards);

  const activeBoard = (leaderboards[currentRegion] || []).slice().sort((a, b) => {
    return timeframe === 'weekly' ? b.weeklyXp - a.weeklyXp : b.xp - a.xp;
  }).map((u, idx) => ({ ...u, dynamicRank: idx + 1 }));

  const currentUserEntry = activeBoard.find((u) => u.isCurrentUser);
  const nextCompetitor = currentUserEntry && currentUserEntry.dynamicRank > 1
    ? activeBoard[currentUserEntry.dynamicRank - 2]
    : null;

  const xpGapToNext = currentUserEntry && nextCompetitor
    ? (timeframe === 'weekly' ? nextCompetitor.weeklyXp - currentUserEntry.weeklyXp : nextCompetitor.xp - currentUserEntry.xp)
    : 0;

  function getRankBadge(rank: number) {
    if (rank === 1) {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
          <Medal className="h-4 w-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-300/20 text-slate-200 font-bold border border-slate-300/30">
          <Medal className="h-4 w-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700/20 text-amber-500 font-bold border border-amber-700/30">
          <Medal className="h-4 w-4" />
        </div>
      );
    }
    return (
      <span className="font-mono text-sm font-semibold text-neutral-400 tabular-nums w-7 text-center">
        #{rank}
      </span>
    );
  }

  function getLeaguePill(league: LeagueTier) {
    switch (league) {
      case 'Apex Earthkeeper':
        return <span className="font-mono text-[11px] text-emerald-400 font-semibold">Apex Earthkeeper</span>;
      case 'Canopy':
        return <span className="font-mono text-[11px] text-teal-400 font-semibold">Canopy League</span>;
      case 'Sprout':
        return <span className="font-mono text-[11px] text-amber-400 font-semibold">Sprout League</span>;
      case 'Seedling':
        return <span className="font-mono text-[11px] text-neutral-400 font-semibold">Seedling League</span>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Regional Bioregions & Leagues
          </span>
          <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white mt-0.5">
            Regional Leaderboards
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Compare your sustained habits with eco-custodians in your bioregion and worldwide.
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              timeframe === 'weekly'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('allTime')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              timeframe === 'allTime'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All-Time XP
          </button>
        </div>
      </div>

      {/* Regional Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {availableRegions.map((region) => (
          <button
            key={region}
            onClick={() => onChangeRegion(region)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
              currentRegion === region
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{region}</span>
          </button>
        ))}
      </div>

      {/* Current User Standings Card */}
      {currentUserEntry && (
        <div className="rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/40 via-neutral-900/80 to-emerald-950/30 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-2xl">
                {currentUserEntry.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Outfit'] text-base font-bold text-white">
                    {currentUserEntry.name}
                  </span>
                  <span className="font-mono text-xs rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 font-bold">
                    Rank #{currentUserEntry.dynamicRank}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                  <span>{currentUserEntry.region}</span>
                  <span aria-hidden="true">·</span>
                  {getLeaguePill(currentUserEntry.league)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-neutral-400 block">
                  {timeframe === 'weekly' ? 'Weekly XP' : 'Total XP'}
                </span>
                <span className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
                  {timeframe === 'weekly' ? currentUserEntry.weeklyXp : currentUserEntry.xp} XP
                </span>
              </div>

              {nextCompetitor && xpGapToNext > 0 ? (
                <div className="hidden md:block text-left border-l border-neutral-800 pl-4">
                  <span className="text-[11px] text-amber-400/90 block font-medium">To Rank #{currentUserEntry.dynamicRank - 1}</span>
                  <span className="font-mono text-xs text-neutral-300">
                    +{xpGapToNext} XP behind {nextCompetitor.name.split(' ')[0]}
                  </span>
                </div>
              ) : null}

              <button
                onClick={onOpenShare}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Brag</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/80 text-neutral-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Custodian</th>
                <th className="py-3 px-4 hidden sm:table-cell">League Tier</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">CO₂ Prevented</th>
                <th className="py-3 px-4 text-right">
                  {timeframe === 'weekly' ? 'Weekly Score' : 'Lifetime XP'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {activeBoard.map((entry) => {
                const isUser = entry.isCurrentUser;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/40 font-medium'
                        : 'hover:bg-neutral-800/40 text-neutral-300'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">{getRankBadge(entry.dynamicRank)}</div>
                    </td>

                    {/* User profile info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{entry.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold ${isUser ? 'text-emerald-300' : 'text-white'}`}>
                              {entry.name}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-neutral-500">
                            @{entry.username} · {entry.region}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* League */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {getLeaguePill(entry.league)}
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-amber-400 font-semibold">
                        <Flame className="h-3 w-3" />
                        <span className="tabular-nums">{entry.streak}d</span>
                      </div>
                    </td>

                    {/* CO2 */}
                    <td className="py-3 px-4 text-right font-mono text-neutral-400 tabular-nums hidden md:table-cell">
                      {entry.co2SavedKg.toFixed(1)} kg
                    </td>

                    {/* XP */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {timeframe === 'weekly' ? entry.weeklyXp : entry.xp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
