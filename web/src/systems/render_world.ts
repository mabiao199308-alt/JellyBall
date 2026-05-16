export function drawVerticalCapsulePath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const r = width * 0.5;
  const topCy = y - height * 0.5 + r;
  const bottomCy = y + height * 0.5 - r;

  ctx.beginPath();
  ctx.arc(x, topCy, r, Math.PI, 0, false);
  ctx.lineTo(x + r, bottomCy);
  ctx.arc(x, bottomCy, r, 0, Math.PI, false);
  ctx.closePath();
}

export function drawHorizontalCapsulePath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const r = height * 0.5;
  const leftCx = x - width * 0.5 + r;
  const rightCx = x + width * 0.5 - r;
  ctx.beginPath();
  ctx.arc(rightCx, y, r, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.lineTo(leftCx, y + r);
  ctx.arc(leftCx, y, r, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.closePath();
}

export function drawMovingTrackWorld(ctx: CanvasRenderingContext2D, options: {
  TRACK_ENABLED: boolean;
  world: any;
  toScreenX: (x: number) => number;
  toScreenY: (y: number) => number;
  getAnchorFuseState: (a: any) => { alpha: number; flash: number };
  getRedAnchorSpawnAnimState: (a: any) => { scale: number; alpha: number; ringAlpha: number; ringRadiusMul: number };
  getAnchorVisualStyle: (a: any, flash?: number) => any;
  GEAR_TEETH: number;
}) {
  const { TRACK_ENABLED, world, toScreenX, toScreenY, getAnchorFuseState, getRedAnchorSpawnAnimState, getAnchorVisualStyle, GEAR_TEETH } = options;
  if (!TRACK_ENABLED || !world.movingTrack) return;
  const t = world.movingTrack;
  if (!t.activated) return;
  const sx = toScreenX(t.x);
  const sy = toScreenY(t.y);
  const offPad = Math.max(80, t.width * 0.6);
  if (sx < -offPad || sx > world.w + offPad || sy < -120 || sy > world.h + 120) return;

  const pinSX = sx + t.pinOffset;
  const slotH = t.height * 0.56;

  ctx.save();
  ctx.fillStyle = "#94a3b8";
  drawHorizontalCapsulePath(ctx, sx, sy, t.width, t.height);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#334155";
  drawHorizontalCapsulePath(ctx, sx, sy, t.width, t.height);
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  drawHorizontalCapsulePath(ctx, sx, sy, t.width - 8, slotH);
  ctx.fill();

  const lane = ctx.createLinearGradient(sx, sy - slotH * 0.5, sx, sy + slotH * 0.5);
  lane.addColorStop(0, "rgba(125, 211, 252, 0.25)");
  lane.addColorStop(1, "rgba(59, 130, 246, 0.32)");
  ctx.fillStyle = lane;
  drawHorizontalCapsulePath(ctx, sx, sy, t.width - 16, slotH - 6);
  ctx.fill();

  if (t.mode === "pin" && t.pinAnchor) {
    const pinVisible = world.timeSec >= t.hiddenUntilSec;
    if (!pinVisible) {
      ctx.restore();
      return;
    }
    const pinFuse = getAnchorFuseState(t.pinAnchor);
    const pinSpawnAnim = getRedAnchorSpawnAnimState(t.pinAnchor);
    ctx.save();
    ctx.translate(pinSX, sy);
    ctx.globalAlpha = pinFuse.alpha * pinSpawnAnim.alpha;
    const pinStyle = getAnchorVisualStyle(t.pinAnchor, pinFuse.flash);
    const pinAnchorRadius = Math.max(1, t.pinRadius);
    const baseOuterR = pinAnchorRadius + 10;
    const outerR = baseOuterR * pinSpawnAnim.scale;
    const ringR = Math.max(2, outerR - 4);
    const coreR = Math.max(1, outerR - 8.5);

    if (pinSpawnAnim.ringAlpha > 0.001) {
      ctx.strokeStyle = `rgba(255, 126, 126, ${pinSpawnAnim.ringAlpha})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, baseOuterR * pinSpawnAnim.ringRadiusMul, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    const rim = ctx.createLinearGradient(-outerR, -outerR, outerR, outerR);
    rim.addColorStop(0, pinStyle.rimLight);
    rim.addColorStop(1, pinStyle.rimDark);
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(86, 64, 41, 0.18)";
    ctx.beginPath();
    ctx.arc(0, 1, ringR, 0, Math.PI * 2);
    ctx.fill();

    const plate = ctx.createRadialGradient(-4, -5, 3, 0, 0, ringR);
    plate.addColorStop(0, "#fffef6");
    plate.addColorStop(1, "#e9d8c2");
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(-3, -3, 2, 0, 0, coreR);
    core.addColorStop(0, "#ffffff");
    core.addColorStop(0.16, pinStyle.core);
    core.addColorStop(1, pinStyle.coreDark);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pinStyle.highlight;
    ctx.beginPath();
    ctx.arc(-coreR * 0.28, -coreR * 0.32, coreR * 0.35, 0, Math.PI * 2);
    ctx.fill();

    if (t.pinAnchor.isRed && pinFuse.flash > 0.001) {
      const glow = ctx.createRadialGradient(0, 0, coreR * 0.15, 0, 0, outerR + 4);
      glow.addColorStop(0, `rgba(255, 255, 255, ${0.92 * pinFuse.flash})`);
      glow.addColorStop(0.52, `rgba(255, 255, 255, ${0.44 * pinFuse.flash})`);
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, outerR + 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (t.mode === "gear" && t.trackGear) {
    const g = t.trackGear;
    const outerR = g.radius;
    const toothR = outerR + g.toothDepth;
    const midR = outerR * 0.82;

    ctx.save();
    ctx.translate(pinSX, sy);
    ctx.rotate(g.angle);

    const metal = ctx.createLinearGradient(-toothR, -toothR, toothR, toothR);
    metal.addColorStop(0, "#f8fafc");
    metal.addColorStop(0.45, "#cbd5e1");
    metal.addColorStop(1, "#64748b");
    ctx.fillStyle = metal;
    ctx.beginPath();
    for (let i = 0; i < GEAR_TEETH * 2; i += 1) {
      const angle = (i / (GEAR_TEETH * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? toothR : outerR;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    const rim = ctx.createRadialGradient(-midR * 0.2, -midR * 0.2, 2, 0, 0, midR);
    rim.addColorStop(0, "#e2e8f0");
    rim.addColorStop(1, "#475569");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(0, 0, midR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, 0, g.innerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, midR * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

export function drawAnchorsWorld(ctx: CanvasRenderingContext2D, options: {
  anchors: any[];
  activeAnchor: any;
  world: any;
  toScreenX: (x: number) => number;
  toScreenY: (y: number) => number;
  getAnchorFuseState: (a: any) => { alpha: number; flash: number };
  getRedAnchorSpawnAnimState: (a: any) => { scale: number; alpha: number; ringAlpha: number; ringRadiusMul: number };
  getAnchorVisualStyle: (a: any, flash?: number) => any;
}) {
  const { anchors, activeAnchor, world, toScreenX, toScreenY, getAnchorFuseState, getRedAnchorSpawnAnimState, getAnchorVisualStyle } = options;
  for (const a of anchors) {
    const sx = toScreenX(a.x);
    const sy = toScreenY(a.y);
    if (sx < -80 || sx > world.w + 80 || sy < -80 || sy > world.h + 80) continue;

    const isActive = a === activeAnchor;
    const fuse = getAnchorFuseState(a);
    const spawnAnim = getRedAnchorSpawnAnimState(a);
    const fuseAlpha = fuse.alpha * spawnAnim.alpha;
    const pulse = isActive ? 1 + world.hookFlash * 4 : 1;
    const style = getAnchorVisualStyle(a, fuse.flash);
    const baseOuterR = a.radius + 10;
    const outerR = baseOuterR * spawnAnim.scale;
    const ringR = Math.max(2, outerR - 4);
    const coreR = Math.max(1, outerR - 8.5);

    ctx.save();
    ctx.globalAlpha = fuseAlpha;
    if (spawnAnim.ringAlpha > 0.001) {
      ctx.strokeStyle = `rgba(255, 126, 126, ${spawnAnim.ringAlpha})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(sx, sy, baseOuterR * spawnAnim.ringRadiusMul, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    const rim = ctx.createLinearGradient(sx - outerR, sy - outerR, sx + outerR, sy + outerR);
    rim.addColorStop(0, style.rimLight);
    rim.addColorStop(1, style.rimDark);
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(sx, sy, outerR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(86, 64, 41, 0.18)";
    ctx.beginPath();
    ctx.arc(sx, sy + 1, ringR, 0, Math.PI * 2);
    ctx.fill();

    const plate = ctx.createRadialGradient(sx - 4, sy - 5, 3, sx, sy, ringR);
    plate.addColorStop(0, "#fffef6");
    plate.addColorStop(1, "#e9d8c2");
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(sx - 3, sy - 3, 2, sx, sy, coreR);
    core.addColorStop(0, "#ffffff");
    core.addColorStop(0.16, style.core);
    core.addColorStop(1, style.coreDark);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(sx, sy, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.highlight;
    ctx.beginPath();
    ctx.arc(sx - coreR * 0.28, sy - coreR * 0.32, coreR * 0.35, 0, Math.PI * 2);
    ctx.fill();

    if (a.isRed && fuse.flash > 0.001) {
      const glow = ctx.createRadialGradient(sx, sy, coreR * 0.15, sx, sy, outerR + 4);
      glow.addColorStop(0, `rgba(255, 255, 255, ${0.92 * fuse.flash})`);
      glow.addColorStop(0.52, `rgba(255, 255, 255, ${0.44 * fuse.flash})`);
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, outerR + 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (isActive) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.9, 0.4 + world.hookFlash * 2) * fuseAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sx, sy, outerR + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawGearHazardsWorld(ctx: CanvasRenderingContext2D, options: {
  GEAR_ENABLED: boolean;
  gears: any[];
  world: any;
  toScreenX: (x: number) => number;
  toScreenY: (y: number) => number;
  GEAR_TEETH: number;
}) {
  const { GEAR_ENABLED, gears, world, toScreenX, toScreenY, GEAR_TEETH } = options;
  if (!GEAR_ENABLED) return;
  for (const g of gears) {
    const sx = toScreenX(g.x);
    const sy = toScreenY(g.y);
    if (sx < -120 || sx > world.w + 120 || sy < -120 || sy > world.h + 120) continue;

    const outerR = g.radius;
    const toothR = outerR + g.toothDepth;
    const midR = outerR * 0.82;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(g.angle);

    const metal = ctx.createLinearGradient(-toothR, -toothR, toothR, toothR);
    metal.addColorStop(0, "#f8fafc");
    metal.addColorStop(0.45, "#cbd5e1");
    metal.addColorStop(1, "#64748b");
    ctx.fillStyle = metal;
    ctx.beginPath();
    for (let i = 0; i < GEAR_TEETH * 2; i += 1) {
      const angle = (i / (GEAR_TEETH * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? toothR : outerR;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    const rim = ctx.createRadialGradient(-midR * 0.2, -midR * 0.2, 2, 0, 0, midR);
    rim.addColorStop(0, "#e2e8f0");
    rim.addColorStop(1, "#475569");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(0, 0, midR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, 0, g.innerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, midR * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
