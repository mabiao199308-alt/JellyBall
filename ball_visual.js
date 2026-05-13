const BALL_VISUAL_STORAGE_KEY = "swipe_ball_visual_cfg_v1";

const defaultBallVisualCfg = {
  "radiusScale": 1.2,
  "minRadius": 30,
  "rotationFactor": 0.22,
  "speedSquashDivisor": 1500,
  "squashStrength": 1,
  "wobbleAmount": 0.6,
  "shadowOpacity": 0.16,
  "shadowOffsetYRatio": 0.36,
  "shadowScaleX": 0.92,
  "shadowScaleY": 0.56,
  "outlineWidth": 2.4,
  "glossOpacity": 0.34,
  "glossScaleX": 0.16,
  "glossScaleY": 0.3,
  "glossOffsetX": -0.28,
  "glossOffsetY": -0.3,
  "bandOpacity": 0.16,
  "bandScaleX": 0.34,
  "bandScaleY": 0.22,
  "bandOffsetX": 0.08,
  "bandOffsetY": -0.02,
  "blobOpacity": 0.22,
  "blob1OffsetX": 0.22,
  "blob1OffsetY": 0.28,
  "blob1ScaleX": 0.26,
  "blob1ScaleY": 0.18,
  "blob2OffsetX": -0.3,
  "blob2OffsetY": 0.08,
  "blob2ScaleX": 0.13,
  "blob2ScaleY": 0.09,
  "bubbleOpacity": 0.22,
  "bubble1OffsetX": 0.14,
  "bubble1OffsetY": 0.24,
  "bubble1Radius": 0.08,
  "bubble2OffsetX": -0.2,
  "bubble2OffsetY": 0.02,
  "bubble2Radius": 0.05,
  "eyeOffsetX": 0.37,
  "eyeY": -0.02,
  "eyeRadius": 0.31,
  "pupilRadius": 0.13,
  "pupilDirX": 0.11,
  "pupilDirY": -0.02,
  "pupilHighlightX": 0.18,
  "pupilHighlightY": -0.22,
  "pupilHighlightRadius": 0.04,
  "colorA": "#f4ff9a",
  "colorB": "#d8f55d",
  "colorC": "#acd726",
  "colorD": "#7aa90f",
  "outlineColor": "#f8ffbc",
  "eyeColor": "#ffffff",
  "pupilColor": "#111111"
};

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function coerceBallVisualCfg(raw) {
  const next = { ...defaultBallVisualCfg };
  if (!raw || typeof raw !== "object") return next;
  for (const [key, defaultVal] of Object.entries(defaultBallVisualCfg)) {
    const incoming = raw[key];
    if (typeof defaultVal === "number") {
      const n = Number(incoming);
      if (Number.isFinite(n)) next[key] = n;
    } else if (typeof defaultVal === "string" && typeof incoming === "string" && incoming.trim()) {
      next[key] = incoming;
    }
  }
  return next;
}

function loadBallVisualCfg() {
  try {
    const raw = localStorage.getItem(BALL_VISUAL_STORAGE_KEY);
    if (!raw) return { ...defaultBallVisualCfg };
    return coerceBallVisualCfg(JSON.parse(raw));
  } catch {
    return { ...defaultBallVisualCfg };
  }
}

