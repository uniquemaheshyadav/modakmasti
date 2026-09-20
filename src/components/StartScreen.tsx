import React from 'react';
import { Play, HelpCircle, Trophy, Sparkles, School, Award } from 'lucide-react';
import { PlayerProfile } from '../types';

interface StartScreenProps {
  profile: PlayerProfile;
  personalBest: number;
  onPlayNow: () => void;
  onHowToPlay: () => void;
  onLeaderboard: () => void;
  onOpenProfile: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  personalBest,
  onPlayNow,
  onHowToPlay,
  onLeaderboard,
  onOpenProfile,
}) => {
  return (
    <div
      id="start-screen"
      className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-between min-h-[580px] sm:min-h-[640px] px-4 py-6 sm:py-8 text-center"
    >
      {/* Top Auspicious Invocation */}
      <div className="flex items-center gap-2 text-xs text-amber-400/90 tracking-widest font-semibold uppercase">
        <span>॥ श्री गणेशाय नमः ॥</span>
      </div>

      {/* Decorative Center Pandal Shrine & Modak Art */}
      <div className="relative my-2 sm:my-4 flex flex-col items-center">
        {/* Divine Golden Halo */}
        <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-amber-600/30 via-orange-500/20 to-yellow-400/30 blur-2xl -z-10 animate-pulse" />

        {/* Central Festive Medallion */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-600 shadow-2xl shadow-orange-950/80 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#20080a] flex items-center justify-center border-2 border-amber-300/40 relative overflow-hidden">
            {/* Glowing ray backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,240,138,0.25)_0%,transparent_70%)]" />

            {/* Respectful Ganesha Emblem with golden modak */}
            <div className="text-center z-10">
              <span className="text-4xl sm:text-5xl block animate-pulse">🍬</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-300 tracking-wider uppercase block mt-1">
                Divine Prasad
              </span>
            </div>
          </div>

          {/* Floating DIYAS on left & right */}
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 text-2xl animate-bounce">
            🪔
          </div>
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            🪔
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="mt-5">
          <h1
            id="main-title"
            className="text-4xl sm:text-5xl font-black font-['Cinzel',serif] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400 drop-shadow-md"
          >
            MODAK MASTI
          </h1>
          <p
            id="main-subtitle"
            className="text-sm sm:text-base font-semibold text-amber-300 mt-1 tracking-wide"
          >
            Catch the blessings. Beat the score.
          </p>
          <p className="text-xs text-amber-400/80 mt-0.5 italic">
            How many modaks can you save?
          </p>
        </div>
      </div>

      {/* Active Player Card / Campus summary */}
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-950/60 to-black/50 border border-amber-700/40 rounded-2xl p-3.5 shadow-lg backdrop-blur-sm mb-4">
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl p-1.5 rounded-xl bg-amber-600/20 border border-amber-600/30 shrink-0">
              {profile.avatarIcon}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Current Player
              </span>
              <h4 className="text-sm font-bold text-amber-100 truncate">{profile.name}</h4>
              <p className="text-xs text-amber-300/80 truncate flex items-center gap-1">
                <School className="w-3 h-3 text-amber-400 shrink-0" />
                <span className={profile.campus || profile.campusName ? 'text-amber-200 font-medium' : 'text-amber-400/70 italic'}>
                  {profile.campus || profile.campusName || 'Select campus'}
                </span>
              </p>
              {profile.rollId && (
                <span className="text-[10px] text-amber-400/70 font-mono block">
                  ID / Roll: {profile.rollId}
                </span>
              )}
            </div>
          </div>

          <button
            id="change-profile-btn"
            onClick={onOpenProfile}
            className="px-2.5 py-1 rounded-lg bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/40 text-[11px] text-amber-300 font-semibold shrink-0 transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Personal best streak/score row */}
        {personalBest > 0 && (
          <div className="mt-2.5 pt-2 border-t border-amber-900/40 flex items-center justify-between text-xs">
            <span className="text-amber-400/90 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Your Best Score:
            </span>
            <span className="font-extrabold text-amber-300 font-mono">
              {personalBest.toLocaleString()} pts
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons (PLAY NOW, HOW TO PLAY, LEADERBOARD) */}
      <div className="w-full max-w-sm space-y-2.5">
        {/* PLAY NOW - Prominent Gold & Saffron Button */}
        <button
          id="start-play-now-btn"
          onClick={onPlayNow}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black text-base sm:text-lg tracking-wider uppercase transition-all shadow-xl shadow-orange-950/60 flex items-center justify-center gap-2.5 active:scale-98 group cursor-pointer"
        >
          <Play className="w-5 h-5 fill-stone-950 text-stone-950 group-hover:scale-110 transition-transform" />
          Play Now
        </button>

        {/* Secondary Buttons Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="start-how-to-play-btn"
            onClick={onHowToPlay}
            className="py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-700/40 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            How To Play
          </button>

          <button
            id="start-leaderboard-btn"
            onClick={onLeaderboard}
            className="py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-700/40 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Subtle bottom note */}
      <div className="text-[11px] text-amber-500/70 mt-4 flex items-center gap-2">
        <span>Desktop: ← → / A D</span>
        <span>•</span>
        <span>Mobile: Touch & Drag</span>
      </div>
    </div>
  );
};
