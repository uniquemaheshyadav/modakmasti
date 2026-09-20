import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenLeaderboard,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div
      id="pause-modal"
      className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#240c0e] border border-amber-600/40 rounded-2xl max-w-sm w-full p-6 text-amber-100 shadow-2xl text-center">
        <span className="text-3xl mb-2 block" role="img" aria-label="Pause">
          ⏸️
        </span>
        <h2 className="text-2xl font-bold font-['Cinzel',serif] text-amber-200 tracking-wider">
          GAME PAUSED
        </h2>
        <p className="text-xs text-amber-400 mt-1 mb-6">Take a breath, champion!</p>

        <div className="space-y-2.5">
          {/* Resume */}
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            Resume
          </button>

          {/* Restart */}
          <button
            id="pause-restart-btn"
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Restart Run
          </button>

          {/* Sound */}
          <button
            id="pause-sound-btn"
            onClick={onToggleSound}
            className="w-full py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Sound: ON
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                Sound: OFF
              </>
            )}
          </button>

          {/* Leaderboard */}
          <button
            id="pause-leaderboard-btn"
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
