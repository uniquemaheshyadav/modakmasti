import { ActivePowerUps, FallingItem, FestivalEvent, FloatingText, GameStats, ItemType, Particle } from '../types';
import { sound } from '../services/sound';
import { getPersonalBest, savePersonalBest, unlockAchievement } from '../services/storage';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
  onMilestone: (text: string) => void;
  onPersonalBestAlert: (type: 'CLOSE' | 'BEATEN') => void;
  onEventStart: (eventName: string, duration: number) => void;
}

export class GameEngine {
  private width: number = 400;
  private height: number = 600;

  // Basket state
  public basketX: number = 200;
  public basketY: number = 540;
  public basketWidth: number = 100;
  public basketHeight: number = 32;
  public basketTargetX: number = 200;
  public basketVx: number = 0;
  public bounceScaleY: number = 1;
  public bounceScaleX: number = 1;
  public bounceVelocityY: number = 0;

  // Falling items
  public items: FallingItem[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Active power-ups
  public powerUps: ActivePowerUps = {
    magnet: 0,
    slowTime: 0,
    shield: false,
    doubleScore: 0,
    basketSizeBoost: 0,
    speedBoost: 0,
  };

  // Game Stats
  public stats: GameStats = {
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
    personalBest: 0,
  };

  // Event states
  public currentEvent: FestivalEvent = 'NONE';
  public eventTimeRemaining: number = 0;
  public nextEventTimer: number = 22; // triggers first special event around 22s

  // Wind gust
  public windForce: number = 0;
  public windDuration: number = 0;

  // Spawning logic
  private spawnTimer: number = 0;
  private spawnInterval: number = 1.3;
  private waveQueue: Array<() => void> = [];

  // Screen shake
  public screenShake: number = 0;

  // Loop & timing
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private callbacks: GameEngineCallbacks;

  // Milestone alerts
  private alerted95: boolean = false;
  private alertedBeaten: boolean = false;
  private basketSizeAwarded: boolean = false;

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.stats.personalBest = getPersonalBest();
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.basketY = h - 55;
    // Keep basket inside bounds
    this.basketX = Math.max(this.basketWidth / 2, Math.min(w - this.basketWidth / 2, this.basketX));
    this.basketTargetX = this.basketX;
  }

