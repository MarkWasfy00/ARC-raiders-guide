'use client';

import { useState, useEffect } from 'react';
import { ScheduledEvent } from '../types/index';
import { EventCard } from './EventCard';
import { Loader2, Calendar, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActiveEvents } from '../utils/eventHelpers';

interface EventTimersContentProps {
  events: ScheduledEvent[];
  isLoading: boolean;
  error: Error | null;
}

type DayFilter = 'all' | 'today' | string;

export function EventTimersContent({ events, isLoading, error }: EventTimersContentProps) {
  const [selectedDay, setSelectedDay] = useState<DayFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNowCount, setActiveNowCount] = useState(0);

  // Update active now count every second
  useEffect(() => {
    if (events.length === 0) return;

    const updateActiveCount = () => {
      const allEvents = getActiveEvents(events);
      // Filter only currently active events (not upcoming)
      const activeOnly = allEvents.filter(e => e.status === 'active');

      // Count unique events (not time slots) - deduplicate by name + map
      const uniqueActiveEvents = new Set(
        activeOnly.map(e => `${e.event.name}-${e.event.map}`)
      );

      setActiveNowCount(uniqueActiveEvents.size);
    };

    updateActiveCount();
    const interval = setInterval(updateActiveCount, 1000);
    return () => clearInterval(interval);
  }, [events]);

  // Convert to active events and filter by search query
  const activeEvents = getActiveEvents(events);
  const filteredEvents = activeEvents.filter(activeEvent => {
    const event = activeEvent.event;
    const matchesSearch =
      searchQuery === '' ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.map.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event timers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load events</h3>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Event Timers</h1>
        <p className="text-muted-foreground">
          Track all Arc Raiders events and their schedules
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Events</p>
          <p className="text-2xl font-bold text-foreground">{events.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Now</p>
          <p className="text-2xl font-bold text-green-500">
            {activeNowCount}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Showing</p>
          <p className="text-2xl font-bold text-primary">{filteredEvents.length}</p>
        </div>
      </div>

      {/* Event Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <EventCard key={`${event.event.name}-${index}`} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
