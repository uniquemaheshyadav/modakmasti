import { Achievement, LeaderboardEntry, PlayerProfile } from '../types';
import { CAMPUSES, INITIAL_LEADERBOARD } from '../data/campuses';
import {
  savePlayerToFirestore,
  saveScoreToFirestore,
  fetchLeaderboardFromFirestore,
} from './firebase';

const PROFILE_KEY = 'ganesh_festival_player_profile';
const LEADERBOARD_KEY = 'modak_catch_leaderboard_v1';
const RAW_SCORES_KEY = 'modak_catch_score_history_v1';
const PERSONAL_BEST_KEY = 'modak_catch_personal_best_v1';
const ACHIEVEMENTS_KEY = 'modak_catch_achievements_v1';
const SOUND_ENABLED_KEY = 'modak_catch_sound_enabled';

export const DEFAULT_PROFILE: PlayerProfile = {
  id: 'player-' + Math.random().toString(36).substring(2, 9),
  name: 'Festival Champion',
  rollId: '',
  campus: '',
  campusId: '',
  campusName: '',
  avatarIcon: '🪔',
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_catch',
    title: 'First Blessing',
    description: 'Catch your very first modak.',
    icon: '🍬',
    unlocked: false,
  },
  {
    id: 'sweet_streak',
    title: 'Sweet Streak',
    description: 'Catch 10 consecutive modaks without a miss or hazard.',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'modak_master',
    title: 'Modak Master',
    description: 'Reach a ×5 combo multiplier.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'golden_touch',
    title: 'Golden Touch',
    description: 'Catch 5 golden modaks in a single run.',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'diamond_blessing',
    title: 'Divine Radiance',
    description: 'Catch an ultra-rare Diamond Modak.',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'festival_fever',
    title: 'Festival Fever',
    description: 'Trigger Modak Fever or survive a Dhol Rush.',
    icon: '🥁',
    unlocked: false,
  },
  {
    id: 'divine_shield',
    title: 'Vighnaharta Shield',
    description: 'Use the Blessing Shield to absorb a falling hazard.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'modak_legend',
    title: 'Modak Legend',
    description: 'Score 5,000+ points in a single run.',
    icon: '👑',
    unlocked: false,
  },
];

/**
 * Update any existing leaderboard entries for a given player when they update their profile
 */
export const updatePlayerCampusInLeaderboard = (
  playerName: string,
  rollId: string | undefined,
  campus: string
): void => {
  if (!campus) return;
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return;
    const list = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(list)) return;

    let modified = false;
    const updated = list.map((entry) => {
      const matchesName =
        entry.playerName &&
        playerName &&
        entry.playerName.trim().toLowerCase() === playerName.trim().toLowerCase();
      const matchesRoll =
        rollId &&
        entry.rollId &&
        entry.rollId.trim().toLowerCase() === rollId.trim().toLowerCase();
      const hasCoep =
        (entry.campus && entry.campus.includes('COEP')) ||
        (entry.campusName && entry.campusName.includes('COEP'));

      if (matchesRoll || matchesName || (hasCoep && matchesName)) {
        modified = true;
        return {
          ...entry,
          campus,
          campusName: campus,
          campusId: campus,
          rollId: rollId || entry.rollId || '',
        };
      }
      return entry;
    });

    if (modified) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Failed to update leaderboard campus', e);
  }
};

