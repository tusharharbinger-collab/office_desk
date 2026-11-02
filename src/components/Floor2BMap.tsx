import React, { useState, useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface Floor2BMapProps {
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

export const Floor2BMap: React.FC<Floor2BMapProps> = React.memo(({
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
      zoneName: fallback.zoneName || 'Floor 2B Wing',
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
            src="/floormaps/2nd_floor_b_wing.png"
            alt="Floor 2B Blueprint"
            className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 select-none ${
              viewMode === 'blueprint'
                ? 'invert-[1] hue-rotate-[195deg] contrast-[1.7] brightness-[1.25] saturate-[1.3]'
                : 'opacity-100 contrast-[1.08]'
            }`}
          />

          {/* ========================================================
              INTERACTIVE SEATS & ROOMS (MATCHING 2B ARCHITECTURAL PLAN)
             ======================================================== */}
          <div className="absolute inset-0 pointer-events-auto">

            {/* 1. NORTHWEST CABIN (7'4" X 10'4") */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-2B-CAB-01',
                code: 'CAB-2B',
                name: 'Executive Cabin (7\'4" X 10\'4")',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 3,
                status: 'available',
                amenities: ['Executive Workstation', 'Visitor Chairs', 'Attached Private Toilet']
              })}
              className="absolute top-[13.0%] left-[8.5%] w-[14.0%] h-[28.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/15 hover:bg-cyan-500/25 rounded-xl transition-all cursor-pointer group p-2 shadow-sm"
              title="Cabin (7'4 X 10'4)"
            >
              <span className="text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-400/60 px-2 py-0.5 rounded shadow uppercase">
                CABIN 7'4" × 10'4"
              </span>
            </div>
            <div className="absolute top-[27.0%] left-[15.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-CAB-01-DESK', {
                  code: 'CAB',
                  podName: 'Executive Cabin',
                  orientation: 'facing-up',
                  amenities: ['Executive High-Back Chair', 'Glass Desk', 'Dual 4K Displays']
                })}
                isSelected={selectedDesk?.id === 'SID-2B-CAB-01-DESK'}
                isHighlighted={highlightedDeskId === 'SID-2B-CAB-01-DESK'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* ========================================================
                NORTH POD: 12 WORKSTATIONS (1200 x 600 mm) - 4 COLS x 3 ROWS
               ======================================================== */}
            {/* Column 1 (left: 32.5%, facing LEFT) */}
            <div className="absolute top-[18.0%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N01', { code: '2B-01', podName: 'North Modular Pod', orientation: 'facing-left' })}
                isSelected={selectedDesk?.id === 'SID-2B-N01'}
                isHighlighted={highlightedDeskId === 'SID-2B-N01'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[26.5%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N02', { code: '2B-02', podName: 'North Modular Pod', orientation: 'facing-left' })}
                isSelected={selectedDesk?.id === 'SID-2B-N02'}
                isHighlighted={highlightedDeskId === 'SID-2B-N02'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[35.0%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N03', { code: '2B-03', podName: 'North Modular Pod', orientation: 'facing-left' })}
                isSelected={selectedDesk?.id === 'SID-2B-N03'}
                isHighlighted={highlightedDeskId === 'SID-2B-N03'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Column 2 (left: 45.0%, facing RIGHT) */}
            <div className="absolute top-[18.0%] left-[45.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N04', { code: '2B-04', podName: 'North Modular Pod', orientation: 'facing-right' })}
                isSelected={selectedDesk?.id === 'SID-2B-N04'}
                isHighlighted={highlightedDeskId === 'SID-2B-N04'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[26.5%] left-[45.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N05', { code: '2B-05', podName: 'North Modular Pod', orientation: 'facing-right' })}
                isSelected={selectedDesk?.id === 'SID-2B-N05'}
                isHighlighted={highlightedDeskId === 'SID-2B-N05'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[35.0%] left-[45.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N06', { code: '2B-06', podName: 'North Modular Pod', orientation: 'facing-right' })}
                isSelected={selectedDesk?.id === 'SID-2B-N06'}
                isHighlighted={highlightedDeskId === 'SID-2B-N06'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Column 3 (left: 54.0%, facing LEFT) */}
            <div className="absolute top-[18.0%] left-[54.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N07', { code: '2B-07', podName: 'North Modular Pod', orientation: 'facing-left' })}
                isSelected={selectedDesk?.id === 'SID-2B-N07'}
                isHighlighted={highlightedDeskId === 'SID-2B-N07'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[26.5%] left-[54.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N08', { code: '2B-08', podName: 'North Modular Pod', orientation: 'facing-left' })}
                isSelected={selectedDesk?.id === 'SID-2B-N08'}
                isHighlighted={highlightedDeskId === 'SID-2B-N08'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[35.0%] left-[54.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N09', { code: '2B-09', podName: 'North Modular Pod', orientation: 'facing-left' })}
                isSelected={selectedDesk?.id === 'SID-2B-N09'}
                isHighlighted={highlightedDeskId === 'SID-2B-N09'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* Column 4 (left: 63.5%, facing RIGHT) */}
            <div className="absolute top-[18.0%] left-[63.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N10', { code: '2B-10', podName: 'North Modular Pod', orientation: 'facing-right' })}
                isSelected={selectedDesk?.id === 'SID-2B-N10'}
                isHighlighted={highlightedDeskId === 'SID-2B-N10'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[26.5%] left-[63.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N11', { code: '2B-11', podName: 'North Modular Pod', orientation: 'facing-right' })}
                isSelected={selectedDesk?.id === 'SID-2B-N11'}
                isHighlighted={highlightedDeskId === 'SID-2B-N11'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[35.0%] left-[63.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2B-N12', { code: '2B-12', podName: 'North Modular Pod', orientation: 'facing-right' })}
                isSelected={selectedDesk?.id === 'SID-2B-N12'}
                isHighlighted={highlightedDeskId === 'SID-2B-N12'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* ========================================================
                SOUTH HIGH-DENSITY BAYS: 23 WORKSTATIONS (1000 x 600 mm)
               ======================================================== */}
            {/* Bay 1: Col 1 (left: 14.0%, facing LEFT) & Col 2 (left: 22.0%, facing RIGHT) */}
            <div className="absolute top-[57.0%] left-[14.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S01', { code: '2B-13', podName: 'South Bay 1', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S01'} isHighlighted={highlightedDeskId === 'SID-2B-S01'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[14.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S02', { code: '2B-14', podName: 'South Bay 1', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S02'} isHighlighted={highlightedDeskId === 'SID-2B-S02'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[75.0%] left-[14.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S03', { code: '2B-15', podName: 'South Bay 1', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S03'} isHighlighted={highlightedDeskId === 'SID-2B-S03'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            <div className="absolute top-[57.0%] left-[22.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S04', { code: '2B-16', podName: 'South Bay 1', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S04'} isHighlighted={highlightedDeskId === 'SID-2B-S04'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[22.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S05', { code: '2B-17', podName: 'South Bay 1', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S05'} isHighlighted={highlightedDeskId === 'SID-2B-S05'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[75.0%] left-[22.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S06', { code: '2B-18', podName: 'South Bay 1', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S06'} isHighlighted={highlightedDeskId === 'SID-2B-S06'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Bay 2: Col 3 (left: 28.5%, facing LEFT) & Col 4 (left: 36.5%, facing RIGHT) */}
            <div className="absolute top-[57.0%] left-[28.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S07', { code: '2B-19', podName: 'South Bay 2', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S07'} isHighlighted={highlightedDeskId === 'SID-2B-S07'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[28.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S08', { code: '2B-20', podName: 'South Bay 2', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S08'} isHighlighted={highlightedDeskId === 'SID-2B-S08'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[75.0%] left-[28.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S09', { code: '2B-21', podName: 'South Bay 2', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S09'} isHighlighted={highlightedDeskId === 'SID-2B-S09'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            <div className="absolute top-[57.0%] left-[36.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S10', { code: '2B-22', podName: 'South Bay 2', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S10'} isHighlighted={highlightedDeskId === 'SID-2B-S10'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[36.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S11', { code: '2B-23', podName: 'South Bay 2', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S11'} isHighlighted={highlightedDeskId === 'SID-2B-S11'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Bay 3: Col 5 (left: 44.0%, facing LEFT) & Col 6 (left: 52.0%, facing RIGHT) */}
            <div className="absolute top-[57.0%] left-[44.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S12', { code: '2B-24', podName: 'South Bay 3', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S12'} isHighlighted={highlightedDeskId === 'SID-2B-S12'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[44.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S13', { code: '2B-25', podName: 'South Bay 3', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S13'} isHighlighted={highlightedDeskId === 'SID-2B-S13'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[75.0%] left-[44.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S14', { code: '2B-26', podName: 'South Bay 3', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S14'} isHighlighted={highlightedDeskId === 'SID-2B-S14'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            <div className="absolute top-[57.0%] left-[52.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S15', { code: '2B-27', podName: 'South Bay 3', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S15'} isHighlighted={highlightedDeskId === 'SID-2B-S15'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[52.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S16', { code: '2B-28', podName: 'South Bay 3', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S16'} isHighlighted={highlightedDeskId === 'SID-2B-S16'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Bay 4: Col 7 (left: 60.5%, facing LEFT) & Col 8 (left: 68.5%, facing RIGHT) */}
            <div className="absolute top-[57.0%] left-[60.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S17', { code: '2B-29', podName: 'South Bay 4', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S17'} isHighlighted={highlightedDeskId === 'SID-2B-S17'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[60.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S18', { code: '2B-30', podName: 'South Bay 4', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S18'} isHighlighted={highlightedDeskId === 'SID-2B-S18'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[75.0%] left-[60.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S19', { code: '2B-31', podName: 'South Bay 4', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S19'} isHighlighted={highlightedDeskId === 'SID-2B-S19'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            <div className="absolute top-[57.0%] left-[68.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S20', { code: '2B-32', podName: 'South Bay 4', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S20'} isHighlighted={highlightedDeskId === 'SID-2B-S20'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[66.0%] left-[68.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S21', { code: '2B-33', podName: 'South Bay 4', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S21'} isHighlighted={highlightedDeskId === 'SID-2B-S21'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[75.0%] left-[68.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S22', { code: '2B-34', podName: 'South Bay 4', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-2B-S22'} isHighlighted={highlightedDeskId === 'SID-2B-S22'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Bay 5: Col 9 (East edge under Cabinet, left: 75.0%, facing LEFT) */}
            <div className="absolute top-[57.0%] left-[75.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-2B-S23', { code: '2B-35', podName: 'South Bay 5', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-2B-S23'} isHighlighted={highlightedDeskId === 'SID-2B-S23'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});
