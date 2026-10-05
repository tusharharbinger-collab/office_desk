import React, { useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface WorkArea2MapProps {
  desks: Desk[];
  rooms?: Room[];
  selectedDesk: Desk | null;
  highlightedDeskId: string | null;
  onSelectDesk: (desk: Desk) => void;
  onHoverDesk: (desk: Desk, e: React.MouseEvent) => void;
  onLeaveDesk: () => void;
  onSelectRoom?: (room: Room) => void;
}

export const WorkArea2Map: React.FC<WorkArea2MapProps> = React.memo(({
  desks,
  selectedDesk,
  highlightedDeskId,
  onSelectDesk,
  onHoverDesk,
  onLeaveDesk
}) => {
  // Memoized desk map for O(1) lookup
  const deskMap = useMemo(() => new Map(desks.map((d) => [d.id, d])), [desks]);
  const getDesk = (id: string) => deskMap.get(id);

  return (
    <div className="relative w-[1380px] h-[620px] bg-[#090D16] border border-slate-700/50 rounded-3xl p-6 shadow-2xl overflow-hidden select-none">
      {/* High-tech Blueprint Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0),
            linear-gradient(to right, rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 120px 120px, 120px 120px'
        }}
      />

      {/* Precision CAD Corner Crosshairs */}
      <div className="absolute top-3 left-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">┌ ┐</div>
      <div className="absolute top-3 right-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">┌ ┐</div>
      <div className="absolute bottom-3 left-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">└ ┘</div>
      <div className="absolute bottom-3 right-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">└ ┘</div>

      {/* Blueprint Architectural Stamp Header */}
      <div className="absolute top-4 left-6 flex items-center gap-3 select-none z-10">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
          <span className="material-symbols-outlined text-lg">domain</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-xs tracking-wider">WA-2 // OFFICE WORK ROOM 2</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              80 WORKSTATIONS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
              7 PODS • 2 WALL BANKS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">
            ARCHITECTURAL BLUEPRINT // OPEN PLAN WORKSPACE
          </span>
        </div>
      </div>

      {/* Blueprint Scale & Coordinate HUD */}
      <div className="absolute top-4 right-6 flex items-center gap-2.5 text-slate-400 font-mono text-[11px] select-none z-10">
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-700/60 px-3 py-1 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-xs text-cyan-400">straighten</span>
          <span>1380 × 620 MM</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-700/60 px-3 py-1 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-xs text-amber-400">explore</span>
          <span>NORTH ↑</span>
        </div>
      </div>

      {/* Main Floor Workspace Container */}
      <div className="absolute top-[70px] left-6 right-6 bottom-6 border border-slate-700/40 rounded-2xl p-4 bg-[#0e1526]/40 backdrop-blur-sm flex items-center justify-between shadow-inner">
        {/* ========================================================
            1. LEFT PERIMETER WALL (5 Desks Facing Right)
           ======================================================== */}
        <div className="flex flex-col justify-center items-center h-full border-r border-slate-700/60 pr-4">
          <div className="flex items-center gap-1.5 mb-2 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">Left Wall</span>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">5</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => {
              const desk = getDesk(`WA2-LW-${String(i).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
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
            2. 7 CENTRAL DOUBLE-SIDED PODS (7 x 10 Desks = 70 Desks)
           ======================================================== */}
        {[1, 2, 3, 4, 5, 6, 7].map((podIdx) => (
          <div
            key={podIdx}
            className="flex flex-col items-center bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 h-full justify-center shadow-lg shadow-black/20 group"
          >
            <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">Pod {podIdx}</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">10</span>
            </div>

            {/* Pod Rows with central vertical spine divider */}
            <div className="flex gap-1 relative py-1">
              {/* Divider partition line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

              {/* Left Column of Pod (Facing Right) */}
              <div className="flex flex-col gap-1.5 pr-2">
                {[1, 3, 5, 7, 9].map((num) => {
                  const desk = getDesk(`WA2-P${podIdx}-${String(num).padStart(2, '0')}`);
                  if (!desk) return null;
                  return (
                    <DeskNode
                      key={desk.id}
                      desk={desk}
                      isSelected={selectedDesk?.id === desk.id}
                      isHighlighted={highlightedDeskId === desk.id}
                      onSelect={onSelectDesk}
                      onHover={onHoverDesk}
                      onLeave={onLeaveDesk}
                    />
                  );
                })}
              </div>

              {/* Right Column of Pod (Facing Left - Front and Back across Divider!) */}
              <div className="flex flex-col gap-1.5 pl-2">
                {[2, 4, 6, 8, 10].map((num) => {
                  const desk = getDesk(`WA2-P${podIdx}-${String(num).padStart(2, '0')}`);
                  if (!desk) return null;
                  return (
                    <DeskNode
                      key={desk.id}
                      desk={desk}
                      isSelected={selectedDesk?.id === desk.id}
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
        <div className="flex flex-col justify-center items-center h-full border-l border-slate-700/60 pl-4">
          <div className="flex items-center gap-1.5 mb-2 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">Right Wall</span>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">5</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => {
              const desk = getDesk(`WA2-RW-${String(i).padStart(2, '0')}`);
              if (!desk) return null;
              return (
                <DeskNode
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDesk?.id === desk.id}
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
    </div>
  );
});
