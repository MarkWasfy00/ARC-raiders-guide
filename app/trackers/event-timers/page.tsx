'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type EventInstance = {
  id: string;
  map: string;
  startOffsetMinutes: number;
  durationMinutes: number;
};

type EventDefinition = {
  id: string;
  name: string;
  thumbnail: string;
  maps: string[];
  instances: EventInstance[];
};

type ResolvedInstance = EventInstance & {
  start: Date;
  end: Date;
};

type ResolvedEvent = Omit<EventDefinition, 'instances'> & {
  instances: ResolvedInstance[];
};

const timeZone = 'Africa/Cairo';

const rawEvents: EventDefinition[] = [
  {
    id: 'stormline',
    name: 'Stormline Breach',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/events.webp',
    maps: ['Dam', 'Bluegate', 'Spaceport'],
    instances: [
      { id: 'stormline-1', map: 'Dam', startOffsetMinutes: -75, durationMinutes: 90 },
      { id: 'stormline-2', map: 'Bluegate', startOffsetMinutes: 120, durationMinutes: 60 },
      { id: 'stormline-3', map: 'Spaceport', startOffsetMinutes: 360, durationMinutes: 60 },
    ],
  },
  {
    id: 'signalflare',
    name: 'Signal Flare Escort',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/quests.webp',
    maps: ['Stella Montis', 'Dam'],
    instances: [
      { id: 'signalflare-1', map: 'Stella Montis', startOffsetMinutes: 25, durationMinutes: 50 },
      { id: 'signalflare-2', map: 'Dam', startOffsetMinutes: 210, durationMinutes: 50 },
      { id: 'signalflare-3', map: 'Stella Montis', startOffsetMinutes: 470, durationMinutes: 50 },
    ],
  },
  {
    id: 'orbitbreak',
    name: 'Orbit Breaker Drop',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    maps: ['Bluegate', 'Spaceport'],
    instances: [
      { id: 'orbitbreak-1', map: 'Bluegate', startOffsetMinutes: -40, durationMinutes: 60 },
      { id: 'orbitbreak-2', map: 'Spaceport', startOffsetMinutes: 90, durationMinutes: 60 },
      { id: 'orbitbreak-3', map: 'Bluegate', startOffsetMinutes: 300, durationMinutes: 60 },
    ],
  },
  {
    id: 'gridpulse',
    name: 'Gridpulse Sweep',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/arcs.webp',
    maps: ['Dam', 'Stella Montis'],
    instances: [
      { id: 'gridpulse-1', map: 'Dam', startOffsetMinutes: -30, durationMinutes: 70 },
      { id: 'gridpulse-2', map: 'Stella Montis', startOffsetMinutes: 160, durationMinutes: 50 },
      { id: 'gridpulse-3', map: 'Dam', startOffsetMinutes: 420, durationMinutes: 60 },
    ],
  },
  {
    id: 'embertrail',
    name: 'Embertrail Convoy',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/quests.webp',
    maps: ['Bluegate', 'Spaceport'],
    instances: [
      { id: 'embertrail-1', map: 'Bluegate', startOffsetMinutes: -55, durationMinutes: 80 },
      { id: 'embertrail-2', map: 'Spaceport', startOffsetMinutes: 140, durationMinutes: 55 },
      { id: 'embertrail-3', map: 'Bluegate', startOffsetMinutes: 380, durationMinutes: 55 },
    ],
  },
  {
    id: 'riftguard',
    name: 'Riftguard Uplink',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/events.webp',
    maps: ['Stella Montis', 'Dam'],
    instances: [
      { id: 'riftguard-1', map: 'Stella Montis', startOffsetMinutes: -20, durationMinutes: 75 },
      { id: 'riftguard-2', map: 'Dam', startOffsetMinutes: 190, durationMinutes: 60 },
      { id: 'riftguard-3', map: 'Stella Montis', startOffsetMinutes: 430, durationMinutes: 60 },
    ],
  },
  {
    id: 'strikezone',
    name: 'Strikezone Relay',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    maps: ['Spaceport', 'Bluegate'],
    instances: [
      { id: 'strikezone-1', map: 'Spaceport', startOffsetMinutes: -45, durationMinutes: 65 },
      { id: 'strikezone-2', map: 'Bluegate', startOffsetMinutes: 150, durationMinutes: 55 },
      { id: 'strikezone-3', map: 'Spaceport', startOffsetMinutes: 410, durationMinutes: 55 },
    ],
  },
  {
    id: 'clearwater',
    name: 'Clearwater Surge',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/arcs.webp',
    maps: ['Dam', 'Bluegate'],
    instances: [
      { id: 'clearwater-1', map: 'Dam', startOffsetMinutes: -10, durationMinutes: 60 },
      { id: 'clearwater-2', map: 'Bluegate', startOffsetMinutes: 180, durationMinutes: 60 },
      { id: 'clearwater-3', map: 'Dam', startOffsetMinutes: 420, durationMinutes: 60 },
    ],
  },
  {
    id: 'novaeclipse',
    name: 'Nova Eclipse',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    maps: ['Spaceport', 'Stella Montis'],
    instances: [
      { id: 'novaeclipse-1', map: 'Spaceport', startOffsetMinutes: 45, durationMinutes: 60 },
      { id: 'novaeclipse-2', map: 'Stella Montis', startOffsetMinutes: 240, durationMinutes: 60 },
      { id: 'novaeclipse-3', map: 'Spaceport', startOffsetMinutes: 520, durationMinutes: 60 },
    ],
  },
  {
    id: 'skyforge',
    name: 'Skyforge Outpost',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/events.webp',
    maps: ['Bluegate', 'Dam'],
    instances: [
      { id: 'skyforge-1', map: 'Bluegate', startOffsetMinutes: 70, durationMinutes: 55 },
      { id: 'skyforge-2', map: 'Dam', startOffsetMinutes: 260, durationMinutes: 55 },
      { id: 'skyforge-3', map: 'Bluegate', startOffsetMinutes: 520, durationMinutes: 55 },
    ],
  },
  {
    id: 'ironhail',
    name: 'Ironhail Drop',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/quests.webp',
    maps: ['Stella Montis', 'Spaceport'],
    instances: [
      { id: 'ironhail-1', map: 'Stella Montis', startOffsetMinutes: 85, durationMinutes: 60 },
      { id: 'ironhail-2', map: 'Spaceport', startOffsetMinutes: 280, durationMinutes: 60 },
      { id: 'ironhail-3', map: 'Stella Montis', startOffsetMinutes: 560, durationMinutes: 60 },
    ],
  },
  {
    id: 'aegisline',
    name: 'Aegisline Defense',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/arcs.webp',
    maps: ['Dam', 'Bluegate'],
    instances: [
      { id: 'aegisline-1', map: 'Dam', startOffsetMinutes: 110, durationMinutes: 50 },
      { id: 'aegisline-2', map: 'Bluegate', startOffsetMinutes: 300, durationMinutes: 50 },
      { id: 'aegisline-3', map: 'Dam', startOffsetMinutes: 580, durationMinutes: 50 },
    ],
  },
  {
    id: 'driftwake',
    name: 'Driftwake Intercept',
    thumbnail: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    maps: ['Spaceport', 'Stella Montis'],
    instances: [
      { id: 'driftwake-1', map: 'Spaceport', startOffsetMinutes: 130, durationMinutes: 55 },
      { id: 'driftwake-2', map: 'Stella Montis', startOffsetMinutes: 320, durationMinutes: 55 },
      { id: 'driftwake-3', map: 'Spaceport', startOffsetMinutes: 600, durationMinutes: 55 },
    ],
  },
];

