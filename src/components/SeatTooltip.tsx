import React from 'react';
import { Desk } from '../types';
import { Avatar } from './Avatar';

interface SeatTooltipProps {
  desk: Desk | null;
  position: { x: number; y: number };
}

export const SeatTooltip: React.FC<SeatTooltipProps> = React.memo(({ desk, position }) => {
  if (!desk) return null;

  let badgeColor = "bg-secondary/15 text-secondary border-secondary/30";
  let statusText = "Available";

  if (desk.status === 'booked') {
    badgeColor = "bg-error/15 text-error border-error/30";
    statusText = "Occupied";
  } else if (desk.status === 'hold') {
    badgeColor = "bg-tertiary/15 text-tertiary border-tertiary/30";
    statusText = "Temporary Hold";
  } else if (desk.status === 'selected') {
    badgeColor = "bg-primary-container/20 text-primary border-primary/40";
    statusText = "Selected By You";
  }

  return (
    <div
      className="fixed pointer-events-none z-50 bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 p-3.5 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] w-72 text-on-surface will-change-transform"
      style={{
        transform: `translate3d(${position.x + 16}px, ${position.y + 16}px, 0)`,
        top: 0,
        left: 0
      }}
    >
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-outline-variant/30">
        <div>
          <span className="text-primary font-mono font-semibold text-base">
            {desk.id}
          </span>
          <span className="text-xs text-on-surface-variant ml-2 font-mono">
            (Seat #{desk.code})
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeColor}`}
        >
          {statusText}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-on-surface-variant">
        <div className="flex justify-between items-center">
          <span className="text-outline">Location:</span>
          <span className="text-on-surface font-medium truncate max-w-[170px]">
            {desk.podName}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-outline">Orientation:</span>
          <span className="text-on-surface capitalize">
            {desk.orientation.replace('-', ' ')}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-outline">Amenities:</span>
          <span className="text-on-surface text-right max-w-[170px] truncate">
            {desk.amenities.join(', ')}
          </span>
        </div>

        {desk.occupant && (
          <div className="mt-2.5 pt-2 border-t border-outline-variant/30 bg-surface-container/60 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <Avatar
                src={desk.occupant.avatar}
                name={desk.occupant.name}
                size="sm"
                rounded="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-on-surface truncate">
                  {desk.occupant.name}
                </p>
                <p className="text-[10px] text-primary truncate">
                  {desk.occupant.role}
                </p>
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-outline">
              <span>Time Slot: {desk.occupant.bookedTime}</span>
              <span className="text-secondary font-mono">
                {desk.occupant.hoursRemaining} left
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
