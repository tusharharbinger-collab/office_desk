import React, { useState, useMemo } from 'react';
import { Desk, Room, SiddhantFloorId } from '../types';
import { OFFICES } from '../data/officeConfig';
import { LegalFinanceMap } from './LegalFinanceMap';
import { Floor2AMap } from './Floor2AMap';
import { Floor2BMap } from './Floor2BMap';
import { Floor3AMap } from './Floor3AMap';
import { GroundBMap } from './GroundBMap';

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
  // 5 Floor Map IDs corresponding exactly to: Legal Finance, Floor 2A, Floor 2B, Floor 3A, Ground B
  const [selectedFloorId, setSelectedFloorId] = useState<SiddhantFloorId>('legal_finance');
  const [viewMode, setViewMode] = useState<'blueprint' | 'original'>('original');
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  const rotateMap = () => {
    setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
  };

  // Normalized floor mapping (handles backward-compatibility IDs)
  const normalizedFloorId = useMemo(() => {
    if (selectedFloorId === 'finance_legal') return 'legal_finance';
    if (selectedFloorId === '2nd_floor_a_wing') return 'floor_2a';
    if (selectedFloorId === '2nd_floor_b_wing') return 'floor_2b';
    if (selectedFloorId === '3rd_floor_a_wing' || selectedFloorId === '3rd_floor_b_wing') return 'floor_3a';
    return selectedFloorId;
  }, [selectedFloorId]);

  const floorMeta = {
    legal_finance: {
      name: 'Legal Finance',
      badge: '14 Seats',
      desc: '5 Executive Cabins • 2 Cubicles • 6-Desk Modular Pod'
    },
    floor_2a: {
      name: 'Floor 2A',
      badge: '22 Seats',
      desc: '22 Workstations • 1 Collab Room • 1 IT Server Room'
    },
    floor_2b: {
      name: 'Floor 2B',
      badge: '35 Seats',
      desc: '35 Modular Workstations • 1 Northwest Executive Cabin'
    },
    floor_3a: {
      name: 'Floor 3A',
      badge: '25 Seats',
      desc: '25 Workstations • 1 Meeting Room • 2 Focus Pods • 1 Cabin'
    },
    ground_b: {
      name: 'Ground B',
      badge: '14 Seats',
      desc: '14 Seats (Dimensional CAD Plan) • 5 Cabins • 2 Cubicles'
    }
  }[normalizedFloorId] || { name: 'Siddhant Floor', badge: '', desc: '' };

  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* ========================================================
          SINGLE UNIFIED TOP TOOLBAR: NO DUPLICATE HEADERS
          (Floor Switcher + Live Specs + Rotation + CAD Mode)
         ======================================================== */}
      <div className="w-[1380px] flex items-center justify-between px-3.5 py-2.5 bg-[#0c121e]/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <span className="material-symbols-outlined text-xl">domain</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-white tracking-wider uppercase">
                SIDDHANT // {floorMeta.name.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                {floorMeta.badge}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {floorMeta.desc}
            </div>
          </div>
        </div>

        {/* 5 Separate Map Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          {[
            { id: 'legal_finance' as SiddhantFloorId, name: 'Legal Finance', icon: 'account_balance', badge: '14 Seats' },
            { id: 'floor_2a' as SiddhantFloorId, name: 'Floor 2A', icon: 'layers', badge: '22 Seats' },
            { id: 'floor_2b' as SiddhantFloorId, name: 'Floor 2B', icon: 'grid_view', badge: '35 Seats' },
            { id: 'floor_3a' as SiddhantFloorId, name: 'Floor 3A', icon: 'apartment', badge: '25 Seats' },
            { id: 'ground_b' as SiddhantFloorId, name: 'Ground B', icon: 'architecture', badge: '14 Seats' }
          ].map((floor) => {
            const isActive = normalizedFloorId === floor.id;
            return (
              <button
                key={floor.id}
                type="button"
                onClick={() => setSelectedFloorId(floor.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-300 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent font-medium'
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${isActive ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                  {floor.icon}
                </span>
                <span>{floor.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {floor.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Unified Direction & View Mode Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={rotateMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-300 hover:bg-slate-800 transition-all cursor-pointer font-bold shadow-sm"
            title="Rotate map direction by 90 degrees"
          >
            <span 
              className="material-symbols-outlined text-sm transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              explore
            </span>
            <span>{rotation === 0 ? 'North ↑ (0°)' : rotation === 90 ? 'East → (90°)' : rotation === 180 ? 'South ↓ (180°)' : 'West ← (270°)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'blueprint' ? 'original' : 'blueprint')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-400 text-cyan-200 hover:bg-slate-800 transition-all cursor-pointer font-bold shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">
              {viewMode === 'original' ? 'filter_b_and_w' : 'light_mode'}
            </span>
            <span>{viewMode === 'original' ? 'Original CAD Plan' : 'Electric Dark CAD'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          ACTIVE MAP RENDERER (Clean Drawing without Duplicate Header)
         ======================================================== */}
      {normalizedFloorId === 'legal_finance' && (
        <LegalFinanceMap
          desks={desks}
          rooms={rooms}
          selectedDesk={selectedDesk}
          highlightedDeskId={highlightedDeskId}
          onSelectDesk={onSelectDesk}
          onHoverDesk={onHoverDesk}
          onLeaveDesk={onLeaveDesk}
          onSelectRoom={onSelectRoom}
          viewMode={viewMode}
          rotation={rotation}
        />
      )}

      {normalizedFloorId === 'floor_2a' && (
        <Floor2AMap
          desks={desks}
          rooms={rooms}
          selectedDesk={selectedDesk}
          highlightedDeskId={highlightedDeskId}
          onSelectDesk={onSelectDesk}
          onHoverDesk={onHoverDesk}
          onLeaveDesk={onLeaveDesk}
          onSelectRoom={onSelectRoom}
          viewMode={viewMode}
          rotation={rotation}
        />
      )}

      {normalizedFloorId === 'floor_2b' && (
        <Floor2BMap
          desks={desks}
          rooms={rooms}
          selectedDesk={selectedDesk}
          highlightedDeskId={highlightedDeskId}
          onSelectDesk={onSelectDesk}
          onHoverDesk={onHoverDesk}
          onLeaveDesk={onLeaveDesk}
          onSelectRoom={onSelectRoom}
          viewMode={viewMode}
          rotation={rotation}
        />
      )}

      {normalizedFloorId === 'floor_3a' && (
        <Floor3AMap
          desks={desks}
          rooms={rooms}
          selectedDesk={selectedDesk}
          highlightedDeskId={highlightedDeskId}
          onSelectDesk={onSelectDesk}
          onHoverDesk={onHoverDesk}
          onLeaveDesk={onLeaveDesk}
          onSelectRoom={onSelectRoom}
          viewMode={viewMode}
          rotation={rotation}
        />
      )}

      {normalizedFloorId === 'ground_b' && (
        <GroundBMap
          desks={desks}
          rooms={rooms}
          selectedDesk={selectedDesk}
          highlightedDeskId={highlightedDeskId}
          onSelectDesk={onSelectDesk}
          onHoverDesk={onHoverDesk}
          onLeaveDesk={onLeaveDesk}
          onSelectRoom={onSelectRoom}
          viewMode={viewMode}
          rotation={rotation}
        />
      )}
    </div>
  );
});
