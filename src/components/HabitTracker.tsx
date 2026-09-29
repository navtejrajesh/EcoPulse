import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Zap,
  Salad,
  Bike,
  ShoppingBag,
  Droplets,
  Sparkles,
  X,
  Bell,
  BellRing,
  BellOff,
  Clock,
  Send,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit, HabitCategory } from '../types';
import { soundManager } from '../utils/audio';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendHabitReminder,
  NotificationPermissionState,
} from '../utils/notifications';

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'completedToday' | 'history'>) => void;
  onUpdateHabitReminder?: (habitId: string, reminderEnabled: boolean, reminderTime: string) => void;
}

const TIME_PRESETS = [
  { label: 'Morning', time: '08:00' },
  { label: 'Noon', time: '12:30' },
  { label: 'Evening', time: '18:30' },
  { label: 'Night', time: '21:30' },
];

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onUpdateHabitReminder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermission());
  const [editingReminderHabitId, setEditingReminderHabitId] = useState<string | null>(null);
  const [testSentId, setTestSentId] = useState<string | null>(null);

  // New habit form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('energy');
  const [newXp, setNewXp] = useState(30);
  const [newCo2, setNewCo2] = useState(1.2);
  const [newReminderEnabled, setNewReminderEnabled] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState('09:00');

  const filteredHabits = habits.filter(
    (h) => selectedCategory === 'all' || h.category === selectedCategory
  );

  const completedTodayCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      soundManager.playHabitComplete();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
      });
    }
    onToggleHabit(id);
  };

  const handleRequestPermission = async () => {
    soundManager.playClick();
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleToggleReminder = async (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();

    if (!habit.reminderEnabled) {
      // If turning on, ensure permission is requested
      if (permission === 'default') {
        const res = await requestNotificationPermission();
        setPermission(res);
      }
      const timeToSet = habit.reminderTime || '09:00';
      onUpdateHabitReminder?.(habit.id, true, timeToSet);
      setEditingReminderHabitId(habit.id);
    } else {
      onUpdateHabitReminder?.(habit.id, false, habit.reminderTime || '09:00');
      if (editingReminderHabitId === habit.id) {
        setEditingReminderHabitId(null);
      }
    }
  };

  const handleTimeChange = (habitId: string, newTime: string) => {
    onUpdateHabitReminder?.(habitId, true, newTime);
  };

  const handleTestReminder = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    sendHabitReminder(habit);
    setTestSentId(habit.id);
    setTimeout(() => {
      setTestSentId((curr) => (curr === habit.id ? null : curr));
    }, 2500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom sustainable daily habit',
      category: newCategory,
      xp: Number(newXp) || 25,
      impact: {
        co2Kg: Number(newCo2) || 1.0,
      },
      icon: getCategoryIconName(newCategory),
      custom: true,
      reminderEnabled: newReminderEnabled,
      reminderTime: newReminderTime,
    });

    setNewTitle('');
    setNewDesc('');
    setNewReminderEnabled(false);
    setNewReminderTime('09:00');
    setIsModalOpen(false);
  };

  function getCategoryIcon(cat: HabitCategory) {
    switch (cat) {
      case 'energy':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'food':
        return <Salad className="h-4 w-4 text-emerald-400" />;
      case 'transport':
        return <Bike className="h-4 w-4 text-sky-400" />;
      case 'waste':
        return <ShoppingBag className="h-4 w-4 text-purple-400" />;
      case 'water':
        return <Droplets className="h-4 w-4 text-teal-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-emerald-400" />;
    }
  }

  function getCategoryIconName(cat: HabitCategory) {
    switch (cat) {
      case 'energy':
        return 'Zap';
      case 'food':
        return 'Salad';
      case 'transport':
        return 'Bike';
      case 'waste':
        return 'ShoppingBag';
      case 'water':
        return 'Droplets';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header section with category tabs & add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Daily Action Ledger
          </span>
          <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white mt-0.5">
            Sustainable Habits
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Complete your mindful actions today, toggle daily push reminders, and climb regional ranks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300">
            <span className="font-medium text-emerald-400 font-mono tabular-nums">{completedTodayCount}</span> /{' '}
            <span className="font-mono tabular-nums">{totalCount}</span> Completed Today
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Custom Habit</span>
          </button>
        </div>
      </div>

      {/* Daily Notification Permission / Helper Banner */}
      <div className="rounded-2xl border border-emerald-900/50 bg-[#071910]/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Daily Push Notifications</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                  permission === 'granted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : permission === 'denied'
                    ? 'bg-red-950 text-red-300 border border-red-500/30'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}
              >
                {permission === 'granted'
                  ? 'Active'
                  : permission === 'denied'
                  ? 'Browser Blocked'
                  : 'Needs Permission'}
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Toggle reminders on any habit card below to receive gentle alerts at your chosen time of day.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button
              onClick={handleRequestPermission}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-sm"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Allow Push Reminders</span>
            </button>
          )}
          {permission === 'granted' && (
            <button
              onClick={() => {
                const sampleHabit = habits[0] || {
                  id: 'sample',
                  title: 'Plant-Based Meal',
                  streak: 6,
                  impact: { co2Kg: 3.2 },
                  xp: 45,
                };
                sendHabitReminder(sampleHabit);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-600/60 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300 hover:text-white hover:bg-emerald-900/50 transition-colors"
            >
              <Send className="h-3 w-3" />
              <span>Send Sample Push</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-900/80 rounded-xl border border-neutral-800/80 scrollbar-none">
        {[
          { id: 'all', label: 'All Habits' },
          { id: 'energy', label: '⚡ Energy' },
          { id: 'food', label: '🥗 Food & Diet' },
          { id: 'transport', label: '🚲 Mobility' },
          { id: 'waste', label: '♻️ Circularity' },
          { id: 'water', label: '💧 Water' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === tab.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredHabits.map((habit) => {
          const isReminderOn = !!habit.reminderEnabled;
          const isEditingTime = editingReminderHabitId === habit.id;

          return (
            <div
              key={habit.id}
              onClick={() => handleToggle(habit.id, habit.completedToday)}
              className={`group cursor-pointer select-none rounded-xl border p-4 transition-all duration-200 ${
                habit.completedToday
                  ? 'border-emerald-800/50 bg-emerald-950/20 hover:border-emerald-700/60'
                  : 'border-neutral-800/80 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    aria-label={`Mark ${habit.title} as ${habit.completedToday ? 'incomplete' : 'complete'}`}
                    className="mt-0.5 shrink-0 focus:outline-none"
                  >
                    {habit.completedToday ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-emerald-500/20 transition-transform group-hover:scale-110" />
                    ) : (
                      <Circle className="h-6 w-6 text-neutral-600 transition-colors group-hover:text-emerald-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {habit.title}
                      </span>
                      {habit.custom && (
                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                      {habit.description}
                    </p>

                    {/* Impact line with subtle separators */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                        +{habit.xp} XP
                      </div>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span className="font-mono text-neutral-300">
                        -{habit.impact.co2Kg} kg CO₂
                      </span>
                      {habit.impact.waterLiters && (
                        <>
                          <span aria-hidden="true" className="text-neutral-700">·</span>
                          <span className="font-mono text-teal-400">
                            +{habit.impact.waterLiters}L saved
                          </span>
                        </>
                      )}
                      {habit.impact.energyKwh && (
                        <>
                          <span aria-hidden="true" className="text-neutral-700">·</span>
                          <span className="font-mono text-amber-400">
                            -{habit.impact.energyKwh} kWh
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Streak & Icon */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800/80 border border-neutral-700/60">
                    {getCategoryIcon(habit.category)}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span>{habit.streak}d</span>
                  </div>
                </div>
              </div>

              {/* Habit Push Notification Toggle & Time Selector */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3.5 pt-3 border-t border-neutral-800/80 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  {/* Left: Notification Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleReminder(habit, e)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                        isReminderOn
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                          : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/50 hover:text-white'
                      }`}
                      title={isReminderOn ? 'Click to disable reminder' : 'Click to enable daily push reminder'}
                    >
                      {isReminderOn ? (
                        <>
                          <BellRing className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                          <span>Reminder Daily</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-3.5 w-3.5" />
                          <span>Remind Me</span>
                        </>
                      )}
                    </button>

                    {/* Active Time Display / Editor Trigger */}
                    {isReminderOn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          setEditingReminderHabitId(isEditingTime ? null : habit.id);
                        }}
                        className="flex items-center gap-1 font-mono text-[11px] text-emerald-400 hover:text-emerald-300 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md"
                        title="Click to edit reminder time"
                      >
                        <Clock className="h-3 w-3 text-emerald-500" />
                        <span>{habit.reminderTime || '09:00'}</span>
                        <span className="text-[9px] text-neutral-500 underline ml-0.5">
                          {isEditingTime ? 'Done' : 'Change'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Right: Quick Test Button */}
                  {isReminderOn && (
                    <button
                      type="button"
                      onClick={(e) => handleTestReminder(habit, e)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                      title="Trigger a test notification now"
                    >
                      {testSentId === habit.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Sent!</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          <span>Test</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Time of Day Selector Drawer */}
                {isReminderOn && isEditingTime && (
                  <div className="mt-1 p-2.5 rounded-lg bg-neutral-900/90 border border-emerald-950 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-neutral-300 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-400" />
                        <span>Preferred Time of Day:</span>
                      </span>
                      <input
                        type="time"
                        value={habit.reminderTime || '09:00'}
                        onChange={(e) => handleTimeChange(habit.id, e.target.value)}
                        className="rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-neutral-500">Presets:</span>
                      {TIME_PRESETS.map((preset) => (
                        <button
                          key={preset.time}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            handleTimeChange(habit.id, preset.time);
                          }}
                          className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                            habit.reminderTime === preset.time
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {preset.label} ({preset.time})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Adding Custom Habit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-900 bg-[#0d1612] p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-['Outfit'] text-lg font-bold text-white">Create Custom Habit</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Add a personal sustainable commitment tailored to your lifestyle.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300">Habit Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Line-dry clothes instead of dryer"
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Saves tumbler heater energy and makes laundry smell fresh"
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as HabitCategory)}
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="energy">Energy</option>
                    <option value="food">Food & Diet</option>
                    <option value="transport">Mobility</option>
                    <option value="waste">Circularity</option>
                    <option value="water">Water</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300">Estimated CO₂ (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newCo2}
                    onChange={(e) => setNewCo2(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notification Toggle in Custom Habit Modal */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-white">Daily Push Reminder</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newReminderEnabled}
                    onChange={(e) => setNewReminderEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {newReminderEnabled && (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                    <span className="text-neutral-400">Preferred Reminder Time:</span>
                    <input
                      type="time"
                      value={newReminderTime}
                      onChange={(e) => setNewReminderTime(e.target.value)}
                      className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
