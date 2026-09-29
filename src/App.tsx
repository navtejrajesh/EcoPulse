import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  Trophy,
  ArrowRight,
  Share2,
  Calendar,
  CheckCircle2,
  Leaf,
  Globe,
  Quote as QuoteIcon,
} from 'lucide-react';
import { Habit, Badge, LeaderboardUser, EcoTip, MotivationalQuote, UserProfile } from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_HABITS,
  INITIAL_BADGES,
  INITIAL_LEADERBOARDS,
  MOTIVATIONAL_QUOTES,
  ECO_TIPS,
} from './data/initialData';
import { Navbar, NavTabType } from './components/Navbar';
import { TerrariumWidget } from './components/TerrariumWidget';
import { HabitTracker } from './components/HabitTracker';
import { BadgeCollection } from './components/BadgeCollection';
import { RegionalLeaderboard } from './components/RegionalLeaderboard';
import { TipsAndQuotes } from './components/TipsAndQuotes';
import { SocialShareModal } from './components/SocialShareModal';
import { ProfileModal } from './components/ProfileModal';
import { AiAssistant } from './components/AiAssistant';
import { OnboardingGate } from './components/OnboardingGate';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { NotificationToast } from './components/NotificationToast';
import { useNotificationScheduler } from './hooks/useNotificationScheduler';
import { soundManager } from './utils/audio';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');

  // First-time user onboarding gate: only required on the very first time using the app
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const hasCompleted = localStorage.getItem('ecopulse_user_has_onboarded') === 'true';
      const hasExistingUser = localStorage.getItem('ecopulse_user_v1') !== null;
      return hasCompleted || hasExistingUser;
    } catch {
      return true; // Fail-safe
    }
  });

  // Core state with local storage persistence
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_user_v1');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_habits_v1');
      return saved ? JSON.parse(saved) : INITIAL_HABITS;
    } catch {
      return INITIAL_HABITS;
    }
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_badges_v1');
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardUser[]>>(() => {
    try {
      const saved = localStorage.getItem('ecopulse_leaderboards_v1');
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARDS;
    } catch {
      return INITIAL_LEADERBOARDS;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [shareBadgeTarget, setShareBadgeTarget] = useState<Badge | null>(null);
  const [shareQuoteTarget, setShareQuoteTarget] = useState<MotivationalQuote | null>(null);
  const [recentUnlockBanner, setRecentUnlockBanner] = useState<Badge | null>(null);

  // Daily notification scheduler & active alert hook
  const { activeAlert, dismissAlert } = useNotificationScheduler(habits);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ecopulse_user_v1', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('ecopulse_habits_v1', JSON.stringify(habits));
    } catch {}
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem('ecopulse_badges_v1', JSON.stringify(badges));
    } catch {}
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem('ecopulse_leaderboards_v1', JSON.stringify(leaderboards));
    } catch {}
  }, [leaderboards]);

  // Handle sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playClick();
  };

  // Check badges for automatic unlock
  const checkBadgeUnlocks = (
    currentBadges: Badge[],
    currentUser: UserProfile,
    currentHabits: Habit[]
  ): { updatedBadges: Badge[]; unlocked: Badge | null; addedXp: number } => {
    let newlyUnlocked: Badge | null = null;
    let extraXp = 0;

    const completedTodayCount = currentHabits.filter((h) => h.completedToday).length;
    const plasticHabit = currentHabits.find((h) => h.category === 'waste' && h.title.includes('Plastic'));
    const plantHabit = currentHabits.find((h) => h.category === 'food');

    const updated = currentBadges.map((badge) => {
      if (badge.unlockedAt) return badge;

      let currentProgress = badge.progress;
      let shouldUnlock = false;

      if (badge.id === 'badge-sprout') {
        currentProgress = completedTodayCount > 0 ? 1 : 0;
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-century-carbon') {
        currentProgress = Number(currentUser.totalCo2Kg.toFixed(1));
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-streak-fire') {
        currentProgress = currentUser.streak;
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-solar-sentinel') {
        currentProgress = Number(currentUser.totalEnergyKwh.toFixed(1));
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-hydration-hero') {
        currentProgress = currentUser.totalWaterL;
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-plant-paladin') {
        currentProgress = Math.min(badge.maxProgress, badge.progress + (plantHabit?.completedToday ? 1 : 0));
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-zero-plastic') {
        currentProgress = plasticHabit?.streak || 0;
        shouldUnlock = currentProgress >= badge.maxProgress;
      } else if (badge.id === 'badge-planetary-guardian') {
        currentProgress = Math.min(50, currentUser.streak * 3 + completedTodayCount * 2);
        shouldUnlock = currentUser.level >= 10 || currentProgress >= badge.maxProgress;
      }

      if (shouldUnlock && !badge.unlockedAt) {
        newlyUnlocked = {
          ...badge,
          progress: badge.maxProgress,
          unlockedAt: new Date().toISOString(),
        };
        extraXp += badge.rewardXp;
        return newlyUnlocked;
      }

      return {
        ...badge,
        progress: currentProgress,
      };
    });

    return { updatedBadges: updated, unlocked: newlyUnlocked, addedXp: extraXp };
  };

  // Toggle habit completion
  const handleToggleHabit = (habitId: string) => {
    setHabits((prevHabits) => {
      const target = prevHabits.find((h) => h.id === habitId);
      if (!target) return prevHabits;

      const isNowCompleted = !target.completedToday;
      const todayStr = '2026-09-29';

      const updatedTarget: Habit = {
        ...target,
        completedToday: isNowCompleted,
        streak: isNowCompleted ? target.streak + 1 : Math.max(0, target.streak - 1),
        history: {
          ...target.history,
          [todayStr]: isNowCompleted,
        },
      };

      const nextHabits = prevHabits.map((h) => (h.id === habitId ? updatedTarget : h));

      // Calculate incremental impact
      const co2Delta = isNowCompleted ? target.impact.co2Kg : -target.impact.co2Kg;
      const waterDelta = target.impact.waterLiters ? (isNowCompleted ? target.impact.waterLiters : -target.impact.waterLiters) : 0;
      const wasteDelta = target.impact.wasteItems ? (isNowCompleted ? target.impact.wasteItems : -target.impact.wasteItems) : 0;
      const energyDelta = target.impact.energyKwh ? (isNowCompleted ? target.impact.energyKwh : -target.impact.energyKwh) : 0;
      const xpDelta = isNowCompleted ? target.xp : -target.xp;

      setUser((prevUser) => {
        const nextXp = Math.max(0, prevUser.xp + xpDelta);
        const nextLevel = Math.max(1, Math.floor(nextXp / 500) + 1);
        const nextCo2 = Math.max(0, prevUser.totalCo2Kg + co2Delta);
        const nextWater = Math.max(0, prevUser.totalWaterL + waterDelta);
        const nextWaste = Math.max(0, prevUser.totalWasteItems + wasteDelta);
        const nextEnergy = Math.max(0, prevUser.totalEnergyKwh + energyDelta);

        const updatedUser: UserProfile = {
          ...prevUser,
          xp: nextXp,
          level: nextLevel,
          totalCo2Kg: Number(nextCo2.toFixed(1)),
          totalWaterL: nextWater,
          totalWasteItems: nextWaste,
          totalEnergyKwh: Number(nextEnergy.toFixed(1)),
        };

        // Check for badge unlocks
        const badgeCheck = checkBadgeUnlocks(badges, updatedUser, nextHabits);
        if (badgeCheck.unlocked) {
          setBadges(badgeCheck.updatedBadges);
          setRecentUnlockBanner(badgeCheck.unlocked);
          soundManager.playBadgeUnlock();
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#34d399', '#f59e0b', '#8b5cf6', '#38bdf8'],
          });
        }

        // Sync user in leaderboards
        updateLeaderboardUser(updatedUser, isNowCompleted ? xpDelta : 0);

        return updatedUser;
      });

      return nextHabits;
    });
  };

  const updateLeaderboardUser = (updatedUser: UserProfile, deltaXp: number) => {
    setLeaderboards((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((reg) => {
        copy[reg] = copy[reg].map((u) => {
          if (u.isCurrentUser) {
            return {
              ...u,
              name: `${updatedUser.name} (You)`,
              username: updatedUser.username,
              avatar: updatedUser.avatar,
              region: updatedUser.region,
              xp: updatedUser.xp,
              weeklyXp: Math.max(0, u.weeklyXp + deltaXp),
              streak: updatedUser.streak,
              co2SavedKg: updatedUser.totalCo2Kg,
            };
          }
          return u;
        });
      });
      return copy;
    });
  };

  // Add custom habit
  const handleAddHabit = (
    newHabitData: Omit<Habit, 'id' | 'streak' | 'completedToday' | 'history'>
  ) => {
    soundManager.playClick();
    const newHabit: Habit = {
      ...newHabitData,
      id: `custom-${Date.now()}`,
      streak: 0,
      completedToday: false,
      history: {},
    };
    setHabits((prev) => [newHabit, ...prev]);
  };

  // Adopt tip as habit
  const handleAdoptTipAsHabit = (tip: EcoTip) => {
    if (!tip.suggestedHabit) return;
    const exists = habits.some((h) => h.title.toLowerCase() === tip.suggestedHabit!.title.toLowerCase());
    if (exists) return;

    const newHabit: Habit = {
      id: `adopted-${Date.now()}`,
      title: tip.suggestedHabit.title,
      description: tip.suggestedHabit.description,
      category: tip.suggestedHabit.category,
      xp: tip.suggestedHabit.xp,
      impact: tip.suggestedHabit.impact,
      streak: 0,
      completedToday: false,
      history: {},
      icon: tip.suggestedHabit.icon,
      custom: true,
    };

    setHabits((prev) => [newHabit, ...prev]);
    setActiveTab('habits');
  };

  // Update daily reminder toggle and preferred time for a habit
  const handleUpdateHabitReminder = (
    habitId: string,
    reminderEnabled: boolean,
    reminderTime: string
  ) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, reminderEnabled, reminderTime } : h))
    );
  };

  // Open share modal with a badge
  const handleShareBadge = (badge: Badge) => {
    setShareBadgeTarget(badge);
    setShareQuoteTarget(null);
    setIsShareModalOpen(true);
  };

  // Open share modal with a quote
  const handleShareQuote = (quote: MotivationalQuote) => {
    setShareQuoteTarget(quote);
    setShareBadgeTarget(null);
    setIsShareModalOpen(true);
  };

  // Complete registration & enter app
  const handleOnboardingComplete = (newUser: UserProfile, starterHabitIds: string[]) => {
    setUser(newUser);
    // Pin starter habits
    setHabits((prev) => {
      const selected = prev.filter((h) => starterHabitIds.includes(h.id));
      const others = prev.filter((h) => !starterHabitIds.includes(h.id));
      return [...selected, ...others];
    });
    setIsOnboarded(true);
    try {
      localStorage.setItem('ecopulse_user_has_onboarded', 'true');
      localStorage.setItem('ecopulse_user_v1', JSON.stringify(newUser));
    } catch {}
  };

  // Reset habit progress and badges to initial defaults (preserves user registration)
  const handleResetData = () => {
    localStorage.removeItem('ecopulse_habits_v1');
    localStorage.removeItem('ecopulse_badges_v1');
    localStorage.removeItem('ecopulse_leaderboards_v1');
    setHabits(INITIAL_HABITS);
    setBadges(INITIAL_BADGES);
    setLeaderboards(INITIAL_LEADERBOARDS);
  };

  const unlockedBadgesCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <div className="min-h-screen bg-[#070e0a] text-[#e3efe9] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Strict One-Row Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenShare={() => {
          setShareBadgeTarget(null);
          setShareQuoteTarget(null);
          setIsShareModalOpen(true);
        }}
      />

      {/* Mobile App PWA Install Prompt Banner */}
      <PWAInstallBanner />

      {/* Unlock Notification Banner */}
      {recentUnlockBanner && (
        <div className="border-b border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-white">
                New Badge Unlocked: {recentUnlockBanner.name}!
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                +{recentUnlockBanner.rewardXp} XP Awarded
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  handleShareBadge(recentUnlockBanner);
                  setRecentUnlockBanner(null);
                }}
                className="font-semibold text-emerald-300 hover:text-white underline underline-offset-2"
              >
                Share Achievement →
              </button>
              <button
                onClick={() => setRecentUnlockBanner(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 pb-28 lg:pb-12">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Living Terrarium Widget & Player Progress */}
            <TerrariumWidget
              user={user}
              habits={habits}
              badges={badges}
              onViewBadges={() => setActiveTab('badges')}
              onOpenShare={() => {
                setShareBadgeTarget(null);
                setIsShareModalOpen(true);
              }}
            />

            {/* Quick Today's Habits Strip */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                    Action Plan
                  </span>
                  <h2 className="font-['Outfit'] text-xl font-bold text-white mt-0.5">
                    Today's Priority Habits
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('habits')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>View All {habits.length} Habits</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {habits.slice(0, 3).map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none ${
                      habit.completedToday
                        ? 'border-emerald-800/60 bg-emerald-950/20'
                        : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {habit.completedToday ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-neutral-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{habit.title}</p>
                          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{habit.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                            <span>+{habit.xp} XP</span>
                            <span className="text-neutral-600">·</span>
                            <span className="text-neutral-400">-{habit.impact.co2Kg}kg CO₂</span>
                            {habit.reminderEnabled && (
                              <>
                                <span className="text-neutral-600">·</span>
                                <span className="text-emerald-400/90 font-medium">🔔 {habit.reminderTime || '09:00'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400 font-semibold shrink-0">
                        <Flame className="h-3.5 w-3.5" />
                        <span>{habit.streak}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Two-Column Section: Regional Rank Snapshot + Daily Wisdom Snippet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Regional Standings Snapshot */}
              <div className="lg:col-span-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                      Bioregion Pulse
                    </span>
                    <button
                      onClick={() => setActiveTab('leaderboards')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Full Leaderboard</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <h3 className="font-['Outfit'] text-lg font-bold text-white mt-1">
                    {user.region} Standings
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Your sustained daily habits keep your bioregion in top competitive tiers.
                  </p>

                  <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-xl">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{user.name} (You)</p>
                        <p className="font-mono text-[11px] text-emerald-400">Level {user.level} Guardian</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-neutral-400 block">Current Standings</span>
                      <span className="font-mono text-sm font-bold text-white">Rank #3 in {user.region}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">1,420 Total XP</span>
                  <button
                    onClick={() => {
                      setShareBadgeTarget(null);
                      setIsShareModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share Rank to Socials</span>
                  </button>
                </div>
              </div>

              {/* Daily Quote Feature */}
              <div className="lg:col-span-6 rounded-2xl border border-emerald-950 bg-gradient-to-br from-[#0b1b13] to-[#07120d] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <QuoteIcon className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                      Daily Eco Wisdom
                    </span>
                  </div>
                  <blockquote className="font-['Outfit'] text-base font-medium italic text-emerald-100 mt-3 leading-relaxed">
                    "{MOTIVATIONAL_QUOTES[0].quote}"
                  </blockquote>
                  <p className="mt-2 text-xs font-semibold text-white">
                    — {MOTIVATIONAL_QUOTES[0].author}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {MOTIVATIONAL_QUOTES[0].titleOrContext}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveTab('tips')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>Explore Tips & Quotes</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => handleShareQuote(MOTIVATIONAL_QUOTES[0])}
                    className="flex items-center gap-1 text-emerald-300 hover:text-white font-semibold"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share Quote</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Quick AI Doubt Banner */}
            <div className="rounded-2xl border border-cyan-900/60 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-[#07130e] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-md">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Outfit'] text-lg font-bold text-white tracking-tight">
                      Got a Sustainability Doubt?
                    </h3>
                    <span className="font-mono text-[10px] rounded bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 font-semibold">
                      AI Advisor
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Ask about tricky composting items, plastic recycling codes, or home energy reduction hacks.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('ai');
                }}
                className="whitespace-nowrap flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white hover:from-emerald-400 hover:to-cyan-400 shadow-md transition-all self-start sm:self-auto"
              >
                <span>Ask AI a Question</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY HABITS */}
        {activeTab === 'habits' && (
          <HabitTracker
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onUpdateHabitReminder={handleUpdateHabitReminder}
          />
        )}

        {/* TAB 3: COLLECTIBLE BADGES */}
        {activeTab === 'badges' && (
          <BadgeCollection
            badges={badges}
            onShareBadge={handleShareBadge}
          />
        )}

        {/* TAB 4: REGIONAL LEADERBOARDS */}
        {activeTab === 'leaderboards' && (
          <RegionalLeaderboard
            leaderboards={leaderboards}
            currentRegion={user.region}
            onChangeRegion={(reg) => {
              soundManager.playClick();
              setUser((prev) => ({ ...prev, region: reg }));
            }}
            user={user}
            onOpenShare={() => {
              setShareBadgeTarget(null);
              setIsShareModalOpen(true);
            }}
          />
        )}

        {/* TAB 5: WISDOM & TIPS */}
        {activeTab === 'tips' && (
          <TipsAndQuotes
            quotes={MOTIVATIONAL_QUOTES}
            tips={ECO_TIPS}
            existingHabitTitles={habits.map((h) => h.title)}
            onAdoptTipAsHabit={handleAdoptTipAsHabit}
            onOpenShareWithQuote={handleShareQuote}
          />
        )}

        {/* TAB 6: SHARE STUDIO */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Social Outreach & Proof
              </span>
              <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white mt-0.5">
                Achievement Share Studio
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Render verified ecological achievement certificates, download PNG cards, or post directly to social media.
              </p>
            </div>

            {/* Launch Share Studio Trigger Box */}
            <div className="rounded-2xl border border-emerald-900 bg-gradient-to-r from-emerald-950/40 via-neutral-900/90 to-emerald-950/40 p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Share2 className="h-7 w-7" />
              </div>
              <h3 className="font-['Outfit'] text-xl font-bold text-white">
                Share Your Sustainable Journey
              </h3>
              <p className="max-w-md mx-auto text-xs text-neutral-300 leading-relaxed">
                Choose between your {unlockedBadgesCount} unlocked badges, your {user.totalCo2Kg}kg CO₂ milestone, or an inspiring environmental quote to generate a high-definition card for Twitter, Instagram Stories, WhatsApp, or LinkedIn.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsShareModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950 transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                <span>Open Card Studio & Publish</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: ASK AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                Instant Ecological Guidance
              </span>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
                Ask EcoPulse AI
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Clear up doubts on tricky recyclables, composting do's and don'ts, clean commuting, and habit adoption.
              </p>
            </div>

            <AiAssistant
              user={user}
              habits={habits}
              onAddHabitFromAi={handleAddHabit}
            />
          </div>
        )}
      </main>

      {/* Quiet, Clean Footer */}
      <footer className="mt-20 border-t border-neutral-900 py-8 text-center text-xs text-neutral-500 pb-28 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-bold text-neutral-300">EcoPulse</span>
            <span aria-hidden="true">·</span>
            <span>Gamified Planetary Custodianship</span>
          </div>

          <p className="text-neutral-500 text-[11px]">
            Every small habit compounds into collective watershed restoration.
          </p>

          <div className="flex items-center gap-4 text-neutral-400">
            <button onClick={() => setActiveTab('ai')} className="hover:text-cyan-300 transition-colors">
              Ask AI
            </button>
            <button onClick={() => setIsProfileModalOpen(true)} className="hover:text-white transition-colors">
              Profile
            </button>
            <button onClick={() => setIsShareModalOpen(true)} className="hover:text-white transition-colors">
              Social Share
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile-First Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        userAvatar={user.avatar}
      />

      {/* Interactive Modals */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={user}
        badges={badges}
        initialBadge={shareBadgeTarget}
        initialQuote={shareQuoteTarget}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateProfile={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onResetData={handleResetData}
      />

      {/* Compulsory User Information & Registration Gate */}
      {!isOnboarded && (
        <OnboardingGate
          onComplete={handleOnboardingComplete}
          existingProfile={user}
        />
      )}

      {/* Push / In-App Habit Notification Toast */}
      <NotificationToast
        alert={activeAlert}
        onDismiss={dismissAlert}
        onViewHabits={() => setActiveTab('habits')}
      />
    </div>
  );
}
