import { useEffect, useState, useRef } from 'react';
import { Habit } from '../types';
import { sendHabitReminder } from '../utils/notifications';

interface InAppAlert {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

export function useNotificationScheduler(habits: Habit[]) {
  const [activeAlert, setActiveAlert] = useState<InAppAlert | null>(null);
  const notifiedMapRef = useRef<Record<string, string>>({}); // habitId -> YYYY-MM-DD

  // Listen for in-app notification event fallback
  useEffect(() => {
    const handleInAppAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string }>;
      const alert: InAppAlert = {
        id: `alert-${Date.now()}`,
        title: customEvent.detail.title,
        body: customEvent.detail.body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setActiveAlert(alert);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setActiveAlert((curr) => (curr?.id === alert.id ? null : curr));
      }, 6000);
    };

    window.addEventListener('ecopulse:in-app-notification', handleInAppAlert);
    return () => {
      window.removeEventListener('ecopulse:in-app-notification', handleInAppAlert);
    };
  }, []);

  // Interval to check habit reminder times
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().slice(0, 10);

      habits.forEach((habit) => {
        if (habit.reminderEnabled && habit.reminderTime) {
          const lastNotified = notifiedMapRef.current[habit.id];

          // If scheduled for this exact minute and haven't fired today
          if (habit.reminderTime === currentTimeStr && lastNotified !== todayDateStr) {
            notifiedMapRef.current[habit.id] = todayDateStr;
            sendHabitReminder(habit);
          }
        }
      });
    };

    // Run check immediately and every 25 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 25000);

    return () => clearInterval(interval);
  }, [habits]);

  return {
    activeAlert,
    dismissAlert: () => setActiveAlert(null),
  };
}
