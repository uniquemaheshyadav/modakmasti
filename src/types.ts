export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'HOW_TO_PLAY' | 'LEADERBOARD';

export type ItemType = 
  | 'NORMAL_MODAK'
  | 'GOLDEN_MODAK'
  | 'DIAMOND_MODAK'
  | 'BLESSING_MODAK'
  | 'COCONUT'
  | 'HEAVY_STONE'
  | 'DIYA'
  | 'FLOWER'
  | 'MAGNET'
  | 'SLOW_TIME'
  | 'SHIELD'
  | 'DOUBLE_SCORE';

export interface FallingItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  points: number;
  isHazard: boolean;
  isPowerUp: boolean;
  color: string;
  sparkleTimer?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'sparkle' | 'petal' | 'star';
  rotation?: number;
  rotationSpeed?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export type FestivalEvent = 'NONE' | 'DHOL_RUSH' | 'MODAK_RAIN' | 'DIYA_SHOWER' | 'FLOWER_SHOWER';

export interface ActivePowerUps {
  magnet: number; // remaining seconds
  slowTime: number;
  shield: boolean;
  doubleScore: number;
  basketSizeBoost: number;
  speedBoost: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  rollId?: string;
  campus: string; // Canonical campus field
  campusId?: string; // backwards compatibility
  campusName?: string; // backwards compatibility
  avatarIcon: string;
}

export interface LeaderboardEntry {
  id: string;
  userId?: string;
  user_id?: string;
  game?: string;
  playerName: string;
  rollId?: string;
  campus: string; // Canonical campus field
  campusId?: string; // backwards compatibility
  campusName?: string; // backwards compatibility
  score: number;
  survivalTime: number; // in seconds
  modaksCaught: number;
  bestCombo: number;
  goldenModaks: number;
  date: string;
  timestamp: number;
  createdAt?: number;
}

export interface GameStats {
  score: number;
  survivalTime: number;
  modaksCaught: number;
  bestCombo: number;
  currentCombo: number;
  streak: number;
  goldenCaught: number;
  diamondsCaught: number;
  lives: number;
  maxLives: number;
  feverGauge: number; // 0 to 100
  isFever: boolean;
  feverTimeRemaining: number;
  personalBest: number;
}

export interface Campus {
  id: string;
  name: string;
  city: string;
  state: string;
  shortCode: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}
