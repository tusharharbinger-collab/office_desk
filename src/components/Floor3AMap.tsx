import React, { useState, useMemo } from 'react';
import { Desk, Room } from '../types';
import { DeskNode } from './DeskNode';

interface Floor3AMapProps {
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

export const Floor3AMap: React.FC<Floor3AMapProps> = React.memo(({
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
      zoneName: fallback.zoneName || 'Floor 3A Wing',
      podName: fallback.podName || 'Work Pod',
      row: fallback.row || 1,
      col: fallback.col || 1,
      orientation: fallback.orientation || 'facing-right',
      status: fallback.status || 'available',
      amenities: fallback.amenities || ['Dual 4K Monitor', 'Standing Desk', 'Type-C Hub'],
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
            src="/floormaps/3rd_floor_a_wing.png"
            alt="Floor 3A Blueprint"
            className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 select-none ${
              viewMode === 'blueprint'
                ? 'invert-[1] hue-rotate-[195deg] contrast-[1.7] brightness-[1.25] saturate-[1.3]'
                : 'opacity-100 contrast-[1.08]'
            }`}
          />

          {/* ========================================================
              INTERACTIVE SEATS & ROOMS (MATCHING 3A CAD PLAN)
             ======================================================== */}
          <div className="absolute inset-0 pointer-events-auto">

            {/* 1. 04 PAX MEETING ROOM (2500 x 2650 mm) WITH HIGH TABLE */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-3A-CONF-01',
                code: 'CONF-04',
                name: '04 Pax Meeting Room (High Table)',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 4,
                status: 'available',
                amenities: ['1650x750mm High Collaboration Table', '4 High Stools', '4K Presentation Display']
              })}
              className="absolute top-[7.5%] left-[12.8%] w-[13.4%] h-[24.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/15 hover:bg-cyan-500/25 rounded-xl transition-all cursor-pointer group p-2 shadow-sm"
              title="04 Pax Meeting Room"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-400/60 px-2 py-0.5 rounded shadow uppercase">
                  MEETING ROOM (4 PAX)
                </span>
              </div>
            </div>

            {/* 2. ACOUSTIC PHONE POD 1 (1510 x 1190 mm) */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-3A-POD-01',
                code: 'POD-1',
                name: 'Single Focus Pod 1',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 1,
                status: 'available',
                amenities: ['Acoustic Sound Insulation', 'Ventilation Fan', 'Power Hub']
              })}
              className="absolute top-[32.5%] left-[12.8%] w-[8.7%] h-[10.0%] border-2 border-emerald-500/80 hover:border-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-xl transition-all cursor-pointer group flex items-center justify-center p-1 shadow-sm"
              title="Single Phone/Focus Pod 1"
            >
              <span className="text-[10px] font-mono font-bold text-emerald-200 bg-slate-900/90 border border-emerald-400/60 px-1.5 py-0.5 rounded shadow">
                POD 1
              </span>
            </div>

            {/* 3. ACOUSTIC PHONE POD 2 (1510 x 1190 mm) */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-3A-POD-02',
                code: 'POD-2',
                name: 'Single Focus Pod 2',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 1,
                status: 'available',
                amenities: ['Acoustic Sound Insulation', 'Ventilation Fan', 'Power Hub']
              })}
              className="absolute top-[43.5%] left-[12.8%] w-[8.7%] h-[10.0%] border-2 border-emerald-500/80 hover:border-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-xl transition-all cursor-pointer group flex items-center justify-center p-1 shadow-sm"
              title="Single Phone/Focus Pod 2"
            >
              <span className="text-[10px] font-mono font-bold text-emerald-200 bg-slate-900/90 border border-emerald-400/60 px-1.5 py-0.5 rounded shadow">
                POD 2
              </span>
            </div>

            {/* 4. EXECUTIVE CABIN (2500 x 3200 mm) */}
            <div
              onClick={() => onSelectRoom && onSelectRoom({
                id: 'SID-3A-CAB-01',
                code: 'CAB-3A',
                name: 'Executive Cabin (2500 x 3200 mm)',
                areaId: 'area-1',
                officeId: 'siddhant',
                capacity: 3,
                status: 'available',
                amenities: ['Executive Workstation', '2 Visitor Chairs', 'Storage Credenza']
              })}
              className="absolute top-[54.5%] left-[12.8%] w-[13.4%] h-[23.0%] border-2 border-cyan-500/80 hover:border-cyan-400 bg-cyan-500/15 hover:bg-cyan-500/25 rounded-xl transition-all cursor-pointer group p-2 shadow-sm"
              title="Executive Cabin"
            >
              <span className="text-[10px] font-mono font-bold text-cyan-200 bg-slate-900/90 border border-cyan-400/60 px-2 py-0.5 rounded shadow uppercase">
                CABIN 2.5×3.2M
              </span>
            </div>
            <div className="absolute top-[65.0%] left-[18.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode
                desk={getDesk('SID-3A-CAB-01-DESK', {
                  code: 'CAB',
                  podName: 'Executive Cabin',
                  orientation: 'facing-up',
                  amenities: ['Executive High-Back Chair', 'Glass Desk', 'Dual 4K Displays']
                })}
                isSelected={selectedDesk?.id === 'SID-3A-CAB-01-DESK'}
                isHighlighted={highlightedDeskId === 'SID-3A-CAB-01-DESK'}
                onSelect={onSelectDesk}
                onHover={onHoverDesk}
                onLeave={onLeaveDesk}
              />
            </div>

            {/* ========================================================
                5. DELIVERY HEADS DEPARTMENT: 5 DESKS (3984 x 3310 mm)
               ======================================================== */}
            {/* Left Column (3 desks, facing LEFT) */}
            <div className="absolute top-[17.0%] left-[31.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-DH-01', { code: 'DH-1', podName: 'Delivery Heads Dept', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-DH-01'} isHighlighted={highlightedDeskId === 'SID-3A-DH-01'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[25.5%] left-[31.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-DH-02', { code: 'DH-2', podName: 'Delivery Heads Dept', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-DH-02'} isHighlighted={highlightedDeskId === 'SID-3A-DH-02'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[34.0%] left-[31.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-DH-03', { code: 'DH-3', podName: 'Delivery Heads Dept', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-DH-03'} isHighlighted={highlightedDeskId === 'SID-3A-DH-03'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Right Column (2 desks, facing RIGHT) */}
            <div className="absolute top-[25.5%] left-[43.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-DH-04', { code: 'DH-4', podName: 'Delivery Heads Dept', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-DH-04'} isHighlighted={highlightedDeskId === 'SID-3A-DH-04'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[34.0%] left-[43.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-DH-05', { code: 'DH-5', podName: 'Delivery Heads Dept', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-DH-05'} isHighlighted={highlightedDeskId === 'SID-3A-DH-05'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* ========================================================
                6. SALES & PRE-SALES DEPARTMENT: 6 DESKS (3400 x 4120 mm)
               ======================================================== */}
            {/* Left Column (3 desks, facing LEFT) */}
            <div className="absolute top-[17.0%] left-[50.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-SP-01', { code: 'SP-1', podName: 'Sales & Pre-Sales', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-SP-01'} isHighlighted={highlightedDeskId === 'SID-3A-SP-01'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[25.5%] left-[50.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-SP-02', { code: 'SP-2', podName: 'Sales & Pre-Sales', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-SP-02'} isHighlighted={highlightedDeskId === 'SID-3A-SP-02'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[34.0%] left-[50.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-SP-03', { code: 'SP-3', podName: 'Sales & Pre-Sales', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-SP-03'} isHighlighted={highlightedDeskId === 'SID-3A-SP-03'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Right Column (3 desks, facing RIGHT) */}
            <div className="absolute top-[17.0%] left-[60.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-SP-04', { code: 'SP-4', podName: 'Sales & Pre-Sales', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-SP-04'} isHighlighted={highlightedDeskId === 'SID-3A-SP-04'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[25.5%] left-[60.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-SP-05', { code: 'SP-5', podName: 'Sales & Pre-Sales', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-SP-05'} isHighlighted={highlightedDeskId === 'SID-3A-SP-05'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[34.0%] left-[60.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-SP-06', { code: 'SP-6', podName: 'Sales & Pre-Sales', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-SP-06'} isHighlighted={highlightedDeskId === 'SID-3A-SP-06'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* ========================================================
                7. GENERAL WORKSTATIONS POOL: 13 WORKSTATIONS
               ======================================================== */}
            {/* Bay 1 (4 desks: 2 facing 2) */}
            <div className="absolute top-[53.5%] left-[30.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-01', { code: '3A-01', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-01'} isHighlighted={highlightedDeskId === 'SID-3A-WS-01'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[61.5%] left-[30.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-02', { code: '3A-02', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-02'} isHighlighted={highlightedDeskId === 'SID-3A-WS-02'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            <div className="absolute top-[53.5%] left-[36.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-03', { code: '3A-03', podName: 'General Workstation Pool', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-WS-03'} isHighlighted={highlightedDeskId === 'SID-3A-WS-03'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[61.5%] left-[36.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-04', { code: '3A-04', podName: 'General Workstation Pool', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-WS-04'} isHighlighted={highlightedDeskId === 'SID-3A-WS-04'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Bay 2 (6 desks: 3 facing 3) */}
            <div className="absolute top-[53.5%] left-[44.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-05', { code: '3A-05', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-05'} isHighlighted={highlightedDeskId === 'SID-3A-WS-05'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[61.5%] left-[44.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-06', { code: '3A-06', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-06'} isHighlighted={highlightedDeskId === 'SID-3A-WS-06'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[70.0%] left-[44.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-07', { code: '3A-07', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-07'} isHighlighted={highlightedDeskId === 'SID-3A-WS-07'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            <div className="absolute top-[53.5%] left-[51.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-08', { code: '3A-08', podName: 'General Workstation Pool', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-WS-08'} isHighlighted={highlightedDeskId === 'SID-3A-WS-08'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[61.5%] left-[51.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-09', { code: '3A-09', podName: 'General Workstation Pool', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-WS-09'} isHighlighted={highlightedDeskId === 'SID-3A-WS-09'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[70.0%] left-[51.5%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-10', { code: '3A-10', podName: 'General Workstation Pool', orientation: 'facing-left' })} isSelected={selectedDesk?.id === 'SID-3A-WS-10'} isHighlighted={highlightedDeskId === 'SID-3A-WS-10'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

            {/* Bay 3 (3 desks against right edge) */}
            <div className="absolute top-[53.5%] left-[59.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-11', { code: '3A-11', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-11'} isHighlighted={highlightedDeskId === 'SID-3A-WS-11'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[61.5%] left-[59.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-12', { code: '3A-12', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-12'} isHighlighted={highlightedDeskId === 'SID-3A-WS-12'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>
            <div className="absolute top-[70.0%] left-[59.0%] -translate-x-1/2 -translate-y-1/2">
              <DeskNode desk={getDesk('SID-3A-WS-13', { code: '3A-13', podName: 'General Workstation Pool', orientation: 'facing-right' })} isSelected={selectedDesk?.id === 'SID-3A-WS-13'} isHighlighted={highlightedDeskId === 'SID-3A-WS-13'} onSelect={onSelectDesk} onHover={onHoverDesk} onLeave={onLeaveDesk} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});
