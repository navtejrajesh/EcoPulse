import React from 'react';
import { Bell, X, Sparkles, ExternalLink } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NotificationToastProps {
  alert: {
    id: string;
    title: string;
    body: string;
    timestamp: string;
  } | null;
  onDismiss: () => void;
  onViewHabits?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  alert,
  onDismiss,
  onViewHabits,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed top-5 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl border border-emerald-500/50 bg-[#071910]/95 backdrop-blur-md p-4 text-white shadow-2xl shadow-emerald-950/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mt-0.5">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Habit Reminder · {alert.timestamp}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-white mt-0.5 leading-snug">
                {alert.title}
              </h4>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {alert.body}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onDismiss();
            }}
            aria-label="Close notification"
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {onViewHabits && (
          <div className="mt-3 pt-2.5 border-t border-emerald-950 flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">Keep your daily streak alive!</span>
            <button
              onClick={() => {
                soundManager.playClick();
                onDismiss();
                onViewHabits();
              }}
              className="font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Go to Habits</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
