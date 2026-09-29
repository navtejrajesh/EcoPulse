import React, { useState } from 'react';
import {
  Quote,
  Sparkles,
  Zap,
  Salad,
  Bike,
  ShoppingBag,
  Droplets,
  DollarSign,
  PlusCircle,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { EcoTip, Habit, MotivationalQuote } from '../types';
import { soundManager } from '../utils/audio';

interface TipsAndQuotesProps {
  quotes: MotivationalQuote[];
  tips: EcoTip[];
  existingHabitTitles: string[];
  onAdoptTipAsHabit: (tip: EcoTip) => void;
  onOpenShareWithQuote: (quote: MotivationalQuote) => void;
}

export const TipsAndQuotes: React.FC<TipsAndQuotesProps> = ({
  quotes,
  tips,
  existingHabitTitles,
  onAdoptTipAsHabit,
  onOpenShareWithQuote,
}) => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentQuote = quotes[activeQuoteIndex] || quotes[0];

  const filteredTips = tips.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const handlePrevQuote = () => {
    soundManager.playClick();
    setActiveQuoteIndex((prev) => (prev > 0 ? prev - 1 : quotes.length - 1));
  };

  const handleNextQuote = () => {
    soundManager.playClick();
    setActiveQuoteIndex((prev) => (prev < quotes.length - 1 ? prev + 1 : 0));
  };

  const handleCopyQuote = (q: MotivationalQuote) => {
    soundManager.playClick();
    const text = `"${q.quote}" — ${q.author} (${q.titleOrContext}) via EcoPulse`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(q.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  function getCategoryBadge(cat: string) {
    switch (cat) {
      case 'energy':
        return <span className="font-mono text-xs text-amber-400 font-semibold">⚡ Energy Conservation</span>;
      case 'food':
        return <span className="font-mono text-xs text-emerald-400 font-semibold">🥗 Diet & Agriculture</span>;
      case 'transport':
        return <span className="font-mono text-xs text-sky-400 font-semibold">🚲 Low-Carbon Mobility</span>;
      case 'waste':
        return <span className="font-mono text-xs text-purple-400 font-semibold">♻️ Circular Materials</span>;
      case 'water':
        return <span className="font-mono text-xs text-teal-400 font-semibold">💧 Water Stewardship</span>;
      default:
        return <span className="font-mono text-xs text-neutral-400 font-semibold">General Ecology</span>;
    }
  }

  return (
    <div className="space-y-8">
      {/* Daily Eco Wisdom Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-800/60 bg-gradient-to-br from-[#0c2017] via-[#091510] to-[#05110c] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-emerald-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Daily Eco Wisdom · {currentQuote.topic}
            </span>
          </div>

          {/* Prev/Next buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevQuote}
              aria-label="Previous quote"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px] text-neutral-400 px-1 tabular-nums">
              {activeQuoteIndex + 1}/{quotes.length}
            </span>
            <button
              onClick={handleNextQuote}
              aria-label="Next quote"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Big quote text */}
        <div className="my-5">
          <blockquote className="font-['Outfit'] text-xl sm:text-2xl font-medium italic text-emerald-50 leading-relaxed max-w-4xl">
            "{currentQuote.quote}"
          </blockquote>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-4">
            <div>
              <p className="font-['Outfit'] text-base font-bold text-white">
                {currentQuote.author}
              </p>
              <p className="text-xs text-neutral-400">
                {currentQuote.titleOrContext}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyQuote(currentQuote)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              >
                {copiedId === currentQuote.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Quote</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenShareWithQuote(currentQuote)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <span>Share Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Tips Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Science-Backed Guide
            </span>
            <h3 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white mt-0.5">
              Actionable Eco Tips
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              High-leverage habits designed to reduce your footprint while saving annual living costs.
            </p>
          </div>

          {/* Segmented Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-900/80 rounded-xl border border-neutral-800/80 scrollbar-none self-start sm:self-auto">
            {[
              { id: 'all', label: 'All Tips' },
              { id: 'energy', label: '⚡ Energy' },
              { id: 'food', label: '🥗 Food' },
              { id: 'transport', label: '🚲 Mobility' },
              { id: 'waste', label: '♻️ Circularity' },
              { id: 'water', label: '💧 Water' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTips.map((tip) => {
            const isAlreadyAdopted = tip.suggestedHabit
              ? existingHabitTitles.some((title) =>
                  title.toLowerCase().includes(tip.suggestedHabit!.title.toLowerCase())
                )
              : false;

            return (
              <div
                key={tip.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(tip.category)}
                    <span className="font-mono text-[11px] text-neutral-400">
                      {tip.difficulty}
                    </span>
                  </div>

                  <h4 className="font-['Outfit'] text-base font-bold text-white mt-2">
                    {tip.title}
                  </h4>
                  <p className="mt-1 text-xs text-emerald-300/90 font-medium">
                    {tip.impactHighlight}
                  </p>

                  <p className="mt-2.5 text-xs text-neutral-400 leading-relaxed">
                    {tip.practicalGuide}
                  </p>

                  {/* Impact Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-800/80 pt-3">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono">CO₂ Impact</span>
                      <p className="font-mono text-xs font-bold text-emerald-400">
                        -{tip.annualCo2Kg} kg / yr
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono">Avg Savings</span>
                      <p className="font-mono text-xs font-bold text-amber-400">
                        +${tip.annualMoneySavedUsd} / yr
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click Adopt Button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/60">
                  <button
                    disabled={isAlreadyAdopted}
                    onClick={() => {
                      soundManager.playHabitComplete();
                      onAdoptTipAsHabit(tip);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                      isAlreadyAdopted
                        ? 'bg-neutral-800/80 text-neutral-500 cursor-not-allowed'
                        : 'bg-emerald-600/90 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isAlreadyAdopted ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Active in Daily Habits</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Adopt as Daily Habit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