export const getStoredProfile = (): PlayerProfile => {
  let profile: PlayerProfile = { ...DEFAULT_PROFILE };

  // 1. Try dedicated profile keys
  const profileKeys = [
    PROFILE_KEY,
    'mooshika_modak_dash_profile',
    'player_profile',
    'user_profile',
    'ganesh_game_profile',
  ];

  for (const key of profileKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Detect canonical campus or legacy fields
          let candidateCampus =
            parsed.campus ||
            parsed.campusName ||
            parsed.campusId ||
            parsed.college ||
            parsed.university ||
            parsed.school ||
            '';

          // Strictly strip any hardcoded stale COEP fallback
          if (
            typeof candidateCampus === 'string' &&
            (candidateCampus.includes('COEP') || candidateCampus === 'coep-pune')
          ) {
            candidateCampus = '';
          }

          profile = {
            id: parsed.id || profile.id,
            name: parsed.name || parsed.displayName || parsed.playerName || profile.name,
            rollId: parsed.rollId || parsed.roll || parsed.roll_id || profile.rollId,
            campus: candidateCampus || profile.campus,
            campusId: candidateCampus || profile.campusId,
            campusName: candidateCampus || profile.campusName,
            avatarIcon: parsed.avatarIcon || profile.avatarIcon,
          };
          if (candidateCampus) {
            break;
          }
        }
      }
    } catch (e) {
      // continue checking
    }
  }

  // 2. Fallback to individual shared localStorage keys if still unset
  try {
    const fallbackName =
      localStorage.getItem('displayName') ||
      localStorage.getItem('player_name') ||
      localStorage.getItem('playerName');
    if (fallbackName && fallbackName.trim()) {
      profile.name = fallbackName.trim();
    }

    const fallbackRoll =
      localStorage.getItem('rollId') ||
      localStorage.getItem('roll_id') ||
      localStorage.getItem('roll') ||
      localStorage.getItem('player_roll_id');
    if (fallbackRoll && fallbackRoll.trim()) {
      profile.rollId = fallbackRoll.trim();
    }

    let fallbackCampus =
      localStorage.getItem('campus') ||
      localStorage.getItem('player_campus') ||
      localStorage.getItem('campusName') ||
      localStorage.getItem('selected_campus') ||
      localStorage.getItem('college') ||
      localStorage.getItem('university') ||
      '';

    if (
      fallbackCampus &&
      (fallbackCampus.includes('COEP') || fallbackCampus === 'coep-pune')
    ) {
      fallbackCampus = '';
    }

    if (fallbackCampus && fallbackCampus.trim()) {
      profile.campus = fallbackCampus.trim();
      profile.campusId = fallbackCampus.trim();
      profile.campusName = fallbackCampus.trim();
    }
  } catch (e) {
    console.warn('Error reading fallback profile values from localStorage', e);
  }

  // Final sanity check: ensure COEP never survives in canonical profile
  if (profile.campus && profile.campus.includes('COEP')) {
    profile.campus = '';
    profile.campusId = '';
    profile.campusName = '';
  }

  return profile;
};

export const saveStoredProfile = (profile: PlayerProfile): void => {
  try {
    const canonicalCampus = (
      profile.campus ||
      profile.campusName ||
      profile.campusId ||
      ''
    ).trim();

    const cleanProfile: PlayerProfile = {
      ...profile,
      campus: canonicalCampus,
      campusName: canonicalCampus,
      campusId: canonicalCampus,
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile));

    // Synchronize to shared platform keys for compatibility with all games
    if (cleanProfile.name) {
      localStorage.setItem('displayName', cleanProfile.name);
      localStorage.setItem('player_name', cleanProfile.name);
      localStorage.setItem('playerName', cleanProfile.name);
    }
    if (canonicalCampus) {
      localStorage.setItem('campus', canonicalCampus);
      localStorage.setItem('player_campus', canonicalCampus);
      localStorage.setItem('campusName', canonicalCampus);
      localStorage.setItem('selected_campus', canonicalCampus);
      // Explicitly overwrite legacy college keys to avoid stale COEP leakage
      localStorage.setItem('college', canonicalCampus);
      localStorage.setItem('university', canonicalCampus);
    }
    if (cleanProfile.rollId) {
      localStorage.setItem('rollId', cleanProfile.rollId);
      localStorage.setItem('roll_id', cleanProfile.rollId);
      localStorage.setItem('player_roll_id', cleanProfile.rollId);
    }

    // Mirror to other platform profile keys
    const otherKeys = [
      'mooshika_modak_dash_profile',
      'player_profile',
      'user_profile',
      'ganesh_game_profile',
    ];
    for (const k of otherKeys) {
      try {
        localStorage.setItem(k, JSON.stringify(cleanProfile));
      } catch (e) {}
    }

    // Update existing leaderboard entries for this player so their campus updates immediately
    updatePlayerCampusInLeaderboard(cleanProfile.name, cleanProfile.rollId, canonicalCampus);

    // Synchronize to Firebase Firestore database in background
    savePlayerToFirestore(cleanProfile).catch((err) =>
      console.warn('Firestore player sync warning:', err)
    );
  } catch (e) {
    console.warn('Failed to save profile', e);
  }
};

/**
 * Retrieve raw historical score attempts (without player deduplication)
 * Preserves all attempts for history, statistics, and cloud synchronization.
 */
