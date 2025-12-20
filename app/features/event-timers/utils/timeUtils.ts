export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getEventStatus(startTime: Date, endTime: Date): {
  status: 'active' | 'upcoming' | 'ended';
  timeRemaining?: number;
  timeUntilStart?: number;
} {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= start && now <= end) {
    return {
      status: 'active',
      timeRemaining: end.getTime() - now.getTime(),
    };
  } else if (now < start) {
    return {
      status: 'upcoming',
      timeUntilStart: start.getTime() - now.getTime(),
    };
  } else {
    return {
      status: 'ended',
    };
  }
}
