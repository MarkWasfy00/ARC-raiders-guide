'use client';

import { ScheduledEvent } from '../types/index';
import { getActiveEvents } from '../utils/eventHelpers';
import { EventCard } from './EventCard';
import { useEffect, useState } from 'react';

interface EventTimersProps {
  events: ScheduledEvent[];
}

export function EventTimers({ events }: EventTimersProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get active and upcoming events
  const allActiveEvents = getActiveEvents(events);
  const activeEvents = allActiveEvents.filter((e) => e.status === 'active');
  const upcomingEvents = allActiveEvents.filter(
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
              {activeEvents.map((event, index) => (
                <EventCard key={`${event.event.name}-${event.event.map}-${index}`} event={event} />
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
              {upcomingEvents.map((event, index) => (
                <EventCard key={`${event.event.name}-${event.event.map}-${index}`} event={event} />
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
