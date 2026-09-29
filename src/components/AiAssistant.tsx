import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  Check,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Habit, UserProfile } from '../types';
import { soundManager } from '../utils/audio';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  suggestedHabit?: {
    title: string;
    description: string;
    category: 'energy' | 'food' | 'transport' | 'waste' | 'water';
    co2Kg: number;
    xp: number;
  };
  timestamp: string;
}

interface AiAssistantProps {
  user: UserProfile;
  habits: Habit[];
  onAddHabitFromAi: (habit: Omit<Habit, 'id' | 'streak' | 'completedToday' | 'history'>) => void;
}

const COMMON_DOUBTS = [
  {
    icon: '🍕',
    title: 'Pizza Box Recycling',
    query: 'Can greasy cardboard pizza boxes be recycled or should they go into compost?',
  },
  {
    icon: '🥑',
    title: 'Composting Tricky Scraps',
    query: 'Can I compost citrus peels, avocado seeds, and coffee grounds without harming worms or compost balance?',
  },
  {
    icon: '⚡',
    title: 'Phantom Power Drain',
    query: 'Which appliances consume the highest vampire electricity while turned off or on standby?',
  },
  {
    icon: '🚲',
    title: 'Biking vs Car CO₂',
    query: 'How much CO₂ and fuel do I realistically save by biking a 5km commute instead of driving?',
  },
  {
    icon: '🧴',
    title: 'Plastic Resin Codes',
    query: 'What do plastic numbers (#1 through #7) mean, and which ones actually get recycled in municipal facilities?',
  },
  {
    icon: '🥗',
    title: 'Plant Meal Carbon Impact',
    query: 'How much carbon footprint does one single meatless dinner save compared to beef or chicken?',
  },
];

export const AiAssistant: React.FC<AiAssistantProps> = ({
  user,
  habits,
  onAddHabitFromAi,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        content: `Hello ${user.name}! I am **EcoPulse AI**, your personal sustainability advisor. 🌿\n\nAsk me any doubt you have about recycling nuances, composting rules, home energy conservation, carbon footprints, or greener daily alternatives. What would you like to clarify today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adoptedHabitIds, setAdoptedHabitIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    soundManager.playClick();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            name: user.name,
            level: user.level,
            streak: user.streak,
            totalCo2Kg: user.totalCo2Kg,
            region: user.region,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: data.reply,
        suggestedHabit: data.suggestedHabit || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      soundManager.playHabitComplete();
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content:
          "I couldn't reach the ecological advisor right now. Please ensure your network is stable and try asking your question again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptHabit = (msgId: string, habitSuggestion: NonNullable<ChatMessage['suggestedHabit']>) => {
    soundManager.playHabitComplete();
    onAddHabitFromAi({
      title: habitSuggestion.title,
      description: habitSuggestion.description,
      category: habitSuggestion.category,
      xp: habitSuggestion.xp || 35,
      impact: {
        co2Kg: habitSuggestion.co2Kg || 1.2,
      },
      icon: 'Sparkles',
      custom: true,
    });
    setAdoptedHabitIds((prev) => [...prev, msgId]);
  };

  const handleClearHistory = () => {
    soundManager.playClick();
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: `Chat history cleared. What sustainability doubt can I help you with next, ${user.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[82vh] rounded-2xl border border-emerald-900/70 bg-[#08120d] overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-emerald-950 bg-[#0b1712] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-950">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Outfit'] text-lg font-bold text-white tracking-tight">
                EcoPulse AI Advisor
              </h2>
              <span className="font-mono text-[10px] rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 font-semibold">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Clear your doubts on composting, recycling rules, and climate habits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isAdopted = adoptedHabitIds.includes(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'bg-neutral-900/90 border border-neutral-800/90 text-neutral-200'
                }`}
              >
                {/* Content formatting */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => {
                    // Quick check for bold or bullets
                    return (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Habit Suggestion Action Card if returned by AI */}
                {msg.suggestedHabit && (
                  <div className="mt-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                        Suggested Daily Habit
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">
                        +{msg.suggestedHabit.xp} XP
                      </span>
                    </div>

                    <p className="font-['Outfit'] font-bold text-white text-sm mt-1">
                      {msg.suggestedHabit.title}
                    </p>
                    <p className="text-[11px] text-neutral-300 mt-0.5">
                      {msg.suggestedHabit.description}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-neutral-400">
                        Estimated: -{msg.suggestedHabit.co2Kg} kg CO₂
                      </span>

                      <button
                        disabled={isAdopted}
                        onClick={() => handleAdoptHabit(msg.id, msg.suggestedHabit!)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isAdopted
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400 cursor-default'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                        }`}
                      >
                        {isAdopted ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Added to Habits</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Add to My Habits</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] font-mono text-right ${
                    isUser ? 'text-emerald-100/70' : 'text-neutral-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-base mt-0.5">
                  {user.avatar}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 text-neutral-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Analyzing ecological literature & calculating impacts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Doubt Prompts Strip */}
      <div className="border-t border-neutral-800/80 bg-neutral-950/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>Frequently Asked Sustainability Doubts:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {COMMON_DOUBTS.map((doubt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(doubt.query)}
              disabled={loading}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-[11px] text-neutral-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-neutral-800 transition-colors shrink-0"
            >
              <span>{doubt.icon}</span>
              <span>{doubt.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="border-t border-neutral-800 bg-[#0b1712] p-3 sm:p-4 flex items-center gap-2.5"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any sustainability doubt (e.g., 'Can I compost citrus peels?')"
          disabled={loading}
          className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
