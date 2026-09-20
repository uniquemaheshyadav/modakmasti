import React, { useState } from 'react';
import { X, Check, School, User, Hash, AlertCircle } from 'lucide-react';
import { PlayerProfile } from '../types';
import { campuses, CAMPUS_PLACEHOLDER } from '../data/campuses';

interface ProfileModalProps {
  profile: PlayerProfile;
  onSave: (updated: PlayerProfile) => void;
  onClose: () => void;
}

const AVATARS = ['🪔', '🍬', '🌺', '🐘', '🥁', '✨', '👑', '🕉️'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile.name || '');
  const [rollId, setRollId] = useState(profile.rollId || '');

  // Determine initial selected campus without stale COEP fallback
  const candidateCampus = (profile.campus || profile.campusName || profile.campusId || '').trim();
  const initialCampus =
    candidateCampus.includes('COEP') || candidateCampus === 'coep-pune' ? '' : candidateCampus;

  const [selectedCampus, setSelectedCampus] = useState(initialCampus);
  const [avatar, setAvatar] = useState(profile.avatarIcon || '🪔');
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampus || selectedCampus === CAMPUS_PLACEHOLDER) {
      setError('Please select your campus to continue.');
      return;
    }

    const trimmedName = name.trim() || 'Festival Champion';

    onSave({
      ...profile,
      name: trimmedName,
      rollId: rollId.trim(),
      campus: selectedCampus,
      campusId: selectedCampus,
      campusName: selectedCampus,
      avatarIcon: avatar,
    });
    onClose();
  };

  return (
    <div
      id="profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-[#240c0e] border border-amber-600/40 rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 text-amber-100 shadow-2xl relative my-auto">
        <button
          id="close-profile-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400 hover:text-amber-200 p-1.5 rounded-lg hover:bg-amber-900/40 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="text-3xl block" role="img" aria-label="Avatar">
            {avatar}
          </span>
          <h2 className="text-xl font-bold font-['Cinzel',serif] text-amber-200 mt-1">
            PLAYER PROFILE
          </h2>
          <p className="text-xs text-amber-400">Campus & arcade identity</p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Avatar picker */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1.5">
              Choose Avatar
            </label>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border transition-all ${
                    avatar === av
                      ? 'bg-amber-500/30 border-amber-400 scale-110 shadow'
                      : 'bg-black/30 border-amber-900/40 hover:border-amber-700/60'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Roll / ID (Optional / Platform shared) */}
          <div>
            <label htmlFor="player-roll-input" className="block text-xs font-semibold text-amber-300 mb-1">
              Roll / ID <span className="text-[10px] text-amber-500/80 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/80" />
              <input
                id="player-roll-input"
                type="text"
                maxLength={32}
                value={rollId}
                onChange={(e) => setRollId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-black/40 border border-amber-800/50 rounded-xl text-amber-100 placeholder-amber-700/60 focus:outline-none focus:border-amber-400"
                placeholder="e.g. N25M01A0064"
              />
            </div>
          </div>

          {/* Display Name input */}
          <div>
            <label htmlFor="player-name-input" className="block text-xs font-semibold text-amber-300 mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/80" />
              <input
                id="player-name-input"
                type="text"
                required
                maxLength={24}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-black/40 border border-amber-800/50 rounded-xl text-amber-100 placeholder-amber-700/60 focus:outline-none focus:border-amber-400"
                placeholder="e.g. Rahul"
              />
            </div>
          </div>

          {/* Campus selection dropdown */}
          <div>
            <label htmlFor="campus-select" className="block text-xs font-semibold text-amber-300 mb-1">
              Campus <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/80 pointer-events-none" />
              <select
                id="campus-select"
                value={selectedCampus}
                onChange={(e) => {
                  setSelectedCampus(e.target.value);
                  setError(null);
                }}
                className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-[#1c0809] border border-amber-800/50 rounded-xl text-amber-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                required
              >
                {/* Initial Placeholder */}
                <option value="" disabled className="bg-[#240c0e] text-stone-400">
                  {CAMPUS_PLACEHOLDER}
                </option>

                {/* 42 Unique Campus Options with Sanjay Ghodawat University,MH as FIRST option */}
                {campuses.map((campus) => (
                  <option key={campus} value={campus} className="bg-[#240c0e] text-amber-100 py-1.5">
                    {campus}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-amber-400/70 mt-1">
              Your scores will automatically represent this campus on the leaderboard.
            </p>
          </div>

          {/* Save button */}
          <button
            id="save-profile-btn"
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 mt-2 active:scale-98"
          >
            <Check className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};
