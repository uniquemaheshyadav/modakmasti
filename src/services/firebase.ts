import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LeaderboardEntry, PlayerProfile } from '../types';

let app: FirebaseApp;
let db: Firestore;
let isInitialized = false;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  // Support custom databaseId if configured
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
  isInitialized = true;
  console.log('Firebase Firestore initialized with database:', firebaseConfig.firestoreDatabaseId || '(default)');
} catch (error) {
  console.error('Failed to initialize Firebase Firestore:', error);
}

export { app, db, isInitialized };

/**
 * Save or update player profile in Firebase Firestore
 */
export async function savePlayerToFirestore(profile: PlayerProfile): Promise<boolean> {
  if (!isInitialized || !db || !profile.id) return false;
  try {
    const canonicalCampus = profile.campus || profile.campusName || profile.campusId || '';
    const playerRef = doc(db, 'players', profile.id);
    await setDoc(
      playerRef,
      {
        id: profile.id,
        name: profile.name,
        rollId: profile.rollId || '',
        campus: canonicalCampus,
        campusId: canonicalCampus,
        campusName: canonicalCampus,
        avatarIcon: profile.avatarIcon,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Error saving player to Firestore:', err);
    return false;
  }
}

/**
 * Save new game score to Firebase Firestore Leaderboard
 */
export async function saveScoreToFirestore(entry: LeaderboardEntry): Promise<boolean> {
  if (!isInitialized || !db || !entry.id) return false;
  try {
    const canonicalCampus = entry.campus || entry.campusName || entry.campusId || '';
    const userId = (entry.userId || entry.user_id || '').trim();
    const entryRef = doc(db, 'leaderboard', entry.id);
    await setDoc(entryRef, {
      ...entry,
      userId: userId,
      user_id: userId,
      game: entry.game || 'modak-masti',
      campus: canonicalCampus,
      campusId: canonicalCampus,
      campusName: canonicalCampus,
      rollId: entry.rollId || '',
      createdAt: entry.createdAt || Date.now(),
      timestamp: entry.timestamp || Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('Error saving score to Firestore:', err);
    return false;
  }
}

/**
 * Fetch all registered players from Firestore
 */
export async function fetchPlayersFromFirestore(): Promise<PlayerProfile[]> {
  if (!isInitialized || !db) return [];
  try {
    const colRef = collection(db, 'players');
    const snapshot = await getDocs(colRef);
    const players: PlayerProfile[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      const canonicalCampus =
        data.campus || data.campusName || data.campusId || data.college || '';
      players.push({
        id: data.id || d.id,
        name: data.name || 'Unknown',
        rollId: data.rollId || data.roll_id || '',
        campus: canonicalCampus,
        campusId: canonicalCampus,
        campusName: canonicalCampus,
        avatarIcon: data.avatarIcon || '🪔',
      });
    });
    return players;
  } catch (err) {
    console.warn('Error fetching players from Firestore:', err);
    return [];
  }
}

/**
 * Fetch top leaderboard scores from Firestore
 */
export async function fetchLeaderboardFromFirestore(limitCount: number = 200): Promise<LeaderboardEntry[]> {
  if (!isInitialized || !db) return [];
  try {
    const colRef = collection(db, 'leaderboard');
    const q = query(colRef, orderBy('score', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      const canonicalCampus =
        data.campus || data.campusName || data.campusId || data.college || '';
      const uid = (data.userId || data.user_id || data.playerId || '').toString().trim();
      entries.push({
        id: data.id || d.id,
        userId: uid || undefined,
        user_id: uid || undefined,
        game: data.game || 'modak-masti',
        playerName: data.playerName || 'Anonymous',
        rollId: data.rollId || data.roll_id || '',
        campus: canonicalCampus,
        campusId: canonicalCampus,
        campusName: canonicalCampus,
        score: Number(data.score) || 0,
        survivalTime: Number(data.survivalTime) || 0,
        modaksCaught: Number(data.modaksCaught) || 0,
        bestCombo: Number(data.bestCombo) || 1,
        goldenModaks: Number(data.goldenModaks) || 0,
        date: data.date || 'Recent',
        timestamp: Number(data.timestamp) || Number(data.createdAt) || Date.now(),
        createdAt: Number(data.createdAt) || Number(data.timestamp) || Date.now(),
      });
    });
    return entries;
  } catch (err) {
    console.warn('Error fetching leaderboard from Firestore:', err);
    return [];
  }
}

/**
 * Real-time subscription to leaderboard changes
 */
export function subscribeToLeaderboard(callback: (entries: LeaderboardEntry[]) => void): () => void {
  if (!isInitialized || !db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'leaderboard');
    const q = query(colRef, orderBy('score', 'desc'), limit(200));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const canonicalCampus =
            data.campus || data.campusName || data.campusId || data.college || '';
          const uid = (data.userId || data.user_id || data.playerId || '').toString().trim();
          entries.push({
            id: data.id || d.id,
            userId: uid || undefined,
            user_id: uid || undefined,
            game: data.game || 'modak-masti',
            playerName: data.playerName || 'Anonymous',
            rollId: data.rollId || data.roll_id || '',
            campus: canonicalCampus,
            campusId: canonicalCampus,
            campusName: canonicalCampus,
            score: Number(data.score) || 0,
            survivalTime: Number(data.survivalTime) || 0,
            modaksCaught: Number(data.modaksCaught) || 0,
            bestCombo: Number(data.bestCombo) || 1,
            goldenModaks: Number(data.goldenModaks) || 0,
            date: data.date || 'Recent',
            timestamp: Number(data.timestamp) || Number(data.createdAt) || Date.now(),
            createdAt: Number(data.createdAt) || Number(data.timestamp) || Date.now(),
          });
        });
        callback(entries);
      },
      (error) => {
        console.warn('Firestore realtime subscription error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to leaderboard in Firestore:', err);
    return () => {};
  }
}
