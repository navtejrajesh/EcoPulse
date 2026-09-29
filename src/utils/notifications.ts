import { Habit } from '../types';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return Notification.permission;
  }
}

export function showPushNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined') return false;

  // Web Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        silent: false,
        ...options,
      });
      return true;
    } catch (e) {
      // In some mobile browsers or service-worker-only environments
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            icon: '/pwa-192x192.png',
            badge: '/icon.svg',
            ...options,
          });
        }).catch(() => {});
        return true;
      }
    }
  }

  // Dispatch in-app fallback event for UI toast
  window.dispatchEvent(
    new CustomEvent('ecopulse:in-app-notification', {
      detail: {
        title,
        body: options?.body || 'Time to complete your daily eco habit!',
      },
    })
  );

  return false;
}

export function sendHabitReminder(habit: Habit): void {
  const title = `🌱 EcoPulse: Time for ${habit.title}!`;
  const body = `Keep your ${habit.streak}-day streak alive! Completing this saves ${habit.impact.co2Kg}kg CO₂ and earns +${habit.xp} XP.`;

  showPushNotification(title, {
    body,
    tag: `habit-reminder-${habit.id}`,
  });
}
