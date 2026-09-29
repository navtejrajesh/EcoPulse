import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  User,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Compass,
  Zap,
  Bike,
  HeartHandshake,
} from 'lucide-react';
import { UserProfile, Habit } from '../types';
import { REGIONS_LIST } from '../data/initialData';
import { soundManager } from '../utils/audio';

interface OnboardingGateProps {
  onComplete: (user: UserProfile, starterHabitIds: string[]) => void;
  existingProfile?: UserProfile;
}

const AVATARS = ['🌱', '🌲', '🌿', '🌊', '☀️', '🦊', '🎋', '🌺', '🐝', '🦅', '🦉', '🌾'];

const STARTER_HABIT_OPTIONS = [
  {
    id: 'habit-1',
    title: 'Cold-Water Laundry Wash',
    category: 'energy',
    impact: '0.6kg CO₂ / load',
    icon: '⚡',
  },
  {
    id: 'habit-2',
    title: 'Zero Single-Use Plastic Day',
    category: 'waste',
    impact: '3 items diverted',
    icon: '🛍️',
  },
  {
    id: 'habit-3',
    title: 'Active Pedal or Walking Trip',
    category: 'transport',
    impact: '1.2kg CO₂ saved',
    icon: '🚲',
  },
  {
    id: 'habit-4',
    title: '100% Plant-Powered Meal',
    category: 'food',
    impact: '1.5kg CO₂ / meal',
    icon: '🥗',
  },
  {
    id: 'habit-5',
    title: 'Kill Vampire Standby Power',
    category: 'energy',
    impact: '0.9kg CO₂ / night',
    icon: '🔌',
  },
  {
    id: 'habit-6',
    title: 'Rapid 4-Minute Shower',
    category: 'water',
    impact: '40L water saved',
    icon: '💧',
  },
];

