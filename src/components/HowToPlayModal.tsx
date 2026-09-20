import React from 'react';
import { X, Play, ArrowLeftRight, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
  onPlayNow: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose, onPlayNow }) => {
  return (
    <div
      id="how-to-play-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#240c0e] border border-amber-600/40 rounded-2xl max-w-md w-full p-5 sm:p-6 text-amber-100 shadow-2xl relative">
        {/* Close button */}
        <button
          id="close-how-to-play-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400/80 hover:text-amber-200 p-1.5 rounded-lg hover:bg-amber-900/40"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <span className="text-3xl" role="img" aria-label="Modak">
            🍬
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Cinzel',serif] text-amber-200 mt-1">
            HOW TO PLAY
          </h2>
          <p className="text-xs text-amber-400 font-medium">Simple 3-step master guide</p>
        </div>

        {/* 3 Core Steps */}
        <div className="space-y-3.5 mb-5">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/30">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0 text-sm shadow">
              1
            </div>
            <div>
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                MOVE
              </h3>
              <p className="text-xs text-amber-100/80 mt-0.5">
                Drag on screen with your finger or use <kbd className="px-1 py-0.5 bg-black/40 rounded text-amber-300">←</kbd> <kbd className="px-1 py-0.5 bg-black/40 rounded text-amber-300">→</kbd> / <kbd className="px-1 py-0.5 bg-black/40 rounded text-amber-300">A</kbd> <kbd className="px-1 py-0.5 bg-black/40 rounded text-amber-300">D</kbd> keys.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/30">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0 text-sm shadow">
              2
            </div>
            <div>
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                CATCH
              </h3>
              <p className="text-xs text-amber-100/80 mt-0.5">
                Catch falling modaks: 🟡 Normal (+10), ✨ Golden (+50), 💎 Diamond (+100).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/30">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0 text-sm shadow">
              3
            </div>
            <div>
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                COMBO
              </h3>
              <p className="text-xs text-amber-100/80 mt-0.5">
                Keep catching without misses to climb multipliers (<span className="text-amber-300 font-semibold">×2 → ×5</span>) and trigger <span className="text-orange-400 font-bold">MODAK FEVER!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Hazard Warning banner */}
        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center gap-2.5 mb-5 text-xs text-red-200">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>
            <strong className="text-red-300">⚠️ Avoid hazards:</strong> Coconuts (🥥) deduct points and break combos; heavy stones (🪨) slow you down.
          </span>
        </div>

        {/* Action button */}
        <button
          id="how-to-play-start-btn"
          onClick={onPlayNow}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-stone-950" />
          Got It! Play Now
        </button>
      </div>
    </div>
  );
};
