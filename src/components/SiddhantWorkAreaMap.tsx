import React, { useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface SiddhantWorkAreaMapProps {
  activeArea: 'area-1' | 'area-2';
  desks: Desk[];
  rooms?: Room[];
  selectedDesk: Desk | null;
  highlightedDeskId: string | null;
  onSelectDesk: (desk: Desk) => void;
  onHoverDesk: (desk: Desk, e: React.MouseEvent) => void;
  onLeaveDesk: () => void;
  onSelectRoom?: (room: Room) => void;
}

export const SiddhantWorkAreaMap: React.FC<SiddhantWorkAreaMapProps> = React.memo(({
  activeArea,
  desks,
  rooms = [],
  selectedDesk,
  highlightedDeskId,
  onSelectDesk,
  onHoverDesk,
  onLeaveDesk,
  onSelectRoom
}) => {
  // Memoized desk map for O(1) lookup
  const deskMap = useMemo(() => new Map(desks.map((d) => [d.id, d])), [desks]);
  const getDesk = (id: string) => deskMap.get(id);

  // Filter meeting rooms for this area
  const areaRooms = useMemo(() => rooms.filter((r) => r.areaId === activeArea), [rooms, activeArea]);

  return (
    <div className="relative w-[1220px] h-[920px] bg-[#080C14] border border-emerald-500/25 rounded-3xl p-6 shadow-2xl overflow-hidden select-none">
      {/* Blueprint Grid Background with Emerald Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0),
            linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 120px 120px, 120px 120px'
        }}
      />

      {/* Precision CAD Corner Crosshairs */}
      <div className="absolute top-3 left-3 text-emerald-600/70 font-mono text-[10px] pointer-events-none">┌ ┐</div>
      <div className="absolute top-3 right-3 text-emerald-600/70 font-mono text-[10px] pointer-events-none">┌ ┐</div>
      <div className="absolute bottom-3 left-3 text-emerald-600/70 font-mono text-[10px] pointer-events-none">└ ┘</div>
      <div className="absolute bottom-3 right-3 text-emerald-600/70 font-mono text-[10px] pointer-events-none">└ ┘</div>

      {/* Architectural Stamp Header */}
      <div className="absolute top-4 left-6 flex items-center gap-3 select-none z-10">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
          <span className="material-symbols-outlined text-xl">location_city</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-xs tracking-wider">
              SIDDHANT CAMPUS // {activeArea === 'area-1' ? 'MAIN COLLABORATION FLOOR' : 'FOCUS & SILENT WING'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              {activeArea === 'area-1' ? '80 WORKSTATIONS' : '40 WORKSTATIONS'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Siddhant Corporate Center • {activeArea === 'area-1' ? 'Pods Alpha-Zeta & Executive Bays' : 'Silent & Focus Pods'}
          </span>
        </div>
      </div>

      {/* Architectural Blueprint Import Notice Ribbon (Top Right) */}
      <div className="absolute top-4 right-6 z-10 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono shadow-md backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse flex-shrink-0" />
        <span className="font-semibold">Blueprint Notice:</span>
        <span className="text-amber-200/80 text-[11px]">Architectural CAD overlay awaiting import. Interactive booking & Outlook sync are 100% active.</span>
      </div>

      {/* ========================================================
          AREA 1 FLOOR PLAN (80 Desks)
         ======================================================== */}
      {activeArea === 'area-1' ? (
        <div className="pt-20 px-4 h-full flex flex-col justify-between pb-6">
          {/* Top Row: West Window Bank + 3 Collaboration Pods + East Window Bank */}
          <div className="grid grid-cols-12 gap-3 items-start">
            {/* West Window Perimeter (8 Desks: SID-WA1-65 to 72) */}
            <div className="col-span-2 bg-[#0C121D]/90 border border-white/[0.08] rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">West Skyline</span>
                <span className="text-[9px] font-mono text-slate-400">8 Desks</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[65, 66, 67, 68, 69, 70, 71, 72].map((num) => {
                  const d = getDesk(`SID-WA1-${String(num).padStart(2, '0')}`);
                  if (!d) return null;
                  return (
                    <DeskNode
                      key={d.id}
                      desk={d}
                      isSelected={selectedDesk?.id === d.id}
                      isHighlighted={highlightedDeskId === d.id}
                      onSelect={onSelectDesk}
                      onHover={onHoverDesk}
                      onLeave={onLeaveDesk}
                    />
                  );
                })}
              </div>
            </div>

            {/* Central Pods Alpha, Beta, Gamma (24 Desks: 1 to 24) */}
            <div className="col-span-8 grid grid-cols-3 gap-3">
              {[
                { name: 'Pod Alpha', start: 1, end: 8, zone: 'Zone A' },
                { name: 'Pod Beta', start: 9, end: 16, zone: 'Zone B' },
                { name: 'Pod Gamma', start: 17, end: 24, zone: 'Zone C' }
              ].map((pod) => (
                <div key={pod.name} className="bg-[#0C121D]/90 border border-white/[0.08] rounded-2xl p-3 shadow-lg">
                  <div className="flex items-center justify-between mb-2 border-b border-white/[0.06] pb-1.5">
                    <span className="text-[11px] font-mono font-bold text-emerald-400">{pod.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">{pod.zone}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: pod.end - pod.start + 1 }, (_, i) => pod.start + i).map((num) => {
                      const d = getDesk(`SID-WA1-${String(num).padStart(2, '0')}`);
                      if (!d) return null;
                      return (
                        <DeskNode
                          key={d.id}
                          desk={d}
                          isSelected={selectedDesk?.id === d.id}
                          isHighlighted={highlightedDeskId === d.id}
                          onSelect={onSelectDesk}
                          onHover={onHoverDesk}
                          onLeave={onLeaveDesk}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* East Window Perimeter (8 Desks: SID-WA1-73 to 80) */}
            <div className="col-span-2 bg-[#0C121D]/90 border border-white/[0.08] rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">East Skyline</span>
                <span className="text-[9px] font-mono text-slate-400">8 Desks</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[73, 74, 75, 76, 77, 78, 79, 80].map((num) => {
                  const d = getDesk(`SID-WA1-${String(num).padStart(2, '0')}`);
                  if (!d) return null;
                  return (
                    <DeskNode
                      key={d.id}
                      desk={d}
                      isSelected={selectedDesk?.id === d.id}
                      isHighlighted={highlightedDeskId === d.id}
                      onSelect={onSelectDesk}
                      onHover={onHoverDesk}
                      onLeave={onLeaveDesk}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Middle Row: Meeting Rooms Strip */}
          <div className="my-3 grid grid-cols-2 gap-4">
            {/* Room 1: Siddhant Executive Boardroom */}
            <div
              onClick={() => {
                const r = areaRooms.find((x) => x.id === 'SID-CONF-01');
                if (r && onSelectRoom) onSelectRoom(r);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/40 to-blue-950/30 border border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(14,165,233,0.25)] transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">meeting_room</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300">
                      Siddhant Executive Boardroom
                    </h4>
                    <span className="text-[10px] font-mono text-sky-400 font-semibold">CONF-1</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Capacity: 14 Persons • 4K Dual Telepresence • Whiteboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-400/30 text-xs font-semibold transition-all"
              >
                Book Boardroom
              </button>
            </div>

            {/* Room 2: Siddhant Innovation Hub */}
            <div
              onClick={() => {
                const r = areaRooms.find((x) => x.id === 'SID-CONF-02');
                if (r && onSelectRoom) onSelectRoom(r);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">hub</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Siddhant Innovation Hub
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">CONF-2</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Capacity: 8 Persons • Smart Digital Touch Display • Acoustic Insulation
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-400/30 text-xs font-semibold transition-all"
              >
                Book Hub
              </button>
            </div>
          </div>

          {/* Bottom Row: Pods Delta, Epsilon, Zeta + 2 Executive Bays (40 Desks: 25 to 64) */}
          <div className="grid grid-cols-5 gap-3 items-start">
            {[
              { name: 'Pod Delta', start: 25, end: 32, zone: 'Zone D' },
              { name: 'Pod Epsilon', start: 33, end: 40, zone: 'Zone E' },
              { name: 'Pod Zeta', start: 41, end: 48, zone: 'Zone F' },
              { name: 'Executive Bay 1', start: 49, end: 56, zone: 'Zone G' },
              { name: 'Executive Bay 2', start: 57, end: 64, zone: 'Zone G' }
            ].map((pod) => (
              <div key={pod.name} className="bg-[#0C121D]/90 border border-white/[0.08] rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2 border-b border-white/[0.06] pb-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{pod.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">{pod.zone}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: pod.end - pod.start + 1 }, (_, i) => pod.start + i).map((num) => {
                    const d = getDesk(`SID-WA1-${String(num).padStart(2, '0')}`);
                    if (!d) return null;
                    return (
                      <DeskNode
                        key={d.id}
                        desk={d}
                        isSelected={selectedDesk?.id === d.id}
                        isHighlighted={highlightedDeskId === d.id}
                        onSelect={onSelectDesk}
                        onHover={onHoverDesk}
                        onLeave={onLeaveDesk}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================
            AREA 2 FLOOR PLAN (40 Desks: Focus Wing & Silent Pods)
           ======================================================== */
        <div className="pt-20 px-6 h-full flex flex-col justify-between pb-6">
          {/* Top Row: Focus Pods 1 & 2 (20 Desks: SID-WA2-01 to 20) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Focus Collaboration Pods (20 Desks)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Ergonomic Standing Stations • Dual 4K</span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { name: 'Focus Pod 1', start: 1, end: 10 },
                { name: 'Focus Pod 2', start: 11, end: 20 }
              ].map((pod) => (
                <div key={pod.name} className="bg-[#0C121D]/90 border border-white/[0.08] rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">{pod.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">10 Workstations</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: pod.end - pod.start + 1 }, (_, i) => pod.start + i).map((num) => {
                      const d = getDesk(`SID-WA2-${String(num).padStart(2, '0')}`);
                      if (!d) return null;
                      return (
                        <DeskNode
                          key={d.id}
                          desk={d}
                          isSelected={selectedDesk?.id === d.id}
                          isHighlighted={highlightedDeskId === d.id}
                          onSelect={onSelectDesk}
                          onHover={onHoverDesk}
                          onLeave={onLeaveDesk}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Row: Area 2 Meeting Rooms */}
          <div className="grid grid-cols-2 gap-5 my-4">
            <div
              onClick={() => {
                const r = areaRooms.find((x) => x.id === 'SID-FOCUS-01');
                if (r && onSelectRoom) onSelectRoom(r);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Siddhant Focus Cabin A
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">ROOM-1</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Capacity: 4 Persons • 4K Display • Soundproof Acoustic Glass
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-400/30 text-xs font-semibold transition-all"
              >
                Book Cabin
              </button>
            </div>

            <div
              onClick={() => {
                const r = areaRooms.find((x) => x.id === 'SID-FOCUS-02');
                if (r && onSelectRoom) onSelectRoom(r);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/40 to-blue-950/30 border border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(14,165,233,0.25)] transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300">
                      Siddhant 1-on-1 Pod B
                    </h4>
                    <span className="text-[10px] font-mono text-sky-400 font-semibold">ROOM-2</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Capacity: 2 Persons • Privacy Frosting • High-Def Webcam Bar
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-400/30 text-xs font-semibold transition-all"
              >
                Book Pod
              </button>
            </div>
          </div>

          {/* Bottom Row: Silent Zone Banks 1 & 2 (20 Desks: SID-WA2-21 to 40) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Silent Deep-Work Banks (20 Desks)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Zero-Distraction Noise-Insulated Workstations</span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { name: 'Silent Bank 1', start: 21, end: 30 },
                { name: 'Silent Bank 2', start: 31, end: 40 }
              ].map((bank) => (
                <div key={bank.name} className="bg-[#0C121D]/90 border border-white/[0.08] rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{bank.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">10 Silent Desks</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: bank.end - bank.start + 1 }, (_, i) => bank.start + i).map((num) => {
                      const d = getDesk(`SID-WA2-${String(num).padStart(2, '0')}`);
                      if (!d) return null;
                      return (
                        <DeskNode
                          key={d.id}
                          desk={d}
                          isSelected={selectedDesk?.id === d.id}
                          isHighlighted={highlightedDeskId === d.id}
                          onSelect={onSelectDesk}
                          onHover={onHoverDesk}
                          onLeave={onLeaveDesk}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
