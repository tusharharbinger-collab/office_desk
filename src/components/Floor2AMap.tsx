import React, { useState, useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface Floor2AMapProps {
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

export const Floor2AMap: React.FC<Floor2AMapProps> = React.memo(({
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
      zoneName: fallback.zoneName || 'Floor 2A Wing',
      podName: fallback.podName || 'Work Pod',
      row: fallback.row || 1,
      col: fallback.col || 1,
      orientation: fallback.orientation || 'facing-right',
      status: fallback.status || 'available',
      amenities: fallback.amenities || ['1050x600 Workstation', 'Dual 4K Monitor', 'Type-C Hub'],
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
          CANVAS AREA: EXACT 1.647:1 BLUEPRINT BACKDROP OVERLAY
         ======================================================== */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-600/60 bg-white flex items-center justify-center p-2 shadow-2xl">
        <div
          className="relative w-[1300px] h-[789px] transition-transform duration-500 origin-center bg-white"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Authentic CAD Blueprint Image */}
          <img
            src="/floormaps/2nd_floor_a_wing.png"
            alt="Floor 2A Blueprint"
            className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 select-none ${
              viewMode === 'blueprint'
                ? 'invert-[1] hue-rotate-[195deg] contrast-[1.7] brightness-[1.25] saturate-[1.3]'
                : 'opacity-100 contrast-[1.08]'
            }`}
          />

          {/* ========================================================
              INTERACTIVE SEATS & ROOMS (MATCHING LEELA ASSOC 2A DRAWING)
             ======================================================== */}
          <div className="absolute inset-0 pointer-events-auto">

            {/* 1. COLLAB ROOM (Mid-Left with Round Table & 4 Chairs) */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-2A-COLLAB',
                code: 'COLLAB',
                name: 'Floor 2A Collab Room',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 4,
                status: 'available',
                amenities: ['Round Collaboration Table', '4K Smart Display', 'Acoustic Glass Walls']
              })}
              className="absolute top-[37.0%] left-[12.8%] w-[8.8%] h-[14.5%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/15 hover:bg-cyan-500/25 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between p-2 shadow-sm"
              title="Collab Room (4 Pax Discussion Space)"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-400/60 px-1.5 py-0.5 rounded shadow uppercase">
                  COLLAB 4 PAX
                </span>
              </div>
            </div>

            {/* 2. IT SERVER ROOM (Top Right with Sliding Door) */}
            <div
              className="absolute top-[7.5%] left-[47.2%] w-[18.2%] h-[22.0%] border-2 border-emerald-500/80 bg-emerald-500/15 rounded-xl flex items-center justify-center pointer-events-none shadow-sm"
              title="IT - Server Room"
            >
              <span className="text-[10px] font-mono font-bold text-emerald-200 bg-slate-900/90 border border-emerald-400/60 px-2 py-0.5 rounded shadow">
                IT - SERVER ROOM
              </span>
            </div>

            {/* IT Server Room Workstations below sliding door */}
            <div className="absolute top-[34.8%] left-[49.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-IT-01', {
                  code: 'IT-1',
                  podName: 'IT Support Station',
                  orientation: 'facing-left',
                  amenities: ['Network Terminal', 'Dual Display', 'Rack Access']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-IT-01'}
                isHighlighted={highlightedDeskId === 'SID-2A-IT-01'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[34.8%] left-[62.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-IT-02', {
                  code: 'IT-2',
                  podName: 'IT Operations Station',
                  orientation: 'facing-right',
                  amenities: ['Network Terminal', 'Dual Display', 'Rack Access']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-IT-02'}
                isHighlighted={highlightedDeskId === 'SID-2A-IT-02'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* ========================================================
                NORTH WORKSTATION PODS (11 WORKSTATIONS)
               ======================================================== */}
            {/* NW Column 1: 3 Desks along West Wall (facing LEFT) */}
            <div className="absolute top-[18.5%] left-[16.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N01', {
                  code: '2A-01',
                  podName: 'Northwest Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Dual 4K Monitor']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N01'}
                isHighlighted={highlightedDeskId === 'SID-2A-N01'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[25.5%] left-[16.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N02', {
                  code: '2A-02',
                  podName: 'Northwest Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Dual 4K Monitor']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N02'}
                isHighlighted={highlightedDeskId === 'SID-2A-N02'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[32.5%] left-[16.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N03', {
                  code: '2A-03',
                  podName: 'Northwest Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Dual 4K Monitor']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N03'}
                isHighlighted={highlightedDeskId === 'SID-2A-N03'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* N-Center Pod: 5 Desks (2 on left facing RIGHT, 3 on right facing LEFT) */}
            <div className="absolute top-[18.5%] left-[26.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N04', {
                  code: '2A-04',
                  podName: 'North-Center Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N04'}
                isHighlighted={highlightedDeskId === 'SID-2A-N04'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[25.5%] left-[26.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N05', {
                  code: '2A-05',
                  podName: 'North-Center Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N05'}
                isHighlighted={highlightedDeskId === 'SID-2A-N05'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            <div className="absolute top-[18.5%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N06', {
                  code: '2A-06',
                  podName: 'North-Center Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N06'}
                isHighlighted={highlightedDeskId === 'SID-2A-N06'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[25.5%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N07', {
                  code: '2A-07',
                  podName: 'North-Center Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N07'}
                isHighlighted={highlightedDeskId === 'SID-2A-N07'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[32.5%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N08', {
                  code: '2A-08',
                  podName: 'North-Center Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N08'}
                isHighlighted={highlightedDeskId === 'SID-2A-N08'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* N-Right Pod: 3 Desks (facing RIGHT) */}
            <div className="absolute top-[18.5%] left-[43.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N09', {
                  code: '2A-09',
                  podName: 'North-East Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Dual Display']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N09'}
                isHighlighted={highlightedDeskId === 'SID-2A-N09'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[25.5%] left-[43.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N10', {
                  code: '2A-10',
                  podName: 'North-East Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Dual Display']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N10'}
                isHighlighted={highlightedDeskId === 'SID-2A-N10'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[32.5%] left-[43.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-N11', {
                  code: '2A-11',
                  podName: 'North-East Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Dual Display']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-N11'}
                isHighlighted={highlightedDeskId === 'SID-2A-N11'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* ========================================================
                SOUTH WORKSTATION PODS (11 WORKSTATIONS)
               ======================================================== */}
            {/* SW Column 1: 2 Desks below Printer (facing LEFT) */}
            <div className="absolute top-[57.5%] left-[16.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S01', {
                  code: '2A-12',
                  podName: 'Southwest Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Printer Hub Access']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S01'}
                isHighlighted={highlightedDeskId === 'SID-2A-S01'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[64.5%] left-[16.2%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S02', {
                  code: '2A-13',
                  podName: 'Southwest Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Printer Hub Access']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S02'}
                isHighlighted={highlightedDeskId === 'SID-2A-S02'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* S-Center Pod: 6 Desks (3 facing RIGHT, 3 facing LEFT) */}
            <div className="absolute top-[54.0%] left-[26.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S03', {
                  code: '2A-14',
                  podName: 'South-Center Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S03'}
                isHighlighted={highlightedDeskId === 'SID-2A-S03'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[61.0%] left-[26.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S04', {
                  code: '2A-15',
                  podName: 'South-Center Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S04'}
                isHighlighted={highlightedDeskId === 'SID-2A-S04'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[68.0%] left-[26.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S05', {
                  code: '2A-16',
                  podName: 'South-Center Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S05'}
                isHighlighted={highlightedDeskId === 'SID-2A-S05'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            <div className="absolute top-[54.0%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S06', {
                  code: '2A-17',
                  podName: 'South-Center Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S06'}
                isHighlighted={highlightedDeskId === 'SID-2A-S06'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[61.0%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S07', {
                  code: '2A-18',
                  podName: 'South-Center Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S07'}
                isHighlighted={highlightedDeskId === 'SID-2A-S07'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[68.0%] left-[32.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S08', {
                  code: '2A-19',
                  podName: 'South-Center Pod',
                  orientation: 'facing-left',
                  amenities: ['1050x600 Desk', 'Vertical Raceway']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S08'}
                isHighlighted={highlightedDeskId === 'SID-2A-S08'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* S-Right Pod: 3 Desks (facing RIGHT) */}
            <div className="absolute top-[54.0%] left-[41.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S09', {
                  code: '2A-20',
                  podName: 'South-East Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Overhead Storage']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S09'}
                isHighlighted={highlightedDeskId === 'SID-2A-S09'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[61.0%] left-[41.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S10', {
                  code: '2A-21',
                  podName: 'South-East Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Overhead Storage']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S10'}
                isHighlighted={highlightedDeskId === 'SID-2A-S10'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>
            <div className="absolute top-[68.0%] left-[41.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-2A-S11', {
                  code: '2A-22',
                  podName: 'South-East Pod',
                  orientation: 'facing-right',
                  amenities: ['1050x600 Desk', 'Overhead Storage']
                })}
                isSelected={selectedDesk?.id === 'SID-2A-S11'}
                isHighlighted={highlightedDeskId === 'SID-2A-S11'}
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
