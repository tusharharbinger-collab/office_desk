import React, { useState } from 'react';
import { OfficeLocation } from '../types';
import { OFFICES, OFFICE_LIST } from '../data/officeConfig';

interface OfficeSelectionModalProps {
  isOpen: boolean;
  currentOffice: OfficeLocation;
  onSelectOffice: (office: OfficeLocation) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const OfficeSelectionModal: React.FC<OfficeSelectionModalProps> = ({
  isOpen,
  currentOffice,
  onSelectOffice,
  onClose,
  canDismiss = true
}) => {
  const [selected, setSelected] = useState<OfficeLocation>(currentOffice);
  const [rememberChoice, setRememberChoice] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleConfirm = (officeId: OfficeLocation) => {
    if (rememberChoice) {
      localStorage.setItem('smartdesk_selected_office', officeId);
    }
    onSelectOffice(officeId);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0D121D] border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Card */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.08] flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-white/30 flex-shrink-0">
              <img src="/harbinger-logo.webp" alt="Harbinger Group" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Select Office Location
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  Campus Switcher
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your office campus to view real-time blueprints, desks, and meeting rooms.
              </p>
            </div>
          </div>

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
              title="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Office Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICE_LIST.map((office) => {
              const isSelected = selected === office.id;
              const isGlobalPort = office.id === 'global-port';

              return (
                <div
                  key={office.id}
                  onClick={() => setSelected(office.id)}
                  className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? isGlobalPort
                        ? 'bg-sky-950/30 border-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.25)] ring-1 ring-sky-400/50'
                        : 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {/* Top Badge & Radio indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isGlobalPort
                            ? 'bg-sky-500/15 text-sky-300 border-sky-400/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                        }`}
                      >
                        {office.badge}
                      </span>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? isGlobalPort
                              ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_8px_#38bdf8]'
                              : 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_8px_#34d399]'
                            : 'border-slate-600 bg-black/40'
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                    </div>

                    {/* Campus Name & Icon */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isGlobalPort
                            ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {isGlobalPort ? 'corporate_fare' : 'location_city'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                          {office.name} Office
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">{office.tagline}</p>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-black/30 border border-white/[0.05] text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-mono uppercase">Desks Total</span>
                        <span className="text-white font-bold font-mono text-xs">{office.totalDesks} Seats</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-mono uppercase">Meeting Rooms</span>
                        <span className="text-white font-bold font-mono text-xs">{office.totalRooms} Rooms</span>
                      </div>
                    </div>

                    {/* Areas breakdown */}
                    <div className="space-y-1 text-[11px] text-slate-400 mb-3">
                      {office.areas.map((a) => (
                        <div key={a.id} className="flex items-center justify-between">
                          <span>{a.name}</span>
                          <span className="font-mono text-slate-300 font-semibold">{a.deskCount} desks</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blueprint status indicator */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          office.blueprintStatus === 'active'
                            ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                            : 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'
                        }`}
                      />
                      <span className="text-slate-300 font-medium">
                        {office.blueprintStatus === 'active'
                          ? 'Floor Plan Blueprint Active'
                          : 'Blueprint Overlay Pending'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm(office.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? isGlobalPort
                            ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/25'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1]'
                      }`}
                    >
                      {isSelected ? 'Enter Campus' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Blueprint Notice Callout */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-xs text-slate-400">
            <span className="material-symbols-outlined text-sky-400 text-lg flex-shrink-0">info</span>
            <div className="leading-relaxed">
              <span className="text-slate-200 font-semibold">Zero Data Conflict Guarantee:</span>{' '}
              Desks, meeting rooms, multi-day schedules, and Outlook calendar invites are 100% isolated per campus.
              Both campuses share all features seamlessly.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/[0.08] bg-black/40 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="rounded bg-black/60 border-slate-600 text-sky-500 focus:ring-sky-500/20 cursor-pointer"
            />
            <span>Remember my choice for future visits</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            {canDismiss && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => handleConfirm(selected)}
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selected === 'siddhant'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/25'
              }`}
            >
              <span>Confirm & Book at {OFFICES[selected].name}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
