import React, { useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface WorkArea1MapProps {
  desks: Desk[];
  rooms?: Room[];
  selectedDesk: Desk | null;
  highlightedDeskId: string | null;
  onSelectDesk: (desk: Desk) => void;
  onHoverDesk: (desk: Desk, e: React.MouseEvent) => void;
  onLeaveDesk: () => void;
  onSelectRoom?: (room: Room) => void;
}

export const WorkArea1Map: React.FC<WorkArea1MapProps> = React.memo(({
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
    <div className="relative w-[1180px] h-[950px] bg-[#090D16] border border-slate-700/50 rounded-3xl p-6 shadow-2xl overflow-hidden select-none">
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
            <span className="font-mono font-bold text-white text-xs tracking-wider">WA-1 // MAIN FLOOR</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              130 WORKSTATIONS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
              9 WORK PODS
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
          <span>1180 × 950 MM</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-700/60 px-3 py-1 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-xs text-amber-400">explore</span>
          <span>NORTH ↑</span>
        </div>
      </div>

      {/* Architectural Corridor Watermarks / Walking Path Guide */}
      <div className="absolute top-[365px] left-[165px] right-[40px] h-[1px] border-b border-dashed border-slate-800 pointer-events-none" />
      <div className="absolute top-[353px] left-[520px] text-[9px] font-mono uppercase text-slate-600 tracking-widest pointer-events-none select-none">
        ← MAIN AISLE WAY // 2.4M CENTRAL PASSAGE →
      </div>

      {/* ========================================================
          1. WEST PERIMETER WALL (LEFT WALL: 14 Desks + 2 Pillars)
         ======================================================== */}
      <div className="absolute top-[72px] left-[25px] w-[105px] border-r border-slate-700/60 pr-3 flex flex-col justify-start z-10">
        <div className="flex items-center gap-1.5 mb-1.5 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">West Wall</span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">14</span>
        </div>

        {/* Top Segment: 3 Desks */}
        <div className="flex flex-col gap-1.5">
          {[1, 2, 3].map((i) => {
            const id = `WA1-LW-${String(i).padStart(2, '0')}`;
            const desk = getDesk(id);
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

        {/* Structural Pillar 1 */}
        <div className="w-16 h-9 my-1.5 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/70 rounded-lg flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
          <span className="material-symbols-outlined text-[12px] text-slate-500">view_column</span>
          <span className="text-[8px] font-mono text-slate-400 font-semibold tracking-wider">PILLAR 1</span>
        </div>

        {/* Middle Segment: 6 Desks */}
        <div className="flex flex-col gap-1.5">
          {[4, 5, 6, 7, 8, 9].map((i) => {
            const id = `WA1-LW-${String(i).padStart(2, '0')}`;
            const desk = getDesk(id);
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

        {/* Structural Pillar 2 */}
        <div className="w-16 h-9 my-1.5 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/70 rounded-lg flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
          <span className="material-symbols-outlined text-[12px] text-slate-500">view_column</span>
          <span className="text-[8px] font-mono text-slate-400 font-semibold tracking-wider">PILLAR 2</span>
        </div>

        {/* Bottom Segment: 5 Desks */}
        <div className="flex flex-col gap-1.5">
          {[10, 11, 12, 13, 14].map((i) => {
            const id = `WA1-LW-${String(i).padStart(2, '0')}`;
            const desk = getDesk(id);
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
          2. NORTH FLOOR: TOP PODS (2 x 10 Desks)
         ======================================================== */}
      {/* Top Pod 1 (5 Pairs = 10 Desks, Front & Back face to face) */}
      <div className="absolute top-[75px] left-[165px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">North Pod 1</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">10</span>
        </div>
        <div className="flex gap-1 relative">
          {/* Vertical Divider Spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          {/* Left Column (Facing Right) */}
          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9].map((num) => {
              const desk = getDesk(`WA1-NP1-${String(num).padStart(2, '0')}`);
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

          {/* Right Column (Facing Left - Front and Back across Divider!) */}
          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10].map((num) => {
              const desk = getDesk(`WA1-NP1-${String(num).padStart(2, '0')}`);
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

      {/* Top Pod 2 (5 Pairs = 10 Desks, Front & Back face to face) */}
      <div className="absolute top-[75px] left-[325px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">North Pod 2</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">10</span>
        </div>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9].map((num) => {
              const desk = getDesk(`WA1-NP2-${String(num).padStart(2, '0')}`);
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

          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10].map((num) => {
              const desk = getDesk(`WA1-NP2-${String(num).padStart(2, '0')}`);
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

      {/* ========================================================
          3. MAIN FLOOR SOUTH PODS (3 Pods x 9 Pairs = 54 Desks)
         ======================================================== */}
      {/* South Pod 1 (18 Desks, 9 Pairs Front & Back) */}
      <div className="absolute top-[390px] left-[165px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">South Pod 1</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">18</span>
        </div>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((num) => {
              const desk = getDesk(`WA1-SP1-${String(num).padStart(2, '0')}`);
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

          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((num) => {
              const desk = getDesk(`WA1-SP1-${String(num).padStart(2, '0')}`);
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

      {/* South Pod 2 (18 Desks, 9 Pairs Front & Back) */}
      <div className="absolute top-[390px] left-[325px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">South Pod 2</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">18</span>
        </div>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((num) => {
              const desk = getDesk(`WA1-SP2-${String(num).padStart(2, '0')}`);
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

          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((num) => {
              const desk = getDesk(`WA1-SP2-${String(num).padStart(2, '0')}`);
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

      {/* South Pod 3 (18 Desks, 9 Pairs Front & Back) */}
      <div className="absolute top-[390px] left-[485px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">South Pod 3</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">18</span>
        </div>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((num) => {
              const desk = getDesk(`WA1-SP3-${String(num).padStart(2, '0')}`);
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

          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((num) => {
              const desk = getDesk(`WA1-SP3-${String(num).padStart(2, '0')}`);
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

      {/* ========================================================
          4. CENTER POD WITH PILLARS (14 Desks)
         ======================================================== */}
      <div className="absolute top-[390px] left-[645px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">Pillar Pod</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">14</span>
        </div>

        {/* Top 2 Pairs (4 desks) */}
        <div className="flex gap-1 relative mb-1.5">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />
          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3].map((num) => {
              const desk = getDesk(`WA1-CP-0${num}`);
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
          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4].map((num) => {
              const desk = getDesk(`WA1-CP-0${num}`);
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

        {/* Middle Structural Pillar */}
        <div className="w-24 h-9 my-1 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/70 rounded-lg flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
          <span className="material-symbols-outlined text-[12px] text-slate-500">view_column</span>
          <span className="text-[8px] font-mono text-slate-400 font-semibold tracking-wider">PILLAR</span>
        </div>

        {/* Lower 5 Pairs (10 desks) */}
        <div className="flex gap-1 relative my-1.5">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />
          <div className="flex flex-col gap-1.5 pr-2">
            {[5, 7, 9, 11, 13].map((num) => {
              const desk = getDesk(`WA1-CP-${String(num).padStart(2, '0')}`);
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
          <div className="flex flex-col gap-1.5 pl-2">
            {[6, 8, 10, 12, 14].map((num) => {
              const desk = getDesk(`WA1-CP-${String(num).padStart(2, '0')}`);
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

        {/* Base Pillar */}
        <div className="w-24 h-9 mt-1 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/70 rounded-lg flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
          <span className="material-symbols-outlined text-[12px] text-slate-500">view_column</span>
          <span className="text-[8px] font-mono text-slate-400 font-semibold tracking-wider">PILLAR</span>
        </div>
      </div>

      {/* ========================================================
          5. EAST MAIN FLOOR PODS (2 Pods x 7 Pairs = 28 Desks)
         ======================================================== */}
      {/* East Pod 1 (14 Desks, 7 Pairs Front & Back) */}
      <div className="absolute top-[390px] left-[815px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">East Pod 1</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">14</span>
        </div>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9, 11, 13].map((num) => {
              const desk = getDesk(`WA1-EP1-${String(num).padStart(2, '0')}`);
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

          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10, 12, 14].map((num) => {
              const desk = getDesk(`WA1-EP1-${String(num).padStart(2, '0')}`);
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

      {/* East Pod 2 (14 Desks, 7 Pairs Front & Back) */}
      <div className="absolute top-[390px] left-[975px] bg-[#0e1526]/70 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl p-3 flex flex-col items-center shadow-lg shadow-black/20 group z-10">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wide font-medium">East Pod 2</span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 rounded">14</span>
        </div>
        <div className="flex gap-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-full z-10" />

          <div className="flex flex-col gap-1.5 pr-2">
            {[1, 3, 5, 7, 9, 11, 13].map((num) => {
              const desk = getDesk(`WA1-EP2-${String(num).padStart(2, '0')}`);
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

          <div className="flex flex-col gap-1.5 pl-2">
            {[2, 4, 6, 8, 10, 12, 14].map((num) => {
              const desk = getDesk(`WA1-EP2-${String(num).padStart(2, '0')}`);
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
