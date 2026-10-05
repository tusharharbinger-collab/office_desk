import React, { useState, useEffect } from 'react';
import { EmailNotification, UserProfile } from '../types';
import { api } from '../services/api';

interface OutlookEmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const OutlookEmailsModal: React.FC<OutlookEmailsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'seat_booking' | 'room_booking'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await api.getEmailNotifications();
      setEmails(data);
      if (data.length > 0) {
        // Fetch detailed version for first email
        const detailed = await api.getEmailNotification(data[0].id).catch(() => data[0]);
        setSelectedEmail(detailed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = async (email: EmailNotification) => {
    if (email.html_content) {
      setSelectedEmail(email);
    } else {
      try {
        const detailed = await api.getEmailNotification(email.id);
        setSelectedEmail(detailed);
      } catch {
        setSelectedEmail(email);
      }
    }
  };

  const handleResend = async () => {
    if (!selectedEmail) return;
    try {
      setIsResending(true);
      const res = await api.resendOutlookEmail(selectedEmail.booking_id);
      setActionMessage(res.message || 'Outlook notification re-sent successfully!');
      setTimeout(() => setActionMessage(null), 3500);
      loadEmails();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to resend');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  const filteredEmails = emails.filter((em) => {
    const matchesQuery =
      em.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      em.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      em.booking_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || em.type === filterType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#0B0F17] border border-white/[0.12] rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#111726] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Microsoft 4-Color Grid Icon */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
              <div className="grid grid-cols-2 gap-1 w-5 h-5">
                <div className="bg-[#f25022] rounded-xs"></div>
                <div className="bg-[#7fba00] rounded-xs"></div>
                <div className="bg-[#00a4ef] rounded-xs"></div>
                <div className="bg-[#ffb900] rounded-xs"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Microsoft Outlook Email & Calendar Outbox
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatic confirmation emails and .ics calendar invites dispatched to corporate Outlook accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://outlook.office.com/calendar/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0078D4]/20 hover:bg-[#0078D4]/30 border border-[#0078D4]/40 text-sky-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Open Outlook Web</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action toast */}
        {actionMessage && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Main Content Split View */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Panel: Email Feed */}
          <div className="w-full md:w-80 lg:w-96 border-r border-white/[0.08] bg-[#0c101a] flex flex-col flex-shrink-0">
            {/* Search & Filter Toolbar */}
            <div className="p-3 border-b border-white/[0.08] space-y-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search Outlook emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#131926] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center font-medium ${
                    filterType === 'all'
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({emails.length})
                </button>
                <button
                  onClick={() => setFilterType('room_booking')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center font-medium ${
                    filterType === 'room_booking'
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rooms
                </button>
                <button
                  onClick={() => setFilterType('seat_booking')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center font-medium ${
                    filterType === 'seat_booking'
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Desks
                </button>
              </div>
            </div>

            {/* Email Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-white/[0.04]">
              {loading && emails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-2xl animate-spin text-sky-400 mb-2 block">
                    sync
                  </span>
                  Fetching Outlook messages...
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No Outlook emails found.
                </div>
              ) : (
                filteredEmails.map((em) => {
                  const isSelected = selectedEmail?.id === em.id;
                  const isRoom = em.type === 'room_booking';

                  return (
                    <div
                      key={em.id}
                      onClick={() => handleSelectEmail(em)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-400/40 shadow-sm'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0078D4]/20 text-sky-300 border border-[#0078D4]/30 font-semibold">
                          {isRoom ? 'Meeting Room' : 'Desk Booking'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(em.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                        {em.subject}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[180px] text-slate-300 font-mono">
                          To: {em.recipient_email}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">✓ Sent</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Rendered Outlook Email Preview */}
          <div className="flex-1 flex flex-col bg-[#090D16] min-w-0 overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Email Metadata Ribbon */}
                <div className="p-4 bg-[#111726]/90 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Recipient: <strong className="text-slate-200">{selectedEmail.recipient_name}</strong> ({selectedEmail.recipient_email})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">Booking ID: {selectedEmail.booking_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download .ics Button */}
                    <a
                      href={api.getCalendarIcsUrl(selectedEmail.booking_id)}
                      download={`smartdesk-outlook-${selectedEmail.booking_id}.ics`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold transition-all cursor-pointer"
                      title="Download calendar file to add into Microsoft Outlook desktop or mobile"
                    >
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                      <span>Add to Outlook (.ics)</span>
                    </a>

                    {/* Resend Button */}
                    <button
                      onClick={handleResend}
                      disabled={isResending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      title="Re-send email to recipient Outlook account"
                    >
                      <span className={`material-symbols-outlined text-sm ${isResending ? 'animate-spin' : ''}`}>
                        refresh
                      </span>
                      <span>{isResending ? 'Sending...' : 'Re-send Email'}</span>
                    </button>
                  </div>
                </div>

                {/* Email HTML Frame Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070A10]">
                  <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-white">
                    {selectedEmail.html_content ? (
                      <div
                        className="outlook-preview-body"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                      />
                    ) : (
                      <div className="p-8 text-center text-slate-600 text-sm">
                        Loading email message body...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">
                  mark_email_read
                </span>
                <p className="text-sm font-medium">Select an Outlook confirmation message to preview</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Whenever you or an admin reserve a desk or meeting room, an official Microsoft 365 Outlook invitation is sent automatically.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
