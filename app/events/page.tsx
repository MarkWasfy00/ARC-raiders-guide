import { EventTimers } from '@/app/features/event-timers';
import { Event } from '@/app/features/event-timers/types';

// Sample event data - replace with your actual data source
const sampleEvents: Event[] = [
  {
    id: '1',
    name: 'Husk Graveyard',
    location: 'Buried City',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/husk-graveyard.webp',
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
    endTime: new Date(Date.now() + 30 * 60 * 1000), // Ends in 30 mins
  },
  {
    id: '2',
    name: 'Hidden Bunker',
    location: 'Spaceport',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/hiddenbunker.webp',
    startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 mins ago
    endTime: new Date(Date.now() + 45 * 60 * 1000), // Ends in 45 mins
  },
  {
    id: '3',
    name: 'Cold Snap',
    location: 'Blue Gate',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/coldsnap.webp',
    startTime: new Date(Date.now() - 10 * 60 * 1000), // Started 10 mins ago
    endTime: new Date(Date.now() + 90 * 60 * 1000), // Ends in 1h 30 mins
  },
  {
    id: '4',
    name: 'Prospecting Probes',
    location: 'Dam',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/probe.webp',
    startTime: new Date(Date.now() + 30 * 60 * 1000), // Starts in 30 mins
    endTime: new Date(Date.now() + 120 * 60 * 1000), // Ends in 2 hours
  },
  {
    id: '5',
    name: 'Matriarch',
    location: 'Blue Gate',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/matriarch.webp',
    startTime: new Date(Date.now() + 90 * 60 * 1000), // Starts in 1h 30 mins
    endTime: new Date(Date.now() + 180 * 60 * 1000), // Ends in 3 hours
  },
  {
    id: '6',
    name: 'Electromagnetic Storm',
    location: 'Dam',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/electrical.webp',
    startTime: new Date(Date.now() + 90 * 60 * 1000), // Starts in 1h 30 mins
    endTime: new Date(Date.now() + 150 * 60 * 1000), // Ends in 2h 30 mins
  },
  {
    id: '7',
    name: 'Night Raid',
    location: 'Stella Montis',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/night.webp',
    startTime: new Date(Date.now() + 90 * 60 * 1000), // Starts in 1h 30 mins
    endTime: new Date(Date.now() + 180 * 60 * 1000), // Ends in 3 hours
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