export const getRawScoreHistory = (): LeaderboardEntry[] => {
  try {
    const rawHistory = localStorage.getItem(RAW_SCORES_KEY);
    if (rawHistory) {
      const parsed = JSON.parse(rawHistory) as LeaderboardEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const rawLead = localStorage.getItem(LEADERBOARD_KEY);
    if (rawLead) {
      const parsed = JSON.parse(rawLead) as LeaderboardEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read score history', e);
  }
  return INITIAL_LEADERBOARD;
};

export const getPersonalBest = (): number => {
  let best = 0;
  try {
    const raw = localStorage.getItem(PERSONAL_BEST_KEY);
    if (raw) {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) best = num;
    }
  } catch (e) {
    console.warn('Failed to read personal best', e);
  }

  // Verify against all attempts by current player in score history
  try {
    const currentProfile = getStoredProfile();
    const rawList = getRawScoreHistory();
    for (const attempt of rawList) {
      if (attempt.game && attempt.game !== 'modak-masti' && attempt.game !== 'modak-catch') continue;
      const uid = (attempt.userId || attempt.user_id || '').trim();
      const rid = (attempt.rollId || '').trim();
      const isPlayer =
        (uid && currentProfile.id && uid.toLowerCase() === currentProfile.id.toLowerCase()) ||
        (rid && currentProfile.rollId && rid.toLowerCase() === currentProfile.rollId.toLowerCase()) ||
        (attempt.playerName && currentProfile.name && attempt.playerName.trim().toLowerCase() === currentProfile.name.trim().toLowerCase());

      if (isPlayer && attempt.score > best) {
        best = attempt.score;
      }
    }
  } catch (e) {
    // Continue with current best
  }

  return best;
};

export const savePersonalBest = (score: number): number => {
  const current = getPersonalBest();
  if (score > current) {
    try {
      localStorage.setItem(PERSONAL_BEST_KEY, score.toString());
    } catch (e) {
      console.warn('Failed to save personal best', e);
    }
    return score;
  }
  return current;
};

export interface AggregateLeaderboardOptions {
  campus?: string;
  timeWindowMs?: number; // e.g. for TODAY
  searchQuery?: string;
  game?: string; // defaults to 'modak-masti'
}

/**
 * Resolves a stable player identifier for grouping.
 * Priority:
 * 1. user_id if authentication/identity exists
 * 2. Otherwise roll_id
 * 3. Fallback: normalized display name only if no stable ID exists
 */
export const getStablePlayerKey = (
  entry: Partial<LeaderboardEntry> & { user_id?: string; playerId?: string; roll_id?: string },
  activeProfile?: PlayerProfile,
  rollToUserMap?: Map<string, string>
): string => {
  const uid = (entry.userId || entry.user_id || entry.playerId || '').trim();
  if (uid) {
    return `uid:${uid.toLowerCase()}`;
  }

  const rid = (entry.rollId || entry.roll_id || '').trim();
  if (rid) {
    const ridLower = rid.toLowerCase();
    if (rollToUserMap && rollToUserMap.has(ridLower)) {
      return `uid:${rollToUserMap.get(ridLower)}`;
    }
    if (activeProfile?.rollId && activeProfile.id && ridLower === activeProfile.rollId.trim().toLowerCase()) {
      return `uid:${activeProfile.id.trim().toLowerCase()}`;
    }
    return `roll:${ridLower}`;
  }

  const nameLower = (entry.playerName || 'anonymous').trim().toLowerCase();
  if (activeProfile?.name && activeProfile.id && nameLower === activeProfile.name.trim().toLowerCase()) {
    return `uid:${activeProfile.id.trim().toLowerCase()}`;
  }

  return `name:${nameLower}`;
};

/**
 * Deterministic comparison between two attempts for the SAME player:
 * Returns true if candidate is superior to current best.
 * Priority:
 * 1. Highest score (candidate.score > currentBest.score)
 * 2. Longest survival time (candidate.survivalTime > currentBest.survivalTime)
 * 3. Most recent attempt (timestamp DESC)
 */
export const isBetterAttempt = (
  candidate: LeaderboardEntry,
  currentBest: LeaderboardEntry
): boolean => {
  if (candidate.score > currentBest.score) return true;
  if (candidate.score < currentBest.score) return false;

  // Secondary tie-breaker: Longest survival time
  if (candidate.survivalTime > currentBest.survivalTime) return true;
  if (candidate.survivalTime < currentBest.survivalTime) return false;

  // Tertiary tie-breaker: Most recent attempt
  const candidateTime = candidate.timestamp || candidate.createdAt || 0;
  const currentTime = currentBest.timestamp || currentBest.createdAt || 0;
  return candidateTime > currentTime;
};

/**
 * Standard sorting comparator for leaderboard rankings:
 * 1. Score DESC
 * 2. Survival Time DESC
 * 3. Timestamp DESC
 */
export const compareLeaderboardEntries = (
  a: LeaderboardEntry,
  b: LeaderboardEntry
): number => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  if (b.survivalTime !== a.survivalTime) {
    return b.survivalTime - a.survivalTime;
  }
  const timeA = a.timestamp || a.createdAt || 0;
  const timeB = b.timestamp || b.createdAt || 0;
  return timeB - timeA;
};

