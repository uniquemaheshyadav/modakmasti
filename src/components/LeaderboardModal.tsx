import React, { useState, useMemo } from 'react';
import { X, Trophy, Globe, School, Calendar, Search, Users } from 'lucide-react';
import { LeaderboardEntry, PlayerProfile } from '../types';
import { aggregateLeaderboard } from '../services/storage';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  profile: PlayerProfile;
  onClose: () => void;
  onPlayNow: () => void;
  onOpenCloudDb?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  profile,
  onClose,
  onPlayNow,
  onOpenCloudDb,
}) => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'MY_CAMPUS' | 'TODAY'>('GLOBAL');
  const [searchQuery, setSearchQuery] = useState('');

  const userCampus = (profile.campus || profile.campusName || '').trim();

  // Aggregate scores so that EACH PLAYER APPEARS EXACTLY ONCE with their Best Score
  const filteredEntries = useMemo(() => {
    if (activeTab === 'MY_CAMPUS' && !userCampus) {
      return [];
    }

    return aggregateLeaderboard(entries, {
      campus: activeTab === 'MY_CAMPUS' ? userCampus : undefined,
      timeWindowMs: activeTab === 'TODAY' ? 24 * 60 * 60 * 1000 : undefined,
      searchQuery: searchQuery,
      game: 'modak-masti',
    });
  }, [entries, activeTab, userCampus, searchQuery]);

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div
      id="leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#240c0e] border border-amber-600/40 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col text-amber-100 shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-800/40 flex items-center justify-between shrink-0 bg-[#2b0f12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-['Cinzel',serif] text-amber-200 leading-tight">
                  MODAK MASTI RANKS
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'Player' : 'Players'}
                </span>
              </div>
              <p className="text-xs text-amber-400/90 font-medium">
                Official Hall of Fame • Best Score per Player
              </p>
            </div>
          </div>

          <button
            id="close-leaderboard-btn"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 p-1.5 rounded-lg hover:bg-amber-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: GLOBAL | MY CAMPUS | TODAY'S TOP */}
        <div className="p-3 sm:p-4 pb-2 shrink-0 border-b border-amber-900/30">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-amber-900/40">
            <button
              id="tab-global-btn"
              onClick={() => setActiveTab('GLOBAL')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'GLOBAL'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-stone-950 shadow'
                  : 'text-amber-300/80 hover:text-amber-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>GLOBAL</span>
            </button>

            <button
              id="tab-campus-btn"
              onClick={() => setActiveTab('MY_CAMPUS')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 truncate ${
                activeTab === 'MY_CAMPUS'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-stone-950 shadow'
                  : 'text-amber-300/80 hover:text-amber-100'
              }`}
              title={profile.campusName}
            >
              <School className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">MY CAMPUS</span>
            </button>

            <button
              id="tab-today-btn"
              onClick={() => setActiveTab('TODAY')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'TODAY'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-stone-950 shadow'
                  : 'text-amber-300/80 hover:text-amber-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>TODAY</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70" />
            <input
              id="leaderboard-search-input"
              type="text"
              placeholder="Search player or campus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-100 placeholder-amber-600/60 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Current Campus Context Badge */}
        {activeTab === 'MY_CAMPUS' && (
          <div className="px-4 py-1.5 bg-amber-900/20 text-xs text-amber-300/90 border-b border-amber-900/30 flex items-center justify-between">
            <span className="truncate">Showing ranking for: <strong>{userCampus}</strong></span>
          </div>
        )}

        {/* Leaderboard Table / List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-10 text-amber-400/60 text-xs">
              <span className="text-3xl block mb-2">🪔</span>
              No runs recorded for this view yet. Be the first champion to set a record!
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const entryCampus = entry.campus || entry.campusName || 'Unknown Campus';
              const isCurrentUser =
                (entry.userId &&
                  profile.id &&
                  entry.userId.toLowerCase() === profile.id.toLowerCase()) ||
                (entry.rollId &&
                  profile.rollId &&
                  entry.rollId.trim().toLowerCase() === profile.rollId.trim().toLowerCase()) ||
                (entry.playerName.trim().toLowerCase() === profile.name.trim().toLowerCase() &&
                  entryCampus.toLowerCase() === userCampus.toLowerCase());
              const isTop3 = idx < 3;

              return (
                <div
                  key={entry.id || idx}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                    isCurrentUser
                      ? 'bg-amber-600/20 border-amber-500/60'
                      : isTop3
                      ? 'bg-amber-950/50 border-amber-700/40'
                      : 'bg-black/30 border-amber-900/30'
                  }`}
                >
                  {/* Left: Rank, Name, Campus, Roll ID */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 text-center font-bold text-sm shrink-0">
                      {getRankBadge(idx)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-amber-100 truncate">
                          {entry.playerName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1 rounded uppercase font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400/90 block truncate font-medium">
                        {entryCampus}
                      </span>
                      {entry.rollId && (
                        <span className="text-[10px] text-amber-500/80 block font-mono">
                          ID / Roll: {entry.rollId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Score, Time, Stats */}
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-amber-300 font-mono text-sm sm:text-base">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-400/70 space-x-1.5">
                      <span>{entry.survivalTime.toFixed(1)}s</span>
                      <span>•</span>
                      <span>🍬 {entry.modaksCaught}</span>
                      <span>•</span>
                      <span className="text-orange-400 font-bold">×{entry.bestCombo}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-3 sm:p-4 border-t border-amber-900/40 bg-[#2b0f12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-400/80">
              Ranked by <strong>Best Score</strong> • Tie-breaker: <strong>Longest Survival Time</strong>
            </span>
          </div>
          <button
            id="leaderboard-play-btn"
            onClick={onPlayNow}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 transition-all"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};
