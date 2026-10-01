import React, { useState, useRef, useEffect } from 'react';
import { Desk, Room } from '../types';
import { WorkArea1Map } from './WorkArea1Map';
import { WorkArea2Map } from './WorkArea2Map';
import { SeatTooltip } from './SeatTooltip';

interface FloorPlanViewportProps {
  activeArea: 'area-1' | 'area-2';
  desks: Desk[];
  rooms: Room[];
  selectedDesk: Desk | null;
  showPresence: boolean;
  highlightedDeskId: string | null;
  scale: number;
  onScaleChange: (newScale: number) => void;
  onSelectDesk: (desk: Desk) => void;
  onSelectRoom: (room: Room) => void;
}

export const FloorPlanViewport: React.FC<FloorPlanViewportProps> = ({
  activeArea,
  desks,
  rooms,
  selectedDesk,
  showPresence,
  highlightedDeskId,
  scale,
  onScaleChange,
  onSelectDesk,
  onSelectRoom
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 20, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(false);

  // Tooltip state
  const [hoveredDesk, setHoveredDesk] = useState<Desk | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Counts for status legend
  const availableCount = desks.filter((d) => d.status === 'available').length;
  const bookedCount = desks.filter((d) => d.status === 'booked').length;

  // Auto-fit floor plan to viewport dimensions
  const fitToScreen = () => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    // Dimensions of each blueprint container
    const mapW = activeArea === 'area-1' ? 1520 : 1680;
    const mapH = activeArea === 'area-1' ? 1140 : 920;

    // Provide comfortable 40px buffer all around
    const padX = 48;
    const padY = 48;
    const scaleW = (clientWidth - padX) / mapW;
    const scaleH = (clientHeight - padY) / mapH;
    const fitScale = Math.min(Math.max(Math.min(scaleW, scaleH), 0.35), 1.25);
    const roundedScale = Number(fitScale.toFixed(2));

    const centeredX = Math.round((clientWidth - mapW * roundedScale) / 2);
    const centeredY = Math.round((clientHeight - mapH * roundedScale) / 2);

    onScaleChange(roundedScale);
    setPan({ x: Math.max(12, centeredX), y: Math.max(12, centeredY) });
  };

  // Auto-fit on initial render, window resize, and area switch
  useEffect(() => {
    // Delay slightly to ensure layout container has fully computed its width/height
    const timer = setTimeout(() => {
      fitToScreen();
    }, 50);

    const handleResize = () => fitToScreen();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeArea]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-desk-id]')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    onScaleChange(Math.min(Math.max(scale + zoomDelta, 0.35), 2.0));
  };

  // Hover handlers
  const handleHoverDesk = (desk: Desk, e: React.MouseEvent) => {
    setHoveredDesk(desk);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleLeaveDesk = () => {
    setHoveredDesk(null);
  };

  // Minimap indicator calculations
  const mapW = activeArea === 'area-1' ? 1520 : 1680;
  const mapH = activeArea === 'area-1' ? 1140 : 920;
  const vpWidth = viewportRef.current?.clientWidth || 1000;
  const vpHeight = viewportRef.current?.clientHeight || 700;

  const mmWidth = 160;
  const mmHeight = (mmWidth * mapH) / mapW;

  const indW = Math.max(16, Math.min(mmWidth, (vpWidth / (mapW * scale)) * mmWidth));
  const indH = Math.max(12, Math.min(mmHeight, (vpHeight / (mapH * scale)) * mmHeight));
  const indX = Math.max(0, Math.min(mmWidth - indW, (-pan.x / (mapW * scale)) * mmWidth));
  const indY = Math.max(0, Math.min(mmHeight - indH, (-pan.y / (mapH * scale)) * mmHeight));

  return (
    <div
      ref={viewportRef}
      className={`relative w-full h-[calc(100vh-56px)] overflow-hidden select-none bg-background ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Subtle architectural dot grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#31353e_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

      {/* Scaled & Translated Blueprint Canvas */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
        }}
      >
        {activeArea === 'area-1' ? (
          <WorkArea1Map
            desks={desks}
            rooms={rooms}
            selectedDesk={selectedDesk}
            showPresence={showPresence}
            highlightedDeskId={highlightedDeskId}
            onSelectDesk={onSelectDesk}
            onHoverDesk={handleHoverDesk}
            onLeaveDesk={handleLeaveDesk}
            onSelectRoom={onSelectRoom}
          />
        ) : (
          <WorkArea2Map
            desks={desks}
            rooms={rooms}
            selectedDesk={selectedDesk}
            showPresence={showPresence}
            highlightedDeskId={highlightedDeskId}
            onSelectDesk={onSelectDesk}
            onHoverDesk={handleHoverDesk}
            onLeaveDesk={handleLeaveDesk}
            onSelectRoom={onSelectRoom}
          />
        )}
      </div>

      {/* Hover Card Tooltip */}
      <SeatTooltip desk={hoveredDesk} position={tooltipPos} />

      {/* Floating Status Legend (Bottom-Left Pill, non-obtrusive) */}
      <div className="absolute bottom-5 left-5 z-20 hidden sm:flex items-center gap-3.5 bg-[#0B0F17]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-xl shadow-xl pointer-events-none text-xs text-slate-300 font-medium font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>Available ({availableCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
          <span>Occupied ({bookedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          <span>Hold</span>
        </div>
      </div>

      {/* Floating Canvas Controls Dock (Bottom-Right) */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1.5 bg-[#0B0F17]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => onScaleChange(Math.max(scale - 0.1, 0.35))}
          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-base">remove</span>
        </button>

        <button
          onClick={fitToScreen}
          className="px-2.5 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 flex items-center justify-center text-xs font-mono font-medium transition-all cursor-pointer"
          title="Click to Auto-Fit Blueprint"
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={() => onScaleChange(Math.min(scale + 0.1, 2.0))}
          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>

        <div className="w-[1px] h-5 bg-white/[0.1] mx-0.5" />

        <button
          onClick={fitToScreen}
          className="h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-sky-400 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
          title="Fit Blueprint to Screen"
        >
          <span className="material-symbols-outlined text-base text-sky-400">crop_free</span>
          <span className="hidden sm:inline text-[11px] font-medium">Fit</span>
        </button>

        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
            showMinimap
              ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-sm font-semibold'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Toggle Overview Minimap"
        >
          <span className="material-symbols-outlined text-base">map</span>
          <span className="hidden sm:inline text-[11px] font-medium">Minimap</span>
        </button>
      </div>

      {/* Floating Pop-over Minimap */}
      {showMinimap && (
        <div className="absolute bottom-16 right-5 z-30 w-48 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/40 rounded-2xl p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center text-[10px] text-outline uppercase font-mono pb-1.5 border-b border-outline-variant/20 mb-2">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <span className="material-symbols-outlined text-xs">radar</span>
              <span>Overview Radar</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span>{activeArea === 'area-1' ? 'WA-1 (130)' : 'WA-2 (80)'}</span>
              <button
                onClick={() => setShowMinimap(false)}
                className="w-4 h-4 rounded-full bg-surface-container hover:bg-surface-container-highest text-outline flex items-center justify-center cursor-pointer text-[10px]"
                title="Hide Radar"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="relative bg-surface-container-lowest/90 rounded-lg border border-outline-variant/30 overflow-hidden mx-auto"
            style={{ width: `${mmWidth}px`, height: `${mmHeight}px` }}
          >
            {/* Viewport Frustum Box */}
            <div
              className="absolute border border-primary bg-primary/20 rounded transition-all duration-75 shadow-sm"
              style={{
                left: `${indX}px`,
                top: `${indY}px`,
                width: `${indW}px`,
                height: `${indH}px`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
