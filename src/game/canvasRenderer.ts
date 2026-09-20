import { ActivePowerUps, FallingItem, FloatingText, Particle } from '../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private time: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public renderBackground(time: number, isFever: boolean, isSlowTime: boolean, isDholRush: boolean) {
    this.time = time;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // 1. Sky & Pandal base gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isFever) {
      bgGrad.addColorStop(0, '#2d0806');
      bgGrad.addColorStop(0.4, '#4a1208');
      bgGrad.addColorStop(0.8, '#6c1b0c');
      bgGrad.addColorStop(1, '#2c0604');
    } else if (isSlowTime) {
      bgGrad.addColorStop(0, '#0c1524');
      bgGrad.addColorStop(0.5, '#17273d');
      bgGrad.addColorStop(1, '#0e1828');
    } else {
      bgGrad.addColorStop(0, '#1c0809'); // Deep warm crimson twilight
      bgGrad.addColorStop(0.4, '#2d0f0c');
      bgGrad.addColorStop(0.85, '#3d1610');
      bgGrad.addColorStop(1, '#1b0606');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Festive Pandal Arch architecture
    this.drawPandalArches(w, h, isFever);

    // 3. Marigold flower garlands (scalloped swaying strings)
    this.drawGarlands(w, time);

    // 5. Traditional floor Rangoli band along bottom
    this.drawBottomRangoli(w, h);

    // 6. Corner Diyas with dancing warm glow
    this.drawCornerDiyas(w, h, time);

    // 7. Modak Fever or Dhol Rush festive overlay borders
    if (isFever) {
      this.drawFeverBorders(w, h, time);
    } else if (isDholRush) {
      this.drawDholRushPulse(w, h, time);
    }

    ctx.restore();
  }

  // Pandal ceiling arches and festive pillars
  private drawPandalArches(w: number, h: number, isFever: boolean) {
    const ctx = this.ctx;
    ctx.save();

    // Soft decorative arches
    ctx.strokeStyle = isFever ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.15)';
    ctx.lineWidth = 2;

    const arches = 5;
    const archW = w / arches;
    for (let i = 0; i < arches; i++) {
      const xStart = i * archW;
      const xEnd = (i + 1) * archW;
      const midX = (xStart + xEnd) / 2;
      ctx.beginPath();
      ctx.moveTo(xStart, 0);
      ctx.quadraticCurveTo(midX, 60, xEnd, 0);
      ctx.stroke();
    }

    // Side decorative temple border pillars
    const pillarGradLeft = ctx.createLinearGradient(0, 0, 16, 0);
    pillarGradLeft.addColorStop(0, 'rgba(120, 30, 10, 0.6)');
    pillarGradLeft.addColorStop(1, 'rgba(120, 30, 10, 0)');
    ctx.fillStyle = pillarGradLeft;
    ctx.fillRect(0, 0, 16, h);

    const pillarGradRight = ctx.createLinearGradient(w, 0, w - 16, 0);
    pillarGradRight.addColorStop(0, 'rgba(120, 30, 10, 0.6)');
    pillarGradRight.addColorStop(1, 'rgba(120, 30, 10, 0)');
    ctx.fillStyle = pillarGradRight;
    ctx.fillRect(w - 16, 0, 16, h);

    ctx.restore();
  }

  // Marigold flower garlands (genda phool) with gentle wave sway
  private drawGarlands(w: number, time: number) {
    const ctx = this.ctx;
    ctx.save();

    const sway = Math.sin(time * 0.002) * 2;
    const garlands = 3;
    const span = w / garlands;

    for (let g = 0; g < garlands; g++) {
      const x0 = g * span;
      const x1 = (g + 1) * span;
      const flowerCount = 10;

      for (let i = 0; i <= flowerCount; i++) {
        const t = i / flowerCount;
        const x = x0 + (x1 - x0) * t;
        // Parabolic drop + subtle sway
        const y = 8 + 26 * Math.sin(t * Math.PI) + sway * (t - 0.5);

        // Flower ball (alternating saffron and bright yellow)
        const isSaffron = i % 2 === 0;
        ctx.fillStyle = isSaffron ? '#f97316' : '#eab308';
        ctx.beginPath();
        ctx.arc(x, y, 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner flower petaled ring
        ctx.fillStyle = isSaffron ? '#ea580c' : '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Occasional little green mango leaf
        if (i % 3 === 1) {
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.ellipse(x + 2, y + 5, 2.5, 5, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  // Bottom rangoli pattern
  private drawBottomRangoli(w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();

    const baseline = h - 14;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 1;

    // Floor baseline line
    ctx.beginPath();
    ctx.moveTo(0, baseline);
    ctx.lineTo(w, baseline);
    ctx.stroke();

    // Repeating lotus petal / geometric rangoli arches
    const step = 28;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x + step / 2, baseline, step / 2, Math.PI, 0);
      ctx.stroke();

      // Tiny center dot
      ctx.fillStyle = 'rgba(234, 88, 12, 0.25)';
      ctx.beginPath();
      ctx.arc(x + step / 2, baseline - 4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Corner brass diyas with realistic flickering flame
  private drawCornerDiyas(w: number, h: number, time: number) {
    const ctx = this.ctx;
    const positions = [
      { x: 30, y: h - 35 },
      { x: w - 30, y: h - 35 },
    ];

    positions.forEach((pos, idx) => {
      ctx.save();
      const flicker = Math.sin(time * 0.008 + idx * 2.5) * 1.5 + Math.cos(time * 0.012) * 0.8;

      // Outer warm flame glow
      const glowGrad = ctx.createRadialGradient(pos.x, pos.y - 10, 2, pos.x, pos.y - 10, 26);
      glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 10, 26, 0, Math.PI * 2);
      ctx.fill();

      // Diya clay/brass lamp vessel
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 14, 6, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Diya rim
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flickering flame (teardrop)
      const flameH = 12 + flicker;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(pos.x - 3.5, pos.y - 1);
      ctx.quadraticCurveTo(pos.x - 4, pos.y - flameH * 0.6, pos.x, pos.y - flameH);
      ctx.quadraticCurveTo(pos.x + 4, pos.y - flameH * 0.6, pos.x + 3.5, pos.y - 1);
      ctx.closePath();
      ctx.fill();

      // Inner bright yellow flame core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(pos.x - 2, pos.y - 1);
      ctx.quadraticCurveTo(pos.x - 2, pos.y - flameH * 0.5, pos.x, pos.y - flameH * 0.75);
      ctx.quadraticCurveTo(pos.x + 2, pos.y - flameH * 0.5, pos.x + 2, pos.y - 1);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  // Modak Fever celebratory golden border pulses
  private drawFeverBorders(w: number, h: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.01);
    ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + pulse * 0.35})`;
    ctx.lineWidth = 5 + pulse * 4;
    ctx.strokeRect(0, 0, w, h);

    // Warm vignette
    const feverVignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    feverVignette.addColorStop(0, 'rgba(255, 180, 0, 0)');
    feverVignette.addColorStop(1, `rgba(255, 120, 0, ${0.15 + pulse * 0.1})`);
    ctx.fillStyle = feverVignette;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // Dhol Rush screen vibration indicator
  private drawDholRushPulse(w: number, h: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    const pulse = Math.abs(Math.sin(time * 0.02));
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.25 + pulse * 0.3})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  // Draw the Player Basket (Festive Brass Thali with Velvet Cushion & Mushak Companion)
  public drawBasket(
    x: number,
    y: number,
    width: number,
    height: number,
    bounceScaleY: number,
    bounceScaleX: number,
    powerUps: ActivePowerUps
  ) {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(x, y);
    ctx.scale(bounceScaleX, bounceScaleY);

    const halfW = width / 2;
    const halfH = height / 2;

    // 1. Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, halfH + 8, halfW * 0.95, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Modak Magnet attraction aura
    if (powerUps.magnet > 0) {
      const magRadius = halfW * 1.5;
      const magGrad = ctx.createRadialGradient(0, 0, halfW * 0.5, 0, 0, magRadius);
      magGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      magGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.15)');
      magGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = magGrad;
      ctx.beginPath();
      ctx.arc(0, 0, magRadius, 0, Math.PI * 2);
      ctx.fill();

      // Magnetic flux arcs
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, magRadius * 0.8, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Blessing Shield divine bubble
    if (powerUps.shield) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -6, halfW * 1.15, halfH * 1.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      const shieldGrad = ctx.createRadialGradient(0, -6, 10, 0, -6, halfW * 1.15);
      shieldGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
      shieldGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
      ctx.fillStyle = shieldGrad;
      ctx.fill();
    }

    // 4. Outer Brass Thali Vessel Body (Ornate Indian ceremonial tray)
    const brassGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    brassGrad.addColorStop(0, '#92400e');
    brassGrad.addColorStop(0.15, '#d97706');
    brassGrad.addColorStop(0.5, '#fef08a');
    brassGrad.addColorStop(0.85, '#d97706');
    brassGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Embossed Scalloped Decorative Rim
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Golden beaded rim notches
    const notches = 16;
    for (let i = 0; i < notches; i++) {
      const angle = (i / notches) * Math.PI * 2;
      const nx = Math.cos(angle) * (halfW - 3);
      const ny = Math.sin(angle) * (halfH - 2);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Inner Velvet Cushion (Warm vermilion/crimson silk center where modaks land)
    const velvetGrad = ctx.createRadialGradient(0, -1, 4, 0, -1, halfW * 0.78);
    velvetGrad.addColorStop(0, '#991b1b');
    velvetGrad.addColorStop(0.7, '#7f1d1d');
    velvetGrad.addColorStop(1, '#450a0a');

    ctx.fillStyle = velvetGrad;
    ctx.beginPath();
    ctx.ellipse(0, -1, halfW * 0.78, halfH * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gold embossed center floral motif
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -1, halfW * 0.35, halfH * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 7. Cute Friendly Mushak (Mouse companion riding on the left edge)
    this.drawMushakCompanion(-halfW * 0.85, -halfH * 0.5);

    ctx.restore();
  }

  // Cute, respectful friendly Mushak (vehicle of Lord Ganesha) sitting cheerfully on the basket
  private drawMushakCompanion(ox: number, oy: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(ox, oy);

    // Body
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.ellipse(5, -3, 4.5, 3.5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(4, -7, 2.5, 2.8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(6.5, -3.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Snout & tiny nose
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(9.5, -2, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Curled cheerful tail
    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, 1);
    ctx.quadraticCurveTo(-12, 4, -10, -3);
    ctx.stroke();

    // Tiny modak Mushak is holding happily
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(6, 1, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw any falling item with high graphical polish
  public drawFallingItem(item: FallingItem) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);

    switch (item.type) {
      case 'NORMAL_MODAK':
        this.drawNormalModak(item.radius);
        break;
      case 'GOLDEN_MODAK':
        this.drawGoldenModak(item.radius, item.sparkleTimer || 0);
        break;
      case 'DIAMOND_MODAK':
        this.drawDiamondModak(item.radius, item.sparkleTimer || 0);
        break;
      case 'BLESSING_MODAK':
        this.drawBlessingModak(item.radius);
        break;
      case 'COCONUT':
        this.drawCoconut(item.radius);
        break;
      case 'HEAVY_STONE':
        this.drawHeavyStone(item.radius);
        break;
      case 'DIYA':
        this.drawDiyaItem(item.radius);
        break;
      case 'FLOWER':
        this.drawFlowerItem(item.radius);
        break;
      case 'MAGNET':
        this.drawMagnetPowerUp(item.radius);
        break;
      case 'SLOW_TIME':
        this.drawSlowTimePowerUp(item.radius);
        break;
      case 'SHIELD':
        this.drawShieldPowerUp(item.radius);
        break;
      case 'DOUBLE_SCORE':
        this.drawDoubleScorePowerUp(item.radius);
        break;
    }

    ctx.restore();
  }

  // 1. Normal Modak: Authentic pleated dumpling shape with saffron pinch tip
  private drawNormalModak(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    // Outer soft glow
    const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.3);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.2)');
    glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Modak silhouette path: Plump rounded base tapering to sharp conical tip
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25); // Top pinch tip
    ctx.bezierCurveTo(r * 0.5, -r * 0.7, r * 1.15, -r * 0.2, r * 1.1, r * 0.6); // Right bulge
    ctx.bezierCurveTo(r * 1.0, r * 1.1, -r * 1.0, r * 1.1, -r * 1.1, r * 0.6); // Bottom curved base
    ctx.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.5, -r * 0.7, 0, -r * 1.25); // Left bulge
    ctx.closePath();

    // Steamed modak ivory/warm cream gradient
    const fillGrad = ctx.createLinearGradient(-r * 0.5, -r, r * 0.8, r);
    fillGrad.addColorStop(0, '#fffbeb');
    fillGrad.addColorStop(0.4, '#fef3c7');
    fillGrad.addColorStop(0.85, '#fde68a');
    fillGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Pleats (Dumpling vertical tuck folds)
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 1.4;

    // Center pleat
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.quadraticCurveTo(0, 0, 0, r * 0.95);
    ctx.stroke();

    // Left pleats
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.quadraticCurveTo(-r * 0.45, 0, -r * 0.55, r * 0.85);
    ctx.stroke();

    // Right pleats
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.quadraticCurveTo(r * 0.45, 0, r * 0.55, r * 0.85);
    ctx.stroke();

    // Saffron (Kesar) dot at apex tip
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(0, -r * 1.15, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Highlight sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.25, r * 0.22, r * 0.45, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Golden Modak: Radiance, sparkle rays, and 24K gold gloss
  private drawGoldenModak(radius: number, sparkleTimer: number) {
    const ctx = this.ctx;
    const r = radius * 1.08;

    // Golden halo glow
    const aura = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.6);
    aura.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
    aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Modak shape
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.bezierCurveTo(r * 0.5, -r * 0.7, r * 1.15, -r * 0.2, r * 1.1, r * 0.6);
    ctx.bezierCurveTo(r * 1.0, r * 1.1, -r * 1.0, r * 1.1, -r * 1.1, r * 0.6);
    ctx.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.5, -r * 0.7, 0, -r * 1.25);
    ctx.closePath();

    // 24K Gold gradient
    const goldGrad = ctx.createLinearGradient(-r, -r, r, r);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.3, '#f59e0b');
    goldGrad.addColorStop(0.6, '#fef08a');
    goldGrad.addColorStop(0.85, '#d97706');
    goldGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = goldGrad;
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Sparkle stars around it
    const angle = (sparkleTimer * 0.05) % (Math.PI * 2);
    for (let i = 0; i < 4; i++) {
      const a = angle + (i * Math.PI) / 2;
      const sx = Math.cos(a) * r * 1.35;
      const sy = Math.sin(a) * r * 1.35;
      this.drawSparkle(sx, sy, 4);
    }
  }

  // 3. Diamond Modak: Ultra rare crystalline prismatic sheen
  private drawDiamondModak(radius: number, sparkleTimer: number) {
    const ctx = this.ctx;
    const r = radius * 1.12;

    // Prismatic diamond glow
    const diamondGlow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.8);
    diamondGlow.addColorStop(0, 'rgba(224, 242, 254, 0.8)');
    diamondGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
    diamondGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = diamondGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Modak gem outline
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.bezierCurveTo(r * 0.5, -r * 0.7, r * 1.15, -r * 0.2, r * 1.1, r * 0.6);
    ctx.bezierCurveTo(r * 1.0, r * 1.1, -r * 1.0, r * 1.1, -r * 1.1, r * 0.6);
    ctx.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.5, -r * 0.7, 0, -r * 1.25);
    ctx.closePath();

    const diamondGrad = ctx.createLinearGradient(-r, -r, r, r);
    diamondGrad.addColorStop(0, '#ffffff');
    diamondGrad.addColorStop(0.3, '#bae6fd');
    diamondGrad.addColorStop(0.7, '#38bdf8');
    diamondGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = diamondGrad;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Facet lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.lineTo(r * 0.6, 0);
    ctx.lineTo(0, r * 0.9);
    ctx.lineTo(-r * 0.6, 0);
    ctx.closePath();
    ctx.stroke();

    // Intense diamond glints
    const angle = (sparkleTimer * 0.08) % (Math.PI * 2);
    for (let i = 0; i < 5; i++) {
      const a = angle + (i * Math.PI * 2) / 5;
      const sx = Math.cos(a) * r * 1.4;
      const sy = Math.sin(a) * r * 1.4;
      this.drawSparkle(sx, sy, 5, '#bae6fd');
    }
  }

  // 4. Blessing Modak: Rose petal pink with floating lotus motifs
  private drawBlessingModak(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    // Rose glow
    const roseGlow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.4);
    roseGlow.addColorStop(0, 'rgba(251, 113, 133, 0.5)');
    roseGlow.addColorStop(1, 'rgba(251, 113, 133, 0)');
    ctx.fillStyle = roseGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.bezierCurveTo(r * 0.5, -r * 0.7, r * 1.15, -r * 0.2, r * 1.1, r * 0.6);
    ctx.bezierCurveTo(r * 1.0, r * 1.1, -r * 1.0, r * 1.1, -r * 1.1, r * 0.6);
    ctx.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.5, -r * 0.7, 0, -r * 1.25);
    ctx.closePath();

    const roseGrad = ctx.createLinearGradient(-r, -r, r, r);
    roseGrad.addColorStop(0, '#fff1f2');
    roseGrad.addColorStop(0.5, '#f43f5e');
    roseGrad.addColorStop(1, '#9f1239');
    ctx.fillStyle = roseGrad;
    ctx.fill();

    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Sacred Om or Lotus mark in gold
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Coconut Hazard: Clearly distinguishable brown shell with 3 eyes
  private drawCoconut(radius: number) {
    const ctx = this.ctx;
    const r = radius * 1.05;

    // Coconut fibrous shell
    const coconutGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 2, 0, 0, r);
    coconutGrad.addColorStop(0, '#78350f');
    coconutGrad.addColorStop(0.7, '#451a03');
    coconutGrad.addColorStop(1, '#291002');
    ctx.fillStyle = coconutGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Characteristic top tuft of fibers
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 1.1);
    ctx.lineTo(0, -r * 1.45);
    ctx.lineTo(r * 0.3, -r * 1.1);
    ctx.closePath();
    ctx.fill();

    // 3 characteristic coconut eyes
    ctx.fillStyle = '#1c0a00';
    const eyes = [
      { x: -r * 0.25, y: -r * 0.3 },
      { x: r * 0.25, y: -r * 0.3 },
      { x: 0, y: -r * 0.65 },
    ];
    eyes.forEach((eye) => {
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    });

    // Red warning hazard boundary
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 6. Heavy Stone Hazard: Cracked granite rock
  private drawHeavyStone(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    // Jagged polygonal rock
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.5);
    ctx.lineTo(-r * 0.3, -r * 0.95);
    ctx.lineTo(r * 0.7, -r * 0.7);
    ctx.lineTo(r * 0.95, r * 0.3);
    ctx.lineTo(r * 0.4, r * 0.9);
    ctx.lineTo(-r * 0.6, r * 0.75);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crack lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.4);
    ctx.lineTo(0, 0);
    ctx.lineTo(r * 0.4, r * 0.3);
    ctx.stroke();

    // Hazard ring
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(-r * 1.1, -r * 1.1, r * 2.2, r * 2.2);
    ctx.setLineDash([]);
  }

  // 7. Diya Item (Bonus +25)
  private drawDiyaItem(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    // Diya warm flame
    const glow = ctx.createRadialGradient(0, -r * 0.5, 2, 0, -r * 0.5, r * 1.4);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -r * 0.5, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Vessel
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r * 0.85, r * 0.45, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Flame
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, 0);
    ctx.quadraticCurveTo(-r * 0.3, -r * 0.7, 0, -r * 1.1);
    ctx.quadraticCurveTo(r * 0.3, -r * 0.7, r * 0.25, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -r * 0.5, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Flower Item (Bonus +15)
  private drawFlowerItem(radius: number) {
    const ctx = this.ctx;
    const r = radius;
    const petals = 6;

    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const px = Math.cos(angle) * r * 0.5;
      const py = Math.sin(angle) * r * 0.5;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Yellow center
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Magnet Power-up
  private drawMagnetPowerUp(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    // Glowing badge background
    ctx.fillStyle = '#4338ca';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a5b4fc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // U-shaped magnet
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.55, 0, Math.PI);
    ctx.stroke();

    // Silver tips
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.15);
    ctx.lineTo(-r * 0.55, -r * 0.3);
    ctx.moveTo(r * 0.55, r * 0.15);
    ctx.lineTo(r * 0.55, -r * 0.3);
    ctx.stroke();
  }

  // 10. Slow Time Power-up
  private drawSlowTimePowerUp(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Divine Snowflake / Clock hands
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, 0);
      ctx.lineTo(r * 0.6, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
  }

  // 11. Shield Power-up
  private drawShieldPowerUp(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lotus shield icon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(r * 0.6, -r * 0.3);
    ctx.lineTo(r * 0.4, r * 0.5);
    ctx.lineTo(0, r * 0.75);
    ctx.lineTo(-r * 0.4, r * 0.5);
    ctx.lineTo(-r * 0.6, -r * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // 12. Double Score Power-up (2X)
  private drawDoubleScorePowerUp(radius: number) {
    const ctx = this.ctx;
    const r = radius;

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.stroke();

    // "2X" text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(r * 1.1)}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2X', 0, 1);
  }

  // Helper: Draw 4-point sparkle star
  private drawSparkle(x: number, y: number, size: number, color: string = '#ffffff') {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x, y, x + size, y);
    ctx.quadraticCurveTo(x, y, x, y + size);
    ctx.quadraticCurveTo(x, y, x - size, y);
    ctx.quadraticCurveTo(x, y, x, y - size);
    ctx.fill();
  }

  // Render particles (crumbs, golden sparks, flower petals)
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    ctx.save();
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'petal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'sparkle') {
        this.drawSparkle(p.x, p.y, p.size, p.color);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // Render floating score popups with bounce scale
  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    ctx.save();
    texts.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      // Text stroke for contrast
      ctx.font = "bold 20px 'Cinzel', 'Outfit', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#1a0505';
      ctx.strokeText(t.text, 0, 0);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }
}
