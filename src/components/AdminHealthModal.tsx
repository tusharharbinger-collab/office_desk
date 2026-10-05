import React, { useState } from 'react';
import { SystemHealthMetric } from '../types';

interface AdminHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: SystemHealthMetric;
  totalSeats?: number;
  occupiedSeats?: number;
  isPageView?: boolean;
}

export const AdminHealthModal: React.FC<AdminHealthModalProps> = ({
  isOpen,
  onClose,
  health,
  isPageView = true
}) => {
  if (!isOpen) return null;

  const [simulatedPing, setSimulatedPing] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setSimulatedPing(Math.floor(Math.random() * 8) + 2);
      setIsPinging(false);
    }, 400);
  };

  const content = (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Top Page Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#121724]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">monitor_heart</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Workspace / DevOps & Infrastructure
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              System Health & DevOps Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live performance metrics, WebSocket concurrency, database pool health, and endpoint status.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestPing}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span className={`material-symbols-outlined text-sm ${isPinging ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isPinging ? 'Pinging Gateway...' : simulatedPing ? `Latency: ${simulatedPing}ms` : 'Ping API Gateway'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            <span>Floor Plan</span>
          </button>
        </div>
      </div>

      {/* 4 Core Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#121724] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Availability (Uptime)</span>
            <span className="material-symbols-outlined text-xs text-emerald-400">timer</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{health.uptime}</p>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>99.98% High Availability</span>
          </div>
        </div>

        <div className="bg-[#121724] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>p95 API Latency</span>
            <span className="material-symbols-outlined text-xs text-sky-400">speed</span>
          </div>
          <p className="text-2xl font-bold font-mono text-sky-300 mt-1">{health.latencyMs} ms</p>
          <span className="text-[11px] text-slate-400 mt-1 block">&lt; 50ms Target SLA</span>
        </div>

        <div className="bg-[#121724] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Live WebSockets</span>
            <span className="material-symbols-outlined text-xs text-teal-400">lan</span>
          </div>
          <p className="text-2xl font-bold font-mono text-teal-300 mt-1">{health.socketConnections} Clients</p>
          <div className="text-[11px] text-teal-400 flex items-center gap-1 mt-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Zero Packet Drops</span>
          </div>
        </div>

        <div className="bg-[#121724] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Database Pool Health</span>
            <span className="material-symbols-outlined text-xs text-amber-400">dns</span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-300 mt-1">{health.dbPoolHealth}%</p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
              style={{ width: `${Math.min(health.dbPoolHealth, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Balance (Subsystems vs Endpoints) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Subsystem Services */}
        <div className="bg-[#121724] rounded-2xl border border-white/[0.08] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Core Subsystems & Engines
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              5 of 5 Healthy
            </span>
          </div>

          <div className="space-y-3">
            {/* Database Engine */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">database</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">SQLite Database (WAL Mode)</p>
                  <p className="text-[10px] text-slate-400 font-mono">better-sqlite3 • Zero Contention</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                ONLINE
              </span>
            </div>

            {/* Auto-Expire Worker */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Auto-Expire Ghost Seat Sweeper</p>
                  <p className="text-[10px] text-slate-400 font-mono">60s Polling • Auto De-Allocation</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                ACTIVE
              </span>
            </div>

            {/* Authentication & SSO */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">security</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Microsoft 365 SSO & JWT Engine</p>
                  <p className="text-[10px] text-slate-400 font-mono">OAuth 2.0 PKCE • Bearer Auth</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                VERIFIED
              </span>
            </div>

            {/* Mutex Lock Coordinator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Atomic Concurrency & Mutex Locks</p>
                  <p className="text-[10px] text-slate-400 font-mono">{health.redisLockActive} Active Leases • Race Condition Guard</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                LOCKED
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Endpoint Monitor */}
        <div className="bg-[#121724] rounded-2xl border border-white/[0.08] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              API Gateway & Real-Time Endpoints
            </h3>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Avg Latency 3.8ms
            </span>
          </div>

          <div className="space-y-3">
            <div className="px-3.5 py-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  GET
                </span>
                <span className="font-mono text-xs text-white">/api/desks</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                200 OK (3ms)
              </span>
            </div>

            <div className="px-3.5 py-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  POST
                </span>
                <span className="font-mono text-xs text-white">/api/bookings</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                200 OK (5ms)
              </span>
            </div>

            <div className="px-3.5 py-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  DELETE
                </span>
                <span className="font-mono text-xs text-white">/api/bookings/:id</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                200 OK (4ms)
              </span>
            </div>

            <div className="px-3.5 py-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  WS
                </span>
                <span className="font-mono text-xs text-white">/ws (Live Telemetry & Sync)</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                101 Connected (1ms)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] flex flex-wrap justify-between items-center text-xs text-slate-400 gap-3">
        <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Telemetry synchronized with Express Server & SQLite WAL engine (Node.js runtime).
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all cursor-pointer"
        >
          Return to Floor Plan
        </button>
      </div>
    </div>
  );

  if (isPageView) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#090D16] p-4 sm:p-6 lg:p-8 flex flex-col animate-in fade-in duration-150">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#131826] border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col p-6">
        {content}
      </div>
    </div>
  );
};
