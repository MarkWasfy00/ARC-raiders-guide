'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Star, StarOff, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type ApiEvent = {
  name: string;
  map: string;
  icon: string;
  startTime: number;
  endTime: number;
};

type ApiResponse = {
  data: ApiEvent[];
  cachedAt: number;
};

type EventInstance = {
  id: string;
  map: string;
  start: Date;
  end: Date;
};

type EventDefinition = {
  id: string;
  name: string;
  thumbnail: string;
  maps: string[];
  instances: EventInstance[];
};

const timeZone = 'Africa/Cairo';

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

const getNearestActiveInstance = (instances: EventInstance[], now: Date) => {
  const active = instances.filter((instance) => now >= instance.start && now < instance.end);
  if (active.length === 0) return null;
  return active.reduce((closest, instance) => (instance.end < closest.end ? instance : closest));
};

const getNearestUpcomingInstance = (instances: EventInstance[], now: Date) => {
  const upcoming = instances.filter((instance) => now < instance.start);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((closest, instance) => (instance.start < closest.start ? instance : closest));
};

const transformApiData = (apiEvents: ApiEvent[]): EventDefinition[] => {
  const eventMap = new Map<string, EventDefinition>();

  apiEvents.forEach((apiEvent, index) => {
    const eventId = apiEvent.name.toLowerCase().replace(/\s+/g, '-');

    if (!eventMap.has(eventId)) {
      eventMap.set(eventId, {
        id: eventId,
        name: apiEvent.name,
        thumbnail: apiEvent.icon,
        maps: [],
        instances: [],
      });
    }

    const event = eventMap.get(eventId)!;

    if (!event.maps.includes(apiEvent.map)) {
      event.maps.push(apiEvent.map);
    }

    event.instances.push({
      id: `${eventId}-${index}`,
      map: apiEvent.map,
      start: new Date(apiEvent.startTime),
      end: new Date(apiEvent.endTime),
    });
  });

  return Array.from(eventMap.values());
};

export default function EventTimersPage() {
  const [now, setNow] = useState(() => new Date());
  const [favourite, setFavourite] = useState(false);
  const [mapNotifications, setMapNotifications] = useState<Record<string, string[]>>({});
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/event-timers');

        if (!response.ok) {
          throw new Error('Failed to fetch event schedule');
        }

        const data: ApiResponse = await response.json();
        const transformedEvents = transformApiData(data.data);
        setEvents(transformedEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const activeEvents = events
    .map((event) => {
      const activeInstance = getNearestActiveInstance(event.instances, now);
      return activeInstance ? { event, instance: activeInstance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.instance.end.getTime() - b!.instance.end.getTime()) as Array<{
    event: EventDefinition;
    instance: EventInstance;
  }>;

  const upcomingEvents = events
    .map((event) => {
      const upcomingInstance = getNearestUpcomingInstance(event.instances, now);
      const activeInstance = getNearestActiveInstance(event.instances, now);
      return !activeInstance && upcomingInstance ? { event, instance: upcomingInstance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.instance.start.getTime() - b!.instance.start.getTime()) as Array<{
    event: EventDefinition;
    instance: EventInstance;
  }>;

  const toggleEventNotifications = (event: EventDefinition) => {
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4DB3FF] mx-auto mb-4" />
          <p className="text-[#A0A0A0]">جاري تحميل مؤقتات الأحداث...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">فشل تحميل الأحداث</h3>
          <p className="text-[#A0A0A0] text-sm">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative w-full px-6 md:px-12 xl:px-16 py-8 space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] md:text-[22px] font-bold tracking-wide">
              مؤقتات أحداث ARC Raiders
            </h1>
            <div className="flex items-center gap-2 text-[12px] md:text-[14px] text-[#A0A0A0] border border-dashed border-white/10 rounded-full px-3 py-1 bg-white/5">
              <Link href="/" className="hover:text-white transition-colors">
                ARC Raiders
              </Link>
              <span className="text-white/30">{'<'}</span>
              <span className="text-white/70">مؤقتات الأحداث</span>
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
            {favourite ? 'تمت الإضافة للمفضلة' : 'إضافة للمفضلة'}
          </button>
        </header>

        <section className="flex flex-wrap items-center justify-between gap-2 text-[#A0A0A0] text-[12px] md:text-[14px]">
          <span>الأوقات معروضة بتوقيت {timeZone}</span>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[14px] md:text-[16px] font-semibold text-[#3AEF7E] uppercase">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#3AEF7E]" />
              نشطة الآن
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
                      ينتهي خلال {formatCountdown(instance.end.getTime() - now.getTime())}
                    </div>
                  </div>
                </div>
              ))}
              {activeEvents.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] md:text-[14px] text-[#A0A0A0]">
                  لا توجد أحداث نشطة الآن. تحقق من القائمة القادمة للتخطيط المسبق.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[14px] md:text-[16px] font-semibold text-[#4DB3FF] uppercase">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#4DB3FF]" />
              القادمة
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
                      يبدأ خلال {formatCountdown(instance.start.getTime() - now.getTime())}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] md:text-[14px] text-[#A0A0A0]">
                  لا توجد أحداث قادمة مجدولة في الدورة التالية.
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
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .slice(0, 5);
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
                            <div className="text-[#A0A0A0]">
                              {formatDateTime(instance.start)} · {instance.map}
                            </div>
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
