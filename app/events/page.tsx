import { EventTimers } from '@/app/features/event-timers';
import { ScheduledEvent } from '@/app/features/event-timers';

// Sample event data - replace with your actual data source
const sampleEvents: ScheduledEvent[] = [
  {
    name: 'Husk Graveyard',
    map: 'Buried City',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/husk-graveyard.webp',
    startTime: Date.now() - 30 * 60 * 1000, // Started 30 mins ago
    endTime: Date.now() + 30 * 60 * 1000, // Ends in 30 mins
  },
  {
    name: 'Hidden Bunker',
    map: 'Spaceport',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/hiddenbunker.webp',
    startTime: Date.now() - 15 * 60 * 1000, // Started 15 mins ago
    endTime: Date.now() + 45 * 60 * 1000, // Ends in 45 mins
  },
  {
    name: 'Cold Snap',
    map: 'Blue Gate',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/coldsnap.webp',
    startTime: Date.now() - 10 * 60 * 1000, // Started 10 mins ago
    endTime: Date.now() + 90 * 60 * 1000, // Ends in 1h 30 mins
  },
  {
    name: 'Prospecting Probes',
    map: 'Dam',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/probe.webp',
    startTime: Date.now() + 30 * 60 * 1000, // Starts in 30 mins
    endTime: Date.now() + 120 * 60 * 1000, // Ends in 2 hours
  },
  {
    name: 'Matriarch',
    map: 'Blue Gate',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/matriarch.webp',
    startTime: Date.now() + 90 * 60 * 1000, // Starts in 1h 30 mins
    endTime: Date.now() + 180 * 60 * 1000, // Ends in 3 hours
  },
  {
    name: 'Electromagnetic Storm',
    map: 'Dam',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/electrical.webp',
    startTime: Date.now() + 90 * 60 * 1000, // Starts in 1h 30 mins
    endTime: Date.now() + 150 * 60 * 1000, // Ends in 2h 30 mins
  },
  {
    name: 'Night Raid',
    map: 'Stella Montis',
    icon: 'https://cdn.metaforge.app/arc-raiders/custom/night.webp',
    startTime: Date.now() + 90 * 60 * 1000, // Starts in 1h 30 mins
    endTime: Date.now() + 180 * 60 * 1000, // Ends in 3 hours
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Event Timers
          </h1>
          <p className="text-muted-foreground">
            Track active and upcoming events in ARC Raiders
          </p>
        </div>
        <EventTimers events={sampleEvents} />
      </div>
    </div>
  );
}
