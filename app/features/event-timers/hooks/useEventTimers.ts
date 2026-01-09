'use client';

import { useState, useEffect } from 'react';
import { ScheduledEvent, EventsScheduleResponse } from '../types/index';
import { getActiveEvents } from '../utils/eventHelpers';

interface EventWithNavbarFormat {
  status: 'active' | 'upcoming';
  event: {
    name: string;
    map: string;
  };
  timeUntilChange: number;
}

export function useEventTimers() {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/event-timers');

        if (!response.ok) {
          throw new Error('Failed to fetch event timers');
        }

        const data: EventsScheduleResponse = await response.json();
        setEvents(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();

    // Refresh data every 5 minutes
    const fetchInterval = setInterval(fetchEvents, 5 * 60 * 1000);

    return () => clearInterval(fetchInterval);
  }, []);

  // Get active and upcoming events with real-time updates
  const activeEventsData = getActiveEvents(events);

  // Transform to the format expected by Navbar
  const activeEvents: EventWithNavbarFormat[] = activeEventsData.map((e) => ({
    status: e.status,
    event: {
      name: e.event.name,
      map: e.event.map,
    },
    timeUntilChange: e.timeUntilChange,
  }));

  const upcomingEvents = activeEventsData.filter((e) => e.status === 'upcoming');

  return {
    activeEvents,
    upcomingEvents,
    allEvents: activeEventsData,
    isLoading,
    error,
  };
}
