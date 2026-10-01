import React from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface WorkArea1MapProps {
  desks: Desk[];
  rooms: Room[];
  selectedDesk: Desk | null;
  showPresence: boolean;
  highlightedDeskId: string | null;
  onSelectDesk: (desk: Desk) => void;
  onHoverDesk: (desk: Desk, e: React.MouseEvent) => void;
  onLeaveDesk: () => void;
  onSelectRoom: (room: Room) => void;
}

export const WorkArea1Map: React.FC<WorkArea1MapProps> = ({
  desks,
  rooms,
  selectedDesk,
  showPresence,
  highlightedDeskId,
  onSelectDesk,
  onHoverDesk,
  onLeaveDesk,
  onSelectRoom
}) => {
  // Map helper to find desk by id
  const getDesk = (id: string) => desks.find((d) => d.id === id);

  return (
    <div className="relative w-[1520px] h-[880px] bg-surface-container-lowest/80 border-2 border-outline-variant/40 rounded-3xl p-6 shadow-2xl">
      {/* Blueprint Architectural Stamp */}
      <div className="absolute top-3 left-6 flex items-center gap-2.5 text-outline/70 font-mono text-xs select-none">
        <span className="material-symbols-outlined text-primary text-base">architecture</span>
        <span className="font-semibold text-on-surface tracking-wider">WA-1 // MAIN FLOOR</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-secondary">
          130 DESKS • 2 SUITES
        </span>
      </div>

      {/* ========================================================
          1. WEST PERIMETER WALL (LEFT WALL: 14 Desks + 2 Pillars)
         ======================================================== */}
      <div className="absolute top-[75px] left-[35px] w-[100px] h-[770px] border-r-2 border-outline-variant/40 pr-3 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase tracking-wider mb-2">
          West Wall
        </div>

        {/* Top Segment: 3 Desks */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => {
            const id = `WA1-LW-${String(i).padStart(2, '0')}`;
            const desk = getDesk(id);
            if (!desk) return null;
            return (
              <DeskNode
                key={desk.id}
                desk={desk}
                isSelected={selectedDesk?.id === desk.id}
                showPresence={showPresence}
                isHighlighted={highlightedDeskId === desk.id}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            );
          })}
        </div>

        {/* Structural Pillar 1 */}
        <div className="w-16 h-12 my-2 bg-surface-container-highest border border-outline-variant/60 rounded-md flex items-center justify-center shadow-inner">
          <span className="text-[9px] font-mono text-outline font-semibold">PILLAR 1</span>
        </div>

        {/* Middle Segment: 6 Desks */}
        <div className="flex flex-col gap-3">
          {[4, 5, 6, 7, 8, 9].map((i) => {
            const id = `WA1-LW-${String(i).padStart(2, '0')}`;
            const desk = getDesk(id);
            if (!desk) return null;
            return (
              <DeskNode
                key={desk.id}
                desk={desk}
                isSelected={selectedDesk?.id === desk.id}
                showPresence={showPresence}
                isHighlighted={highlightedDeskId === desk.id}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            );
          })}
        </div>

        {/* Structural Pillar 2 */}
        <div className="w-16 h-12 my-2 bg-surface-container-highest border border-outline-variant/60 rounded-md flex items-center justify-center shadow-inner">
          <span className="text-[9px] font-mono text-outline font-semibold">PILLAR 2</span>
        </div>

        {/* Bottom Segment: 5 Desks */}
        <div className="flex flex-col gap-3">
          {[10, 11, 12, 13, 14].map((i) => {
            const id = `WA1-LW-${String(i).padStart(2, '0')}`;
            const desk = getDesk(id);
            if (!desk) return null;
            return (
              <DeskNode
                key={desk.id}
                desk={desk}
                isSelected={selectedDesk?.id === desk.id}
                showPresence={showPresence}
                isHighlighted={highlightedDeskId === desk.id}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. NORTH FLOOR: TOP PODS (2 x 10 Desks) & BOARDROOM
         ======================================================== */}
      {/* Top Pod 1 (5 Pairs = 10 Desks, Front & Back face to face) */}
      <div className="absolute top-[80px] left-[180px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">North Pod 1 (10)</span>
        <div className="flex gap-1 relative">
          {/* Vertical Divider Spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          {/* Left Column (Facing Right) */}
          <div className="flex flex-col gap-2.5 pr-2">
            {[1, 3, 5, 7, 9].map((num) => {
              const desk = getDesk(`WA1-NP1-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          {/* Right Column (Facing Left - Front and Back across Divider!) */}
          <div className="flex flex-col gap-2.5 pl-2">
            {[2, 4, 6, 8, 10].map((num) => {
              const desk = getDesk(`WA1-NP1-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Pod 2 (5 Pairs = 10 Desks, Front & Back face to face) */}
      <div className="absolute top-[80px] left-[340px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">North Pod 2 (10)</span>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          <div className="flex flex-col gap-2.5 pr-2">
            {[1, 3, 5, 7, 9].map((num) => {
              const desk = getDesk(`WA1-NP2-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2.5 pl-2">
            {[2, 4, 6, 8, 10].map((num) => {
              const desk = getDesk(`WA1-NP2-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Center Large Square Boardroom / Conference Room */}
      <div
        className="absolute top-[80px] left-[510px] w-[370px] h-[330px] bg-surface-container/70 border-2 border-primary/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-primary cursor-pointer transition-all group"
        onClick={() => {
          const room = rooms.find((r) => r.id === 'WA1-CONF-01');
          if (room) onSelectRoom(room);
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">co_present</span>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Executive Boardroom</h3>
              <p className="text-[11px] text-on-surface-variant">Central Conference Suite</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/30">
            SEC-CONF-01
          </span>
        </div>

        {/* Visual Conference Table with Chairs */}
        <div className="w-[85%] h-28 mx-auto bg-surface-container-high rounded-full border-2 border-outline-variant/40 flex items-center justify-center relative shadow-inner">
          <div className="w-[90%] h-12 bg-surface-container-lowest/80 rounded-full border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-mono text-primary font-medium tracking-wide">
              Capacity: 14 Persons • 4K Video Wall
            </span>
          </div>
          {/* Subtle Chairs around table */}
          <div className="absolute -top-3 left-1/4 w-5 h-2.5 bg-outline/60 rounded-t" />
          <div className="absolute -top-3 left-2/4 w-5 h-2.5 bg-outline/60 rounded-t" />
          <div className="absolute -top-3 left-3/4 w-5 h-2.5 bg-outline/60 rounded-t" />
          <div className="absolute -bottom-3 left-1/4 w-5 h-2.5 bg-outline/60 rounded-b" />
          <div className="absolute -bottom-3 left-2/4 w-5 h-2.5 bg-outline/60 rounded-b" />
          <div className="absolute -bottom-3 left-3/4 w-5 h-2.5 bg-outline/60 rounded-b" />
        </div>

        <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/30">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_6px_#ef4444]" />
            Currently Reserved
          </span>
          <span className="text-primary text-[11px] group-hover:underline">
            View Schedule →
          </span>
        </div>
      </div>

      {/* Top-Right Executive Suite ("OFFICE" in blueprint) */}
      <div
        className="absolute top-[80px] left-[910px] w-[560px] h-[330px] bg-surface-container-low/80 border-2 border-outline-variant/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-primary/50 cursor-pointer transition-all"
        onClick={() => {
          const room = rooms.find((r) => r.id === 'WA1-EXEC-01');
          if (room) onSelectRoom(room);
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-2xl">domain</span>
            <div>
              <h3 className="text-base font-semibold text-on-surface">Director Executive Office</h3>
              <p className="text-[11px] text-on-surface-variant">Private Executive Cabin Suite</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary/20 text-tertiary border border-tertiary/30">
            SEC-EXEC-01
          </span>
        </div>

        {/* Executive Desk layout representation */}
        <div className="flex items-center justify-around py-4">
          <div className="w-48 h-20 bg-surface-container border-2 border-outline-variant/50 rounded-xl flex items-center justify-center flex-col relative shadow">
            <span className="text-xs font-semibold text-on-surface">Executive Desk</span>
            <span className="text-[10px] text-outline">Triple 4K Displays • Ergonomic</span>
            <div className="absolute -top-3 w-8 h-3 bg-tertiary/60 rounded-t" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-32 h-14 bg-surface-container-high/60 border border-outline-variant/30 rounded-lg flex items-center justify-center text-[10px] text-outline">
              Private Lounge
            </div>
            <div className="text-[11px] text-secondary flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_#4edea3]" />
              Available for Booking
            </div>
          </div>
        </div>

        <div className="text-xs text-outline flex justify-between pt-2 border-t border-outline-variant/30">
          <span>Access: Leadership & Executive Visitors</span>
          <span className="text-primary font-mono font-medium">VIP Tier</span>
        </div>
      </div>

      {/* ========================================================
          3. MAIN FLOOR SOUTH PODS (3 Pods x 9 Pairs = 54 Desks)
         ======================================================== */}
      {/* South Pod 1 (18 Desks, 9 Pairs Front & Back) */}
      <div className="absolute top-[440px] left-[180px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">South Pod 1 (18)</span>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          <div className="flex flex-col gap-2 pr-2">
            {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((num) => {
              const desk = getDesk(`WA1-SP1-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((num) => {
              const desk = getDesk(`WA1-SP1-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* South Pod 2 (18 Desks, 9 Pairs Front & Back) */}
      <div className="absolute top-[440px] left-[340px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">South Pod 2 (18)</span>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          <div className="flex flex-col gap-2 pr-2">
            {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((num) => {
              const desk = getDesk(`WA1-SP2-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((num) => {
              const desk = getDesk(`WA1-SP2-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* South Pod 3 (18 Desks, 9 Pairs Front & Back) */}
      <div className="absolute top-[440px] left-[500px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">South Pod 3 (18)</span>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          <div className="flex flex-col gap-2 pr-2">
            {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((num) => {
              const desk = getDesk(`WA1-SP3-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((num) => {
              const desk = getDesk(`WA1-SP3-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. CENTER POD WITH PILLARS (14 Desks)
         ======================================================== */}
      <div className="absolute top-[440px] left-[660px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">Pillar Pod (14)</span>

        {/* Top 2 Pairs (4 desks) */}
        <div className="flex gap-1 relative mb-2">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />
          <div className="flex flex-col gap-2 pr-2">
            {[1, 3].map((num) => {
              const desk = getDesk(`WA1-CP-0${num}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
          <div className="flex flex-col gap-2 pl-2">
            {[2, 4].map((num) => {
              const desk = getDesk(`WA1-CP-0${num}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>

        {/* Middle Structural Pillar */}
        <div className="w-24 h-12 my-2 bg-surface-container-highest border border-outline-variant/60 rounded-lg flex items-center justify-center shadow-inner">
          <span className="text-[9px] font-mono text-outline font-semibold">PILLAR</span>
        </div>

        {/* Lower 5 Pairs (10 desks) */}
        <div className="flex gap-1 relative my-2">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />
          <div className="flex flex-col gap-2 pr-2">
            {[5, 7, 9, 11, 13].map((num) => {
              const desk = getDesk(`WA1-CP-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
          <div className="flex flex-col gap-2 pl-2">
            {[6, 8, 10, 12, 14].map((num) => {
              const desk = getDesk(`WA1-CP-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>

        {/* Base Pillar */}
        <div className="w-24 h-12 mt-2 bg-surface-container-highest border border-outline-variant/60 rounded-lg flex items-center justify-center shadow-inner">
          <span className="text-[9px] font-mono text-outline font-semibold">PILLAR</span>
        </div>
      </div>

      {/* ========================================================
          5. RIGHT PODS (2 Pods x 7 Pairs = 28 Desks)
         ======================================================== */}
      {/* East Pod 1 (14 Desks, 7 Pairs Front & Back) */}
      <div className="absolute top-[440px] left-[840px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">East Pod 1 (14)</span>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          <div className="flex flex-col gap-2 pr-2">
            {[1, 3, 5, 7, 9, 11, 13].map((num) => {
              const desk = getDesk(`WA1-EP1-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            {[2, 4, 6, 8, 10, 12, 14].map((num) => {
              const desk = getDesk(`WA1-EP1-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* East Pod 2 (14 Desks, 7 Pairs Front & Back) */}
      <div className="absolute top-[440px] left-[1000px] bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-outline uppercase mb-2">East Pod 2 (14)</span>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

          <div className="flex flex-col gap-2 pr-2">
            {[1, 3, 5, 7, 9, 11, 13].map((num) => {
              const desk = getDesk(`WA1-EP2-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            {[2, 4, 6, 8, 10, 12, 14].map((num) => {
              const desk = getDesk(`WA1-EP2-${String(num).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
                  showPresence={showPresence}
                  isHighlighted={highlightedDeskId === desk.id}
                  onSelect={onSelectDesk}
                  onHover={onHoverDesk}
                  onLeave={onLeaveDesk}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          6. ANCILLARY FACILITIES (BOTTOM-RIGHT)
         ======================================================== */}
      {/* Server Room */}
      <div className="absolute bottom-[25px] right-[240px] w-[220px] h-[130px] bg-surface-container-low/70 border-2 border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-lg">dns</span>
          <span className="text-xs font-semibold text-on-surface">Server Room</span>
        </div>
        <div className="text-[10px] text-outline font-mono">
          Racks: 4x 42U Server Cabinets • Fiber Backbone
        </div>
        <div className="flex items-center justify-between text-[10px] text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_4px_#4edea3]" />
            Temp: 19.4°C
          </span>
          <span className="text-outline">Restricted</span>
        </div>
      </div>

      {/* Restrooms: Men & Women Toilets */}
      <div className="absolute bottom-[25px] right-[40px] w-[180px] h-[210px] flex flex-col gap-3">
        <div className="h-[95px] bg-surface-container-low/70 border-2 border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-lg">man</span>
            <span className="text-xs font-semibold text-on-surface">Men Toilet</span>
          </div>
          <span className="text-[10px] text-outline font-mono">Facilities: 4 Stalls</span>
        </div>

        <div className="h-[95px] bg-surface-container-low/70 border-2 border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-lg">woman</span>
            <span className="text-xs font-semibold text-on-surface">Women Toilet</span>
          </div>
          <span className="text-[10px] text-outline font-mono">Facilities: 4 Stalls</span>
        </div>
      </div>
    </div>
  );
};
