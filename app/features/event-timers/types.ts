export type EventStatus = 'active' | 'upcoming' | 'ended';

export interface Event {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  startTime: Date;
  endTime: Date;
}

export interface EventWithStatus extends Event {
  status: EventStatus;
  timeRemaining?: number;
  timeUntilStart?: number;
}