const formatCountdown = (totalMs: number) => {
  const safeMs = Math.max(0, totalMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone,
  hour: 'numeric',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone,
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone,
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

const formatTimeRange = (start: Date, end: Date) =>
  `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;

const formatDateTime = (date: Date) => `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;

const getNearestActiveInstance = (instances: ResolvedInstance[], now: Date) => {
  const active = instances.filter((instance) => now >= instance.start && now < instance.end);
  if (active.length === 0) return null;
  return active.reduce((closest, instance) => (instance.end < closest.end ? instance : closest));
};

const getNearestUpcomingInstance = (instances: ResolvedInstance[], now: Date) => {
  const upcoming = instances.filter((instance) => now < instance.start);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((closest, instance) => (instance.start < closest.start ? instance : closest));
};

export default function EventTimersPage() {
  const baseTimeRef = useRef(new Date());
  const [now, setNow] = useState(() => new Date());
  const [favourite, setFavourite] = useState(false);
  const [mapNotifications, setMapNotifications] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const events = useMemo<ResolvedEvent[]>(() => {
    const base = baseTimeRef.current;
    return rawEvents.map((event) => ({
      ...event,
      instances: event.instances.map((instance) => {
        const start = new Date(base.getTime() + instance.startOffsetMinutes * 60 * 1000);
        const end = new Date(start.getTime() + instance.durationMinutes * 60 * 1000);
        return { ...instance, start, end };
      }),
    }));
  }, []);

  const activeEvents = events
    .map((event) => {
      const activeInstance = getNearestActiveInstance(event.instances, now);
      return activeInstance ? { event, instance: activeInstance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.instance.end.getTime() - b!.instance.end.getTime()) as Array<{
    event: ResolvedEvent;
    instance: ResolvedInstance;
  }>;

  const upcomingEvents = events
    .map((event) => {
      const upcomingInstance = getNearestUpcomingInstance(event.instances, now);
      const activeInstance = getNearestActiveInstance(event.instances, now);
      return !activeInstance && upcomingInstance ? { event, instance: upcomingInstance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.instance.start.getTime() - b!.instance.start.getTime()) as Array<{
    event: ResolvedEvent;
    instance: ResolvedInstance;
  }>;

  const toggleEventNotifications = (event: ResolvedEvent) => {
    setMapNotifications((prev) => {
      const current = new Set(prev[event.id] ?? []);
      const allSelected = event.maps.every((map) => current.has(map));
      return {
        ...prev,
        [event.id]: allSelected ? [] : [...event.maps],
      };
    });
  };

  const toggleMapNotification = (eventId: string, mapName: string) => {
    setMapNotifications((prev) => {
      const current = new Set(prev[eventId] ?? []);
      if (current.has(mapName)) {
        current.delete(mapName);
      } else {
        current.add(mapName);
      }
      return { ...prev, [eventId]: [...current] };
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative w-full px-6 md:px-12 xl:px-16 py-8 space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] md:text-[22px] font-bold tracking-wide">
              ARC Raiders Event Timers
            </h1>
            <div className="flex items-center gap-2 text-[12px] md:text-[14px] text-[#A0A0A0] border border-dashed border-white/10 rounded-full px-3 py-1 bg-white/5">
              <Link href="/" className="hover:text-white transition-colors">
                Arc Raiders
              </Link>
              <span className="text-white/30">{'>'}</span>
              <span className="text-white/70">Event Timers</span>
            </div>
          </div>

          <button
            onClick={() => setFavourite((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] md:text-[14px] font-semibold transition-all shadow-sm',
              favourite
                ? 'border-[#4DB3FF] bg-[#4DB3FF]/15 text-[#4DB3FF] shadow-[0_0_18px_rgba(77,179,255,0.35)]'
                : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
            )}
          >
            {favourite ? (
              <Star className="w-4 h-4 text-[#4DB3FF] fill-[#4DB3FF]" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
            {favourite ? 'Added to favourite' : 'Add to favourite'}
          </button>
        </header>

        <section className="flex flex-wrap items-center justify-between gap-2 text-[#A0A0A0] text-[12px] md:text-[14px]">
          <span>Times shown in {timeZone}</span>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[14px] md:text-[16px] font-semibold text-[#3AEF7E] uppercase">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#3AEF7E]" />
              Active Now
            </div>
            <div className="flex flex-wrap gap-3">
              {activeEvents.map(({ event, instance }) => (
                <div
                  key={`${event.id}-active`}
                  className="w-full sm:w-[260px] flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/15">
                    <Image src={event.thumbnail} alt={event.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="text-[14px] md:text-[16px] font-semibold">{event.name}</div>
                    <div className="text-[12px] md:text-[13px] text-[#A0A0A0]">{instance.map}</div>
                    <div className="text-[12px] md:text-[13px] font-semibold text-[#3AEF7E]">
                      Ends in {formatCountdown(instance.end.getTime() - now.getTime())}
                    </div>
                  </div>
                </div>
              ))}
              {activeEvents.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] md:text-[14px] text-[#A0A0A0]">
                  No active events right now. Check the upcoming list to plan ahead.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[14px] md:text-[16px] font-semibold text-[#4DB3FF] uppercase">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#4DB3FF]" />
              Upcoming Next
            </div>
            <div className="flex flex-wrap gap-3">
              {upcomingEvents.map(({ event, instance }) => (
                <div
                  key={`${event.id}-upcoming`}
                  className="w-full sm:w-[260px] flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/15">
                    <Image src={event.thumbnail} alt={event.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="text-[14px] md:text-[16px] font-semibold">{event.name}</div>
                    <div className="text-[12px] md:text-[13px] text-[#A0A0A0]">{instance.map}</div>
                    <div className="text-[12px] md:text-[13px] font-semibold text-[#4DB3FF]">
                      Starts in {formatCountdown(instance.start.getTime() - now.getTime())}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] md:text-[14px] text-[#A0A0A0]">
                  No upcoming events scheduled in the next rotation.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-4">
          {events.map((event) => {
            const activeInstance = getNearestActiveInstance(event.instances, now);
            const upcomingInstance = getNearestUpcomingInstance(event.instances, now);
            const isActive = Boolean(activeInstance);
            const statusLabel = isActive ? 'Active' : 'Upcoming';
            const statusColor = isActive ? '#3AEF7E' : '#4DB3FF';
            const displayInstance = isActive ? activeInstance : upcomingInstance;
            const countdownTarget = isActive ? displayInstance?.end : displayInstance?.start;
            const countdownLabel = isActive ? 'Ends in' : 'Starts in';
            const sortedInstances = [...event.instances]
              .filter((instance) => instance.end > now)
              .sort((a, b) => a.start.getTime() - b.start.getTime());
            const highlightedInstanceId = isActive ? activeInstance?.id : upcomingInstance?.id;
            const activeMapNotifications = new Set(mapNotifications[event.id] ?? []);
            const eventNotificationsActive =
              event.maps.length > 0 && event.maps.every((map) => activeMapNotifications.has(map));

            return (
              <article
                key={event.id}
                className="w-full md:w-[calc(50%-8px)] xl:w-[calc(33.333%-10.7px)] rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white/15">
                      <Image src={event.thumbnail} alt={event.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[14px] md:text-[16px] font-semibold">{event.name}</h2>
                        <span
                          className="text-[11px] md:text-[12px] font-semibold px-2 py-0.5 rounded-full border uppercase"
                          style={{
                            color: statusColor,
                            borderColor: `${statusColor}55`,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="text-[12px] md:text-[13px] text-[#A0A0A0]">
                        {event.maps.join(', ')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleEventNotifications(event)}
                    className={cn(
                      'inline-flex items-center justify-center rounded-full border px-3 py-2 text-[12px] md:text-[13px] transition-colors',
                      eventNotificationsActive
                        ? 'border-white/20 text-white bg-white/10'
                        : 'border-white/10 text-white/70 hover:border-white/30'
                    )}
                    aria-pressed={eventNotificationsActive}
                  >
                    <Bell
                      className={cn(
                        'h-4 w-4 transition-transform',
                        eventNotificationsActive ? 'fill-white text-white' : 'text-white/70',
                        eventNotificationsActive ? 'scale-110' : 'scale-100'
                      )}
                    />
                  </button>
                </div>

                <div
                  className="mt-3 rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: isActive ? 'rgba(58,239,126,0.12)' : 'rgba(77,179,255,0.12)',
                    border: `1px solid ${isActive ? 'rgba(58,239,126,0.3)' : 'rgba(77,179,255,0.3)'}`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] md:text-[13px] font-semibold">
                    <span>{countdownLabel}</span>
                    <span style={{ color: statusColor }}>
                      {countdownTarget
                        ? formatCountdown(countdownTarget.getTime() - now.getTime())
                        : 'Waiting...'}
                    </span>
                  </div>
                  {displayInstance && countdownTarget && (
                    <div className="mt-1 text-[12px] md:text-[13px] text-[#A0A0A0] space-y-1">
                      <div>{formatTimeRange(displayInstance.start, displayInstance.end)}</div>
                      <div>{formatDateTime(displayInstance.start)}</div>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-[12px] md:text-[13px] text-[#A0A0A0] uppercase tracking-wide">
                    Upcoming Instances
                  </div>
                  <div className="space-y-2">
                    {sortedInstances.map((instance) => {
                      const isHighlighted = instance.id === highlightedInstanceId;
                      const isActiveInstance = now >= instance.start && now < instance.end;
                      const timerTarget = isActiveInstance ? instance.end : instance.start;
                      const label = isActiveInstance ? 'Ends in' : 'Starts in';
                      const mapNotified = activeMapNotifications.has(instance.map);

                      return (
                        <div
                          key={instance.id}
                          className={cn(
                            'flex flex-col md:flex-row md:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px] md:text-[13px] transition-colors',
                            isHighlighted
                              ? 'border-white/30 bg-white/10'
                              : 'border-white/10 bg-transparent'
                          )}
                        >
                          <div className="space-y-0.5">
                            <div>{formatTimeRange(instance.start, instance.end)}</div>
                            <div className="text-[#A0A0A0]">{formatDateTime(instance.start)}</div>
                            <div className="text-[#A0A0A0]">{instance.map}</div>
                          </div>
                          <div className="flex items-center gap-3 md:justify-end">
                            <div className="text-[12px] md:text-[13px] font-semibold">
                              {label} {formatCountdown(timerTarget.getTime() - now.getTime())}
                            </div>
                            <button
                              onClick={() => toggleMapNotification(event.id, instance.map)}
                              className={cn(
                                'inline-flex items-center justify-center rounded-full border px-2 py-1 transition-colors',
                                mapNotified
                                  ? 'border-white/25 bg-white/10 text-white'
                                  : 'border-white/10 text-white/70 hover:border-white/30'
                              )}
                              aria-pressed={mapNotified}
                            >
                              <Bell className={cn('h-3.5 w-3.5', mapNotified ? 'fill-white text-white' : 'text-white/70')} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