/**
 * Aggregates game score attempts into a clean leaderboard:
 * - One unique player = one leaderboard entry (Best Score)
 * - Game-specific to 'modak-catch'
 * - Filters by campus or time window if requested
 * - Preserves deterministic tie-breaking and search
 */
export const aggregateLeaderboard = (
  entries: LeaderboardEntry[],
  options?: AggregateLeaderboardOptions
): LeaderboardEntry[] => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const targetGame = options?.game || 'modak-masti';
  const targetCampus = options?.campus ? options.campus.trim().toLowerCase() : undefined;
  const timeWindowMs = options?.timeWindowMs;
  const activeProfile = getStoredProfile();
  const now = Date.now();

  // Pre-build identity linking map (linking rollId to userId where known)
  const rollToUserMap = new Map<string, string>();
  if (activeProfile?.id && activeProfile.rollId) {
    rollToUserMap.set(activeProfile.rollId.trim().toLowerCase(), activeProfile.id.trim().toLowerCase());
  }
  entries.forEach((e) => {
    const uid = (e.userId || e.user_id || '').trim().toLowerCase();
    const rid = (e.rollId || '').trim().toLowerCase();
    if (uid && rid) {
      rollToUserMap.set(rid, uid);
    }
  });

  // Filter valid game attempts
  const validAttempts = entries.filter((item) => {
    if (!item || typeof item.score !== 'number' || item.score <= 0) {
      return false;
    }

    // Specific to Modak Masti game (supports both modak-masti and legacy modak-catch)
    const isTargetGame =
      !item.game ||
      item.game === targetGame ||
      (targetGame === 'modak-masti' && item.game === 'modak-catch');
    if (!isTargetGame) {
      return false;
    }

    // Canonical campus determination
    const itemCampus = (item.campus || item.campusName || item.campusId || '').trim();

    // Campus filter (e.g. for MY_CAMPUS)
    if (targetCampus) {
      if (itemCampus.toLowerCase() !== targetCampus) {
        return false;
      }
    }

    // Time window filter (e.g. for TODAY)
    if (typeof timeWindowMs === 'number' && timeWindowMs > 0) {
      const itemTime = item.timestamp || item.createdAt || 0;
      if (itemTime <= 0 || now - itemTime > timeWindowMs) {
        return false;
      }
    }

    return true;
  });

  // Group by unique player and select best attempt
  const playerBestMap = new Map<string, LeaderboardEntry>();

  for (const attempt of validAttempts) {
    let canonicalCampus = (attempt.campus || attempt.campusName || attempt.campusId || '').trim();
    if (canonicalCampus.includes('COEP') || canonicalCampus === 'coep-pune') {
      canonicalCampus = 'Sanjay Ghodawat University,MH';
    }

    const isCurrent =
      (attempt.userId && activeProfile.id && attempt.userId.toLowerCase() === activeProfile.id.toLowerCase()) ||
      (attempt.rollId && activeProfile.rollId && attempt.rollId.trim().toLowerCase() === activeProfile.rollId.trim().toLowerCase()) ||
      (attempt.playerName && activeProfile.name && attempt.playerName.trim().toLowerCase() === activeProfile.name.trim().toLowerCase());

    if (isCurrent && activeProfile.campus) {
      canonicalCampus = activeProfile.campus;
    }

    const normalizedAttempt: LeaderboardEntry = {
      ...attempt,
      userId: attempt.userId || (isCurrent ? activeProfile.id : undefined),
      rollId: attempt.rollId || (isCurrent ? activeProfile.rollId : undefined),
      campus: canonicalCampus || 'Sanjay Ghodawat University,MH',
      campusName: canonicalCampus || 'Sanjay Ghodawat University,MH',
      campusId: canonicalCampus || 'Sanjay Ghodawat University,MH',
      game: attempt.game || targetGame,
    };

    const playerKey = getStablePlayerKey(normalizedAttempt, activeProfile, rollToUserMap);

    const existingBest = playerBestMap.get(playerKey);
    if (!existingBest || isBetterAttempt(normalizedAttempt, existingBest)) {
      playerBestMap.set(playerKey, normalizedAttempt);
    }
  }

  // Sort all unique players by best attempt descending
  const aggregated = Array.from(playerBestMap.values());
  aggregated.sort(compareLeaderboardEntries);

  // Search filter applied to the aggregated unique-player list
  if (options?.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.trim().toLowerCase();
    return aggregated.filter((entry) => {
      const matchName = entry.playerName.toLowerCase().includes(q);
      const matchCampus = (entry.campus || '').toLowerCase().includes(q);
      const matchRoll = entry.rollId ? entry.rollId.toLowerCase().includes(q) : false;
      return matchName || matchCampus || matchRoll;
    });
  }

  return aggregated;
};

