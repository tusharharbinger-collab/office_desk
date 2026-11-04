import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Desk, Room, OfficeLocation, Role, UserProfile, Booking, SiddhantFloorId } from '../types';
import { WorkArea1Map } from './WorkArea1Map';
import { WorkArea2Map } from './WorkArea2Map';
import { SiddhantWorkAreaMap } from './SiddhantWorkAreaMap';
import { SeatTooltip } from './SeatTooltip';

interface FloorPlanViewportProps {
  activeArea: 'area-1' | 'area-2';
  selectedOffice?: OfficeLocation;
  desks: Desk[];
  rooms: Room[];
  selectedDesk: Desk | null;
  highlightedDeskId: string | null;
  searchQuery?: string;
  siddhantFloorId?: SiddhantFloorId;
  onSiddhantFloorChange?: (floor: SiddhantFloorId) => void;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
  onSelectDesk: (desk: Desk) => void;
  onSelectRoom: (room: Room) => void;
  currentUser?: UserProfile | null;
  userRole?: Role;
  bookings?: Booking[];
  selectedDate?: string;
}

export const FloorPlanViewport: React.FC<FloorPlanViewportProps> = ({
  activeArea,
  selectedOffice = 'global-port',
  desks,
  rooms,
  selectedDesk,
  highlightedDeskId,
  searchQuery = '',
  siddhantFloorId,
  onSiddhantFloorChange,
  scale: externalScale,
  onScaleChange,
  onSelectDesk,
  onSelectRoom,
  currentUser,
  userRole,
  bookings = [],
  selectedDate
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Scalable viewport state
  const [internalScale, setInternalScale] = useState<number>(externalScale || 0.8);
  const scaleRef = useRef(internalScale);
  scaleRef.current = internalScale;

  const [pan, setPan] = useState({ x: 20, y: 15 });
  const panRef = useRef(pan);
  panRef.current = pan;

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [isAnimating, setIsAnimating] = useState(false);
  const animTimerRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);


  // Track if user has manually panned/zoomed
  const isUserInteractedRef = useRef(false);
  const prevSizeRef = useRef<{ w: number; h: number } | null>(null);

  // Tooltip state
  const [hoveredDesk, setHoveredDesk] = useState<Desk | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Touch tracking for pinch-to-zoom & mobile panning
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(internalScale);

  // Search matches computed for all desks so all matching desks show vibrant Yellow
  const effectiveDesks = React.useMemo(() => {
    if (!searchQuery?.trim()) {
      return desks.map((d) => (d.id === highlightedDeskId ? { ...d, isSearchMatch: true } : d));
    }
    const q = searchQuery.toLowerCase().trim();
    return desks.map((d) => {
      const isMatch = Boolean(
        d.id === highlightedDeskId ||
        d.id.toLowerCase().includes(q) ||
        d.code.toLowerCase() === q ||
        d.code.toLowerCase().includes(q) ||
        (d.occupant && d.occupant.name.toLowerCase().includes(q))
      );
      return isMatch ? { ...d, isSearchMatch: true } : d;
    });
  }, [desks, searchQuery, highlightedDeskId]);

  const searchAnchorDeskIdRef = useRef<string | null>(null);

  // Automatic camera pan & popup opening for Admin / Manager upon search match
  useEffect(() => {
    if (!highlightedDeskId && (!searchQuery || !searchQuery.trim())) {
      if (searchAnchorDeskIdRef.current) {
        setHoveredDesk(null);
        searchAnchorDeskIdRef.current = null;
      }
      return;
    }

    const targetDesk = effectiveDesks.find((d) => d.id === highlightedDeskId || d.isSearchMatch);
    if (!targetDesk) return;

    searchAnchorDeskIdRef.current = targetDesk.id;

    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-desk-id="${targetDesk.id}"]`);
      if (el && viewportRef.current) {
        const rect = el.getBoundingClientRect();
        const vRect = viewportRef.current.getBoundingClientRect();

        const isOutOfView =
          rect.top < vRect.top + 80 ||
          rect.bottom > vRect.bottom - 80 ||
          rect.left < vRect.left + 80 ||
          rect.right > vRect.right - 80;

        if (isOutOfView) {
          const deskCenterX = rect.left + rect.width / 2;
          const deskCenterY = rect.top + rect.height / 2;
          const viewportCenterX = vRect.left + vRect.width / 2;
          const viewportCenterY = vRect.top + vRect.height / 2;

          const dx = viewportCenterX - deskCenterX;
          const dy = viewportCenterY - deskCenterY;

          setPan((p) => {
            const nextX = p.x + dx;
            const nextY = p.y + dy;
            panRef.current = { x: nextX, y: nextY };
            return { x: nextX, y: nextY };
          });
        }

        setTimeout(() => {
          const freshEl = document.querySelector(`[data-desk-id="${targetDesk.id}"]`);
          if (!freshEl) return;
          const fRect = freshEl.getBoundingClientRect();

          let popupX = fRect.right + 14;
          if (popupX + 300 > window.innerWidth - 20) {
            popupX = Math.max(10, fRect.left - 300 - 14);
          }
          let popupY = fRect.top - 20;
          if (popupY < 80) popupY = 80;
          if (popupY + 280 > window.innerHeight) {
            popupY = Math.max(80, window.innerHeight - 290);
          }

          const isManagerOrAdminRole = userRole === 'admin' || userRole === 'manager';
          const isSelf = Boolean(
            targetDesk.isSelfBooked ||
            (targetDesk.occupant?.userId && currentUser?.id && targetDesk.occupant.userId === currentUser.id) ||
            (targetDesk.occupant?.name && currentUser?.name && targetDesk.occupant.name.toLowerCase() === currentUser.name.toLowerCase())
          );

          if (isManagerOrAdminRole || isSelf) {
            setHoveredDesk(targetDesk);
            setTooltipPos({ x: popupX, y: popupY });
          }
        }, isOutOfView ? 240 : 0);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [highlightedDeskId, searchQuery, effectiveDesks, userRole, currentUser]);

  // Counts for status legend
  const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
  const availableCount = desks.filter((d) => d.status === 'available').length;
  const bookedCount = desks.filter((d) => d.status === 'booked').length;
  const selfBookedCount = desks.filter((d) => d.status === 'booked' && d.isSelfBooked).length;
  const otherBookedCount = Math.max(0, bookedCount - selfBookedCount);

  // Optimized blueprint dimensions based on active floor plan and office
  const mapW = selectedOffice === 'siddhant' ? 1420 : (activeArea === 'area-1' ? 1180 : 1380);
  const mapH = selectedOffice === 'siddhant' ? 1040 : (activeArea === 'area-1' ? 950 : 620);

  // Sync external scale if supplied and different
  useEffect(() => {
    if (externalScale !== undefined && Math.abs(externalScale - scaleRef.current) > 0.05) {
      setInternalScale(externalScale);
      scaleRef.current = externalScale;
    }
  }, [externalScale]);

  // Keep blueprint within visible boundaries with generous padding
  const clampPan = useCallback(
    (x: number, y: number, currentScale: number) => {
      if (!viewportRef.current) return { x, y };
      const vpW = viewportRef.current.clientWidth;
      const vpH = viewportRef.current.clientHeight;
      const renderW = mapW * currentScale;
      const renderH = mapH * currentScale;

      const marginX = Math.max(140, Math.min(vpW * 0.4, 300));
      const marginY = Math.max(120, Math.min(vpH * 0.4, 250));

      const minX = vpW - renderW - marginX;
      const maxX = marginX;
      const minY = vpH - renderH - marginY;
      const maxY = marginY;

      return {
        x: Math.round(Math.min(Math.max(x, minX), maxX)),
        y: Math.round(Math.min(Math.max(y, minY), maxY))
      };
    },
    [mapW, mapH]
  );

  // Trigger smooth CSS animated transition (for button clicks)
  const triggerAnimatedTransform = useCallback(
    (newPan: { x: number; y: number }, newScale: number) => {
      setIsAnimating(true);
      clearTimeout(animTimerRef.current);
      setInternalScale(newScale);
      setPan(newPan);
      scaleRef.current = newScale;
      panRef.current = newPan;

      if (onScaleChange) onScaleChange(newScale);

      animTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 260);
    },
    [onScaleChange]
  );

  // Zoom towards a specific focal point (cursor or viewport center)
  const zoomAtPoint = useCallback(
    (targetScale: number, clientX?: number, clientY?: number, animated = false) => {
      if (!viewportRef.current) return;
      const clampedScale = Math.min(Math.max(Number(targetScale.toFixed(3)), 0.32), 2.8);
      const currentScale = scaleRef.current;
      if (Math.abs(clampedScale - currentScale) < 0.001) return;

      const rect = viewportRef.current.getBoundingClientRect();
      const pivotX = clientX !== undefined ? clientX - rect.left : rect.width / 2;
      const pivotY = clientY !== undefined ? clientY - rect.top : rect.height / 2;

      // Mathematical cursor-anchoring: keep the point under cursor stationary
      const rawPanX = Math.round(pivotX - (pivotX - panRef.current.x) * (clampedScale / currentScale));
      const rawPanY = Math.round(pivotY - (pivotY - panRef.current.y) * (clampedScale / currentScale));
      const clamped = clampPan(rawPanX, rawPanY, clampedScale);

      isUserInteractedRef.current = true;

      if (animated) {
        triggerAnimatedTransform(clamped, clampedScale);
      } else {
        setIsAnimating(false);
        scaleRef.current = clampedScale;
        panRef.current = clamped;

        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          setInternalScale(clampedScale);
          setPan(clamped);
          if (onScaleChange) onScaleChange(clampedScale);
        });
      }
    },
    [clampPan, triggerAnimatedTransform, onScaleChange]
  );

  // Smart Adaptive Fit: Guarantees 100% of all desks and blueprint are visible without clipping
  const fitToScreen = useCallback((animated = true) => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    if (selectedOffice === 'siddhant') {
      // Siddhant floor maps are precision architectural drawings:
      // Fit comfortably to width with high visibility so all desk codes and rooms are clear!
      const padX = clientWidth < 640 ? 12 : 24;
      const scaleW = (clientWidth - padX) / 1380;
      const roundedScale = Number(Math.min(Math.max(scaleW * 0.98, 0.75), 1.05).toFixed(2));
      const centeredX = Math.round((clientWidth - 1380 * roundedScale) / 2);
      const topY = 16;

      isUserInteractedRef.current = false;
      if (animated) {
        triggerAnimatedTransform({ x: centeredX, y: topY }, roundedScale);
      } else {
        setInternalScale(roundedScale);
        setPan({ x: centeredX, y: topY });
        scaleRef.current = roundedScale;
        panRef.current = { x: centeredX, y: topY };
        if (onScaleChange) onScaleChange(roundedScale);
      }
      return;
    }

    const padX = clientWidth < 640 ? 20 : 44;
    const padY = clientHeight < 640 ? 20 : 44;
    const scaleW = (clientWidth - padX) / mapW;
    const scaleH = (clientHeight - padY) / mapH;

    // Use strict min(scaleW, scaleH) so both width and height fit comfortably
    const fitScale = Math.min(scaleW, scaleH);
    const roundedScale = Number(Math.min(Math.max(fitScale, 0.35), 1.25).toFixed(2));

    const centeredX = Math.round((clientWidth - mapW * roundedScale) / 2);
    const centeredY = Math.round((clientHeight - mapH * roundedScale) / 2);

    isUserInteractedRef.current = false;
    if (animated) {
      triggerAnimatedTransform({ x: centeredX, y: centeredY }, roundedScale);
    } else {
      setInternalScale(roundedScale);
      setPan({ x: centeredX, y: centeredY });
      scaleRef.current = roundedScale;
      panRef.current = { x: centeredX, y: centeredY };
      if (onScaleChange) onScaleChange(roundedScale);
    }
  }, [mapW, mapH, selectedOffice, triggerAnimatedTransform, onScaleChange]);

  // Fit All: Entire blueprint fits within window
  const fitAll = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    if (selectedOffice === 'siddhant') {
      const padX = clientWidth < 640 ? 12 : 24;
      const scaleW = (clientWidth - padX) / 1380;
      const roundedScale = Number(Math.min(Math.max(scaleW * 0.98, 0.75), 1.05).toFixed(2));
      const centeredX = Math.round((clientWidth - 1380 * roundedScale) / 2);
      const topY = 16;
      isUserInteractedRef.current = false;
      triggerAnimatedTransform({ x: centeredX, y: topY }, roundedScale);
      return;
    }

    const padX = clientWidth < 640 ? 16 : 36;
    const padY = clientHeight < 640 ? 16 : 36;
    const scaleW = (clientWidth - padX) / mapW;
    const scaleH = (clientHeight - padY) / mapH;
    const fitScale = Math.min(Math.max(Math.min(scaleW, scaleH), 0.35), 1.2);
    const roundedScale = Number(fitScale.toFixed(2));

    const centeredX = Math.round((clientWidth - mapW * roundedScale) / 2);
    const centeredY = Math.round((clientHeight - mapH * roundedScale) / 2);

    isUserInteractedRef.current = false;
    triggerAnimatedTransform({ x: centeredX, y: centeredY }, roundedScale);
  }, [mapW, mapH, selectedOffice, triggerAnimatedTransform]);

  // Fill Width: Scales to full window width
  const fitToWidth = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth } = viewportRef.current;
    if (clientWidth === 0) return;

    const padX = clientWidth < 640 ? 16 : 40;
    const widthTarget = selectedOffice === 'siddhant' ? 1380 : mapW;
    const scaleW = (clientWidth - padX) / widthTarget;
    const fitScale = Math.min(Math.max(scaleW * 0.96, selectedOffice === 'siddhant' ? 0.75 : 0.5), 1.6);
    const roundedScale = Number(fitScale.toFixed(2));

    const centeredX = Math.round((clientWidth - widthTarget * roundedScale) / 2);
    const topY = 16;

    isUserInteractedRef.current = false;
    triggerAnimatedTransform({ x: centeredX, y: topY }, roundedScale);
  }, [mapW, selectedOffice, triggerAnimatedTransform]);

  // ResizeObserver: auto-adjusts layout when window or sidebar toggles
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      fitToScreen(false);
    }, 40);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW <= 0 || newH <= 0) continue;

        if (!prevSizeRef.current) {
          prevSizeRef.current = { w: newW, h: newH };
          fitToScreen(false);
          continue;
        }

        const deltaW = newW - prevSizeRef.current.w;
        const deltaH = newH - prevSizeRef.current.h;
        prevSizeRef.current = { w: newW, h: newH };

        if (!isUserInteractedRef.current) {
          fitToScreen(false);
        } else {
          setPan((prev) => clampPan(Math.round(prev.x + deltaW / 2), Math.round(prev.y + deltaH / 2), scaleRef.current));
        }
      }
    });

    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeArea, selectedOffice, fitToScreen, clampPan]);

  // Ultra-Smooth Wheel Zoom & Pan (Passive: false, hardware-accelerated RAF)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setIsAnimating(false);
      isUserInteractedRef.current = true;

      // Shift + Wheel -> Horizontal Pan
      if (e.shiftKey) {
        const nextX = panRef.current.x - e.deltaY;
        const clamped = clampPan(nextX, panRef.current.y, scaleRef.current);
        panRef.current = clamped;
        setPan(clamped);
        return;
      }

      // Default: Direct Silky-Smooth Zooming centered on mouse cursor
      const currentScale = scaleRef.current;
      // Normalize wheel delta across trackpads (small deltas) and notched mouse wheels (larger deltas)
      const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 80);
      const zoomFactor = Math.exp(-delta * 0.0022);
      const targetScale = Math.min(Math.max(Number((currentScale * zoomFactor).toFixed(3)), 0.32), 2.8);

      if (Math.abs(targetScale - currentScale) < 0.0005) return;

      const rect = el.getBoundingClientRect();
      const pivotX = e.clientX - rect.left;
      const pivotY = e.clientY - rect.top;

      const rawPanX = Math.round(pivotX - (pivotX - panRef.current.x) * (targetScale / currentScale));
      const rawPanY = Math.round(pivotY - (pivotY - panRef.current.y) * (targetScale / currentScale));
      const clamped = clampPan(rawPanX, rawPanY, targetScale);

      scaleRef.current = targetScale;
      panRef.current = clamped;

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setInternalScale(targetScale);
        setPan(clamped);
        if (onScaleChange) onScaleChange(targetScale);
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [clampPan, onScaleChange]);

  // Window-level Mouse Drag Pan (Prevents cursor dropping when fast panning)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-desk-id], button, input, a')) return;
    setIsAnimating(false);
    setIsDragging(true);
    isDraggingRef.current = true;
    isUserInteractedRef.current = true;
    dragStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const rawX = e.clientX - dragStartRef.current.x;
      const rawY = e.clientY - dragStartRef.current.y;
      const clamped = clampPan(rawX, rawY, scaleRef.current);
      panRef.current = clamped;

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setPan(clamped);
      });
    };

    const handleWindowMouseUp = () => {
      if (isDraggingRef.current) {
        setIsDragging(false);
        isDraggingRef.current = false;
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [clampPan]);

  // Touch handlers for mobile & tablet pinch/drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('[data-desk-id], button, input')) return;
      setIsAnimating(false);
      setIsDragging(true);
      isDraggingRef.current = true;
      isUserInteractedRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y };
    } else if (e.touches.length === 2) {
      setIsAnimating(false);
      setIsDragging(false);
      isDraggingRef.current = false;
      isUserInteractedRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartScaleRef.current = scaleRef.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const rawX = e.touches[0].clientX - dragStartRef.current.x;
      const rawY = e.touches[0].clientY - dragStartRef.current.y;
      const clamped = clampPan(rawX, rawY, scaleRef.current);
      panRef.current = clamped;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setPan(clamped);
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchStartDistRef.current;
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAtPoint(touchStartScaleRef.current * ratio, midX, midY, false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    touchStartDistRef.current = null;
  };

  // Hover handlers (Optimized to avoid re-rendering whole canvas on every mousemove)
  const handleHoverDesk = useCallback((desk: Desk, e: React.MouseEvent) => {
    if (desk.status === 'booked') {
      const isSelf = Boolean(
        desk.isSelfBooked ||
        (desk.occupant?.userId && currentUser?.id && desk.occupant.userId === currentUser.id) ||
        (desk.occupant?.name && currentUser?.name && desk.occupant.name.toLowerCase() === currentUser.name.toLowerCase()) ||
        bookings.some(b => b.deskId === desk.id && b.status === 'active' && b.date === selectedDate)
      );
      const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';

      // For regular employee: someone else's booked seat has NO popup!
      if (!isManagerOrAdmin && !isSelf) {
        setHoveredDesk(null);
        return;
      }
    }
    setHoveredDesk(desk);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [currentUser, userRole, bookings, selectedDate]);

  const handleLeaveDesk = useCallback(() => {
    setHoveredDesk(null);
  }, []);

  return (
    <div
      ref={viewportRef}
      className={`relative w-full h-full overflow-hidden select-none bg-background ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle architectural dot grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#31353e_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

      {/* Scaled & Translated Blueprint Canvas with Zero-lag GPU Compositing Layer */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${internalScale})`,
          transformOrigin: '0 0',
          willChange: isDragging ? 'transform' : 'auto',
          transition: isAnimating ? 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          backfaceVisibility: 'hidden',
          contain: 'layout style'
        }}
      >
        {selectedOffice === 'siddhant' ? (
          <SiddhantWorkAreaMap
            activeArea={activeArea}
            desks={effectiveDesks}
            rooms={rooms}
            selectedDesk={selectedDesk}
            highlightedDeskId={highlightedDeskId}
            selectedFloorId={siddhantFloorId}
            onFloorChange={onSiddhantFloorChange}
            onSelectDesk={onSelectDesk}
            onHoverDesk={handleHoverDesk}
            onLeaveDesk={handleLeaveDesk}
            onSelectRoom={onSelectRoom}
          />
        ) : activeArea === 'area-1' ? (
          <WorkArea1Map
            desks={effectiveDesks}
            rooms={rooms}
            selectedDesk={selectedDesk}
            highlightedDeskId={highlightedDeskId}
            onSelectDesk={onSelectDesk}
            onHoverDesk={handleHoverDesk}
            onLeaveDesk={handleLeaveDesk}
            onSelectRoom={onSelectRoom}
          />
        ) : (
          <WorkArea2Map
            desks={effectiveDesks}
            rooms={rooms}
            selectedDesk={selectedDesk}
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

      {/* Floating Status Legend (Bottom-Left Pill, non-obtrusive; hidden during booking to prevent overlap) */}
      {!selectedDesk && (
        <div className="absolute bottom-5 left-5 z-20 hidden xs:flex sm:flex items-center gap-2.5 sm:gap-3.5 bg-[#0B0F17]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-2 rounded-xl shadow-xl pointer-events-none text-[11px] sm:text-xs text-slate-300 font-medium font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Free ({availableCount})</span>
          </div>
          {isAdminOrManager ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span>Booked ({bookedCount})</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-500" />
                <span>Booked ({otherBookedCount})</span>
              </div>
              {selfBookedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  <span>Your Pass ({selfBookedCount})</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Canvas Controls Dock (Bottom-Right, Responsive, moves up during booking) */}
      <div className={`absolute right-5 z-30 flex items-center gap-1 bg-[#0B0F17]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 ${
        selectedDesk ? 'bottom-20 sm:bottom-24' : 'bottom-5'
      }`}>
        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => zoomAtPoint(internalScale - 0.18, undefined, undefined, true)}
          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Zoom Out (Scroll Down)"
        >
          <span className="material-symbols-outlined text-base">remove</span>
        </button>

        {/* Current Zoom Percentage */}
        <button
          type="button"
          onClick={() => (internalScale === 1.0 ? fitToScreen(true) : zoomAtPoint(1.0, undefined, undefined, true))}
          className="px-2 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-200 flex items-center justify-center text-xs font-mono font-medium transition-colors cursor-pointer min-w-[44px]"
          title="Click to toggle 100% / Auto-Fit"
        >
          {Math.round(internalScale * 100)}%
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => zoomAtPoint(internalScale + 0.18, undefined, undefined, true)}
          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Zoom In (Scroll Up)"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>

        <div className="w-[1px] h-5 bg-white/[0.1] mx-0.5" />

        {/* Fill Width Button */}
        <button
          type="button"
          onClick={fitToWidth}
          className="h-8 px-2.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-400/30 hover:bg-sky-500/25 active:bg-sky-500/35 flex items-center gap-1.5 text-xs transition-colors cursor-pointer font-semibold shadow-sm"
          title="Fit floor plan to full window width (large legible workstations)"
        >
          <span className="material-symbols-outlined text-base text-sky-400">fit_screen</span>
          <span className="text-[11px]">Fill Width</span>
        </button>

        {/* Fit All Button */}
        <button
          type="button"
          onClick={fitAll}
          className="h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
          title="Fit entire floor plan inside view"
        >
          <span className="material-symbols-outlined text-base text-slate-400">crop_free</span>
          <span className="text-[11px] font-medium">Fit All</span>
        </button>


      </div>
    </div>
  );
};
