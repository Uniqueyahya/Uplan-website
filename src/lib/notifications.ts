/**
 * Web Browser Native Background Notifications Helper
 */

export async function requestWebNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function scheduleWebTimerNotifications(taskName: string, durationMinutes: number) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  requestWebNotificationPermission();

  const warningMs = (durationMinutes - 5) * 60 * 1000;
  const completionMs = durationMinutes * 60 * 1000;

  let warningTimer: any = null;
  let completionTimer: any = null;

  if (durationMinutes > 5 && warningMs > 0) {
    warningTimer = setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('⏱️ 5 Minutes Remaining!', {
          body: `Your task "${taskName}" has 5 minutes left to finish.`,
          icon: '/favicon.ico',
        });
      }
    }, warningMs);
  }

  completionTimer = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('🎉 Task Completed!', {
        body: `Your timed task "${taskName}" has finished! Open Uplan to view progress.`,
        icon: '/favicon.ico',
      });
    }
  }, completionMs);

  return { warningTimer, completionTimer };
}

export function cancelWebTimerNotifications(timers: { warningTimer?: any; completionTimer?: any } | null) {
  if (!timers) return;
  if (timers.warningTimer) clearTimeout(timers.warningTimer);
  if (timers.completionTimer) clearTimeout(timers.completionTimer);
}
