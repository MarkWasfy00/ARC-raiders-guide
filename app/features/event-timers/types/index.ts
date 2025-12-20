export interface EventTime {
  start: string;
  end: string;
}

export interface EventData {
  game: string;
  name: string;
  map: string;
  icon: string;
  description: string;
  days: string[];
  times: EventTime[];
}

export interface ArcRaidersEventResponse {
  data: EventData[];
}

// New types for events-schedule API
export interface ScheduledEvent {
  name: string;
  map: string;
  icon: string;
  startTime: number; // Unix timestamp in milliseconds
  endTime: number;   // Unix timestamp in milliseconds
}

export interface EventsScheduleResponse {
  data: ScheduledEvent[];
}

export interface ActiveEvent {
  event: ScheduledEvent;
  status: 'active' | 'upcoming';
  timeUntilChange: number; // milliseconds until event starts or ends
}
