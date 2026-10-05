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

export function addDaysToDate(isoDate: string, days: number): string {
  const parts = isoDate.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isWeekend(isoDate: string): boolean {
  const parts = isoDate.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

export function getWeekdayShort(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function generateDateRange(startDate: string, endDate: string, excludeWeekends: boolean = false): string[] {
  if (!startDate || !endDate) return [startDate || getTodayISODate()];
  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  const result: string[] = [];
  let curr = startDate;
  let safetyLimit = 60; // Max 60 days to prevent excessive loops

  while (curr <= endDate && safetyLimit-- > 0) {
    if (!excludeWeekends || !isWeekend(curr)) {
      result.push(curr);
    }
    curr = addDaysToDate(curr, 1);
  }

  return result.length > 0 ? result : [startDate];
}

export function getNextWorkdays(startDate: string, count: number = 3): string[] {
  const result: string[] = [];
  let curr = startDate || getTodayISODate();
  let safety = 30;

  while (result.length < count && safety-- > 0) {
    if (!isWeekend(curr)) {
      result.push(curr);
    }
    curr = addDaysToDate(curr, 1);
  }

  return result;
}

export function getWorkweekDates(startDate?: string): string[] {
  const base = startDate || getTodayISODate();
  const parts = base.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const currentDay = d.getDay(); // 0 is Sun, 1 is Mon, 5 is Fri, 6 is Sat

  // Find Monday of this week (or next Monday if weekend)
  let diffToMonday = 1 - currentDay;
  if (currentDay === 0) diffToMonday = 1; // if Sun, next Mon
  if (currentDay === 6) diffToMonday = 2; // if Sat, next Mon

  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const w = new Date(mon);
    w.setDate(mon.getDate() + i);
    const yr = w.getFullYear();
    const mo = String(w.getMonth() + 1).padStart(2, '0');
    const da = String(w.getDate()).padStart(2, '0');
    dates.push(`${yr}-${mo}-${da}`);
  }
  return dates;
}

export function calculateDurationHours(startTime: string, endTime: string): number {
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0.5, Math.round((diffMinutes / 60) * 10) / 10);
  } catch {
    return 8;
  }
}

export function formatDurationLabel(startTime: string, endTime: string): string {
  const hours = calculateDurationHours(startTime, endTime);
  return `${hours}h (${startTime} - ${endTime})`;
}