  public start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.reset();
  }

  public pause() {
    this.isRunning = false;
  }

  public resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
    }
  }

  public stop() {
    this.isRunning = false;
  }

  public reset() {
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];
    this.basketX = this.width / 2;
    this.basketTargetX = this.width / 2;
    this.basketVx = 0;
    this.bounceScaleY = 1;
    this.bounceScaleX = 1;
    this.bounceVelocityY = 0;

    this.powerUps = {
      magnet: 0,
      slowTime: 0,
      shield: false,
      doubleScore: 0,
      basketSizeBoost: 0,
      speedBoost: 0,
    };

    const pb = getPersonalBest();
    this.stats = {
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
      personalBest: pb,
    };

    this.currentEvent = 'NONE';
    this.eventTimeRemaining = 0;
    this.nextEventTimer = 22;
    this.windForce = 0;
    this.windDuration = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1.3;
    this.waveQueue = [];
    this.screenShake = 0;
    this.alerted95 = false;
    this.alertedBeaten = false;
    this.basketSizeAwarded = false;

    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  // Handle player horizontal input (arrow keys, A/D, or mouse/touch drag)
  public moveBasketTo(targetX: number) {
    const halfW = this.getCurrentBasketWidth() / 2;
    this.basketTargetX = Math.max(halfW + 8, Math.min(this.width - halfW - 8, targetX));
  }

  public stepInput(direction: -1 | 0 | 1) {
    const speed = (this.powerUps.speedBoost > 0 ? 550 : 420);
    const halfW = this.getCurrentBasketWidth() / 2;
    this.basketTargetX += direction * speed * 0.035;
    this.basketTargetX = Math.max(halfW + 8, Math.min(this.width - halfW - 8, this.basketTargetX));
  }

  public getCurrentBasketWidth(): number {
    let w = this.basketWidth;
    if (this.powerUps.basketSizeBoost > 0) {
      w *= 1.25;
    }
    return w;
  }

  // Core update cycle (delta time based for smooth 60 FPS)
  public update(now: number) {
    if (!this.isRunning) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // 1. Survival time & difficulty scaling
    this.stats.survivalTime += dt;
    this.updateDifficulty(dt);

    // 2. Update Basket movement with smooth physics spring / lerp
    this.updateBasket(dt);

    // 3. Update Power-ups duration
    this.updatePowerUps(dt);

    // 4. Update Festival Events & Wind
    this.updateEvents(dt);

    // 5. Update Falling Objects Physics & Collisions
    this.updateItems(dt);

    // 6. Update Particles
    this.updateParticles(dt);

    // 7. Update Floating texts
    this.updateFloatingTexts(dt);

    // 8. Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    // 9. Personal Best Proximity checks
    this.checkPersonalBest();

    // 10. Trigger stats callback periodically
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  private updateBasket(dt: number) {
    // Smooth responsive lerp with inertia
    const dx = this.basketTargetX - this.basketX;
    const lerpFactor = this.powerUps.speedBoost > 0 ? 18 : 14;
    this.basketVx = dx * lerpFactor;
    this.basketX += this.basketVx * dt;

    // Basket catch bounce spring physics
    const springK = 180;
    const damping = 12;
    const displacement = this.bounceScaleY - 1;
    const force = -springK * displacement - damping * this.bounceVelocityY;
    this.bounceVelocityY += force * dt;
    this.bounceScaleY += this.bounceVelocityY * dt;
    // Inverse stretch horizontally for squash-and-stretch
    this.bounceScaleX = 1 + (1 - this.bounceScaleY) * 0.8;
  }

  private triggerBasketBounce() {
    this.bounceScaleY = 0.76;
    this.bounceVelocityY = -2;
  }

  private updatePowerUps(dt: number) {
    if (this.powerUps.magnet > 0) this.powerUps.magnet = Math.max(0, this.powerUps.magnet - dt);
    if (this.powerUps.slowTime > 0) this.powerUps.slowTime = Math.max(0, this.powerUps.slowTime - dt);
    if (this.powerUps.doubleScore > 0) this.powerUps.doubleScore = Math.max(0, this.powerUps.doubleScore - dt);
    if (this.powerUps.basketSizeBoost > 0) this.powerUps.basketSizeBoost = Math.max(0, this.powerUps.basketSizeBoost - dt);
    if (this.powerUps.speedBoost > 0) this.powerUps.speedBoost = Math.max(0, this.powerUps.speedBoost - dt);

    // Fever mode countdown
    if (this.stats.isFever) {
      this.stats.feverTimeRemaining -= dt;
      this.stats.feverGauge = (this.stats.feverTimeRemaining / 7) * 100;
      if (this.stats.feverTimeRemaining <= 0) {
        this.stats.isFever = false;
        this.stats.feverGauge = 0;
      }
    }
  }

  // Progressive difficulty scaling over survival duration
  private updateDifficulty(dt: number) {
    const time = this.stats.survivalTime;

    // Base spawn interval decreases over time smoothly
    if (time < 15) {
      this.spawnInterval = 1.25;
    } else if (time < 30) {
      this.spawnInterval = 1.05;
    } else if (time < 60) {
      this.spawnInterval = 0.85;
    } else if (time < 90) {
      this.spawnInterval = 0.65;
    } else {
      // Chaos Mode!
      this.spawnInterval = 0.52;
    }

    // Faster during Dhol Rush and Fever
    if (this.stats.isFever || this.currentEvent === 'DHOL_RUSH' || this.currentEvent === 'MODAK_RAIN') {
      this.spawnInterval *= 0.6;
    }

    // Spawn ticker
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnNextWave(time);
    }
  }

  private updateEvents(dt: number) {
    if (this.currentEvent !== 'NONE') {
      this.eventTimeRemaining -= dt;
      if (this.currentEvent === 'DHOL_RUSH' && Math.random() < 0.1) {
        sound.playDholBeat();
      }
      if (this.eventTimeRemaining <= 0) {
        this.currentEvent = 'NONE';
      }
    } else {
      this.nextEventTimer -= dt;
      if (this.nextEventTimer <= 0) {
        // Trigger a festival event
        const events: FestivalEvent[] = ['DHOL_RUSH', 'MODAK_RAIN', 'DIYA_SHOWER', 'FLOWER_SHOWER'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        this.triggerEvent(chosen);
        this.nextEventTimer = 25 + Math.random() * 15; // next event in 25-40s
      }
    }

    // Wind gust simulation
    if (this.windDuration > 0) {
      this.windDuration -= dt;
      if (this.windDuration <= 0) {
        this.windForce = 0;
      }
    } else if (this.stats.survivalTime > 35 && Math.random() < 0.003) {
      // Occasional gentle wind gust
      this.windForce = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 50);
      this.windDuration = 3 + Math.random() * 3;
      this.callbacks.onMilestone('💨 WIND GUST!');
    }
  }

  public triggerEvent(event: FestivalEvent) {
    this.currentEvent = event;
    let dur = 8;
    let title = '';

    switch (event) {
      case 'DHOL_RUSH':
        dur = 8;
        title = '🥁 DHOL RUSH!';
        sound.playDholBeat();
        sound.playFeverStart();
        unlockAchievement('festival_fever');
        break;
      case 'MODAK_RAIN':
        dur = 7;
        title = '🍬 MODAK RAIN!';
        sound.playGoldenCatch();
        break;
      case 'DIYA_SHOWER':
        dur = 6;
        title = '🪔 DIYA SHOWER!';
        break;
      case 'FLOWER_SHOWER':
        dur = 6;
        title = '🌸 FLOWER SHOWER!';
        break;
    }

    this.eventTimeRemaining = dur;
    this.callbacks.onEventStart(title, dur);
  }

  // Smart controlled spawning patterns
  private spawnNextWave(gameTime: number) {
    const w = this.width;
    const padding = 35;
    const availableW = w - padding * 2;

    // Check special event spawns first
    if (this.currentEvent === 'MODAK_RAIN') {
      const x = padding + Math.random() * availableW;
      this.createItem('NORMAL_MODAK', x);
      if (Math.random() < 0.3) {
        this.createItem('GOLDEN_MODAK', padding + Math.random() * availableW);
      }
      return;
    }

    if (this.currentEvent === 'DIYA_SHOWER') {
      const x = padding + Math.random() * availableW;
      this.createItem('DIYA', x);
      return;
    }

    if (this.currentEvent === 'FLOWER_SHOWER') {
      const x = padding + Math.random() * availableW;
      this.createItem('FLOWER', x);
      return;
    }

    // Standard pattern selection
    const patterns = ['single', 'single', 'double'];
    if (gameTime > 25) patterns.push('triple', 'bait');
    if (gameTime > 45) patterns.push('zigzag', 'wave', 'cluster');

    const chosen = patterns[Math.floor(Math.random() * patterns.length)];

    switch (chosen) {
      case 'single': {
        const x = padding + Math.random() * availableW;
        this.createItem(this.pickItemType(gameTime), x);
        break;
      }
      case 'double': {
        const x1 = padding + Math.random() * (availableW * 0.45);
        const x2 = padding + availableW * 0.55 + Math.random() * (availableW * 0.45);
        this.createItem(this.pickItemType(gameTime), x1);
        this.createItem(this.pickItemType(gameTime), x2);
        break;
      }
      case 'triple': {
        const col1 = padding + availableW * 0.15;
        const col2 = padding + availableW * 0.5;
        const col3 = padding + availableW * 0.85;
        this.createItem(this.pickItemType(gameTime), col1);
        this.createItem(this.pickItemType(gameTime), col2);
        this.createItem(this.pickItemType(gameTime), col3);
        break;
      }
      case 'bait': {
        // High risk / high reward: Golden modak close to a hazard!
        const centerX = padding + Math.random() * availableW;
        const offset = 45;
        const goldenX = Math.max(padding, Math.min(w - padding, centerX - offset));
        const hazardX = Math.max(padding, Math.min(w - padding, centerX + offset));
        this.createItem('GOLDEN_MODAK', goldenX);
        this.createItem('COCONUT', hazardX);
        break;
      }
      case 'zigzag': {
        const x = Math.random() > 0.5 ? padding + 20 : w - padding - 20;
        const item = this.createItem(this.pickItemType(gameTime), x);
        if (item) {
          item.speedX = (x > w / 2 ? -1 : 1) * (40 + Math.random() * 30);
        }
        break;
      }
      case 'cluster': {
        const cx = padding + Math.random() * availableW;
        for (let i = 0; i < 3; i++) {
          const ox = cx + (i - 1) * 28;
          this.createItem(i === 1 ? 'GOLDEN_MODAK' : 'NORMAL_MODAK', ox, -i * 24);
        }
        break;
      }
      default: {
        const x = padding + Math.random() * availableW;
        this.createItem(this.pickItemType(gameTime), x);
      }
    }
  }

  // Weight-based item type determination
  private pickItemType(gameTime: number): ItemType {
    const roll = Math.random();

    // Occasional power-up spawn (5% chance)
    if (roll < 0.05) {
      const pUps: ItemType[] = ['MAGNET', 'SLOW_TIME', 'SHIELD', 'DOUBLE_SCORE'];
      return pUps[Math.floor(Math.random() * pUps.length)];
    }

    // Ultra rare diamond modak (1.5% chance)
    if (roll < 0.065) {
      return 'DIAMOND_MODAK';
    }

    // Rare golden modak (8% chance)
    if (roll < 0.15) {
      return 'GOLDEN_MODAK';
    }

    // Blessing modak (8% chance)
    if (roll < 0.23) {
      return 'BLESSING_MODAK';
    }

    // Hazards (coconuts, heavy stones): spawn only after 15 seconds
    if (gameTime >= 15) {
      const hazardChance = gameTime < 30 ? 0.14 : gameTime < 60 ? 0.22 : 0.3;
      if (Math.random() < hazardChance) {
        return Math.random() < 0.7 ? 'COCONUT' : 'HEAVY_STONE';
      }
    }

    return 'NORMAL_MODAK';
  }

  private createItem(type: ItemType, x: number, initialYOffset: number = 0): FallingItem | null {
    // Base falling speed scales with time
    const baseSpeed = 160 + Math.min(240, this.stats.survivalTime * 2.2);
    let speed = baseSpeed * (0.9 + Math.random() * 0.25);
    let radius = 17;
    let points = 10;
    let isHazard = false;
    let isPowerUp = false;
    let color = '#fef08a';

    switch (type) {
      case 'NORMAL_MODAK':
        points = 10;
        color = '#fef08a';
        radius = 16;
        break;
      case 'GOLDEN_MODAK':
        points = 50;
        color = '#f59e0b';
        radius = 19;
        speed *= 1.08;
        break;
      case 'DIAMOND_MODAK':
        points = 100;
        color = '#38bdf8';
        radius = 20;
        speed *= 1.15;
        break;
      case 'BLESSING_MODAK':
        points = 25;
        color = '#f43f5e';
        radius = 17;
        break;
      case 'COCONUT':
        isHazard = true;
        points = -20;
        color = '#78350f';
        radius = 18;
        speed *= 1.05;
        break;
      case 'HEAVY_STONE':
        isHazard = true;
        points = 0;
        color = '#475569';
        radius = 19;
        speed *= 1.12;
        break;
      case 'DIYA':
        points = 25;
        color = '#ea580c';
        radius = 16;
        break;
      case 'FLOWER':
        points = 15;
        color = '#f97316';
        radius = 15;
        break;
      case 'MAGNET':
      case 'SLOW_TIME':
      case 'SHIELD':
      case 'DOUBLE_SCORE':
        isPowerUp = true;
        points = 15;
        radius = 18;
        speed *= 0.88;
        break;
    }

    const item: FallingItem = {
      id: 'item-' + Math.random().toString(36).substring(2, 8),
      type,
      x,
      y: -25 + initialYOffset,
      radius,
      speedY: speed,
      speedX: (Math.random() - 0.5) * 20,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 2.5,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 2 + Math.random() * 3,
      points,
      isHazard,
      isPowerUp,
      color,
      sparkleTimer: 0,
    };

    this.items.push(item);
    return item;
  }

  // Update physics for all active items
  private updateItems(dt: number) {
    const basketW = this.getCurrentBasketWidth();
    const basketHalfW = basketW / 2;
    const basketY = this.basketY;
    const basketX = this.basketX;

    const speedScale = this.powerUps.slowTime > 0 ? 0.5 : 1.0;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      // Sparkle timer for special items
      if (item.sparkleTimer !== undefined) {
        item.sparkleTimer += dt * 60;
      }

      // Magnet power-up attraction: attracts non-hazards toward the basket
      if (this.powerUps.magnet > 0 && !item.isHazard) {
        const dx = basketX - item.x;
        const dy = basketY - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 260 && dist > 5) {
          const pullStrength = 320 * (1 - dist / 260);
          item.x += (dx / dist) * pullStrength * dt;
        }
      }

      // Wind gust drift
      item.x += (this.windForce + item.speedX) * dt * speedScale;
      // Wobble
      item.x += Math.sin(item.wobbleOffset) * 12 * dt;
      item.wobbleOffset += item.wobbleSpeed * dt;

      // Keep within horizontal boundaries
      item.x = Math.max(item.radius, Math.min(this.width - item.radius, item.x));

      // Fall downwards with gravity
      item.y += item.speedY * dt * speedScale;
      item.rotation += item.rotationSpeed * dt;

      // Check Collision with Basket
      const catchZoneTop = basketY - 14;
      const catchZoneBottom = basketY + 12;

      if (item.y + item.radius >= catchZoneTop && item.y - item.radius <= catchZoneBottom) {
        // Check horizontal containment in basket ellipse
        const xDist = Math.abs(item.x - basketX);
        if (xDist <= basketHalfW * 0.95) {
          // CAUGHT!
          this.handleItemCatch(item);
          this.items.splice(i, 1);
          continue;
        }
      }

      // Check Missed (Fallen below screen bottom)
      if (item.y - item.radius > this.height) {
        this.handleItemMiss(item);
        this.items.splice(i, 1);
      }
    }
  }

  // Handle successful catch or hazard catch
  private handleItemCatch(item: FallingItem) {
    this.triggerBasketBounce();

    // 1. Hazard Caught
    if (item.isHazard) {
      if (this.powerUps.shield) {
        // Shield absorbed the hazard!
        this.powerUps.shield = false;
        sound.playShieldAbsorb();
        this.createParticleBurst(item.x, item.y, '#fef08a', 20, 'sparkle');
        this.addFloatingText('SHIELD BLOCKED!', item.x, item.y - 15, '#facc15');
        unlockAchievement('divine_shield');
        return;
      }

      // Hazard penalty
      this.screenShake = 12;
      sound.playHazard();

      // Coconut breaks combo and deducts points
      if (item.type === 'COCONUT') {
        const penalty = 20;
        this.stats.score = Math.max(0, this.stats.score - penalty);
        this.stats.currentCombo = 1;
        this.stats.streak = 0;
        this.stats.lives = Math.max(0, this.stats.lives - 1);
        this.addFloatingText('-20 💔', item.x, item.y - 15, '#ef4444');
        this.createParticleBurst(item.x, item.y, '#78350f', 16);
      } else if (item.type === 'HEAVY_STONE') {
        // Slows basket down for 3 seconds
        this.powerUps.speedBoost = -3; // temporary sluggishness
        this.stats.lives = Math.max(0, this.stats.lives - 1);
        this.addFloatingText('SLOWED! 💔', item.x, item.y - 15, '#94a3b8');
        this.createParticleBurst(item.x, item.y, '#64748b', 16);
      }

      // Check Game Over
      if (this.stats.lives <= 0) {
        this.triggerGameOver();
      }
      return;
    }

    // 2. Power-Up Caught
    if (item.isPowerUp) {
      sound.playPowerUp();
      this.createParticleBurst(item.x, item.y, item.color, 24, 'sparkle');

      switch (item.type) {
        case 'MAGNET':
          this.powerUps.magnet = 5.5;
          this.addFloatingText('🧲 MAGNET ACTIVE!', item.x, item.y - 15, '#818cf8');
          break;
        case 'SLOW_TIME':
          this.powerUps.slowTime = 5.5;
          this.addFloatingText('❄️ SLOW TIME!', item.x, item.y - 15, '#38bdf8');
          break;
        case 'SHIELD':
          this.powerUps.shield = true;
          this.addFloatingText('🛡️ SHIELD ACTIVE!', item.x, item.y - 15, '#fde047');
          break;
        case 'DOUBLE_SCORE':
          this.powerUps.doubleScore = 6;
          this.addFloatingText('✨ 2X SCORE!', item.x, item.y - 15, '#4ade80');
          break;
      }
      return;
    }

    // 3. Good Item Caught (Modak / Diya / Flower)
    this.stats.modaksCaught++;
    this.stats.streak++;

    // First catch achievement
    if (this.stats.modaksCaught === 1) {
      unlockAchievement('first_catch');
    }

    // Combo system calculations:
    // 1 catch: x1, 3 catches: x2, 6 catches: x3, 10 catches: x4, 15 catches: x5
    const streak = this.stats.streak;
    let combo = 1;
    if (streak >= 15) combo = 5;
    else if (streak >= 10) combo = 4;
    else if (streak >= 6) combo = 3;
    else if (streak >= 3) combo = 2;

    if (combo > this.stats.currentCombo) {
      this.callbacks.onMilestone(`COMBO ×${combo}!`);
      if (combo >= 5) {
        unlockAchievement('modak_master');
      }
    }
    this.stats.currentCombo = combo;
    if (combo > this.stats.bestCombo) {
      this.stats.bestCombo = combo;
    }

    // Streak milestones
    if (streak === 5) this.callbacks.onMilestone('NICE! 🍬');
    else if (streak === 10) {
      this.callbacks.onMilestone('GREAT! 🔥');
      unlockAchievement('sweet_streak');
    } else if (streak === 20) this.callbacks.onMilestone('AMAZING! ⚡');
    else if (streak === 30) this.callbacks.onMilestone('MODAK MASTER! 👑');

    // Calculate score with combo and fever multipliers
    let multiplier = combo;
    if (this.powerUps.doubleScore > 0) multiplier *= 2;
    if (this.stats.isFever) multiplier *= 2;

    const earned = item.points * multiplier;
    this.stats.score += earned;

    // Check 5,000 pts legend achievement
    if (this.stats.score >= 5000) {
      unlockAchievement('modak_legend');
    }

    // In-run basket upgrade at 1,000 pts milestone
    if (this.stats.score >= 1000 && !this.basketSizeAwarded) {
      this.basketSizeAwarded = true;
      this.powerUps.basketSizeBoost = 20; // 20s of +25% basket size!
      this.callbacks.onMilestone('BASKET SIZE +25%! 🪔');
      sound.playPowerUp();
    }

    // Fever gauge increase
    if (!this.stats.isFever) {
      const gaugeInc = item.type === 'BLESSING_MODAK' ? 24 : item.type === 'GOLDEN_MODAK' ? 20 : 7;
      this.stats.feverGauge = Math.min(100, this.stats.feverGauge + gaugeInc);
      if (this.stats.feverGauge >= 100) {
        this.triggerFeverMode();
      }
    }

    // Audio & Visual Reactions
    if (item.type === 'GOLDEN_MODAK') {
      this.stats.goldenCaught++;
      sound.playGoldenCatch();
      this.createParticleBurst(item.x, item.y, '#f59e0b', 32, 'sparkle');
      this.addFloatingText(`GOLDEN! +${earned}`, item.x, item.y - 20, '#fde047');
      if (this.stats.goldenCaught >= 5) {
        unlockAchievement('golden_touch');
      }
    } else if (item.type === 'DIAMOND_MODAK') {
      this.stats.diamondsCaught++;
      sound.playDiamondCatch();
      this.createParticleBurst(item.x, item.y, '#38bdf8', 40, 'sparkle');
      this.addFloatingText(`DIVINE DIAMOND! +${earned}`, item.x, item.y - 20, '#bae6fd');
      unlockAchievement('diamond_blessing');
    } else if (item.type === 'BLESSING_MODAK') {
      sound.playCatch(combo + 1);
      this.createParticleBurst(item.x, item.y, '#f43f5e', 22, 'petal');
      this.addFloatingText(`BLESSING! +${earned}`, item.x, item.y - 15, '#f43f5e');
    } else {
      sound.playCatch(combo);
      this.createParticleBurst(item.x, item.y, '#fef08a', 12);
      this.addFloatingText(`+${earned}`, item.x, item.y - 15, combo > 1 ? '#f59e0b' : '#fef08a');
    }
  }

  // Trigger exciting Modak Fever
  private triggerFeverMode() {
    this.stats.isFever = true;
    this.stats.feverTimeRemaining = 7;
    sound.playFeverStart();
    this.callbacks.onMilestone('🔥 MODAK FEVER ×2!');
    unlockAchievement('festival_fever');

    // Screen burst celebration
    this.createParticleBurst(this.width / 2, this.height * 0.4, '#f59e0b', 50, 'sparkle');
  }

  private handleItemMiss(item: FallingItem) {
    // Missing normal modak doesn't cost life, but breaks streak if significant
    if (!item.isHazard && !item.isPowerUp) {
      // Gentle streak reset on miss
      if (this.stats.streak > 5) {
        this.addFloatingText('Streak Lost', item.x, this.height - 25, '#9ca3af');
      }
      this.stats.streak = 0;
      this.stats.currentCombo = 1;
    }
  }

  private checkPersonalBest() {
    const pb = this.stats.personalBest;
    if (pb > 0) {
      if (!this.alerted95 && this.stats.score >= pb * 0.95 && this.stats.score < pb) {
        this.alerted95 = true;
        this.callbacks.onPersonalBestAlert('CLOSE');
      } else if (!this.alertedBeaten && this.stats.score > pb) {
        this.alertedBeaten = true;
        this.stats.personalBest = this.stats.score;
        savePersonalBest(this.stats.score);
        sound.playPersonalBest();
        this.callbacks.onPersonalBestAlert('BEATEN');
        this.callbacks.onMilestone('🏆 NEW PERSONAL BEST!');
      }
    }
  }

  private triggerGameOver() {
    this.isRunning = false;
    sound.playGameOver();
    this.screenShake = 16;
    this.callbacks.onGameOver({ ...this.stats });
  }

  // Visual effects: particles & floating texts
  public createParticleBurst(x: number, y: number, color: string, count: number = 16, shape?: 'circle' | 'sparkle' | 'petal') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 25,
        size: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1,
        decay: 1.2 + Math.random() * 1.5,
        shape: shape || 'circle',
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 4,
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#fef08a') {
    this.floatingTexts.push({
      id: 'ft-' + Math.random().toString(36).substring(2, 7),
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1.3,
      vy: -55,
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // subtle gravity
      p.alpha -= p.decay * dt;
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed * dt;
      }
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * dt;
      t.alpha -= 1.1 * dt;
      t.scale = Math.max(1, t.scale - 0.5 * dt);
      if (t.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
