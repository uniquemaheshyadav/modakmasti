import React from 'react';
import { Trophy, Volume2, VolumeX, User, Sparkles, Award } from 'lucide-react';
import { PlayerProfile } from '../types';
import { sound } from '../services/sound';

interface PlatformHeaderProps {
  profile: PlayerProfile;
  personalBest: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenCloudDb?: () => void;
  gameActive: boolean;
}

export const PlatformHeader: React.FC<PlatformHeaderProps> = ({
  profile,
  personalBest,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
  onOpenLeaderboard,
  onOpenAchievements,
  gameActive,
}) => {
  return (
    <header
      id="platform-header"
      className="w-full bg-[#200a0b]/90 backdrop-blur-md border-b border-amber-900/40 px-3 sm:px-6 py-2.5 flex items-center justify-between z-40 sticky top-0"
    >
      {/* Platform Branding & Game Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl" role="img" aria-label="Ganesh">
          🪔
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Ganesh Chaturthi
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">
              Arcade
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-amber-100 font-['Cinzel',serif] tracking-wide leading-none">
            Modak Masti
          </h1>
        </div>
      </div>

      {/* Center Best Score badge (visible on larger screens or desktop) */}
      {!gameActive && personalBest > 0 && (
        <div
          id="header-personal-best"
          className="hidden md:flex items-center gap-2 bg-amber-950/60 border border-amber-700/40 rounded-full px-3 py-1 text-xs text-amber-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Personal Best:</span>
          <span className="font-bold text-amber-300 font-mono">{personalBest.toLocaleString()}</span>
        </div>
      )}

      {/* Right Controls: Sound, Profile, Leaderboard */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sound toggle button */}
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 transition-colors"
          title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-600" />}
        </button>

        {/* Achievements button */}
        <button
          id="achievements-btn"
          onClick={onOpenAchievements}
          className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 transition-colors"
          title="Achievements"
          aria-label="Achievements"
        >
          <Award className="w-4 h-4" />
        </button>

        {/* Leaderboard button */}
        <button
          id="leaderboard-nav-btn"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-xs font-semibold transition-colors"
          title="Campus & Global Leaderboard"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ranks</span>
        </button>

        {/* Player Profile chip */}
        <button
          id="profile-nav-btn"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700/40 to-orange-700/40 hover:from-amber-700/60 hover:to-orange-700/60 text-amber-100 border border-amber-600/50 text-xs font-medium transition-all max-w-[130px] sm:max-w-[170px]"
        >
          <span className="text-sm">{profile.avatarIcon || '🪔'}</span>
          <span className="truncate">{profile.name}</span>
        </button>
      </div>
    </header>
  );
};
