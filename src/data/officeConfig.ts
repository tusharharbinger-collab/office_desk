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
    campusName: 'Siddhant Corporate Center',
    tagline: 'Multi-Floor Architectural Campus',
    badge: 'New Campus',
    address: 'Bhusari Colony, Paud Road, Pune',
    totalDesks: 156,
    totalRooms: 6,
    areas: [
      { id: 'area-1', name: 'Work Area 1', deskCount: 96, label: 'Area 1 (96 Seats)' },
      { id: 'area-2', name: 'Work Area 2', deskCount: 60, label: 'Area 2 (60 Seats)' }
    ],
    siddhantFloors: [
      {
        id: 'finance_legal',
        name: 'Finance & Legal Floor',
        pdfFileName: 'CON 01_R05_Finance and Legal_.pdf',
        imagePath: '/floormaps/finance_legal.png',
        deskCount: 26,
        badge: 'Executive & Finance'
      },
      {
        id: '2nd_floor_a_wing',
        name: '2nd Floor A Wing',
        pdfFileName: 'Harbinger_Siddhant_2A.pdf',
        imagePath: '/floormaps/2nd_floor_a_wing.png',
        deskCount: 30,
        badge: 'Wing A'
      },
      {
        id: '2nd_floor_b_wing',
        name: '2nd Floor B Wing',
        pdfFileName: 'Harbinger_Siddhant_2B.pdf',
        imagePath: '/floormaps/2nd_floor_b_wing.png',
        deskCount: 35,
        badge: 'Wing B'
      },
      {
        id: '3rd_floor_a_wing',
        name: '3rd Floor A Wing',
        pdfFileName: 'Harbinger_Siddhant_3A.pdf',
        imagePath: '/floormaps/3rd_floor_a_wing.png',
        deskCount: 28,
        badge: 'Wing A'
      },
      {
        id: '3rd_floor_b_wing',
        name: '3rd Floor B Wing',
        pdfFileName: 'Harbinger_Siddhant_3A.pdf',
        imagePath: '/floormaps/3rd_floor_a_wing.png',
        deskCount: 22,
        badge: 'Wing B'
      },
      {
        id: 'ground_b',
        name: 'Ground Floor B Wing',
        pdfFileName: 'Harbinger_Siddhant_Ground_B.pdf',
        imagePath: '/floormaps/ground_b.png',
        deskCount: 15,
        badge: 'Ground Wing B'
      }
    ],
    blueprintStatus: 'active',
    blueprintNotice: 'Full Architectural CAD Floor Maps Active • Select floor wing from dropdown'
  }
};

export const OFFICE_LIST: OfficeConfig[] = Object.values(OFFICES);

export function getOfficeConfig(officeId?: OfficeLocation | string): OfficeConfig {
  if (officeId === 'siddhant') return OFFICES['siddhant'];
  return OFFICES['global-port'];
}
