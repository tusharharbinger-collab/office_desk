import React from 'react';
import { Desk } from '../types';
import { Avatar } from './Avatar';

interface SeatTooltipProps {
  desk: Desk | null;
  position: { x: number; y: number };
}

export const SeatTooltip: React.FC<SeatTooltipProps> = React.memo(({ desk, position }) => {
  if (!desk) return null;

  const isBooked = desk.status === 'booked';
  const isHold = desk.status === 'hold';
  const isSelf = Boolean(desk.isSelfBooked);
  const isAdminOrManager = desk.userRole === 'admin' || desk.userRole === 'manager';

  // If desk is booked by someone else and the user is a regular employee: no tooltip!
  if (isBooked && !isAdminOrManager && !isSelf) {
    return null;
  }

  let badgeColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  let statusText = "Available";

  if (desk.isSearchMatch) {
    if (isBooked) {
      if (isSelf) {
        badgeColor = "bg-amber-500/20 text-amber-300 border-amber-400/50";
        statusText = "Booked by You (Search Match)";
      } else {
        badgeColor = "bg-amber-500/20 text-amber-300 border-amber-400/50";
        statusText = desk.occupant ? `Booked • ${desk.occupant.name}` : "Occupied (Search Match)";
      }
    } else {
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-400/50";
      statusText = "Available (Search Match)";
    }
  } else if (isBooked) {
    if (isSelf) {
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      statusText = "Booked by You (Active Pass)";
    } else {
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      statusText = "Occupied (Admin Inspector)";
    }
  } else if (isHold) {
    badgeColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
    statusText = "Temporary Hold";
  } else if (desk.status === 'selected') {
    badgeColor = "bg-sky-500/20 text-sky-300 border-sky-400/40";
    statusText = "Selected By You";
  }

  return (
    <div
      className={`fixed pointer-events-none z-50 bg-[#0f1422]/95 backdrop-blur-xl border ${
        desk.isSearchMatch
          ? 'border-amber-400/50 shadow-[0_12px_36px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
          : 'border-white/[0.12] shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
      } p-3.5 rounded-2xl w-72 text-white will-change-transform`}
      style={{
        transform: `translate3d(${position.x + 16}px, ${position.y + 16}px, 0)`,
        top: 0,
        left: 0
      }}
    >
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/[0.08]">
        <div>
          <span className={`${desk.isSearchMatch ? 'text-amber-300' : 'text-sky-400'} font-mono font-semibold text-base`}>
            {desk.id}
          </span>
          <span className={`text-xs ${desk.isSearchMatch ? 'text-amber-200/80' : 'text-slate-400'} ml-2 font-mono`}>
            (Seat #{desk.code})
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badgeColor}`}
        >
          {statusText}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Location:</span>
          <span className="text-white font-medium truncate max-w-[170px]">
            {desk.podName}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Orientation:</span>
          <span className="text-white capitalize font-mono text-[11px]">
            {desk.orientation.replace('-', ' ')}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-slate-400">Amenities:</span>
          <span className="text-slate-200 text-right max-w-[170px] truncate text-[11px]">
            {desk.amenities.join(', ')}
          </span>
        </div>

        {desk.occupant && (
          <div className="mt-2.5 pt-2 border-t border-white/[0.08] bg-black/40 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <Avatar
                src={desk.occupant.avatar}
                name={desk.occupant.name}
                size="sm"
                rounded="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">
                    {desk.occupant.name}
                  </p>
                  {isSelf && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase font-bold">
                      You
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-sky-400 font-mono truncate uppercase">
                  {desk.occupant.role}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Time: {desk.occupant.bookedTime}</span>
              <span className="text-emerald-400 font-bold">
                {desk.occupant.hoursRemaining} left
              </span>
            </div>
            <div className="mt-1 text-[9px] font-mono text-center text-sky-400/80 pt-1 border-t border-white/[0.04]">
              {isSelf ? "👆 Click seat to manage your pass" : "👆 Click seat to inspect / release"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
