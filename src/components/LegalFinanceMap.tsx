import React, { useState, useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface LegalFinanceMapProps {
  desks: Desk[];
  rooms?: Room[];
  selectedDesk: Desk | null;
  highlightedDeskId: string | null;
  onSelectDesk: (desk: Desk) => void;
  onHoverDesk: (desk: Desk, e: React.MouseEvent) => void;
  onLeaveDesk: () => void;
  onSelectRoom?: (room: Room) => void;
  viewMode?: 'blueprint' | 'original';
  rotation?: 0 | 90 | 180 | 270;
}

export const LegalFinanceMap: React.FC<LegalFinanceMapProps> = React.memo(({
  desks,
  selectedDesk,
  highlightedDeskId,
  onSelectDesk,
  onHoverDesk,
  onLeaveDesk,
  onSelectRoom,
  viewMode: propViewMode,
  rotation: propRotation
}) => {
  const [internalViewMode] = useState<'blueprint' | 'original'>('original');
  const [internalRotation] = useState<0 | 90 | 180 | 270>(0);
  const viewMode = propViewMode ?? internalViewMode;
  const rotation = propRotation ?? internalRotation;
  const deskMap = useMemo(() => new Map(desks.map((d) => [d.id, d])), [desks]);

  const getDesk = (id: string, fallback: Partial<Desk>): Desk => {
    const found = deskMap.get(id);
    if (found) return found;
    return {
      id,
      code: fallback.code || 'WS',
      areaId: 'area-1',
      officeId: 'siddhant',
      zoneName: fallback.zoneName || 'Legal Finance Wing',
      podName: fallback.podName || 'Work Area',
      row: fallback.row || 1,
      col: fallback.col || 1,
      orientation: fallback.orientation || 'facing-right',
      status: fallback.status || 'available',
      amenities: fallback.amenities || ['Dual 4K Monitor', 'Type-C Hub'],
      pricePerHour: fallback.pricePerHour || 16
    };
  };

  return (
    <div className="relative w-[1380px] bg-[#090D16] border border-slate-700/50 rounded-2xl p-3 shadow-2xl overflow-hidden select-none flex flex-col gap-2">
      {/* Precision CAD Corner Crosshairs */}
      <div className="absolute top-2 left-2 text-slate-700 font-mono text-[10px] pointer-events-none select-none z-20">┌ ┐</div>
      <div className="absolute top-2 right-2 text-slate-700 font-mono text-[10px] pointer-events-none select-none z-20">┌ ┐</div>
      <div className="absolute bottom-2 left-2 text-slate-700 font-mono text-[10px] pointer-events-none select-none z-20">└ ┘</div>
      <div className="absolute bottom-2 right-2 text-slate-700 font-mono text-[10px] pointer-events-none select-none z-20">└ ┘</div>

      {/* ========================================================
          CANVAS AREA: EXACT 1.414:1 BLUEPRINT BACKDROP OVERLAY
         ======================================================== */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-600/60 bg-white flex items-center justify-center p-2 shadow-2xl">
        <div
          className="relative w-[1300px] h-[919px] transition-transform duration-500 origin-center bg-white"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Authentic CAD Blueprint Image */}
          <img
            src="/floormaps/finance_legal.png"
            alt="Legal Finance Blueprint"
            className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 select-none ${
              viewMode === 'blueprint'
                ? 'invert-[1] hue-rotate-[195deg] contrast-[1.7] brightness-[1.25] saturate-[1.3]'
                : 'opacity-100 contrast-[1.08]'
            }`}
          />

          {/* ========================================================
              INTERACTIVE SEATS & ROOMS PLACED AT EXACT BLUEPRINT SEATS
             ======================================================== */}
          <div className="absolute inset-0 pointer-events-auto">

            {/* 1. Cubicle 1 (Top, person sits at bottom facing UP towards desk) */}
            <div className="absolute top-[12.2%] left-[49.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CUB-01', {
                  code: 'CUB-1',
                  podName: 'Cubicle 1 (North)',
                  orientation: 'facing-up',
                  amenities: ['L-Shaped Workstation', 'Dual Monitor Arm', 'Privacy Frosting']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CUB-01'}
                isHighlighted={highlightedDeskId === 'SID-LF-CUB-01'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* 2. Cubicle 2 (Bottom, person sits at top facing DOWN towards desk) */}
            <div className="absolute top-[34.0%] left-[49.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CUB-02', {
                  code: 'CUB-2',
                  podName: 'Cubicle 2 (South)',
                  orientation: 'facing-down',
                  amenities: ['L-Shaped Workstation', 'Dual Monitor Arm', 'Privacy Frosting']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CUB-02'}
                isHighlighted={highlightedDeskId === 'SID-LF-CUB-02'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* 3. Workstations 6 Nos Pod (2 Facing Columns of 3 Desks) */}
            {/* Left Column (3 Desks, person sits on left facing RIGHT towards desk) */}
            <div className="absolute top-[12.5%] left-[58.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-WS-01', {
                  code: 'W1',
                  podName: 'Workstations 6 Nos',
                  orientation: 'facing-right',
                  amenities: ['Dual 4K Monitor', 'Type-C Hub']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-WS-01'}
                isHighlighted={highlightedDeskId === 'SID-LF-WS-01'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[22.5%] left-[58.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-WS-02', {
                  code: 'W2',
                  podName: 'Workstations 6 Nos',
                  orientation: 'facing-right',
                  amenities: ['Dual 4K Monitor', 'Type-C Hub']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-WS-02'}
                isHighlighted={highlightedDeskId === 'SID-LF-WS-02'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[32.5%] left-[58.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-WS-03', {
                  code: 'W3',
                  podName: 'Workstations 6 Nos',
                  orientation: 'facing-right',
                  amenities: ['Dual 4K Monitor', 'Type-C Hub']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-WS-03'}
                isHighlighted={highlightedDeskId === 'SID-LF-WS-03'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Right Column (3 Desks, person sits on right facing LEFT towards desk) */}
            <div className="absolute top-[12.5%] left-[67.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-WS-04', {
                  code: 'W4',
                  podName: 'Workstations 6 Nos',
                  orientation: 'facing-left',
                  amenities: ['Dual 4K Monitor', 'Type-C Hub']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-WS-04'}
                isHighlighted={highlightedDeskId === 'SID-LF-WS-04'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[22.5%] left-[67.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-WS-05', {
                  code: 'W5',
                  podName: 'Workstations 6 Nos',
                  orientation: 'facing-left',
                  amenities: ['Dual 4K Monitor', 'Type-C Hub']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-WS-05'}
                isHighlighted={highlightedDeskId === 'SID-LF-WS-05'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[32.5%] left-[67.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-WS-06', {
                  code: 'W6',
                  podName: 'Workstations 6 Nos',
                  orientation: 'facing-left',
                  amenities: ['Dual 4K Monitor', 'Type-C Hub']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-WS-06'}
                isHighlighted={highlightedDeskId === 'SID-LF-WS-06'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* ========================================================
                SOUTH EXECUTIVE CABINS (West to East)
               ======================================================== */}
            {/* Cabin 1: Admin Cabin (8'0" X 10'6") */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-LF-ADMIN',
                code: 'ADMIN',
                name: 'Admin Cabin (8\'0" X 10\'6")',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 4,
                status: 'available',
                amenities: ['Executive Desk', '3 Visitor Chairs', 'Credenza Storage']
              })}
              className="absolute top-[53.0%] left-[20.0%] w-[11.0%] h-[27.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all cursor-pointer group shadow-sm"
              title="Admin Cabin (8'0 X 10'6)"
            >
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded shadow">
                ADMIN CABIN
              </span>
            </div>
            <div className="absolute top-[70.0%] left-[25.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CAB-ADMIN', {
                  code: 'ADMIN',
                  podName: 'Admin Cabin',
                  orientation: 'facing-up',
                  amenities: ['Executive High-Back Chair', 'Glass Desk', 'Dual 4K Displays']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CAB-ADMIN'}
                isHighlighted={highlightedDeskId === 'SID-LF-CAB-ADMIN'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Cabin 2: Asst. Finance Cabin (6'7" X 10'6") */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-LF-ASST-FIN',
                code: 'ASST-FIN',
                name: 'Asst. Finance Cabin (6\'7" X 10\'6")',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 3,
                status: 'available',
                amenities: ['Executive Desk', '2 Visitor Chairs', 'Storage Unit']
              })}
              className="absolute top-[53.0%] left-[35.0%] w-[10.5%] h-[27.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all cursor-pointer group shadow-sm"
              title="Asst. Finance Cabin (6'7 X 10'6)"
            >
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded shadow">
                ASST. FINANCE
              </span>
            </div>
            <div className="absolute top-[70.0%] left-[40.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CAB-ASST', {
                  code: 'ASST',
                  podName: 'Asst. Finance Cabin',
                  orientation: 'facing-up',
                  amenities: ['Executive High-Back Chair', 'Financial Terminal', 'Visitor Chairs']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CAB-ASST'}
                isHighlighted={highlightedDeskId === 'SID-LF-CAB-ASST'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Cabin 3: Legal Department Cabin (6'0" X 7'7", Indented Wall) - 2 DESKS */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-LF-LEGAL',
                code: 'LEGAL',
                name: 'Legal Department Cabin (6\'0" X 7\'7")',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 2,
                status: 'available',
                amenities: ['Dual Legal Workstations', 'Document Storage', 'Case File Vault']
              })}
              className="absolute top-[53.0%] left-[47.0%] w-[10.0%] h-[18.5%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all cursor-pointer group shadow-sm"
              title="Legal Cabin (6'0 X 7'7)"
            >
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded shadow">
                LEGAL (2 SEATS)
              </span>
            </div>
            {/* Legal Desk 1 (Top, person sits at top facing DOWN) */}
            <div className="absolute top-[57.5%] left-[51.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CAB-LEGAL-1', {
                  code: 'LEG-1',
                  podName: 'Legal Department',
                  orientation: 'facing-down',
                  amenities: ['Legal Research Station', 'Document Display']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CAB-LEGAL-1'}
                isHighlighted={highlightedDeskId === 'SID-LF-CAB-LEGAL-1'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            {/* Legal Desk 2 (Bottom, person sits at bottom facing UP) */}
            <div className="absolute top-[66.5%] left-[51.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CAB-LEGAL-2', {
                  code: 'LEG-2',
                  podName: 'Legal Department',
                  orientation: 'facing-up',
                  amenities: ['Legal Counsel Station', 'Document Display']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CAB-LEGAL-2'}
                isHighlighted={highlightedDeskId === 'SID-LF-CAB-LEGAL-2'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Cabin 4: Dir. Finance Cabin (7'0" X 10'6") */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-LF-DIR-FIN',
                code: 'DIR-FIN',
                name: 'Dir. Finance Cabin (7\'0" X 10\'6")',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 4,
                status: 'available',
                amenities: ['Executive Suite', '3 Visitor Chairs', 'Private Credenza']
              })}
              className="absolute top-[53.0%] left-[58.5%] w-[11.0%] h-[27.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all cursor-pointer group shadow-sm"
              title="Dir. Finance Cabin (7'0 X 10'6)"
            >
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded shadow">
                DIR. FINANCE
              </span>
            </div>
            <div className="absolute top-[70.0%] left-[64.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CAB-DIR', {
                  code: 'DIR',
                  podName: 'Dir. Finance Cabin',
                  orientation: 'facing-up',
                  amenities: ['Executive Leather Chair', 'Curved Display', 'Executive Conference Table']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CAB-DIR'}
                isHighlighted={highlightedDeskId === 'SID-LF-CAB-DIR'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Cabin 5: CFO Finance Cabin (7'0" X 10'6") */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-LF-CFO-FIN',
                code: 'CFO-FIN',
                name: 'CFO Finance Cabin (7\'0" X 10\'6")',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 4,
                status: 'available',
                amenities: ['CFO Executive Suite', '3 Visitor Chairs', 'Private Wall Storage']
              })}
              className="absolute top-[53.0%] left-[72.0%] w-[11.5%] h-[27.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all cursor-pointer group shadow-sm"
              title="CFO. Finance Cabin (7'0 X 10'6)"
            >
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded shadow">
                CFO. FINANCE
              </span>
            </div>
            <div className="absolute top-[70.0%] left-[79.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-LF-CAB-CFO', {
                  code: 'CFO',
                  podName: 'CFO Finance Cabin',
                  orientation: 'facing-up',
                  amenities: ['CFO Executive Suite', 'Ultrawide 5K Display', 'Executive Visitor Seating']
                })}
                isSelected={selectedDesk?.id === 'SID-LF-CAB-CFO'}
                isHighlighted={highlightedDeskId === 'SID-LF-CAB-CFO'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});
