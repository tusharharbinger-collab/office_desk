import React from 'react';
import { OfficeLocation, SiddhantFloorId } from '../types';
import { ActiveTab } from './Sidebar';

interface OfficeFloorNavHeaderProps {
  selectedOffice: OfficeLocation;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeArea: 'area-1' | 'area-2';
  onAreaChange: (area: 'area-1' | 'area-2') => void;
  siddhantFloorId: SiddhantFloorId;
  onSiddhantFloorChange: (floor: SiddhantFloorId) => void;
  area1DeskCount?: number;
  area2DeskCount?: number;
  meetingRoomsCount?: number;
}

export const OfficeFloorNavHeader: React.FC<OfficeFloorNavHeaderProps> = ({
  selectedOffice,
  activeTab,
  onTabChange,
  activeArea,
  onAreaChange,
  siddhantFloorId,
  onSiddhantFloorChange,
  area1DeskCount = 130,
  area2DeskCount = 80,
  meetingRoomsCount
}) => {
  const isGlobalPort = selectedOffice === 'global-port';

  // Effective meeting room count default
  const defaultMeetingRooms = isGlobalPort ? 8 : 6;
  const effectiveRoomsCount = meetingRoomsCount !== undefined ? meetingRoomsCount : defaultMeetingRooms;

  return (
    <div className="h-12 sm:h-13 px-3 sm:px-6 bg-[#0a0f1d]/95 border-b border-white/[0.08] backdrop-blur-xl flex items-center justify-between gap-3 select-none flex-shrink-0 z-20 overflow-x-auto scrollbar-none shadow-sm">
      {/* LEFT ZONE: Campus Identifier + Floor / Wing Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Campus Identifier Badge */}
        <div className="flex items-center gap-2 pr-2.5 sm:pr-3 border-r border-white/[0.08] flex-shrink-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              isGlobalPort
                ? 'bg-sky-500/15 border-sky-400/30 text-sky-400'
                : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isGlobalPort ? 'corporate_fare' : 'domain'}
            </span>
          </div>
          <div className="hidden lg:block leading-tight">
            <span className="text-[11px] font-bold text-slate-200 tracking-wide block uppercase">
              {isGlobalPort ? 'Global Port' : 'Siddhant Center'}
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">
              {isGlobalPort ? 'Main Campus' : 'Architectural CAD'}
            </span>
          </div>
        </div>

        {/* BUTTON GROUP FOR GLOBAL PORT */}
        {isGlobalPort && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Area 1 Button */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onAreaChange('area-1');
              }}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && activeArea === 'area-1'
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/60 shadow-[0_0_12px_rgba(14,165,233,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-sky-400">table_restaurant</span>
              <span>Area 1</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && activeArea === 'area-1'
                    ? 'bg-sky-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {area1DeskCount} Desks
              </span>
            </button>

            {/* Area 2 Button */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onAreaChange('area-2');
              }}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && activeArea === 'area-2'
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/60 shadow-[0_0_12px_rgba(14,165,233,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-sky-400">table_restaurant</span>
              <span>Area 2</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && activeArea === 'area-2'
                    ? 'bg-sky-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {area2DeskCount} Desks
              </span>
            </button>

            {/* Meeting Rooms Button */}
            <button
              type="button"
              onClick={() => onTabChange('meeting-rooms')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'meeting-rooms'
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.35)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-cyan-400">meeting_room</span>
              <span>Meeting Rooms</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'meeting-rooms'
                    ? 'bg-cyan-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {effectiveRoomsCount} Rooms
              </span>
            </button>
          </div>
        )}

        {/* BUTTON GROUP FOR SIDDHANT */}
        {!isGlobalPort && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Floor 2A */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onSiddhantFloorChange('floor_2a');
              }}
              className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && siddhantFloorId === 'floor_2a'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">layers</span>
              <span>2nd Floor A Wing</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && siddhantFloorId === 'floor_2a'
                    ? 'bg-emerald-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                22
              </span>
            </button>

            {/* Floor 2B */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onSiddhantFloorChange('floor_2b');
              }}
              className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && siddhantFloorId === 'floor_2b'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">grid_view</span>
              <span>2nd Floor B Wing</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && siddhantFloorId === 'floor_2b'
                    ? 'bg-emerald-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                35
              </span>
            </button>

            {/* Floor 3A */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onSiddhantFloorChange('floor_3a');
              }}
              className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && siddhantFloorId === 'floor_3a'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">apartment</span>
              <span>3rd Floor A Wing</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && siddhantFloorId === 'floor_3a'
                    ? 'bg-emerald-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                25
              </span>
            </button>

            {/* Ground / 1st Floor B Wing */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onSiddhantFloorChange('ground_b');
              }}
              className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && siddhantFloorId === 'ground_b'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">architecture</span>
              <span>1st Floor B Wing</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && siddhantFloorId === 'ground_b'
                    ? 'bg-emerald-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                14
              </span>
            </button>

            {/* Legal Finance */}
            <button
              type="button"
              onClick={() => {
                onTabChange('floor-plan');
                onSiddhantFloorChange('legal_finance');
              }}
              className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'floor-plan' && siddhantFloorId === 'legal_finance'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">account_balance</span>
              <span>Legal Finance</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'floor-plan' && siddhantFloorId === 'legal_finance'
                    ? 'bg-emerald-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                14
              </span>
            </button>

            {/* Meeting Rooms Button */}
            <button
              type="button"
              onClick={() => onTabChange('meeting-rooms')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                activeTab === 'meeting-rooms'
                  ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/70 shadow-[0_0_15px_rgba(52,211,153,0.35)] font-bold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">meeting_room</span>
              <span>Meeting Rooms</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'meeting-rooms'
                    ? 'bg-emerald-400/30 text-white'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {effectiveRoomsCount} Rooms
              </span>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT ZONE: Live Status Indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        <span className="text-[11px] text-slate-300">
          {activeTab === 'meeting-rooms'
            ? 'Interactive Room Reservation Active'
            : isGlobalPort
            ? 'Full Blueprint Interactive'
            : 'Multi-Floor CAD Overlay Active'}
        </span>
      </div>
    </div>
  );
};

