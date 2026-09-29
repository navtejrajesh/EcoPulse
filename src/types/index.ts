export type HabitCategory = 'energy' | 'food' | 'transport' | 'waste' | 'water';

export interface HabitImpact {
  co2Kg: number;
  waterLiters?: number;
  wasteItems?: number;
  energyKwh?: number;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  xp: number;
  impact: HabitImpact;
  streak: number;
  completedToday: boolean;
  history: Record<string, boolean>; // YYYY-MM-DD -> boolean
  icon: string;
  custom?: boolean;
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g. "09:00" in 24h format
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'planetary_guardian';

export interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  lore: string;
  rarity: BadgeRarity;
  icon: string;
  category: string;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  unit: string;
  rewardXp: number;
  image?: string;
}

export type LeagueTier = 'Seedling' | 'Sprout' | 'Canopy' | 'Apex Earthkeeper';

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: string;
  region: string;
  xp: number;
  weeklyXp: number;
  streak: number;
  badgesCount: number;
  co2SavedKg: number;
  league: LeagueTier;
  isCurrentUser?: boolean;
}

export interface EcoTip {
  id: string;
  title: string;
  category: HabitCategory;
  impactHighlight: string;
  annualCo2Kg: number;
  annualMoneySavedUsd: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  practicalGuide: string;
  quote?: string;
  suggestedHabit?: {
    title: string;
    description: string;
    category: HabitCategory;
    xp: number;
    impact: HabitImpact;
    icon: string;
  };
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  titleOrContext: string;
  topic: string;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  region: string;
  level: number;
  xp: number;
  streak: number;
  totalCo2Kg: number;
  totalWaterL: number;
  totalWasteItems: number;
  totalEnergyKwh: number;
  soundEnabled: boolean;
  joinedDate: string;
}
