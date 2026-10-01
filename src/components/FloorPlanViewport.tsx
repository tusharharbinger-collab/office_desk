import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // Track if user has manually panned/zoomed so resize doesn't override intentional positioning
  const isUserInteractedRef = useRef(false);
  const prevSizeRef = useRef<{ w: number; h: number } | null>(null);

  // Tooltip state
  const [hoveredDesk, setHoveredDesk] = useState<Desk | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Touch tracking for pinch-to-zoom & mobile panning
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(scale);

  // Counts for status legend
  const availableCount = desks.filter((d) => d.status === 'available').length;
  const bookedCount = desks.filter((d) => d.status === 'booked').length;

  // Optimized blueprint dimensions (tightened to ~16:9 ratio for perfect screen filling)
  const mapW = activeArea === 'area-1' ? 1520 : 1680;
  const mapH = activeArea === 'area-1' ? 880 : 920;

  // Keep blueprint within visible boundaries
  const clampPan = useCallback(
    (x: number, y: number, currentScale: number) => {
      if (!viewportRef.current) return { x, y };
      const vpW = viewportRef.current.clientWidth;
      const vpH = viewportRef.current.clientHeight;
      const renderW = mapW * currentScale;
      const renderH = mapH * currentScale;

      const minX = -(renderW - 120);
      const maxX = vpW - 120;
      const minY = -(renderH - 120);
      const maxY = vpH - 120;

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY)
      };
    },
    [mapW, mapH]
  );

  // Zoom towards a specific focal point (cursor or viewport center)
  const zoomAtPoint = useCallback(
    (targetScale: number, clientX?: number, clientY?: number) => {
      if (!viewportRef.current) return;
      const clampedScale = Math.min(Math.max(Number(targetScale.toFixed(2)), 0.35), 2.5);
      if (clampedScale === scale) return;

      const rect = viewportRef.current.getBoundingClientRect();
      const pivotX = clientX !== undefined ? clientX - rect.left : rect.width / 2;
      const pivotY = clientY !== undefined ? clientY - rect.top : rect.height / 2;

      // Keep (pivotX, pivotY) stationary while scaling
      const rawPanX = Math.round(pivotX - (pivotX - pan.x) * (clampedScale / scale));
      const rawPanY = Math.round(pivotY - (pivotY - pan.y) * (clampedScale / scale));
      const clamped = clampPan(rawPanX, rawPanY, clampedScale);

      isUserInteractedRef.current = true;
      onScaleChange(clampedScale);
      setPan(clamped);
    },
    [scale, pan, clampPan, onScaleChange]
  );

  // Smart Adaptive Fit: On wide monitors, fills ~92% of the window width for prominent, large desks!
  const fitToScreen = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const padX = clientWidth < 640 ? 12 : 32;
    const padY = clientHeight < 640 ? 12 : 32;
    const scaleW = (clientWidth - padX) / mapW;
    const scaleH = (clientHeight - padY) / mapH;

    let fitScale: number;
    if (clientWidth >= 1024 && scaleW > scaleH * 1.15) {
      // Widescreen view: Fill available width (between 78% and 100%) so desks are large and clear
      fitScale = Math.min(Math.max(scaleW * 0.94, 0.78), 1.25);
    } else {
      // Standard fit: fit entire blueprint inside viewport
      fitScale = Math.min(scaleW, scaleH);
    }

    const roundedScale = Number(fitScale.toFixed(2));
    const centeredX = Math.round((clientWidth - mapW * roundedScale) / 2);
    const centeredY =
      mapH * roundedScale <= clientHeight
        ? Math.round((clientHeight - mapH * roundedScale) / 2)
        : 18;

    isUserInteractedRef.current = false;
    onScaleChange(roundedScale);
    setPan({ x: centeredX, y: centeredY });
  }, [mapW, mapH, onScaleChange]);

  // Fit All: Forces entire blueprint inside view
  const fitAll = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const padX = clientWidth < 640 ? 12 : 32;
    const padY = clientHeight < 640 ? 12 : 32;
    const scaleW = (clientWidth - padX) / mapW;
    const scaleH = (clientHeight - padY) / mapH;
    const fitScale = Math.min(Math.max(Math.min(scaleW, scaleH), 0.35), 1.2);
    const roundedScale = Number(fitScale.toFixed(2));

    const centeredX = Math.round((clientWidth - mapW * roundedScale) / 2);
    const centeredY = Math.round((clientHeight - mapH * roundedScale) / 2);

    isUserInteractedRef.current = false;
    onScaleChange(roundedScale);
    setPan({ x: centeredX, y: centeredY });
  }, [mapW, mapH, onScaleChange]);

  // Fill Width: Scales to fill full window width
  const fitToWidth = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth } = viewportRef.current;
    if (clientWidth === 0) return;

    const padX = clientWidth < 640 ? 12 : 36;
    const scaleW = (clientWidth - padX) / mapW;
    const fitScale = Math.min(Math.max(scaleW * 0.96, 0.5), 1.5);
    const roundedScale = Number(fitScale.toFixed(2));

    const centeredX = Math.round((clientWidth - mapW * roundedScale) / 2);
    const topY = 18;

    isUserInteractedRef.current = false;
    onScaleChange(roundedScale);
    setPan({ x: centeredX, y: topY });
  }, [mapW, onScaleChange]);

  // Robust ResizeObserver: Continuously auto-adjusts layout when window, sidebar, or panel changes
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    // Initial fit
    const timer = setTimeout(() => {
      fitToScreen();
    }, 50);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW <= 0 || newH <= 0) continue;

        if (!prevSizeRef.current) {
          prevSizeRef.current = { w: newW, h: newH };
          fitToScreen();
          continue;
        }

        const deltaW = newW - prevSizeRef.current.w;
        const deltaH = newH - prevSizeRef.current.h;
        prevSizeRef.current = { w: newW, h: newH };

        if (!isUserInteractedRef.current) {
          fitToScreen();
        } else {
          setPan((prev) => clampPan(Math.round(prev.x + deltaW / 2), Math.round(prev.y + deltaH / 2), scale));
        }
      }
    });

    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeArea, fitToScreen, clampPan, scale]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-desk-id]')) return;
    setIsDragging(true);
    isUserInteractedRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rawX = e.clientX - dragStartRef.current.x;
    const rawY = e.clientY - dragStartRef.current.y;
    setPan(clampPan(rawX, rawY, scale));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel handler: Normal scroll pans vertically/horizontally; Ctrl+wheel / pinch zooms!
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
      zoomAtPoint(scale + zoomDelta, e.clientX, e.clientY);
    } else {
      isUserInteractedRef.current = true;
      setPan((prev) => clampPan(prev.x - e.deltaX, prev.y - e.deltaY, scale));
    }
  };

  // Touch handlers for mobile & tablet pinch/drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('[data-desk-id]')) return;
      setIsDragging(true);
      isUserInteractedRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      isUserInteractedRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const rawX = e.touches[0].clientX - dragStartRef.current.x;
      const rawY = e.touches[0].clientY - dragStartRef.current.y;
      setPan(clampPan(rawX, rawY, scale));
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchStartDistRef.current;
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAtPoint(touchStartScaleRef.current * ratio, midX, midY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
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
      className={`relative w-full h-full overflow-hidden select-none bg-background ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
      <div className="absolute bottom-5 left-5 z-20 hidden xs:flex sm:flex items-center gap-2.5 sm:gap-3.5 bg-[#0B0F17]/90 backdrop-blur-xl border border-white/[0.08] px-3 py-1.5 rounded-xl shadow-xl pointer-events-none text-[11px] sm:text-xs text-slate-300 font-medium font-mono">
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
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          <span>Hold</span>
        </div>
      </div>

      {/* Floating Canvas Controls Dock (Bottom-Right, Fully Responsive) */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1 bg-[#0B0F17]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
        {/* Zoom Out */}
        <button
          onClick={() => zoomAtPoint(scale - 0.15)}
          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-base">remove</span>
        </button>

        {/* Current Zoom Percentage */}
        <button
          onClick={() => (scale === 1 ? fitToScreen() : zoomAtPoint(1.0))}
          className="px-2 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 flex items-center justify-center text-xs font-mono font-medium transition-all cursor-pointer min-w-[44px]"
          title="Click to toggle 100% / Auto-Fit"
        >
          {Math.round(scale * 100)}%
        </button>

        {/* Zoom In */}
        <button
          onClick={() => zoomAtPoint(scale + 0.15)}
          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>

        <div className="w-[1px] h-5 bg-white/[0.1] mx-0.5" />

        {/* Fill Width Button (Fills screen width for large, clear, readable workstations) */}
        <button
          onClick={fitToWidth}
          className="h-8 px-2.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-400/30 hover:bg-sky-500/25 flex items-center gap-1.5 text-xs transition-all cursor-pointer font-semibold shadow-sm"
          title="Fit floor plan to full window width (large legible workstations)"
        >
          <span className="material-symbols-outlined text-base text-sky-400">fit_screen</span>
          <span className="text-[11px]">Fill Width</span>
        </button>

        {/* Fit All Button (Fits entire blueprint inside viewport) */}
        <button
          onClick={fitAll}
          className="h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-all cursor-pointer"
          title="Fit entire floor plan inside view"
        >
          <span className="material-symbols-outlined text-base text-slate-400">crop_free</span>
          <span className="text-[11px] font-medium">Fit All</span>
        </button>

        {/* Minimap Radar Toggle */}
        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
            showMinimap
              ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-sm font-semibold'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Toggle Overview Radar"
        >
          <span className="material-symbols-outlined text-base">map</span>
          <span className="hidden md:inline text-[11px] font-medium">Radar</span>
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