/**
 * Fetch authoritative aggregated leaderboard where EACH PLAYER APPEARS ONLY ONCE
 * Ranked by highest score DESC, then longest survival time DESC.
 */
export const getLeaderboard = (options?: AggregateLeaderboardOptions): LeaderboardEntry[] => {
  const rawList = getRawScoreHistory();
  return aggregateLeaderboard(rawList, options);
};

export const validateAndSubmitScore = (entry: Omit<LeaderboardEntry, 'id' | 'date' | 'timestamp'>): {
  success: boolean;
  isNewBest: boolean;
  leaderboard: LeaderboardEntry[];
  reason?: string;
} => {
  // Fair leaderboard verification
  if (entry.score <= 0) {
    return { success: false, isNewBest: false, leaderboard: getLeaderboard(), reason: 'Score must be greater than 0' };
  }

  // Maximum theoretical score validation: 300 points per second limit
  if (entry.survivalTime > 0 && entry.score / entry.survivalTime > 300) {
    return { success: false, isNewBest: false, leaderboard: getLeaderboard(), reason: 'Score velocity exceeds physical limit' };
  }

  // Catch count sanity check
  if (entry.modaksCaught <= 0 && entry.score > 50) {
    return { success: false, isNewBest: false, leaderboard: getLeaderboard(), reason: 'Invalid catch to score ratio' };
  }

  // Authoritative canonical campus from entry or current profile
  const activeProfile = getStoredProfile();
  const canonicalCampus = (
    entry.campus ||
    activeProfile.campus ||
    entry.campusName ||
    activeProfile.campusName ||
    'Sanjay Ghodawat University,MH'
  ).trim();
  const effectiveUserId = entry.userId || activeProfile.id || '';
  const effectiveRollId = entry.rollId || activeProfile.rollId || '';

  const newEntry: LeaderboardEntry = {
    ...entry,
    userId: effectiveUserId,
    user_id: effectiveUserId,
    game: entry.game || 'modak-masti',
    campus: canonicalCampus,
    campusName: canonicalCampus,
    campusId: canonicalCampus,
    rollId: effectiveRollId,
    id: 'score-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    date: 'Just now',
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  // 1. Preserve all individual attempts in raw history (never deleted, useful for stats)
  const rawList = getRawScoreHistory();
  const updatedHistory = rawList.filter(
    (item) => !(item.playerName === entry.playerName && item.score === entry.score && Math.abs(item.timestamp - Date.now()) < 2000)
  );
  updatedHistory.unshift(newEntry);

  try {
    localStorage.setItem(RAW_SCORES_KEY, JSON.stringify(updatedHistory.slice(0, 500)));
  } catch (e) {
    console.warn('Failed to save score history', e);
  }

  // 2. Aggregate into unique-player best score leaderboard
  const aggregated = aggregateLeaderboard(updatedHistory);
  const trimmed = aggregated.slice(0, 100);

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save leaderboard', e);
  }

  // 3. Update personal best (strictly highest valid score across all attempts)
  const currentBest = getPersonalBest();
  const isNewBest = entry.score > currentBest;
  if (isNewBest) {
    savePersonalBest(entry.score);
  }

  // 4. Synchronize score entry to Firebase Firestore database in background
  saveScoreToFirestore(newEntry).catch((err) =>
    console.warn('Firestore score sync warning:', err)
  );

  return {
    success: true,
    isNewBest,
    leaderboard: trimmed,
  };
};

