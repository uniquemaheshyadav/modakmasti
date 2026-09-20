import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Sparkles, Timer, Flame, Share2, Award } from 'lucide-react';
import { GameStats, PlayerProfile } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  profile: PlayerProfile;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  profile,
  isNewBest,
  onPlayAgain,
  onViewLeaderboard,
}) => {
  useEffect(() => {
    if (isNewBest) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#f97316', '#ef4444', '#fef08a'],
        });
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isNewBest]);

  const handleShare = () => {
    const text = `🪔 I scored ${stats.score.toLocaleString()} points and caught ${stats.modaksCaught} modaks in Modak Masti on the Ganesh Chaturthi platform! Can you beat my score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard! Share it with your friends.');
    }
  };

  return (
    <div
      id="game-over-modal"
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="bg-[#240c0e] border-2 border-amber-600/50 rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 text-amber-100 shadow-2xl relative my-auto">
        {/* Header decoration */}
        <div className="text-center mb-4">
          <span className="text-3xl sm:text-4xl inline-block animate-bounce" role="img" aria-label="Trophy">
            {isNewBest ? '🏆' : '🪔'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Cinzel',serif] text-amber-200 tracking-wide mt-1">
            MODAK RUN COMPLETE!
          </h2>
          <p className="text-xs text-amber-400 font-medium">
            Representing{' '}
            <span className="text-amber-200 font-bold">
              {profile.campus || profile.campusName || 'Your Campus'}
            </span>
          </p>
          {profile.rollId && (
            <p className="text-[11px] text-amber-400/80 font-mono mt-0.5">
              ID / Roll: {profile.rollId}
            </p>
          )}

          {isNewBest && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400 text-amber-300 text-xs font-bold mt-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              🏆 NEW PERSONAL BEST!
            </div>
          )}
        </div>

        {/* Primary Score Hero Card */}
        <div className="bg-gradient-to-b from-amber-950/80 to-amber-900/40 border border-amber-600/40 rounded-xl p-3 sm:p-4 text-center mb-4 shadow-inner">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Total Score</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 font-mono tracking-tight mt-0.5">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Results 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-5 text-xs">
          {/* Time */}
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center gap-2.5">
            <Timer className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-400/80 block uppercase">Time</span>
              <span className="font-bold text-amber-100 font-mono text-sm">
                {stats.survivalTime.toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Modaks Caught */}
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center gap-2.5">
            <span className="text-base shrink-0">🍬</span>
            <div>
              <span className="text-[10px] text-amber-400/80 block uppercase">Caught</span>
              <span className="font-bold text-amber-100 font-mono text-sm">
                {stats.modaksCaught}
              </span>
            </div>
          </div>

          {/* Best Combo */}
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-400/80 block uppercase">Best Combo</span>
              <span className="font-bold text-amber-100 font-mono text-sm">
                ×{stats.bestCombo}
              </span>
            </div>
          </div>

          {/* Golden Modaks */}
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-400/80 block uppercase">Golden</span>
              <span className="font-bold text-amber-100 font-mono text-sm">
                {stats.goldenCaught}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Best info line */}
        <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-black/30 border border-amber-900/40 text-xs mb-5">
          <span className="text-amber-400/90 font-medium">Personal Record:</span>
          <span className="font-bold text-amber-300 font-mono">
            {stats.personalBest.toLocaleString()} pts
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* PLAY AGAIN - Instant One-Click Replay */}
          <button
            id="game-over-play-again-btn"
            onClick={onPlayAgain}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 active:scale-98"
          >
            <RotateCcw className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            Play Again
          </button>

          {/* LEADERBOARD & SHARE row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="game-over-leaderboard-btn"
              onClick={onViewLeaderboard}
              className="py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-700/40 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Leaderboard
            </button>

            <button
              id="game-over-share-btn"
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-700/40 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              Share Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
