import React from 'react';
import { Desk } from '../types';

interface TimeGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeArea: 'area-1' | 'area-2';
  desks: Desk[];
  onSelectDesk: (desk: Desk) => void;
}

export const TimeGridModal: React.FC<TimeGridModalProps> = ({
  isOpen,
  onClose,
  activeArea,
  desks,
  onSelectDesk
}) => {
  if (!isOpen) return null;

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Group sample desks by pod
  const sampleDesks = desks.slice(0, 16);

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Time Grid Matrix Scheduler</h2>
              <p className="text-xs text-outline">
                {activeArea === 'area-1' ? 'Work Area 1' : 'Work Area 2'} • Hourly availability and shift timeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left font-mono font-semibold text-outline uppercase py-3 px-3 w-40">
                  Desk Station
                </th>
                {hours.map((h) => (
                  <th key={h} className="text-center font-mono text-outline py-3 px-1.5 min-w-[50px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {sampleDesks.map((d) => (
                <tr key={d.id} className="hover:bg-surface-container-high/40 transition-all">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-primary mr-1.5">{d.id}</span>
                    <span className="text-[10px] text-outline block truncate">{d.podName}</span>
                  </td>
                  {hours.map((h, i) => {
                    const isOccupied = d.status === 'booked' && i >= 1 && i <= 8;
                    const isHold = d.status === 'hold' && i >= 3 && i <= 6;

                    return (
                      <td key={h} className="py-2 px-1 text-center">
                        <div
                          onClick={() => {
                            if (!isOccupied) {
                              onSelectDesk(d);
                              onClose();
                            }
                          }}
                          className={`h-7 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                            isOccupied
                              ? 'bg-error/25 text-error border border-error/40 cursor-not-allowed text-[10px] font-mono'
                              : isHold
                              ? 'bg-tertiary/25 text-tertiary border border-tertiary/40'
                              : 'bg-secondary/15 hover:bg-secondary/30 text-secondary border border-secondary/30 text-[10px] font-mono'
                          }`}
                          title={isOccupied ? `Occupied (${d.occupant?.name})` : 'Available to book'}
                        >
                          {isOccupied ? 'Booked' : 'Open'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-high/40 flex justify-between items-center text-xs text-outline">
          <span>Click any 'Open' cell to reserve the desk for that time slot.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