/**
 * Merge remote cloud entries with local score history, preserving all attempts
 * and generating the unified one-player-one-best-score leaderboard.
 */
export const mergeAndCacheRemoteEntries = (cloudEntries: LeaderboardEntry[]): LeaderboardEntry[] => {
  if (!cloudEntries || cloudEntries.length === 0) {
    return getLeaderboard();
  }

  const currentProfile = getStoredProfile();
  const sanitizedCloudEntries = cloudEntries.map((e) => {
    let canonicalCampus = e.campus || e.campusName || e.campusId || '';
    const isCurrent =
      (e.userId && currentProfile.id && e.userId.toLowerCase() === currentProfile.id.toLowerCase()) ||
      (e.playerName &&
        currentProfile.name &&
        e.playerName.trim().toLowerCase() === currentProfile.name.trim().toLowerCase()) ||
      (e.rollId &&
        currentProfile.rollId &&
        e.rollId.trim().toLowerCase() === currentProfile.rollId.trim().toLowerCase());

    if (isCurrent && currentProfile.campus) {
      canonicalCampus = currentProfile.campus;
    } else if (
      canonicalCampus.includes('COEP') ||
      canonicalCampus === 'coep-pune'
    ) {
      canonicalCampus = 'Sanjay Ghodawat University,MH';
    }

    return {
      ...e,
      userId: e.userId || (isCurrent ? currentProfile.id : undefined),
      rollId: e.rollId || (isCurrent ? currentProfile.rollId : undefined),
      campus: canonicalCampus,
      campusName: canonicalCampus,
      campusId: canonicalCampus,
      game: e.game || 'modak-masti',
    };
  });

  // Merge cloud entries and local raw history by entry ID (preserving all historical attempts)
  const localHistory = getRawScoreHistory();
  const historyMap = new Map<string, LeaderboardEntry>();
  localHistory.forEach((e) => historyMap.set(e.id, e));
  sanitizedCloudEntries.forEach((e) => historyMap.set(e.id, e));

  const mergedHistory = Array.from(historyMap.values());
  try {
    localStorage.setItem(RAW_SCORES_KEY, JSON.stringify(mergedHistory.slice(0, 500)));
  } catch (e) {
    console.warn('Failed to cache score history', e);
  }

  // Aggregate into unique-player best score list
  const aggregated = aggregateLeaderboard(mergedHistory);
  const top100 = aggregated.slice(0, 100);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top100));
  } catch (e) {
    console.warn('Failed to cache merged leaderboard', e);
  }
  return top100;
};

/**
 * Fetch and synchronize top scores from Firebase Firestore into local storage
 * Preserves all attempts in raw history and produces aggregated one-player-one-best-score leaderboard.
 */
export const syncLeaderboardWithFirestore = async (): Promise<LeaderboardEntry[]> => {
  try {
    const cloudEntries = await fetchLeaderboardFromFirestore(200);
    if (cloudEntries && cloudEntries.length > 0) {
      return mergeAndCacheRemoteEntries(cloudEntries);
    }
  } catch (e) {
    console.warn('Failed to sync leaderboard with Firestore:', e);
  }
  return getLeaderboard();
};

export const getAchievements = (): Achievement[] => {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Achievement[];
      // Merge with INITIAL_ACHIEVEMENTS to handle schema updates
      return INITIAL_ACHIEVEMENTS.map((initial) => {
        const found = stored.find((s) => s.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
  } catch (e) {
    console.warn('Failed to read achievements', e);
  }
  return INITIAL_ACHIEVEMENTS;
};

export const unlockAchievement = (id: string): Achievement[] => {
  const current = getAchievements();
  let changed = false;
  const updated = current.map((ach) => {
    if (ach.id === id && !ach.unlocked) {
      changed = true;
      return { ...ach, unlocked: true, unlockedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    return ach;
  });

  if (changed) {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist achievements', e);
    }
  }
  return updated;
};

export const getSoundEnabled = (): boolean => {
  try {
    const raw = localStorage.getItem(SOUND_ENABLED_KEY);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch (e) {
    console.warn(e);
  }
  return true; // default enabled
};

export const setSoundEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn(e);
  }
};
