import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Heart, Sparkles, Flame, Shield, Magnet, Snowflake, Zap, Timer } from 'lucide-react';
import { GameStats, PlayerProfile } from '../types';
import { GameEngine } from '../game/gameEngine';
import { CanvasRenderer } from '../game/canvasRenderer';
import { GameOverModal } from './GameOverModal';
import { PauseModal } from './PauseModal';
import { LeaderboardModal } from './LeaderboardModal';
import { validateAndSubmitScore, getLeaderboard, getStoredProfile } from '../services/storage';

interface ModakCatchGameProps {
  profile: PlayerProfile;
  personalBest: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExitToMenu: () => void;
}

export const ModakCatchGame: React.FC<ModakCatchGameProps> = ({
  profile,
  personalBest,
  soundEnabled,
  onToggleSound,
  onExitToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // UI state synchronized from engine
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    survivalTime: 0,
    modaksCaught: 0,
    bestCombo: 1,
    currentCombo: 1,
    streak: 0,
    goldenCaught: 0,
    diamondsCaught: 0,
    lives: 3,
    maxLives: 3,
    feverGauge: 0,
    isFever: false,
    feverTimeRemaining: 0,
    personalBest,
  });

  const [milestoneText, setMilestoneText] = useState<string | null>(null);
  const [eventBanner, setEventBanner] = useState<string | null>(null);
  const [pbAlert, setPbAlert] = useState<'CLOSE' | 'BEATEN' | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Milestone timer ref
  const milestoneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMilestone = useCallback((text: string) => {
    setMilestoneText(text);
    if (milestoneTimeoutRef.current) clearTimeout(milestoneTimeoutRef.current);
    milestoneTimeoutRef.current = setTimeout(() => {
      setMilestoneText(null);
    }, 1800);
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback((finalStats: GameStats) => {
    setIsGameOver(true);
    // Ensure authoritative profile is used (not stale closure)
    const stored = getStoredProfile();
    const authoritativeCampus =
      profile.campus ||
      stored.campus ||
      profile.campusName ||
      stored.campusName ||
      'Sanjay Ghodawat University,MH';
    const authoritativeUserId = profile.id || stored.id || '';
    const authoritativeName = profile.name || stored.name || 'Festival Champion';
    const authoritativeRoll = profile.rollId || stored.rollId || '';

    // Submit score to fair leaderboard
    const result = validateAndSubmitScore({
      userId: authoritativeUserId,
      user_id: authoritativeUserId,
      game: 'modak-masti',
      playerName: authoritativeName,
      rollId: authoritativeRoll,
      campus: authoritativeCampus,
      campusId: authoritativeCampus,
      campusName: authoritativeCampus,
      score: finalStats.score,
      survivalTime: finalStats.survivalTime,
      modaksCaught: finalStats.modaksCaught,
      bestCombo: finalStats.bestCombo,
      goldenModaks: finalStats.goldenCaught,
    });
    setIsNewRecord(result.isNewBest);
  }, [profile]);

  // Initialize GameEngine & CanvasRenderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new CanvasRenderer(ctx);
    rendererRef.current = renderer;

    const engine = new GameEngine({
      onStatsUpdate: (s) => setStats(s),
      onGameOver: handleGameOver,
      onMilestone: showMilestone,
      onPersonalBestAlert: (type) => setPbAlert(type),
      onEventStart: (name) => {
        setEventBanner(name);
        setTimeout(() => setEventBanner(null), 3000);
      },
    });
    engineRef.current = engine;

    // Canvas resize handling with pixel ratio
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const w = rect.width;
      const h = rect.height;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      renderer.setDimensions(w, h);
      engine.setDimensions(w, h);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Start engine
    engine.start();

    // Main animation loop
    let lastRenderTime = performance.now();
    const loop = (time: number) => {
      if (engineRef.current && rendererRef.current) {
        const eng = engineRef.current;
        const ren = rendererRef.current;

        // Update physics
        eng.update(time);

        // Screen shake transform
        ctx.save();
        if (eng.screenShake > 0) {
          const shakeX = (Math.random() - 0.5) * eng.screenShake;
          const shakeY = (Math.random() - 0.5) * eng.screenShake;
          ctx.translate(shakeX, shakeY);
        }

        // Render Background & Temple Pandal
        ren.renderBackground(
          time,
          eng.stats.isFever,
          eng.powerUps.slowTime > 0,
          eng.currentEvent === 'DHOL_RUSH'
        );

        // Render Falling Items
        eng.items.forEach((item) => {
          ren.drawFallingItem(item);
        });

        // Render Particles
        ren.renderParticles(eng.particles);

        // Render Player Basket & Mushak
        ren.drawBasket(
          eng.basketX,
          eng.basketY,
          eng.getCurrentBasketWidth(),
          eng.basketHeight,
          eng.bounceScaleY,
          eng.bounceScaleX,
          eng.powerUps
        );

        // Render Floating Score texts
        ren.renderFloatingTexts(eng.floatingTexts);

        ctx.restore();
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', updateCanvasSize);
      if (engineRef.current) engineRef.current.stop();
    };
  }, [handleGameOver, showMilestone]);

  // Touch & Pointer controls
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || isPaused || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    engineRef.current.moveBasketTo(touchX);
  }, [isPaused, isGameOver]);

  // Keyboard controls
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (!isGameOver) {
          togglePause();
        }
        return;
      }
      keysPressed[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Keyboard ticker loop
    const keyInterval = setInterval(() => {
      if (!engineRef.current || isPaused || isGameOver) return;

      if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        engineRef.current.stepInput(-1);
      }
      if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        engineRef.current.stepInput(1);
      }
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(keyInterval);
    };
  }, [isPaused, isGameOver]);

  // Pause Controls
  const togglePause = () => {
    if (isPaused) {
      engineRef.current?.resume();
      setIsPaused(false);
    } else {
      engineRef.current?.pause();
      setIsPaused(true);
    }
  };

  // Instant One-Click Replay (Prompt Requirement #24)
  const handlePlayAgain = () => {
    setIsGameOver(false);
    setIsPaused(false);
    setIsNewRecord(false);
    setMilestoneText(null);
    setEventBanner(null);
    engineRef.current?.reset();
    engineRef.current?.start();
  };

  return (
    <div
      id="modak-masti-container"
      ref={containerRef}
      className="relative w-full h-[calc(100vh-62px)] max-w-4xl mx-auto flex flex-col justify-between overflow-hidden bg-[#160607] touch-none select-none"
    >
      {/* 1. TOP HUD BAR: Lives, Score, Timer, Best, Pause */}
      <div
        id="game-hud-top"
        className="absolute top-0 left-0 right-0 z-20 px-3 sm:px-6 pt-3 pb-2 flex items-center justify-between pointer-events-none"
      >
        {/* Left: Lives & Multiplier */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lives ❤️ */}
          <div
            id="hud-lives"
            className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-800/40"
          >
            {[...Array(stats.maxLives)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < stats.lives
                    ? 'text-red-500 fill-red-500 scale-100'
                    : 'text-stone-600 fill-transparent scale-90 opacity-40'
                }`}
              />
            ))}
          </div>

          {/* Combo Multiplier Badge */}
          <div
            id="hud-combo-badge"
            className={`px-2.5 py-1 rounded-full border font-black text-xs sm:text-sm tracking-wider flex items-center gap-1 transition-all ${
              stats.currentCombo > 1
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-amber-400 text-stone-950 scale-105 shadow-md shadow-orange-950/60'
                : 'bg-black/40 border-amber-900/40 text-amber-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>×{stats.currentCombo}</span>
          </div>
        </div>

        {/* Center: Live Score Display */}
        <div id="hud-score-display" className="text-center">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-400 drop-shadow-sm leading-none">
            {stats.score.toLocaleString()}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold block">
            Score
          </span>
        </div>

        {/* Right: Time, Personal Best, Pause Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Survival Timer */}
          <div
            id="hud-timer"
            className="hidden sm:flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-800/40 text-xs text-amber-200 font-mono"
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>{stats.survivalTime.toFixed(1)}s</span>
          </div>

          {/* Personal Best indicator */}
          {stats.personalBest > 0 && (
            <div
              id="hud-pb"
              className="hidden md:flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-amber-900/40 text-[11px] text-amber-300 font-mono"
            >
              <span className="text-amber-500 font-bold">BEST:</span>
              <span>{stats.personalBest.toLocaleString()}</span>
            </div>
          )}

          {/* Pause Button */}
          <button
            id="hud-pause-btn"
            onClick={togglePause}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-amber-300 border border-amber-800/40 transition-colors"
            title="Pause Game (Esc)"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 fill-amber-300" />
          </button>
        </div>
      </div>

      {/* 2. SECOND ROW: Streak counter & Fever Progress Bar */}
      <div className="absolute top-14 left-0 right-0 z-20 px-3 sm:px-6 flex items-center justify-between pointer-events-none">
        {/* Streak counter */}
        <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-900/30 text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
          <span>STREAK:</span>
          <span className="text-amber-100 font-mono">{stats.streak}</span>
        </div>

        {/* Fever Gauge Meter */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-amber-900/30 w-36 sm:w-48">
          <span className="text-[10px] font-bold text-orange-400 tracking-wider">
            {stats.isFever ? 'FEVER!' : 'FEVER'}
          </span>
          <div className="flex-1 bg-stone-900/80 h-2 rounded-full overflow-hidden border border-amber-800/30">
            <div
              className={`h-full transition-all duration-200 ${
                stats.isFever
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, stats.feverGauge))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. ACTIVE POWER-UPS BADGES (Floating under top HUD) */}
      <div className="absolute top-22 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        {engineRef.current?.powerUps.magnet ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-[10px] font-bold animate-pulse">
            <Magnet className="w-3 h-3 text-indigo-400" />
            <span>MAGNET {Math.ceil(engineRef.current.powerUps.magnet)}s</span>
          </div>
        ) : null}

        {engineRef.current?.powerUps.slowTime ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-500/50 text-sky-200 text-[10px] font-bold animate-pulse">
            <Snowflake className="w-3 h-3 text-sky-400" />
            <span>SLOW {Math.ceil(engineRef.current.powerUps.slowTime)}s</span>
          </div>
        ) : null}

        {engineRef.current?.powerUps.shield ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-400/60 text-amber-200 text-[10px] font-bold">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>DIVINE SHIELD</span>
          </div>
        ) : null}

        {engineRef.current?.powerUps.doubleScore ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-[10px] font-bold animate-pulse">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>2X SCORE {Math.ceil(engineRef.current.powerUps.doubleScore)}s</span>
          </div>
        ) : null}
      </div>

      {/* 4. DYNAMIC BANNERS: Milestone & Festival Event Popups */}
      {milestoneText && (
        <div
          id="milestone-banner"
          className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-stone-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-orange-950/70 animate-bounce"
        >
          {milestoneText}
        </div>
      )}

      {eventBanner && (
        <div
          id="festival-event-banner"
          className="absolute top-36 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-5 py-2 rounded-2xl bg-gradient-to-r from-red-600/90 to-orange-600/90 text-amber-100 font-extrabold text-sm tracking-widest uppercase shadow-2xl border border-yellow-300 animate-pulse text-center"
        >
          {eventBanner}
        </div>
      )}

      {/* 5. PERSONAL BEST PROXIMITY ALERT (Prompt Requirement #22) */}
      {pbAlert === 'CLOSE' && !isGameOver && (
        <div
          id="pb-close-alert"
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 rounded-full bg-orange-600/80 text-amber-100 text-[11px] font-bold tracking-wide border border-orange-400/60 animate-pulse"
        >
          🔥 95% OF YOUR BEST!
        </div>
      )}

      {/* 6. HTML5 CANVAS: High-performance 60 FPS gameplay */}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        onPointerDown={handlePointerMove}
        onPointerMove={handlePointerMove}
        className="w-full h-full block cursor-ew-resize"
      />

      {/* 7. MOBILE TOUCH HELPER INSTRUCTION OVERLAY (Subtle bottom drag hint) */}
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none text-[10px] text-amber-400/50 font-medium">
        ← Drag to move basket →
      </div>

      {/* 8. PAUSE MODAL */}
      {isPaused && !isGameOver && (
        <PauseModal
          onResume={togglePause}
          onRestart={handlePlayAgain}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      )}

      {/* 9. GAME OVER MODAL with instant replay (Prompt requirement #23 & #24) */}
      {isGameOver && (
        <GameOverModal
          stats={stats}
          profile={profile}
          isNewBest={isNewRecord}
          onPlayAgain={handlePlayAgain}
          onViewLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* 10. LEADERBOARD MODAL */}
      {showLeaderboard && (
        <LeaderboardModal
          entries={getLeaderboard()}
          profile={profile}
          onClose={() => setShowLeaderboard(false)}
          onPlayNow={() => {
            setShowLeaderboard(false);
            if (isGameOver) handlePlayAgain();
          }}
        />
      )}
    </div>
  );
};
