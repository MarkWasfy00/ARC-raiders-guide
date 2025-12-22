'use client';

import { ActiveEvent } from '../types/index';
import { formatTimeRemaining } from '../utils/eventHelpers';
import { useEffect, useState } from 'react';

interface EventCardProps {
  event: ActiveEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState(event.timeUntilChange);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isActive = event.status === 'active';
  const statusColor = isActive ? 'text-green-400' : 'text-blue-400';
  const statusText = isActive ? 'ENDS IN' : 'STARTS IN';

  return (
    <div className="flex items-center justify-between p-2 transition-colors hover:bg-white/3 rounded">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          className="h-12 w-12 rounded object-cover"
          src={event.event.icon}
          alt={event.event.name}
        />
        <div className="flex flex-col gap-1">
          <span className="text-foreground font-semibold text-sm">
            {event.event.name}
          </span>
          <span className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">
            {event.event.map}
          </span>
        </div>
      </div>
      <span
        className={`pr-2 text-right text-[0.7rem] font-semibold tracking-wide uppercase ${statusColor}`}
      >
        {statusText} {formatTimeRemaining(timeLeft)}
      </span>
    </div>
  );
}