export const OnboardingGate: React.FC<OnboardingGateProps> = ({
  onComplete,
  existingProfile,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState(existingProfile?.name || '');
  const [username, setUsername] = useState(existingProfile?.username || '');
  const [avatar, setAvatar] = useState(existingProfile?.avatar || '🌱');
  const [region, setRegion] = useState(existingProfile?.region || 'North America (Cascadia / Pacific)');
  const [householdSize, setHouseholdSize] = useState('2');
  const [primaryTransport, setPrimaryTransport] = useState('Bicycle / Walking');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(['habit-1', 'habit-2', 'habit-3']);
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  // Validation
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setErrorMsg('');

    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter your display name to proceed.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Please choose an eco-handle.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!region) {
        setErrorMsg('Please select your home bioregion.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeAccepted) {
      setErrorMsg('Please confirm the planetary stewardship pledge.');
      return;
    }
    if (selectedHabitIds.length < 1) {
      setErrorMsg('Please select at least 1 starter habit to begin your daily streak.');
      return;
    }

    soundManager.playBadgeUnlock();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#34d399', '#38bdf8', '#fbbf24', '#a7f3d0'],
    });

    const newUser: UserProfile = {
      name: name.trim(),
      username: username.trim().replace(/^@/, '').toLowerCase(),
      avatar,
      region,
      level: 1,
      xp: 150, // Welcome bonus XP!
      streak: 1,
      totalCo2Kg: 3.5,
      totalWaterL: 60,
      totalWasteItems: 5,
      totalEnergyKwh: 4.2,
      soundEnabled: true,
      joinedDate: new Date().toISOString(),
    };

    onComplete(newUser, selectedHabitIds);
  };

  const toggleHabitSelection = (habitId: string) => {
    soundManager.playClick();
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050c08]/95 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-3xl border border-emerald-900/80 bg-gradient-to-b from-[#0b1b13] via-[#08150e] to-[#050d09] p-6 sm:p-8 shadow-2xl text-white">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
            <span className="font-['Outfit'] font-black text-xl">EP</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome to EcoPulse
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
            Please fill out your custodian profile to enter the mobile app and start tracking your environmental footprint.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-6 flex items-center justify-between max-w-xs mx-auto">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Bioregion' },
            { num: 3, label: 'Commitment' },
          ].map((item, idx) => (
            <React.Fragment key={item.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step === item.num
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/40 scale-110'
                      : step > item.num
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                  }`}
                >
                  {step > item.num ? <CheckCircle2 className="h-4 w-4" /> : item.num}
                </div>
                <span className="mt-1 text-[10px] font-medium text-neutral-400">{item.label}</span>
              </div>
              {idx < 2 && (
                <div
                  className={`h-0.5 flex-1 mx-2 -mt-4 transition-colors ${
                    step > idx + 1 ? 'bg-emerald-500/60' : 'bg-neutral-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 px-3.5 py-2 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-neutral-300 mb-1.5">
                Choose Your Custodian Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => {
                      soundManager.playClick();
                      setAvatar(emoji);
                    }}
                    className={`flex h-11 w-full items-center justify-center rounded-xl text-xl border transition-all ${
                      avatar === emoji
                        ? 'border-emerald-500 bg-emerald-500/20 scale-105 shadow-md shadow-emerald-950'
                        : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-300">Full / Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex Rivers"
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300">Eco-Handle / Username</label>
              <div className="mt-1 flex items-center rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5">
                <span className="text-neutral-500 mr-1.5 text-sm">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="verdant_alex"
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-black hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-950"
              >
                <span>Continue to Bioregion</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: BIOREGION & HABITS BASELINE */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-neutral-300">Home Bioregion / Region</label>
              <p className="text-[11px] text-neutral-400 mb-1.5">
                Powers your local ecosystem rank and regional leaderboards.
              </p>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {REGIONS_LIST.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Household Size</label>
                <select
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="1">1 Person (Solo)</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4+">4+ People</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Primary Commute</label>
                <select
                  value={primaryTransport}
                  onChange={(e) => setPrimaryTransport(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Bicycle / Walking">Bicycle / Walking</option>
                  <option value="Public Transit">Public Transit</option>
                  <option value="Electric Vehicle">Electric Vehicle</option>
                  <option value="Carpool / Hybrid">Carpool / Hybrid</option>
                  <option value="Combustion Vehicle">Combustion Vehicle</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3 text-[11px] text-neutral-300 flex items-start gap-2.5">
              <Compass className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                You will represent <strong>{region}</strong> against global cohorts on the weekly bioregion leaderboard.
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-xl border border-neutral-800 px-4 py-3 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-black hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-950"
              >
                <span>Next: Pledge Habits</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PLEDGE HABITS & ENTRY */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-neutral-300">
                  Select Your Starter Daily Habits
                </label>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                  {selectedHabitIds.length} Selected
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mb-2">
                These habits will be pinned to your daily tracker dashboard.
              </p>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {STARTER_HABIT_OPTIONS.map((item) => {
                  const isSelected = selectedHabitIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleHabitSelection(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isSelected
                          ? 'border-emerald-500/80 bg-emerald-950/40 text-white'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <p className="font-medium text-xs">{item.title}</p>
                          <p className="text-[10px] text-emerald-400 font-mono">{item.impact}</p>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : 'border-neutral-700 bg-neutral-900'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stewardship Pledge */}
            <div
              onClick={() => setPledgeAccepted(!pledgeAccepted)}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-900/60 bg-emerald-950/20 cursor-pointer select-none"
            >
              <div
                className={`mt-0.5 h-4 w-4 shrink-0 rounded flex items-center justify-center border ${
                  pledgeAccepted ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-neutral-600'
                }`}
              >
                {pledgeAccepted && <CheckCircle2 className="h-3 w-3" />}
              </div>
              <p className="text-[11px] text-neutral-300 leading-snug">
                I commit to tracking my ecological choices honestly, reducing household waste, and taking daily steps for planetary restoration.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 rounded-xl border border-neutral-800 px-4 py-3 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-5 py-3 text-sm font-bold text-black hover:opacity-95 transition-all shadow-lg shadow-emerald-950 scale-100 hover:scale-102"
              >
                <Sparkles className="h-4 w-4" />
                <span>Enter Mobile App</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
