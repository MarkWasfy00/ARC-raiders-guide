import { ScheduledEvent, ActiveEvent } from '../types';

/**
 * Gets all currently active and upcoming events
 */
export function getActiveEvents(events: ScheduledEvent[]): ActiveEvent[] {
  const now = Date.now();
  const activeEvents: ActiveEvent[] = [];
  const UPCOMING_WINDOW = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  events.forEach(event => {
    const { startTime, endTime } = event;

    // Check if event is currently active
    const isActive = now >= startTime && now < endTime;

    // Check if event is upcoming (within next 4 hours)
    const isUpcoming = startTime > now && (startTime - now) <= UPCOMING_WINDOW;

    if (isActive) {
      activeEvents.push({
        event,
        status: 'active',
        timeUntilChange: endTime - now, // Time until event ends
      });
    } else if (isUpcoming) {
      activeEvents.push({
        event,
        status: 'upcoming',
        timeUntilChange: startTime - now, // Time until event starts
      });
    }
  });

  // Sort by time until change (active events first, then upcoming by soonest)
  return activeEvents.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return a.timeUntilChange - b.timeUntilChange;
  });
}

/**
 * Formats milliseconds into a human-readable time string
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
