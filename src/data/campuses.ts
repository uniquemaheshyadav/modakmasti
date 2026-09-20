import { Campus, LeaderboardEntry } from '../types';

export const CAMPUS_PLACEHOLDER = 'Select campus';

/**
 * Centralized list of all 42 unique campuses across the Ganesh Chaturthi game platform.
 * SGU (Sanjay Ghodawat University,MH) is strictly placed at the very top as requested,
 * followed by the official regional order.
 */
export const campuses: readonly string[] = [
  // SGU at the top
  'Sanjay Ghodawat University,MH',

  // KARNATAKA
  'Yenepoya Mangalore Campus,KA',
  'Yenepoya Bangalore Campus,KA',
  'S-VYASA (Deemed to be University),KA',
  "St. Peter's Institute of Higher Education and Research,KA",

  // ANDHRA PRADESH
  'GMRIT,AP',
  'NRI,AP',
  'Annamacharya University,AP',
  'NSRIT,AP',
  'Lingayas Institute of Management and Technology (LIMAT),AP',
  'Bharatiya Engineering Science and Technology Innovation University,AP',
  'MR Deemed to be University,AP',
  'Chlapathi(CITY),AP',
  'VISAKHA INSTITUTE OF ENGINEERING & TECHNOLOGY,AP',
  'MVR College of Engineering & Technology,AP',

  // HARYANA
  'Geeta University,HR',
  'Sushant University,HR',
  "Lingaya's Vidyapeeth,HR",

  // RAJASTHAN
  'Vivekananda Global University,RJ',

  // MADHYA PRADESH
  'Scope Global Skills University,MP',

  // ODISHA
  'Sri Sri University,OD',

  // UTTAR PRADESH
  'Subharti University,UP',
  'Sanskriti University,UP',
  'Noida International University,UP',
  'T. S Mishra University,UP',

  // TAMIL NADU
  'Crescent University,TN',
  "St. Peter's Institute of Higher Education and Research,TN",
  'AMET University (Chennai),TN',
  'Joy University,TN',
  'SNS College of Technology,TN',
  'PK Das Deemed to be university,TN',
  'Bharath Institute of Higher Education and Research Deemed to be University,TN',
  'Takshila University,TN',

  // TELANGANA
  'Malla Reddy University,TG',
  'SMR University,TG',
  'Chaitanya University,TG',
  'Aurora University,TG',
  'KKH,TG',
  'MRV,TG',

  // MAHARASHTRA (without SGU as it was already placed at the top)
  'Sandip University,MH',
  'Alard University,MH',
  'Ajeenkya DY Patil University,MH',
] as const;

// Helper to convert comma state code to full state name if needed
const stateMap: Record<string, string> = {
  MH: 'Maharashtra',
  KA: 'Karnataka',
  AP: 'Andhra Pradesh',
  HR: 'Haryana',
  RJ: 'Rajasthan',
  MP: 'Madhya Pradesh',
  OD: 'Odisha',
  UP: 'Uttar Pradesh',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
};

// Map each campus string into structured Campus object
export const CAMPUSES: Campus[] = campuses.map((campusStr) => {
  const parts = campusStr.split(',');
  const stateCode = parts.length > 1 ? parts[parts.length - 1].trim() : 'IN';
  const nameOnly = parts[0].trim();
  const slug = campusStr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    id: campusStr, // use exact campus string or slug
    name: campusStr,
    city: nameOnly,
    state: stateMap[stateCode] || stateCode,
    shortCode: stateCode,
  };
});

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    playerName: 'Aarav Deshmukh',
    rollId: 'MH24-SGU-019',
    campus: 'Sanjay Ghodawat University,MH',
    campusId: 'Sanjay Ghodawat University,MH',
    campusName: 'Sanjay Ghodawat University,MH',
    score: 4820,
    survivalTime: 88.4,
    modaksCaught: 112,
    bestCombo: 14,
    goldenModaks: 9,
    date: 'Today, 2:15 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'lead-2',
    playerName: 'Tanvi Kulkarni',
    rollId: 'KA24-YEN-042',
    campus: 'Yenepoya Mangalore Campus,KA',
    campusId: 'Yenepoya Mangalore Campus,KA',
    campusName: 'Yenepoya Mangalore Campus,KA',
    score: 4350,
    survivalTime: 79.1,
    modaksCaught: 98,
    bestCombo: 11,
    goldenModaks: 7,
    date: 'Today, 11:30 AM',
    timestamp: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: 'lead-3',
    playerName: 'Rohan Patil',
    rollId: 'AP24-GMR-105',
    campus: 'GMRIT,AP',
    campusId: 'GMRIT,AP',
    campusName: 'GMRIT,AP',
    score: 3910,
    survivalTime: 72.8,
    modaksCaught: 86,
    bestCombo: 9,
    goldenModaks: 6,
    date: 'Today, 9:45 AM',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: 'lead-4',
    playerName: 'Ananya Joshi',
    rollId: 'HR24-GEE-078',
    campus: 'Geeta University,HR',
    campusId: 'Geeta University,HR',
    campusName: 'Geeta University,HR',
    score: 3420,
    survivalTime: 65.2,
    modaksCaught: 74,
    bestCombo: 8,
    goldenModaks: 5,
    date: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
  },
  {
    id: 'lead-5',
    playerName: 'Pranav Sawant',
    rollId: 'MH24-SAN-221',
    campus: 'Sandip University,MH',
    campusId: 'Sandip University,MH',
    campusName: 'Sandip University,MH',
    score: 3100,
    survivalTime: 59.7,
    modaksCaught: 68,
    bestCombo: 7,
    goldenModaks: 4,
    date: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'lead-6',
    playerName: 'Meera Iyer',
    rollId: 'TN24-CRE-014',
    campus: 'Crescent University,TN',
    campusId: 'Crescent University,TN',
    campusName: 'Crescent University,TN',
    score: 2850,
    survivalTime: 54.0,
    modaksCaught: 62,
    bestCombo: 6,
    goldenModaks: 3,
    date: '2 days ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'lead-7',
    playerName: 'Aditya Reddy',
    rollId: 'TG24-MAL-330',
    campus: 'Malla Reddy University,TG',
    campusId: 'Malla Reddy University,TG',
    campusName: 'Malla Reddy University,TG',
    score: 2480,
    survivalTime: 49.3,
    modaksCaught: 55,
    bestCombo: 5,
    goldenModaks: 3,
    date: '2 days ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
  },
];
