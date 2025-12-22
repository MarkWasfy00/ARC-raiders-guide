import { EventsScheduleResponse } from '../types/index';

export async function fetchEventTimers(): Promise<EventsScheduleResponse> {
  // Call our cached API route instead of MetaForge directly
  const response = await fetch('/api/event-timers', {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error('Failed to fetch event timers data');
  }

  return response.json();
}

// Client-side fetch for use in client components
export async function fetchEventTimersClient(): Promise<EventsScheduleResponse> {
  const response = await fetch('/api/event-timers');

  if (!response.ok) {
    throw new Error('Failed to fetch event timers data');
  }

  return response.json();
}
