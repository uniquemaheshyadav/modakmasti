/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlatformHeader } from './components/PlatformHeader';
import { StartScreen } from './components/StartScreen';
import { ModakCatchGame } from './components/ModakCatchGame';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ProfileModal } from './components/ProfileModal';
import { AchievementsModal } from './components/AchievementsModal';
import { GameState, PlayerProfile, LeaderboardEntry } from './types';
import {
  getStoredProfile,
  saveStoredProfile,
  getPersonalBest,
  getLeaderboard,
  getAchievements,
  syncLeaderboardWithFirestore,
  mergeAndCacheRemoteEntries,
} from './services/storage';
import { subscribeToLeaderboard } from './services/firebase';
import { sound } from './services/sound';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile());
  const [personalBest, setPersonalBest] = useState<number>(getPersonalBest());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isSoundEnabled());
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());

  // Active Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);

  // Sync state and Firestore on load
  useEffect(() => {
    setProfile(getStoredProfile());
    setPersonalBest(getPersonalBest());
    setLeaderboardEntries(getLeaderboard());

    // Sync cloud leaderboard entries from Firestore on launch
    syncLeaderboardWithFirestore()
      .then((entries) => {
        if (entries && entries.length > 0) {
          setLeaderboardEntries(entries);
        }
      })
      .catch((err) => console.warn('Initial Firestore sync note:', err));

    // Subscribe to realtime Firestore score updates
    const unsubscribe = subscribeToLeaderboard((entries) => {
      if (entries && entries.length > 0) {
        const merged = mergeAndCacheRemoteEntries(entries);
        setLeaderboardEntries(merged);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = (updated: PlayerProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleToggleSound = () => {
    const updated = sound.toggleSound();
    setSoundEnabled(updated);
  };

  const handleStartGame = () => {
    const campus = (profile.campus || profile.campusName || '').trim();
    if (!campus || campus === 'Select campus' || campus.includes('COEP')) {
      setShowProfile(true);
      return;
    }
    setShowHowToPlay(false);
    setShowLeaderboard(false);
    setGameState('PLAYING');
  };

  const handleExitToMenu = () => {
    setPersonalBest(getPersonalBest());
    setLeaderboardEntries(getLeaderboard());
    setGameState('START');
  };

  const handleOpenLeaderboard = () => {
    setLeaderboardEntries(getLeaderboard());
    setShowLeaderboard(true);
  };

  return (
    <div className="min-h-screen bg-[#160607] text-amber-50 flex flex-col font-['Outfit',sans-serif]">
      {/* Platform Header */}
      <PlatformHeader
        profile={profile}
        personalBest={personalBest}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setShowProfile(true)}
        onOpenLeaderboard={handleOpenLeaderboard}
        onOpenAchievements={() => setShowAchievements(true)}
        gameActive={gameState === 'PLAYING'}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {gameState === 'START' ? (
          <StartScreen
            profile={profile}
            personalBest={personalBest}
            onPlayNow={handleStartGame}
            onHowToPlay={() => setShowHowToPlay(true)}
            onLeaderboard={handleOpenLeaderboard}
            onOpenProfile={() => setShowProfile(true)}
          />
        ) : (
          <ModakCatchGame
            profile={profile}
            personalBest={personalBest}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onExitToMenu={handleExitToMenu}
          />
        )}
      </main>

      {/* Overlays / Global Modals */}
      {showHowToPlay && (
        <HowToPlayModal
          onClose={() => setShowHowToPlay(false)}
          onPlayNow={handleStartGame}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          entries={leaderboardEntries}
          profile={profile}
          onClose={() => setShowLeaderboard(false)}
          onPlayNow={handleStartGame}
        />
      )}

      {showProfile && (
        <ProfileModal
          profile={profile}
          onSave={handleUpdateProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          achievements={getAchievements()}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}
