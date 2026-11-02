import React from 'react';
import { Desk } from '../types';

interface DeskNodeProps {
  desk: Desk;
  isSelected: boolean;
  onSelect: (desk: Desk) => void;
  onHover: (desk: Desk, e: React.MouseEvent) => void;
  onLeave: () => void;
  isHighlighted?: boolean;
}

export const DeskNode: React.FC<DeskNodeProps> = React.memo(({
  desk,
  isSelected,
  onSelect,
  onHover,
  onLeave,
  isHighlighted = false
}) => {
  const isBooked = desk.status === 'booked';
  const isHold = desk.status === 'hold';

  // Orientation determines where chair is rendered relative to desk
  const isFacingRight = desk.orientation === 'facing-right';
  const isFacingLeft = desk.orientation === 'facing-left';
  const isFacingUp = desk.orientation === 'facing-up';
  const isFacingDown = desk.orientation === 'facing-down';

  // Base styling for the desk surface (High Visibility Color Scheme)
  let containerStyle = "border-2 border-emerald-500 bg-[#0f172a] text-emerald-300 shadow-lg shadow-emerald-950/60 hover:border-emerald-300 hover:scale-110 hover:shadow-emerald-500/50";
  let statusDotColor = "bg-emerald-400 shadow-[0_0_10px_#34d399]";
  let statusTextColor = "text-emerald-300 font-black";
  let chairBg = "bg-[#1e293b] border-2 border-emerald-500/80 group-hover:border-emerald-400 shadow-md";
  let chairBackrest = "bg-emerald-400";

  if (isSelected) {
    containerStyle = "border-2 border-white bg-blue-600 text-white shadow-[0_0_30px_#38bdf8] ring-4 ring-cyan-400 scale-125 z-40 font-black";
    statusDotColor = "bg-white shadow-[0_0_12px_#ffffff]";
    statusTextColor = "text-white font-black";
    chairBg = "bg-blue-900 border-2 border-white shadow-lg";
    chairBackrest = "bg-white";
  } else if (isBooked) {
    containerStyle = "border-2 border-rose-500 bg-[#221016] text-rose-300 shadow-md hover:border-rose-400 hover:scale-110";
    statusDotColor = "bg-rose-500 shadow-[0_0_10px_#f43f5e]";
    statusTextColor = "text-rose-300 font-bold";
    chairBg = "bg-[#2d1720] border-2 border-rose-500/80 shadow-md";
    chairBackrest = "bg-rose-400";
  } else if (isHold) {
    containerStyle = "border-2 border-amber-500 bg-[#241a0e] text-amber-300 shadow-md hover:border-amber-400 hover:scale-110";
    statusDotColor = "bg-amber-400 shadow-[0_0_10px_#fbbf24]";
    statusTextColor = "text-amber-300 font-bold";
    chairBg = "bg-[#2b1f13] border-2 border-amber-500/80 shadow-md";
    chairBackrest = "bg-amber-400";
  }

  if (isHighlighted) {
    containerStyle += " ring-4 ring-cyan-400 animate-pulse z-40 scale-120";
  }

  // Flex container layout based on facing direction
  // facing-right: chair on left, desk on right (flex-row)
  // facing-left: desk on left, chair on right (flex-row-reverse)
  // facing-up: desk at top, chair at bottom (flex-col-reverse)
  // facing-down: chair at top, desk at bottom (flex-col)
  const flexLayout = isFacingRight
    ? 'flex-row'
    : isFacingLeft
    ? 'flex-row-reverse'
    : isFacingUp
    ? 'flex-col-reverse'
    : 'flex-col';

  return (
    <div
      className={`relative group flex items-center justify-center cursor-pointer select-none transition-transform duration-100 ${flexLayout}`}
      onClick={() => onSelect(desk)}
      onMouseEnter={(e) => onHover(desk, e)}
      onMouseLeave={onLeave}
      data-desk-id={desk.id}
    >
      {/* Front-and-Back Chair Graphic */}
      <div
        className={`transition-colors duration-100 rounded flex items-center justify-center ${
          isFacingRight
            ? 'w-2.5 h-6 -mr-1 z-10'
            : isFacingLeft
            ? 'w-2.5 h-6 -ml-1 z-10'
            : isFacingUp
            ? 'w-6 h-2.5 -mt-1 z-10'
            : 'w-6 h-2.5 -mb-1 z-10'
        } ${chairBg}`}
        title={`Chair (${desk.orientation || 'facing-down'})`}
      >
        {/* Subtle chair backrest indicator */}
        <div
          className={`rounded-full ${
            isFacingRight || isFacingLeft
              ? 'w-1 h-4'
              : 'w-4 h-1'
          } ${chairBackrest}`}
        />
      </div>

      {/* Desk Workstation Table Top */}
      <div
        className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center relative shadow-sm group-hover:scale-105 transition-transform duration-100 ${containerStyle}`}
      >
        {/* Desk Divider/Screen indicator at edge opposite to chair */}
        <div
          className={`absolute bg-white/40 ${
            isFacingRight
              ? 'right-0 top-0 bottom-0 w-1'
              : isFacingLeft
              ? 'left-0 top-0 bottom-0 w-1'
              : isFacingUp
              ? 'top-0 left-0 right-0 h-1'
              : 'bottom-0 left-0 right-0 h-1'
          }`}
        />

        {/* Status Dot */}
        <span
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${statusDotColor}`}
        />

        {/* Desk Code */}
        <span
          className={`text-[11px] font-mono tracking-tight leading-none font-black ${statusTextColor}`}
        >
          {desk.code}
        </span>

        {/* Micro-amenity indicator */}
        <div className="flex gap-0.5 mt-1 opacity-90">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
});
