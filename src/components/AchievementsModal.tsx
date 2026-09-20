import React from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ achievements, onClose }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      id="achievements-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#240c0e] border border-amber-600/40 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col text-amber-100 shadow-2xl relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-800/40 flex items-center justify-between shrink-0 bg-[#2b0f12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Cinzel',serif] text-amber-200">
                FESTIVAL BLESSINGS
              </h2>
              <p className="text-xs text-amber-400">
                {unlockedCount} of {achievements.length} Achievements Unlocked
              </p>
            </div>
          </div>

          <button
            id="close-achievements-btn"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 p-1.5 rounded-lg hover:bg-amber-900/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/30">
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-amber-800/40">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                ach.unlocked
                  ? 'bg-amber-950/50 border-amber-600/40 text-amber-100'
                  : 'bg-black/20 border-amber-900/20 text-amber-300/40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                  ach.unlocked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow'
                    : 'bg-stone-900 border-stone-800 text-stone-600'
                }`}
              >
                {ach.unlocked ? ach.icon : <Lock className="w-4 h-4 text-stone-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3
                    className={`font-bold text-xs sm:text-sm ${
                      ach.unlocked ? 'text-amber-200' : 'text-stone-500'
                    }`}
                  >
                    {ach.title}
                  </h3>
                  {ach.unlocked && (
                    <span className="text-[10px] text-amber-400/80 font-medium flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {ach.unlockedAt || 'Unlocked'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
