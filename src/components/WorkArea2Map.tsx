import React from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface WorkArea2MapProps {
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

export const WorkArea2Map: React.FC<WorkArea2MapProps> = ({
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
  const getDesk = (id: string) => desks.find((d) => d.id === id);

  return (
    <div className="relative w-[1680px] h-[920px] bg-surface-container-lowest/80 border-2 border-outline-variant/40 rounded-3xl p-8 shadow-2xl">
      {/* Blueprint Architectural Stamp */}
      <div className="flex items-center justify-between mb-3 text-outline/70 font-mono text-xs select-none px-2">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-base">architecture</span>
          <span className="font-semibold text-on-surface tracking-wider">WA-2 // OFFICE WORK ROOM 2</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-secondary">
            80 WORKSTATIONS • 7 PODS • 6 CABINS
          </span>
        </div>
      </div>

      {/* Main Floor Workspace Container */}
      <div className="relative w-full h-[580px] border-2 border-outline-variant/40 rounded-2xl p-6 bg-surface-container-lowest/40 flex items-center justify-between">
        {/* ========================================================
            1. LEFT PERIMETER WALL (5 Desks Facing Right)
           ======================================================== */}
        <div className="flex flex-col justify-around h-full border-r-2 border-outline-variant/40 pr-5">
          <span className="text-[10px] font-mono text-outline uppercase text-center mb-1">
            Left Wall (5)
          </span>
          {[1, 2, 3, 4, 5].map((i) => {
            const desk = getDesk(`WA2-LW-${String(i).padStart(2, '0')}`);
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

        {/* ========================================================
            2. 7 CENTRAL DOUBLE-SIDED PODS (7 x 10 Desks = 70 Desks)
           ======================================================== */}
        {[1, 2, 3, 4, 5, 6, 7].map((podIdx) => (
          <div
            key={podIdx}
            className="flex flex-col items-center bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl p-3 h-full justify-around"
          >
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">
              Pod {podIdx} (10)
            </span>

            {/* Pod Rows with central vertical spine divider */}
            <div className="flex gap-1 relative h-full py-2">
              {/* Divider partition line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-outline-variant/60 rounded-full z-10" />

              {/* Left Column of Pod (Facing Right) */}
              <div className="flex flex-col justify-around pr-2">
                {[1, 3, 5, 7, 9].map((num) => {
                  const desk = getDesk(`WA2-P${podIdx}-${String(num).padStart(2, '0')}`);
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

              {/* Right Column of Pod (Facing Left - Front and Back across Divider!) */}
              <div className="flex flex-col justify-around pl-2">
                {[2, 4, 6, 8, 10].map((num) => {
                  const desk = getDesk(`WA2-P${podIdx}-${String(num).padStart(2, '0')}`);
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
        ))}

        {/* ========================================================
            3. RIGHT PERIMETER WALL (5 Desks Facing Left)
           ======================================================== */}
        <div className="flex flex-col justify-around h-full border-l-2 border-outline-variant/40 pl-5">
          <span className="text-[10px] font-mono text-outline uppercase text-center mb-1">
            Right Wall (5)
          </span>
          {[1, 2, 3, 4, 5].map((i) => {
            const desk = getDesk(`WA2-RW-${String(i).padStart(2, '0')}`);
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
          4. SOUTH ENCLOSED CABINS & CENTRAL ENTRANCE
         ======================================================== */}
      <div className="mt-5 grid grid-cols-12 gap-4 h-[160px]">
        {/* Left Wing Cabins: Room 6, Room 5, Room 4, Room 3 */}
        <div className="col-span-5 grid grid-cols-4 gap-3">
          {[
            { num: 6, code: 'WA2-RM-06' },
            { num: 5, code: 'WA2-RM-05' },
            { num: 4, code: 'WA2-RM-04' },
            { num: 3, code: 'WA2-RM-03' }
          ].map(({ num, code }) => {
            const room = rooms.find((r) => r.id === code);
            const isOccupied = room?.status === 'occupied';

            return (
              <div
                key={code}
                onClick={() => room && onSelectRoom(room)}
                className={`bg-surface-container-low/70 border-2 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:border-primary group ${
                  isOccupied ? 'border-error/40' : 'border-outline-variant/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-on-surface font-mono">
                    Room {num}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOccupied ? 'bg-error shadow-[0_0_6px_#ef4444]' : 'bg-secondary shadow-[0_0_6px_#4edea3]'
                    }`}
                  />
                </div>

                <div className="text-[10px] text-on-surface-variant leading-tight">
                  {room?.name.split('(')[1]?.replace(')', '') || 'Private'}
                </div>

                <div className="flex justify-between items-center text-[10px] text-outline pt-1 border-t border-outline-variant/20">
                  <span>Cap: {room?.capacity}</span>
                  <span className="text-primary font-mono text-[9px] group-hover:underline">
                    {isOccupied ? 'In Use' : 'Book'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Entrance (Marked with arrow as in blueprint) */}
        <div className="col-span-2 bg-surface-container-high/40 border-2 border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center p-3 text-center">
          <span className="material-symbols-outlined text-primary text-2xl animate-bounce">
            arrow_upward
          </span>
          <span className="text-xs font-bold text-on-surface tracking-wider uppercase font-mono mt-1">
            Entrance
          </span>
          <span className="text-[10px] text-outline">Main Access Door</span>
        </div>

        {/* Right Wing Cabins: Room 2, Room 1 */}
        <div className="col-span-5 grid grid-cols-2 gap-3">
          {[
            { num: 2, code: 'WA2-RM-02' },
            { num: 1, code: 'WA2-RM-01' }
          ].map(({ num, code }) => {
            const room = rooms.find((r) => r.id === code);
            const isOccupied = room?.status === 'occupied';

            return (
              <div
                key={code}
                onClick={() => room && onSelectRoom(room)}
                className={`bg-surface-container-low/70 border-2 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:border-primary group ${
                  isOccupied ? 'border-error/40' : 'border-outline-variant/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-on-surface font-mono">
                    Room {num}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOccupied ? 'bg-error shadow-[0_0_6px_#ef4444]' : 'bg-secondary shadow-[0_0_6px_#4edea3]'
                    }`}
                  />
                </div>

                <div className="text-[10px] text-on-surface-variant leading-tight">
                  {room?.name.split('(')[1]?.replace(')', '') || 'Executive Cabin'}
                </div>

                <div className="flex justify-between items-center text-[10px] text-outline pt-1 border-t border-outline-variant/20">
                  <span>Cap: {room?.capacity}</span>
                  <span className="text-primary font-mono text-[9px] group-hover:underline">
                    {isOccupied ? 'In Use' : 'Book'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