function saveBallVisualCfg(cfg) {
  const next = coerceBallVisualCfg(cfg);
  localStorage.setItem(BALL_VISUAL_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function resetBallVisualCfg() {
  localStorage.setItem(BALL_VISUAL_STORAGE_KEY, JSON.stringify(defaultBallVisualCfg));
  return { ...defaultBallVisualCfg };
}

function getVisualRadius(baseRadius, cfg) {
  return Math.max(baseRadius * cfg.radiusScale, cfg.minRadius);
}

function drawJellyBodyPath(ctx, r, squash = 0, wobble = 0) {
  const sx = 1 + squash * 0.16;
  const sy = 1 - squash * 0.12;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.98 * sy);
  ctx.bezierCurveTo(r * 0.68 * sx, -r * (1.02 + wobble * 0.02), r * (1.02 + wobble * 0.04), -r * 0.38 * sy, r * 0.94 * sx, r * 0.14 * sy);
  ctx.bezierCurveTo(r * 0.88 * sx, r * (0.76 + wobble * 0.02), r * 0.46 * sx, r * 1.02 * sy, 0, r * (0.96 + wobble * 0.05));
  ctx.bezierCurveTo(-r * 0.42 * sx, r * (1.04 + wobble * 0.04), -r * 0.92 * sx, r * (0.78 + wobble * 0.02), -r * 0.98 * sx, r * 0.16 * sy);
  ctx.bezierCurveTo(-r * (1.04 + wobble * 0.03), -r * 0.42 * sy, -r * 0.64 * sx, -r * 0.98 * sy, 0, -r * 0.98 * sy);
  ctx.closePath();
}

function drawJellyBall(ctx, options = {}) {
  const cfg = coerceBallVisualCfg(options.cfg);
  const baseRadius = Number.isFinite(options.baseRadius) ? options.baseRadius : 24;
  const r = getVisualRadius(baseRadius, cfg);
  const speed = Math.max(0, Number(options.speed) || 0);
  const time = Number(options.time) || 0;
  const x = Number(options.x) || 0;
  const y = Number(options.y) || 0;
  const angle = Number(options.angle) || 0;
  const lookDirX = Number(options.lookDirX);
  const lookDirY = Number(options.lookDirY);
  const squash = clamp01(speed / Math.max(1, cfg.speedSquashDivisor)) * cfg.squashStrength;
  const wobble = Math.sin(time * 0.008) * cfg.wobbleAmount;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * cfg.rotationFactor);

  const shell = ctx.createRadialGradient(-r * 0.26, -r * 0.34, r * 0.1, 0, 0, r * 1.08);
  shell.addColorStop(0, cfg.colorA);
  shell.addColorStop(0.35, cfg.colorB);
  shell.addColorStop(0.78, cfg.colorC);
  shell.addColorStop(1, cfg.colorD);
  ctx.fillStyle = shell;
  drawJellyBodyPath(ctx, r, squash, wobble);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = cfg.outlineColor;
  ctx.lineWidth = cfg.outlineWidth;
  drawJellyBodyPath(ctx, r - cfg.outlineWidth * 0.5, squash, wobble);
  ctx.stroke();

  ctx.fillStyle = `rgba(255,255,255,${cfg.glossOpacity})`;
  ctx.beginPath();
  ctx.ellipse(r * cfg.glossOffsetX, r * cfg.glossOffsetY, r * cfg.glossScaleX, r * cfg.glossScaleY, -0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,255,${cfg.bandOpacity})`;
  ctx.beginPath();
  ctx.ellipse(r * cfg.bandOffsetX, r * cfg.bandOffsetY, r * cfg.bandScaleX, r * cfg.bandScaleY, -0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(175, 215, 48, ${cfg.blobOpacity})`;
  ctx.beginPath();
  ctx.ellipse(r * cfg.blob1OffsetX, r * cfg.blob1OffsetY, r * cfg.blob1ScaleX, r * cfg.blob1ScaleY, 0.15, 0, Math.PI * 2);
  ctx.ellipse(r * cfg.blob2OffsetX, r * cfg.blob2OffsetY, r * cfg.blob2ScaleX, r * cfg.blob2ScaleY, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,220,${cfg.bubbleOpacity})`;
  ctx.beginPath();
  ctx.arc(r * cfg.bubble1OffsetX, r * cfg.bubble1OffsetY, r * cfg.bubble1Radius, 0, Math.PI * 2);
  ctx.arc(r * cfg.bubble2OffsetX, r * cfg.bubble2OffsetY, r * cfg.bubble2Radius, 0, Math.PI * 2);
  ctx.fill();

  const eyeY = r * cfg.eyeY;
  const eyeOffsetX = r * cfg.eyeOffsetX;
  const eyeR = r * cfg.eyeRadius;
  const pupilR = r * cfg.pupilRadius;
  const hasDynamicLook = Number.isFinite(lookDirX) && Number.isFinite(lookDirY);
  const dynamicLookLen = hasDynamicLook ? Math.hypot(lookDirX, lookDirY) : 0;
  const dynamicLookAmount = clamp01(dynamicLookLen);
  const dynamicLookNx = dynamicLookLen > 0.0001 ? lookDirX / dynamicLookLen : 0;
  const dynamicLookNy = dynamicLookLen > 0.0001 ? lookDirY / dynamicLookLen : 0;
  const defaultLookLen = Math.hypot(cfg.pupilDirX, cfg.pupilDirY);
  const pupilLookScale = Math.max(0.24, Math.min(0.52, (defaultLookLen || 0.34) + 0.18));
  const eyeShiftScale = 0.28 * dynamicLookAmount;
  const eyeShiftDx = eyeR * dynamicLookNx * eyeShiftScale;
  const eyeShiftDy = eyeR * dynamicLookNy * eyeShiftScale;
  const leftEyeX = -eyeOffsetX + eyeShiftDx;
  const rightEyeX = eyeOffsetX + eyeShiftDx;
  const eyeCenterY = eyeY + eyeShiftDy;
  const pupilDx =
    dynamicLookLen > 0.0001
      ? eyeR * dynamicLookNx * pupilLookScale * dynamicLookAmount
      : eyeR * cfg.pupilDirX;
  const pupilDy =
    dynamicLookLen > 0.0001
      ? eyeR * dynamicLookNy * pupilLookScale * dynamicLookAmount
      : eyeR * cfg.pupilDirY;
  const pupilHighlightDx =
    dynamicLookLen > 0.0001
      ? pupilDx * 0.6 + eyeR * cfg.pupilHighlightX * 0.2
      : eyeR * cfg.pupilHighlightX;
  const pupilHighlightDy =
    dynamicLookLen > 0.0001
      ? pupilDy * 0.6 + eyeR * cfg.pupilHighlightY * 0.2
      : eyeR * cfg.pupilHighlightY;
  const pupilHighlightR = r * cfg.pupilHighlightRadius;

  ctx.fillStyle = cfg.eyeColor;
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeCenterY, eyeR, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeCenterY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = cfg.pupilColor;
  ctx.beginPath();
  ctx.arc(leftEyeX + pupilDx, eyeCenterY + pupilDy, pupilR, 0, Math.PI * 2);
  ctx.arc(rightEyeX + pupilDx, eyeCenterY + pupilDy, pupilR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(leftEyeX + pupilHighlightDx, eyeCenterY + pupilHighlightDy, pupilHighlightR, 0, Math.PI * 2);
  ctx.arc(rightEyeX + pupilHighlightDx, eyeCenterY + pupilHighlightDy, pupilHighlightR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

window.BallVisual = {
  BALL_VISUAL_STORAGE_KEY,
  defaultBallVisualCfg,
  coerceBallVisualCfg,
  loadBallVisualCfg,
  saveBallVisualCfg,
  resetBallVisualCfg,
  getVisualRadius,
  drawJellyBall,
};
