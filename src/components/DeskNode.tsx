import React from 'react';
import { Desk } from '../types';

interface DeskNodeProps {
  desk: Desk;
  isSelected: boolean;
  showPresence: boolean;
  onSelect: (desk: Desk) => void;
  onHover: (desk: Desk, e: React.MouseEvent) => void;
  onLeave: () => void;
  isHighlighted?: boolean;
}

export const DeskNode: React.FC<DeskNodeProps> = ({
  desk,
  isSelected,
  showPresence,
  onSelect,
  onHover,
  onLeave,
  isHighlighted = false
}) => {
  const isBooked = desk.status === 'booked';
  const isHold = desk.status === 'hold';
  const isAvailable = desk.status === 'available';

  // Orientation determines where chair is rendered relative to desk
  // 'facing-right' -> Person sits on left, faces right towards desk/divider
  // 'facing-left'  -> Person sits on right, faces left towards desk/divider
  // 'facing-up'    -> Person sits below, faces up towards desk/divider
  // 'facing-down'  -> Person sits above, faces down towards desk/divider
  const isFacingRight = desk.orientation === 'facing-right';
  const isFacingLeft = desk.orientation === 'facing-left';

  // Base styling for the desk surface
  let containerStyle = "border-secondary/40 hover:border-secondary bg-surface-container/90 text-secondary";
  let statusDotColor = "bg-secondary shadow-[0_0_8px_#4edea3]";
  let statusTextColor = "text-secondary";

  if (isSelected) {
    containerStyle = "border-2 border-primary bg-primary-container text-on-primary-container glow-primary scale-105 z-20";
    statusDotColor = "bg-primary shadow-[0_0_10px_#89ceff]";
    statusTextColor = "text-on-primary-container font-bold";
  } else if (isBooked) {
    containerStyle = "border-error/40 bg-surface-container-high/60 text-error opacity-75 hover:opacity-100";
    statusDotColor = "bg-error shadow-[0_0_8px_#ffb4ab]";
    statusTextColor = "text-error";
  } else if (isHold) {
    containerStyle = "border-tertiary/40 bg-surface-container/80 text-tertiary";
    statusDotColor = "bg-tertiary shadow-[0_0_8px_#ffb95f]";
    statusTextColor = "text-tertiary";
  }

  if (isHighlighted) {
    containerStyle += " ring-4 ring-primary animate-pulse z-30 scale-110";
  }

  return (
    <div
      className={`relative group flex items-center justify-center cursor-pointer select-none transition-all duration-150 ${
        isFacingRight ? 'flex-row' : isFacingLeft ? 'flex-row-reverse' : 'flex-col'
      }`}
      onClick={() => onSelect(desk)}
      onMouseEnter={(e) => onHover(desk, e)}
      onMouseMove={(e) => onHover(desk, e)}
      onMouseLeave={onLeave}
      data-desk-id={desk.id}
    >
      {/* Front-and-Back Chair Graphic */}
      <div
        className={`transition-all duration-150 rounded-sm flex items-center justify-center ${
          isFacingRight
            ? 'w-2.5 h-6 -mr-1 z-10'
            : isFacingLeft
            ? 'w-2.5 h-6 -ml-1 z-10'
            : 'w-6 h-2.5 -mb-1 z-10'
        } ${
          isSelected
            ? 'bg-primary-container border border-primary'
            : isBooked
            ? 'bg-error/30 border border-error/50'
            : 'bg-surface-container-highest border border-outline-variant/40 group-hover:border-secondary'
        }`}
        title={`Chair (${desk.orientation})`}
      >
        {/* Subtle chair backrest indicator */}
        <div
          className={`rounded-full ${
            isFacingRight
              ? 'w-1 h-4 bg-outline/60'
              : isFacingLeft
              ? 'w-1 h-4 bg-outline/60'
              : 'w-4 h-1 bg-outline/60'
          }`}
        />
      </div>

      {/* Desk Workstation Table Top */}
      <div
        className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center relative shadow-sm group-hover:scale-105 transition-all ${containerStyle}`}
      >
        {/* Desk Divider/Screen indicator at edge facing opposite of chair */}
        <div
          className={`absolute bg-outline-variant/60 ${
            isFacingRight
              ? 'right-0 top-0 bottom-0 w-0.5'
              : isFacingLeft
              ? 'left-0 top-0 bottom-0 w-0.5'
              : 'top-0 left-0 right-0 h-0.5'
          }`}
        />

        {/* Status Dot */}
        <span
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${statusDotColor}`}
        />

        {/* Desk Code */}
        <span
          className={`text-[10px] font-mono tracking-tight leading-tight ${statusTextColor}`}
        >
          {desk.code}
        </span>

        {/* Micro-amenity icon (small monitor tick) */}
        <div className="flex gap-0.5 mt-0.5 opacity-60">
          <span className="w-1 h-1 rounded-full bg-current" />
          {desk.amenities.some((a) => a.includes('Standing')) && (
            <span className="w-1 h-1 rounded-full bg-current" />
          )}
        </div>

        {/* Manager Live Presence Badge */}
        {showPresence && desk.occupant && (
          <div
            className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full border-2 border-primary bg-cover bg-center shadow-lg z-30 animate-in fade-in zoom-in duration-200"
            style={{ backgroundImage: `url(${desk.occupant.avatar})` }}
          >
            <span className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[8px] px-1 rounded-full font-bold">
              {desk.occupant.hoursRemaining}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
