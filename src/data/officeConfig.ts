import { OfficeLocation, OfficeConfig } from '../types';

export const OFFICES: Record<OfficeLocation, OfficeConfig> = {
  'global-port': {
    id: 'global-port',
    name: 'Global Port',
    campusName: 'Global Port Innovation Campus',
    tagline: 'High-Density Engineering & Tech Center',
    badge: 'Primary Campus',
    address: 'Tower 4, Global Port Tech Park, Phase II',
    totalDesks: 210,
    totalRooms: 8,
    areas: [
      { id: 'area-1', name: 'Work Area 1', deskCount: 130, label: 'Area 1 (130 Seats)' },
      { id: 'area-2', name: 'Work Area 2', deskCount: 80, label: 'Area 2 (80 Seats)' }
    ],
    blueprintStatus: 'active',
    blueprintNotice: 'Full Architectural Floor Plan Active • Work Areas 1 & 2 Blueprint Live'
  },
  'siddhant': {
    id: 'siddhant',
    name: 'Siddhant',
    campusName: 'Siddhant Business Center',
    tagline: 'Modern Modular Collaboration Campus',
    badge: 'New Campus',
    address: 'Siddhant Corporate Towers, Floor 3 & 4',
    totalDesks: 120,
    totalRooms: 4,
    areas: [
      { id: 'area-1', name: 'Work Area 1', deskCount: 80, label: 'Area 1 (80 Seats)' },
      { id: 'area-2', name: 'Work Area 2', deskCount: 40, label: 'Area 2 (40 Seats)' }
    ],
    blueprintStatus: 'pending',
    blueprintNotice: 'Floor Plan Blueprint Awaiting Architectural Import • Interactive Pod Grid Live'
  }
};

export const OFFICE_LIST: OfficeConfig[] = Object.values(OFFICES);

export function getOfficeConfig(officeId?: OfficeLocation | string): OfficeConfig {
  if (officeId === 'siddhant') return OFFICES['siddhant'];
  return OFFICES['global-port'];
}
