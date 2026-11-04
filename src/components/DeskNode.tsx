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
  const isAdminOrManager = desk.userRole === 'admin' || desk.userRole === 'manager';
  const isSelfBooked = Boolean(desk.isSelfBooked);
  const isSearchMatch = Boolean(isHighlighted || desk.isSearchMatch);

  // Orientation determines where chair is rendered relative to desk
  const isFacingRight = desk.orientation === 'facing-right';
  const isFacingLeft = desk.orientation === 'facing-left';
  const isFacingUp = desk.orientation === 'facing-up';
  const isFacingDown = desk.orientation === 'facing-down';

  // Base styling for the desk surface:
  // 1. FREE SEAT (Available) -> High-Visibility Vibrant Green for all users
  let containerStyle = "border-2 border-emerald-500 bg-[#0f172a] text-emerald-300 shadow-lg shadow-emerald-950/60 hover:border-emerald-300 hover:scale-110 hover:shadow-emerald-500/50";
  let statusDotColor = "bg-emerald-400 shadow-[0_0_10px_#34d399]";
  let statusTextColor = "text-emerald-300 font-black";
  let chairBg = "bg-[#1e293b] border-2 border-emerald-500/80 group-hover:border-emerald-400 shadow-md";
  let chairBackrest = "bg-emerald-400";
  let isClickable = true;
  let showHoverEffects = true;

  if (isSelected) {
    containerStyle = "border-2 border-white bg-blue-600 text-white shadow-[0_0_30px_#38bdf8] ring-4 ring-cyan-400 scale-125 z-40 font-black";
    statusDotColor = "bg-white shadow-[0_0_12px_#ffffff]";
    statusTextColor = "text-white font-black";
    chairBg = "bg-blue-900 border-2 border-white shadow-lg";
    chairBackrest = "bg-white";
  } else if (isSearchMatch) {
    // ⭐️ SEARCH HIGHLIGHT: Solid Radiant Yellow (Replaces dull/red pulsing)
    containerStyle = "border-2 border-yellow-400 bg-[#352807] text-yellow-200 shadow-[0_0_28px_rgba(250,204,21,0.95)] ring-4 ring-yellow-400 scale-125 z-40 font-black";
    statusDotColor = "bg-yellow-400 shadow-[0_0_12px_#facc15]";
    statusTextColor = "text-yellow-200 font-black";
    chairBg = "bg-[#423108] border-2 border-yellow-400 shadow-md";
    chairBackrest = "bg-yellow-400";
    isClickable = true;
    showHoverEffects = true;
  } else if (isBooked) {
    if (isAdminOrManager || isSelfBooked) {
      // 2. RED VIEW for Manager/Admin OR Self-Booked by current user
      containerStyle = isSelfBooked
        ? "border-2 border-rose-500 bg-[#2b1219] text-rose-200 shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/50 hover:border-rose-300 hover:scale-110 hover:shadow-[0_0_18px_rgba(244,63,94,0.5)]"
        : "border-2 border-rose-500 bg-[#221016] text-rose-300 shadow-md hover:border-rose-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]";
      statusDotColor = "bg-rose-500 shadow-[0_0_10px_#f43f5e]";
      statusTextColor = isSelfBooked ? "text-rose-200 font-black" : "text-rose-300 font-bold";
      chairBg = "bg-[#2d1720] border-2 border-rose-500/80 shadow-md";
      chairBackrest = "bg-rose-400";
      isClickable = true;
    } else {
      // 3. GREYISH VIEW for Employee viewing another user's booked seat (BookMyShow style)
      // Muted grey tones, disabled cursor, NO scale/glow hover effects, NO popup
      containerStyle = "border-2 border-zinc-700/80 bg-[#161a22] text-zinc-500 shadow-none opacity-60";
      statusDotColor = "bg-zinc-600 border border-zinc-700";
      statusTextColor = "text-zinc-500 font-bold";
      chairBg = "bg-[#11141a] border-2 border-zinc-700/60 shadow-none";
      chairBackrest = "bg-zinc-600";
      isClickable = false;
      showHoverEffects = false;
    }
  } else if (isHold) {
    containerStyle = "border-2 border-amber-500 bg-[#241a0e] text-amber-300 shadow-md hover:border-amber-400 hover:scale-110";
    statusDotColor = "bg-amber-400 shadow-[0_0_10px_#fbbf24]";
    statusTextColor = "text-amber-300 font-bold";
    chairBg = "bg-[#2b1f13] border-2 border-amber-500/80 shadow-md";
    chairBackrest = "bg-amber-400";
  }



  // Flex container layout based on facing direction
  const flexLayout = isFacingRight
    ? 'flex-row'
    : isFacingLeft
    ? 'flex-row-reverse'
    : isFacingUp
    ? 'flex-col-reverse'
    : 'flex-col';

  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-100 ${
        isClickable ? 'group cursor-pointer' : 'cursor-not-allowed pointer-events-auto'
      } ${flexLayout}`}
      onClick={() => {
        if (!isClickable) return;
        onSelect(desk);
      }}
      onMouseEnter={(e) => {
        if (!isClickable) return;
        onHover(desk, e);
      }}
      onMouseLeave={() => {
        if (!isClickable) return;
        onLeave();
      }}
      data-desk-id={desk.id}
      title={
        !isClickable
          ? `Seat ${desk.code} • Reserved (Unavailable)`
          : isSelfBooked
          ? `Seat ${desk.code} • Your Reserved Seat (Click for details)`
          : undefined
      }
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
        className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center relative shadow-sm ${
          showHoverEffects ? 'group-hover:scale-105' : ''
        } transition-transform duration-100 ${containerStyle}`}
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
