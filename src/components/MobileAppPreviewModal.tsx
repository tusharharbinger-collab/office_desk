import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface MobileAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const MobileAppPreviewModal: React.FC<MobileAppPreviewModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return window.location.origin || 'http://localhost:5173';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [iframeKey, setIframeKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerToast("Reloading Live Android WebView Application...");
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDownloadApk = () => {
    const apkUrl = `${window.location.origin}/downloads/smartdesk-user-app.apk`;
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'smartdesk-user-app.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥 Downloading Android APK (smartdesk-user-app.apk)...");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row max-h-[95vh]">
        
        {/* Left / Main Zone: Real Live Mobile Device Frame with Embedded IFrame */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center bg-[#020617] relative min-h-[500px] overflow-y-auto">
          
          {/* Controls Bar above Smartphone */}
          <div className="w-full max-w-[380px] flex items-center justify-between mb-3 px-2 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-white">Live Mobile WebView</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeviceOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 border border-slate-700"
                title="Toggle Orientation"
              >
                <span className="material-symbols-outlined text-sm">screen_rotation</span>
                <span className="capitalize">{deviceOrientation}</span>
              </button>
              <button
                onClick={handleRefresh}
                className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-mono flex items-center gap-1 border border-sky-400/30"
                title="Reload WebView"
              >
                <span className="material-symbols-outlined text-sm animate-spin-hover">refresh</span>
                <span>Reload</span>
              </button>
            </div>
          </div>

          {/* Smartphone Hardware Frame Container */}
          <div className={`transition-all duration-300 bg-slate-950 rounded-[45px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden ${
            deviceOrientation === 'portrait' 
              ? 'w-[360px] h-[660px]' 
              : 'w-[640px] h-[360px]'
          }`}>
            
            {/* Top Camera Notch & Ear Speaker */}
            {deviceOrientation === 'portrait' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-slate-950 rounded-b-2xl z-40 flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div>
                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              </div>
            )}

            {/* Android Status Bar */}
            <div className="h-6 bg-[#090D16] text-slate-300 text-[10px] flex items-center justify-between px-6 pt-1 select-none font-mono z-30">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="material-symbols-outlined text-[12px] text-emerald-400">wifi</span>
                <span className="material-symbols-outlined text-[12px] text-sky-400">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[12px] text-emerald-400">battery_full</span>
              </div>
            </div>

            {/* Android Custom App Bar */}
            <div className="h-11 bg-[#1E293B] border-b border-slate-700/80 px-3 flex items-center justify-between z-30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">SmartDesk Android User</h4>
                  <p className="text-[9px] text-sky-400 font-mono truncate max-w-[170px]">Role: Employee • Live WebView</p>
                </div>
              </div>
              <button 
                onClick={handleDownloadApk}
                className="px-2 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                title="Download APK File"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                <span>APK</span>
              </button>
            </div>

            {/* Live Interactive IFrame Display Screen */}
            <div className="flex-1 bg-[#090D16] relative overflow-hidden z-20">
              {isRefreshing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center">
                  <div className="bg-slate-900 border border-slate-700 text-sky-400 text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    <span>Syncing Web View...</span>
                  </div>
                </div>
              )}

              {/* REAL LIVE APPLICATION IFRAME */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={serverUrl}
                title="SmartDesk Mobile WebView Live Demo"
                className="w-full h-full border-0 bg-[#090D16] select-auto"
                allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
              />
            </div>

            {/* Native Android Bottom Action Bar */}
            <div className="h-11 bg-[#1E293B] border-t border-slate-700/80 flex items-center justify-around z-30 select-none">
              <button 
                onClick={() => {
                  try { iframeRef.current?.contentWindow?.history.back(); } catch {}
                  triggerToast("Android Back Button Pressed");
                }} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Back"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
              </button>
              <button 
                onClick={handleRefresh} 
                className="text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="Home / Refresh"
              >
                <span className="material-symbols-outlined text-base">home</span>
              </button>
              <button 
                onClick={handleRefresh} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reload Portal"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
              <button 
                onClick={handleDownloadApk} 
                className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="Download APK Package"
              >
                <span className="material-symbols-outlined text-base">download</span>
              </button>
            </div>

            {/* Android Navigation Gesture Bar */}
            <div className="h-3 bg-[#090D16] flex items-center justify-center z-30">
              <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
            </div>

            {/* Native Toast Alert Notification */}
            {toastMessage && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-800/95 text-slate-100 border border-slate-700 text-[10px] font-medium px-4 py-1.5 rounded-full shadow-2xl z-50 whitespace-nowrap animate-in fade-in zoom-in-95">
                💬 {toastMessage}
              </div>
            )}

          </div>

        </div>

        {/* Right Zone: Linked Web & APK Controls & Information */}
        <div className="w-full md:w-88 bg-[#0F172A] p-6 border-t md:border-t-0 md:border-l border-slate-700/70 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400 text-xl">phone_android</span>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Mobile & APK Hub</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">Linked Web & Native Client</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The embedded screen on the left is running the <strong>exact live web application</strong> inside an interactive mobile viewport! All floor plan bookings, seat check-ins, and user actions sync in real-time.
            </p>

            {/* Primary APK Download Action Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#131B2E] border border-sky-500/30 mb-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">android</span>
                  <span>Android APK Package</span>
                </span>
                <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                  v1.0.0
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-tight">
                Install this Android app on any phone or emulator. It connects directly to your web application server!
              </p>

              <button
                onClick={handleDownloadApk}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">file_download</span>
                <span>Download Android APK File</span>
              </button>

              <a
                href="/downloads/smartdesk-user-app.apk"
                download="smartdesk-user-app.apk"
                className="block text-center text-[10px] font-mono text-sky-400 hover:underline"
              >
                Direct Link: /downloads/smartdesk-user-app.apk
              </a>
            </div>

            {/* Technical Integration Specs */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Android Project Folder</p>
                <p className="text-sky-300 font-mono text-[11px] truncate mt-0.5">android_user_app/app/src/main/</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Live Web Server Target</p>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={handleRefresh}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>Sync Web &amp; APK State</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
            >
              Close Hub
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
