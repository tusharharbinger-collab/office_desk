// Date and Time utility helpers for SmartDesk

export interface TimeSlotOption {
  id: string;
  label: string;
  shortLabel: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
}

export const TIME_SLOTS: TimeSlotOption[] = [
  {
    id: 'full-day',
    label: 'Full Day (09:00 - 17:00)',
    shortLabel: 'Full Day',
    startTime: '09:00',
    endTime: '17:00',
    durationLabel: 'Full Day (8h)'
  },
  {
    id: 'morning',
    label: 'Morning Shift (09:00 - 13:00)',
    shortLabel: 'Morning',
    startTime: '09:00',
    endTime: '13:00',
    durationLabel: 'Morning (4h)'
  },
  {
    id: 'afternoon',
    label: 'Afternoon Shift (13:00 - 17:00)',
    shortLabel: 'Afternoon',
    startTime: '13:00',
    endTime: '17:00',
    durationLabel: 'Afternoon (4h)'
  },
  {
    id: 'evening',
    label: 'Evening Shift (17:00 - 21:00)',
    shortLabel: 'Evening',
    startTime: '17:00',
    endTime: '21:00',
    durationLabel: 'Evening (4h)'
  },
  {
    id: 'custom',
    label: 'Custom Time Window',
    shortLabel: 'Custom',
    startTime: '10:00',
    endTime: '15:00',
    durationLabel: 'Custom Window'
  }
];

export function getTodayISODate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return 'Today';
  const today = getTodayISODate();
  const tomorrow = getTomorrowISODate();

  if (isoDate === today) {
    const d = new Date();
    return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  if (isoDate === tomorrow) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `Tomorrow, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  // Parse YYYY-MM-DD safely
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return isoDate;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}
