'use client';

import { Event, EventWithStatus } from '../types';
import { getEventStatus } from '../utils/timeUtils';
import { EventCard } from './EventCard';
import { useEffect, useState } from 'react';

interface EventTimersProps {
  events: Event[];
}

export function EventTimers({ events }: EventTimersProps) {
  const [eventsWithStatus, setEventsWithStatus] = useState<EventWithStatus[]>(
    []
  );

  useEffect(() => {
    const updateEventStatuses = () => {
      const updated = events.map((event) => {
        const status = getEventStatus(event.startTime, event.endTime);
        return {
          ...event,
          ...status,
        };
      });
      setEventsWithStatus(updated);
    };

    updateEventStatuses();
    const interval = setInterval(updateEventStatuses, 1000);

    return () => clearInterval(interval);
  }, [events]);

  // Filter out ended events
  const activeEvents = eventsWithStatus.filter((e) => e.status === 'active');
  const upcomingEvents = eventsWithStatus.filter(
    (e) => e.status === 'upcoming'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground/75">
          <h2 className="text-xl font-semibold">Active Events</h2>
          <div className="grid aspect-square w-8 place-items-center rounded-full bg-white/5 text-sm">
            {activeEvents.length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-2">
          {activeEvents.length > 0 ? (
            <div className="space-y-1">
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-muted-foreground">
              No active events at the moment
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground/75">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="grid aspect-square w-8 place-items-center rounded-full bg-white/5 text-sm">
            {upcomingEvents.length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-2">
          {upcomingEvents.length > 0 ? (
            <div className="space-y-1">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-muted-foreground">
              No upcoming events scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
