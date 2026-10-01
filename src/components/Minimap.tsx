import React, { useState } from 'react';

interface MinimapProps {
  areaId: 'area-1' | 'area-2';
  pan: { x: number; y: number };
  scale: number;
}

export const Minimap: React.FC<MinimapProps> = ({ areaId, pan, scale }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Compute normalized indicator position
  const indicatorWidth = Math.max(20, Math.min(50, 50 / scale));
  const indicatorHeight = Math.max(14, Math.min(35, 35 / scale));

  const offsetX = Math.max(2, Math.min(90 - indicatorWidth, (-pan.x / 16) * 0.5 + 8));
  const offsetY = Math.max(2, Math.min(55 - indicatorHeight, (-pan.y / 16) * 0.5 + 8));

  return (
    <div className="fixed bottom-6 right-6 z-30 select-none">
      {/* If open: show the mini map card */}
      {isOpen ? (
        <div className="w-44 bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 rounded-2xl p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center text-[10px] text-outline uppercase font-mono pb-1.5 border-b border-outline-variant/20 mb-2">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <span className="material-symbols-outlined text-xs">map</span>
              <span>Minimap</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span>{areaId === 'area-1' ? 'WA-1' : 'WA-2'}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-4 h-4 rounded-full bg-surface-container hover:bg-surface-container-highest text-outline flex items-center justify-center cursor-pointer text-[10px]"
                title="Hide Minimap"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="relative w-full h-16 bg-surface-container-lowest/90 rounded-lg border border-outline-variant/30 overflow-hidden">
            {areaId === 'area-1' ? (
              <div className="absolute inset-1 flex justify-between opacity-35">
                <div className="w-1 bg-outline rounded" />
                <div className="flex flex-col justify-between w-1/4">
                  <div className="h-3.5 bg-outline/60 rounded" />
                  <div className="h-6 bg-outline/60 rounded" />
                </div>
                <div className="w-1/4 h-6 bg-primary/40 rounded self-start" />
                <div className="flex flex-col justify-between w-1/4">
                  <div className="h-6 bg-tertiary/40 rounded" />
                  <div className="h-3.5 bg-outline/60 rounded" />
                </div>
              </div>
            ) : (
              <div className="absolute inset-1 flex flex-col justify-between opacity-35">
                <div className="flex justify-between h-7 items-center px-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="w-1 h-5 bg-outline/70 rounded-sm" />
                  ))}
                </div>
                <div className="flex justify-between h-3 px-1">
                  <div className="w-10 h-2 bg-outline/50 rounded-sm" />
                  <div className="w-3.5 h-2 bg-primary/40 rounded-sm" />
                  <div className="w-7 h-2 bg-outline/50 rounded-sm" />
                </div>
              </div>
            )}

            {/* Viewport Indicator */}
            <div
              className="absolute border border-primary bg-primary/20 rounded transition-all duration-75 shadow-sm"
              style={{
                left: `${offsetX}px`,
                top: `${offsetY}px`,
                width: `${indicatorWidth}px`,
                height: `${indicatorHeight}px`,
              }}
            />
          </div>
        </div>
      ) : (
        /* Collapsed Floating Toggle Button */
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-xl bg-surface-container-high/90 hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface shadow-xl backdrop-blur-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs"
          title="Show Minimap"
        >
          <span className="material-symbols-outlined text-base text-primary">map</span>
          <span className="text-[11px] font-mono text-outline">Radar</span>
        </button>
      )}
    </div>
  );
};
