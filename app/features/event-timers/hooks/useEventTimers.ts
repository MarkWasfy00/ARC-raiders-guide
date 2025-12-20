'use client';

import { useState, useEffect } from 'react';
import { Event, EventWithStatus } from '../types';
import { getEventStatus } from '../utils/timeUtils';

// Sample event data - replace with your actual data source/API
const sampleEvents: Event[] = [
  {
    id: '1',
    name: 'Husk Graveyard',
    location: 'Buried City',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/husk-graveyard.webp',
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    endTime: new Date(Date.now() + 30 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Hidden Bunker',
    location: 'Spaceport',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/hiddenbunker.webp',
    startTime: new Date(Date.now() - 15 * 60 * 1000),
    endTime: new Date(Date.now() + 45 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Cold Snap',
    location: 'Blue Gate',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/coldsnap.webp',
    startTime: new Date(Date.now() - 10 * 60 * 1000),
    endTime: new Date(Date.now() + 90 * 60 * 1000),
  },
  {
    id: '4',
    name: 'Prospecting Probes',
    location: 'Dam',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/probe.webp',
    startTime: new Date(Date.now() + 30 * 60 * 1000),
    endTime: new Date(Date.now() + 120 * 60 * 1000),
  },
  {
    id: '5',
    name: 'Matriarch',
    location: 'Blue Gate',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/matriarch.webp',
    startTime: new Date(Date.now() + 90 * 60 * 1000),
    endTime: new Date(Date.now() + 180 * 60 * 1000),
  },
  {
    id: '6',
    name: 'Electromagnetic Storm',
    location: 'Dam',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/electrical.webp',
    startTime: new Date(Date.now() + 90 * 60 * 1000),
    endTime: new Date(Date.now() + 150 * 60 * 1000),
  },
  {
    id: '7',
    name: 'Night Raid',
    location: 'Stella Montis',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/night.webp',
    startTime: new Date(Date.now() + 90 * 60 * 1000),
    endTime: new Date(Date.now() + 180 * 60 * 1000),
  },
];

interface EventWithNavbarFormat {
  status: 'active' | 'upcoming' | 'ended';
  event: {
    name: string;
    map: string;
  };
  timeUntilChange: number;
}

export function useEventTimers() {
  const [eventsWithStatus, setEventsWithStatus] = useState<EventWithStatus[]>([]);

  useEffect(() => {
    const updateEventStatuses = () => {
      const updated = sampleEvents.map((event) => {
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
  }, []);

  // Transform to the format expected by Navbar
  const activeEvents: EventWithNavbarFormat[] = eventsWithStatus
    .filter((e) => e.status === 'active' || e.status === 'upcoming')
    .map((e) => ({
      status: e.status,
      event: {
        name: e.name,
        map: e.location,
      },
      timeUntilChange: e.timeRemaining || e.timeUntilStart || 0,
    }));

  const upcomingEvents = eventsWithStatus.filter((e) => e.status === 'upcoming');

  return {
    activeEvents,
    upcomingEvents,
    allEvents: eventsWithStatus,
  };
}
