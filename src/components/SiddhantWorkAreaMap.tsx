import React, { useState, useMemo } from 'react';
import { Desk, Room, SiddhantFloorId } from '../types';
import { OFFICES } from '../data/officeConfig';
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
  // Selected floor state (Defaults to Finance & Legal)
  const [selectedFloorId, setSelectedFloorId] = useState<SiddhantFloorId>('finance_legal');
  const [floorDropdownOpen, setFloorDropdownOpen] = useState<boolean>(false);

  // Available floor maps list
  const siddhantFloors = OFFICES.siddhant.siddhantFloors || [];
  const currentFloor = useMemo(() => {
    return siddhantFloors.find((f) => f.id === selectedFloorId) || siddhantFloors[0];
  }, [siddhantFloors, selectedFloorId]);

  // Memoized desk map for O(1) lookup
  const deskMap = useMemo(() => new Map(desks.map((d) => [d.id, d])), [desks]);
  const getDesk = (id: string) => deskMap.get(id);

  // Filter meeting rooms for this area
  const areaRooms = useMemo(() => rooms.filter((r) => r.areaId === activeArea), [rooms, activeArea]);

  return (
    <div className="relative w-[1380px] h-[920px] bg-[#090D16] border border-slate-700/50 rounded-3xl p-6 shadow-2xl overflow-hidden select-none flex flex-col">
      {/* High-tech Blueprint Grid Background matching Global Port */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0),
            linear-gradient(to right, rgba(16, 185, 129, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 120px 120px, 120px 120px'
        }}
      />

      {/* Precision CAD Corner Crosshairs */}
      <div className="absolute top-3 left-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">┌ ┐</div>
      <div className="absolute top-3 right-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">┌ ┐</div>
      <div className="absolute bottom-3 left-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">└ ┘</div>
      <div className="absolute bottom-3 right-3 text-slate-700 font-mono text-[10px] pointer-events-none select-none">└ ┘</div>

      {/* Blueprint Architectural Stamp Header & Dropdown Chooser */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between select-none z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <span className="material-symbols-outlined text-lg">domain</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-xs tracking-wider uppercase">
                SIDDHANT CAMPUS // {currentFloor?.name.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                {currentFloor?.deskCount} WORKSTATIONS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                POD LAYOUT BLUEPRINT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">
              ARCHITECTURAL SEATING PLAN // {currentFloor?.pdfFileName}
            </span>
          </div>
        </div>

        {/* Floor Selection Dropdown Option */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFloorDropdownOpen(!floorDropdownOpen)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-semibold transition-all cursor-pointer shadow-lg"
          >
            <span className="material-symbols-outlined text-sm text-emerald-400">layers</span>
            <span>Floor Wing: {currentFloor?.name}</span>
            <span className="material-symbols-outlined text-xs text-slate-400">
              {floorDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {floorDropdownOpen && (
            <div className="absolute top-10 right-0 z-50 w-72 rounded-2xl bg-[#0B0F17] border border-emerald-500/30 p-2 shadow-2xl backdrop-blur-xl">
              <div className="px-2.5 py-1.5 border-b border-white/[0.06] mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Siddhant Floor Wings
                </span>
              </div>
              <div className="space-y-1">
                {siddhantFloors.map((floor) => (
                  <button
                    key={floor.id}
                    type="button"
                    onClick={() => {
                      setSelectedFloorId(floor.id);
                      setFloorDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left font-mono text-xs transition-all flex items-center justify-between cursor-pointer ${
                      floor.id === selectedFloorId
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <span>{floor.name}</span>
                    {floor.id === selectedFloorId && (
                      <span className="material-symbols-outlined text-sm text-emerald-400">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blueprint Corridor Aisle Guide */}
      <div className="absolute top-[365px] left-[165px] right-[40px] h-[1px] border-b border-dashed border-slate-800 pointer-events-none" />
      <div className="absolute top-[353px] left-[520px] text-[9px] font-mono uppercase text-slate-600 tracking-widest pointer-events-none select-none">
        ← MAIN AISLE WAY // CENTRAL PASSAGE →
      </div>

      {/* ========================================================
          FULL ARCHITECTURAL POD SEATING PLAN (Matching Global Port Visuals)
         ======================================================== */}
      <div className="pt-20 px-2 h-full flex flex-col justify-between pb-4">
        {/* Top Half: West Bank + North Pods (Alpha, Beta, Gamma, Delta) + East Bank */}
        <div className="grid grid-cols-12 gap-3 items-start">
          {/* West Perimeter Wall (Left Wall - 8 Desks) */}
          <div className="col-span-2 bg-[#0C121D]/90 border border-slate-700/50 rounded-2xl p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">West Perimeter</span>
              <span className="text-[9px] font-mono text-slate-400">8 Seats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const deskId = `SID-${selectedFloorId.toUpperCase()}-W${num}`;
                let d = getDesk(deskId);
                if (!d) {
                  d = {
                    id: deskId,
                    code: `W${num}`,
                    areaId: activeArea,
                    officeId: 'siddhant',
                    zoneName: `${currentFloor?.name} // West Wall`,
                    podName: 'West Perimeter Bank',
                    row: Math.ceil(num / 2),
                    col: ((num - 1) % 2) + 1,
                    orientation: 'facing-right',
                    status: num % 4 === 0 ? 'booked' : 'available',
                    amenities: ['Window View', 'Dual 4K Monitor', 'USB-C Dock'],
                    pricePerHour: 15
                  };
                }
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

          {/* Central Workstation Pods 1 & 2 */}
          <div className="col-span-8 grid grid-cols-2 gap-4">
            {[
              { name: 'North Pod 1 (Alpha)', start: 1, count: 12, codePrefix: 'N1' },
              { name: 'North Pod 2 (Beta)', start: 13, count: 12, codePrefix: 'N2' }
            ].map((pod) => (
              <div key={pod.name} className="bg-[#0C121D]/90 border border-slate-700/50 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{pod.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">12 Desks</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: pod.count }, (_, i) => i + 1).map((idx) => {
                    const deskId = `SID-${selectedFloorId.toUpperCase()}-${pod.codePrefix}-${idx}`;
                    let d = getDesk(deskId);
                    if (!d) {
                      d = {
                        id: deskId,
                        code: `${pod.codePrefix}-${idx}`,
                        areaId: activeArea,
                        officeId: 'siddhant',
                        zoneName: `${currentFloor?.name} // Central Pods`,
                        podName: pod.name,
                        row: Math.ceil(idx / 2),
                        col: ((idx - 1) % 2) + 1,
                        orientation: idx % 2 === 1 ? 'facing-right' : 'facing-left',
                        status: (idx + pod.start) % 5 === 0 ? 'booked' : 'available',
                        amenities: ['Dual 4K Monitor', 'Standing Desk', 'Type-C Hub'],
                        pricePerHour: 16
                      };
                    }
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

          {/* East Perimeter Wall (Right Wall - 8 Desks) */}
          <div className="col-span-2 bg-[#0C121D]/90 border border-slate-700/50 rounded-2xl p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">East Perimeter</span>
              <span className="text-[9px] font-mono text-slate-400">8 Seats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const deskId = `SID-${selectedFloorId.toUpperCase()}-E${num}`;
                let d = getDesk(deskId);
                if (!d) {
                  d = {
                    id: deskId,
                    code: `E${num}`,
                    areaId: activeArea,
                    officeId: 'siddhant',
                    zoneName: `${currentFloor?.name} // East Wall`,
                    podName: 'East Perimeter Bank',
                    row: Math.ceil(num / 2),
                    col: ((num - 1) % 2) + 1,
                    orientation: 'facing-left',
                    status: num % 3 === 0 ? 'booked' : 'available',
                    amenities: ['Window View', 'Ultrawide Display', 'Power Dock'],
                    pricePerHour: 15
                  };
                }
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

        {/* Bottom Half: South Pod Bays (South 1, South 2, South 3, Executive Bays) */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[
            { name: 'South Pod 1', codePrefix: 'S1', count: 12 },
            { name: 'South Pod 2', codePrefix: 'S2', count: 12 },
            { name: 'South Pod 3', codePrefix: 'S3', count: 12 },
            { name: 'Executive Pod Bay', codePrefix: 'EX', count: 12 }
          ].map((pod) => (
            <div key={pod.name} className="bg-[#0C121D]/90 border border-slate-700/50 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-mono font-bold text-emerald-400">{pod.name}</span>
                <span className="text-[9px] font-mono text-slate-400">12 Desks</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: pod.count }, (_, i) => i + 1).map((idx) => {
                  const deskId = `SID-${selectedFloorId.toUpperCase()}-${pod.codePrefix}-${idx}`;
                  let d = getDesk(deskId);
                  if (!d) {
                    d = {
                      id: deskId,
                      code: `${pod.codePrefix}-${idx}`,
                      areaId: activeArea,
                      officeId: 'siddhant',
                      zoneName: `${currentFloor?.name} // South Wing`,
                      podName: pod.name,
                      row: Math.ceil(idx / 2),
                      col: ((idx - 1) % 2) + 1,
                      orientation: idx % 2 === 1 ? 'facing-right' : 'facing-left',
                      status: idx % 6 === 0 ? 'booked' : 'available',
                      amenities: ['Dual 4K Monitor', 'Ergonomic Chair', 'Power Hub'],
                      pricePerHour: 16
                    };
                  }
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
  );
});
