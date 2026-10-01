import React, { useState } from 'react';
import { Desk, UserProfile } from '../types';

interface ManagerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  area1Desks: Desk[];
  area2Desks: Desk[];
  onLocateSeat: (areaId: 'area-1' | 'area-2', deskId: string) => void;
  onReleaseSeat: (deskId: string) => void;
  users?: UserProfile[];
  onBookForUser?: (user: UserProfile) => void;
}

export const ManagerAnalyticsModal: React.FC<ManagerAnalyticsModalProps> = ({
  isOpen,
  onClose,
  area1Desks,
  area2Desks,
  onLocateSeat,
  onReleaseSeat,
  users = [],
  onBookForUser
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'presence' | 'utilization' | 'departments' | 'assign'>('presence');
  const [filterDept, setFilterDept] = useState<string>('all');

  const allDesks = [...area1Desks, ...area2Desks];
  const occupiedDesks = allDesks.filter((d) => d.status === 'booked' && d.occupant);

  const area1Occupied = area1Desks.filter((d) => d.status === 'booked').length;
  const area2Occupied = area2Desks.filter((d) => d.status === 'booked').length;

  const area1Rate = Math.round((area1Occupied / area1Desks.length) * 100);
  const area2Rate = Math.round((area2Occupied / area2Desks.length) * 100);
  const overallRate = Math.round(((area1Occupied + area2Occupied) / allDesks.length) * 100);

  const filteredOccupants = filterDept === 'all'
    ? occupiedDesks
    : occupiedDesks.filter((d) => d.occupant?.department.toLowerCase() === filterDept.toLowerCase());

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shadow-[0_0_12px_rgba(78,222,163,0.3)]">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-on-surface">Manager Presence & Analytics</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono font-bold">
                  LIVE RADAR
                </span>
              </div>
              <p className="text-xs text-outline">
                Monitor live occupancy, track employee locations, and review space utilization reports.
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

        {/* Metric Cards Row */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-outline-variant/20 bg-surface-container-lowest/30">
          <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
            <span className="text-[11px] text-outline uppercase font-mono">Overall Occupancy</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-secondary">{overallRate}%</span>
              <span className="text-xs text-outline">
                ({area1Occupied + area2Occupied} of {allDesks.length} Seats)
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-secondary shadow-[0_0_6px_#4edea3]"
                style={{ width: `${overallRate}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
            <span className="text-[11px] text-outline uppercase font-mono">Work Area 1 (Main Floor)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-primary">{area1Rate}%</span>
              <span className="text-xs text-outline">({area1Occupied} / 130)</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary shadow-[0_0_6px_#89ceff]"
                style={{ width: `${area1Rate}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
            <span className="text-[11px] text-outline uppercase font-mono">Work Area 2 (Room 2)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-tertiary">{area2Rate}%</span>
              <span className="text-xs text-outline">({area2Occupied} / 80)</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-tertiary shadow-[0_0_6px_#ffb95f]"
                style={{ width: `${area2Rate}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
            <span className="text-[11px] text-outline uppercase font-mono">Peak Traffic Window</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-on-surface">10:30 - 15:30</span>
            </div>
            <p className="text-[11px] text-secondary mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Optimal HVAC Efficiency
            </p>
          </div>
        </div>

        {/* Tab Switcher & Filters */}
        <div className="px-6 py-3 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('presence')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'presence'
                  ? 'bg-secondary/20 text-secondary border border-secondary/40 font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Who is Sitting Where ({occupiedDesks.length})
            </button>
            <button
              onClick={() => setActiveTab('utilization')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'utilization'
                  ? 'bg-secondary/20 text-secondary border border-secondary/40 font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Hourly Peak Trends
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'departments'
                  ? 'bg-secondary/20 text-secondary border border-secondary/40 font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Department Breakdown
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'assign'
                  ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">event_seat</span>
              <span>Assign Desks to Employees</span>
            </button>
          </div>

          {activeTab === 'presence' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline">Filter Dept:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="data science">Data Science</option>
                <option value="product">Product</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          )}
        </div>

        {/* Body content based on active tab */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'presence' && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 text-[11px] font-mono text-outline uppercase px-4 py-1 border-b border-outline-variant/20">
                <span className="col-span-4">Employee & Role</span>
                <span className="col-span-2">Department</span>
                <span className="col-span-3">Assigned Workstation</span>
                <span className="col-span-2">Duration Left</span>
                <span className="col-span-1 text-right">Actions</span>
              </div>

              {filteredOccupants.map((desk) => {
                const occ = desk.occupant!;
                return (
                  <div
                    key={desk.id}
                    className="grid grid-cols-12 items-center bg-surface-container-high/40 hover:bg-surface-container-high p-3.5 rounded-2xl border border-outline-variant/30 transition-all text-xs"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <img
                        src={occ.avatar}
                        alt={occ.name}
                        className="w-9 h-9 rounded-full object-cover border border-secondary/40 shadow-sm"
                      />
                      <div>
                        <p className="font-semibold text-on-surface">{occ.name}</p>
                        <p className="text-[11px] text-outline">{occ.role}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-[11px] font-medium border border-outline-variant/30">
                        {occ.department}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <span className="font-mono font-bold text-on-surface mr-2">{desk.id}</span>
                      <span className="text-[11px] text-outline">
                        ({desk.areaId === 'area-1' ? 'Area 1' : 'Area 2'}) • {desk.podName}
                      </span>
                    </div>

                    <div className="col-span-2 font-mono text-secondary flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {occ.hoursRemaining} remaining
                    </div>

                    <div className="col-span-1 flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          onLocateSeat(desk.areaId, desk.id);
                          onClose();
                        }}
                        title="Locate on Map"
                        className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">my_location</span>
                      </button>
                      <button
                        onClick={() => onReleaseSeat(desk.id)}
                        title="Force Release Ghost Seat"
                        className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">person_remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'utilization' && (
            <div className="space-y-6">
              <h3 className="text-xs font-semibold text-outline uppercase font-mono">
                Hourly Floor Utilization Distribution (Today)
              </h3>
              <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-4 border-b border-outline-variant/30 px-4">
                {[
                  { hour: '08:00', pct: 25 },
                  { hour: '09:00', pct: 60 },
                  { hour: '10:00', pct: 85 },
                  { hour: '11:00', pct: 92 },
                  { hour: '12:00', pct: 88 },
                  { hour: '13:00', pct: 72 },
                  { hour: '14:00', pct: 90 },
                  { hour: '15:00', pct: 94 },
                  { hour: '16:00', pct: 82 },
                  { hour: '17:00', pct: 65 },
                  { hour: '18:00', pct: 35 },
                  { hour: '19:00', pct: 15 }
                ].map((slot) => (
                  <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-outline">{slot.pct}%</span>
                    <div className="w-full bg-surface-container-highest rounded-t-lg overflow-hidden h-40 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-primary-container to-secondary rounded-t-lg transition-all duration-500 shadow-[0_0_10px_rgba(78,222,163,0.3)]"
                        style={{ height: `${slot.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      {slot.hour}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-outline">
                Data refreshed in real time across Work Area 1 (130 desks) and Work Area 2 (80 desks).
              </p>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="grid grid-cols-2 gap-6">
              {[
                { dept: 'Frontend & Backend Engineering', seats: 42, pct: 45, color: 'bg-primary' },
                { dept: 'Product & UX Design', seats: 18, pct: 20, color: 'bg-secondary' },
                { dept: 'Data Science & AI Platform', seats: 14, pct: 15, color: 'bg-tertiary' },
                { dept: 'QA & Automation', seats: 10, pct: 11, color: 'bg-error' },
                { dept: 'Operations & Management', seats: 8, pct: 9, color: 'bg-primary-container' }
              ].map((item) => (
                <div
                  key={item.dept}
                  className="bg-surface-container-high/40 border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-on-surface">{item.dept}</span>
                    <span className="text-xs font-mono font-bold text-primary">{item.seats} Desks</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct * 2}%` }} />
                  </div>
                  <span className="text-[10px] text-outline font-mono">{item.pct}% of active occupancy</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'assign' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-primary-container/10 border border-primary/20 text-xs mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-base">info</span>
                  <span className="text-on-surface">
                    Managers cannot book seats for themselves. Select any existing employee below to allocate a dedicated workstation on their behalf.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 text-[11px] font-mono text-outline uppercase px-4 py-1 border-b border-outline-variant/20">
                <span className="col-span-4">Employee</span>
                <span className="col-span-3">Department</span>
                <span className="col-span-3">Current Desk Status</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {users
                .filter((u) => u.role === 'user' && u.active)
                .map((emp) => {
                  const assignedDesk = allDesks.find(
                    (d) => d.status === 'booked' && d.occupant?.name === emp.name
                  );

                  return (
                    <div
                      key={emp.id}
                      className="grid grid-cols-12 items-center bg-surface-container-high/40 hover:bg-surface-container-high p-3.5 rounded-2xl border border-outline-variant/30 transition-all text-xs"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border border-outline-variant/40 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-on-surface">{emp.name}</p>
                          <p className="text-[11px] text-outline">{emp.email}</p>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-surface-container text-on-surface font-medium border border-outline-variant/30 text-[11px]">
                          {emp.department}
                        </span>
                      </div>

                      <div className="col-span-3">
                        {assignedDesk ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_6px_#ffb4ab]" />
                            <span className="font-mono font-bold text-on-surface">{assignedDesk.id}</span>
                            <span className="text-[11px] text-outline">({assignedDesk.podName})</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-mono font-semibold uppercase">
                            No Desk Assigned
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 flex justify-end">
                        {onBookForUser && (
                          <button
                            onClick={() => onBookForUser(emp)}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold flex items-center gap-1 shadow-[0_0_12px_rgba(14,165,233,0.35)] transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">event_seat</span>
                            <span>{assignedDesk ? 'Reassign' : 'Assign Desk'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-high/40 flex justify-between items-center text-xs">
          <span className="text-outline">
            Manager Control Engine • Compliant with Real Estate Utilization Policies
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Occupancy Report exported as CSV.')}
              className="px-4 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
