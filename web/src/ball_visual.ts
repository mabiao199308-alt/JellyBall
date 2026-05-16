const defaultBallVisualCfg = {
  "radiusScale": 1.2,
  "minRadius": 30,
  "rotationFactor": 0.22,
  "speedSquashDivisor": 1500,
  "squashStrength": 0.56,
  "stretchNarrowStrength": 0.15,
  "stretchLengthStrength": 0.28,
  "stretchMinWidthScale": 0.88,
  "wobbleAmount": 0.6,
  "shadowOpacity": 0.16,
  "shadowOffsetYRatio": 0.36,
  "shadowScaleX": 0.92,
  "shadowScaleY": 0.56,
  "outlineWidth": 2.4,
  "edgeGlowOpacity": 0.24,
  "edgeGlowWidthMul": 2.6,
  "edgeGlowBlurRatio": 0.16,
  "edgeGlowColor": "#ff9dc2",
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
  "shapeStyle": "squircle",
  "shapeRoundness": 2.8,
  "softShellSegments": 24,
  "softShellHardness": 0.62,
  "softShellMaxDeform": 0.34,
  "softShellRipple": 0.09,
  "softShellJiggle": 0.11,
  "colorA": "#ffe8f2",
  "colorB": "#ffb8d2",
  "colorC": "#ff8ea9",
  "colorD": "#ff6f61",
  "outlineColor": "#fff3f8",
  "eyeColor": "#ffffff",
  "pupilColor": "#111111"
};

type BallVisualCfg = typeof defaultBallVisualCfg;
type LayerVisibility = Record<string, boolean>;
type LayerDebugItem = { key: string; label: string; x: number; y: number };

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function resolveBallVisualCfg(raw: Record<string, unknown> | null | undefined): BallVisualCfg {
  const next = { ...defaultBallVisualCfg };
  if (!raw || typeof raw !== "object") return next;
  for (const [key, defaultVal] of Object.entries(defaultBallVisualCfg)) {
    const incoming = raw[key as keyof BallVisualCfg];
    if (typeof defaultVal === "number") {
      const n = Number(incoming);
      if (Number.isFinite(n)) (next as any)[key] = n;
    } else if (typeof defaultVal === "string" && typeof incoming === "string" && incoming.trim()) {
      (next as any)[key] = incoming;
    }
  }
  return next;
}

function getVisualRadius(baseRadius: number, cfg: BallVisualCfg) {
  return Math.max(baseRadius * cfg.radiusScale, cfg.minRadius);
}

function drawSoftClosedPath(ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>) {
  if (!points || points.length < 3) return;
  const first = points[0];
  const last = points[points.length - 1];
  const startX = (last.x + first.x) * 0.5;
  const startY = (last.y + first.y) * 0.5;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[(i + 1) % points.length];
    const midX = (p.x + next.x) * 0.5;
    const midY = (p.y + next.y) * 0.5;
    ctx.quadraticCurveTo(p.x, p.y, midX, midY);
  }
  ctx.closePath();
}

function drawJellyBodyPath(ctx: CanvasRenderingContext2D, r: number, squash = 0, wobble = 0, cfg = defaultBallVisualCfg, time = 0) {
  // 偏“充气球”风格：边缘有软体感，但整体保持更硬挺
  const safeSquash = Math.min(Math.max(0, squash), 0.72);
  const sx = Math.max(cfg.stretchMinWidthScale, 1 - safeSquash * cfg.stretchNarrowStrength);
  const sy = 1 + safeSquash * cfg.stretchLengthStrength;
  const segmentCount = Math.max(16, Math.min(48, Math.round(cfg.softShellSegments || 24)));
  const hardness = clamp01(cfg.softShellHardness);
  const softness = 1 - hardness;
  const maxDeform = Math.max(0.02, Math.min(0.45, Number(cfg.softShellMaxDeform) || 0.24));
  const ripple = Math.max(0, Number(cfg.softShellRipple) || 0.055);
  const jiggle = Math.max(0, Number(cfg.softShellJiggle) || 0.05);
  const shapeStyle = typeof cfg.shapeStyle === "string" ? cfg.shapeStyle : "round";
  const shapeRoundness = Math.max(2.1, Math.min(8, Number(cfg.shapeRoundness) || 3.8));
  const wobbleAbs = Math.min(1, Math.abs(wobble));
  const deformRatio = clamp01(safeSquash / Math.max(0.001, cfg.squashStrength));
  const shellAmt = Math.min(maxDeform, deformRatio * (0.22 + softness * 0.34) + wobbleAbs * jiggle * (0.3 + softness * 0.5));
  const phase = time * 0.0048;

  const points = [];
  for (let i = 0; i < segmentCount; i++) {
    const t = (i / segmentCount) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);

    // 去掉时间驱动的边缘噪声，避免“方/长方”来回闪
    const lowFreq = Math.sin(t * 2 + 0.62) * (0.55 + shellAmt * 0.6);
    const highFreq = Math.sin(t * 5 - 1.08) * (0.45 + wobbleAbs * 0.5);
    const radialNoise = (lowFreq * 0.018 + highFreq * 0.012) * (softness * 0.85 + 0.15) * ripple;
    const wobblePulse = Math.sin(phase) * wobble * (0.08 + softness * 0.14);
    const directional = s * (shellAmt * 0.24 + wobblePulse);
    let baseShapeScale = 1;
    if (shapeStyle === "squircle") {
      baseShapeScale = Math.pow(Math.pow(Math.abs(c), shapeRoundness) + Math.pow(Math.abs(s), shapeRoundness), -1 / shapeRoundness);
    } else if (shapeStyle === "oval") {
      baseShapeScale = 1 + 0.08 * Math.sin(t) * Math.sin(t);
    } else if (shapeStyle === "drop") {
      baseShapeScale = 1 + 0.1 * Math.max(0, s) - 0.04 * Math.max(0, -s);
    }
    const radiusScale = baseShapeScale * (1 + radialNoise + directional);

    points.push({
      x: c * r * sx * radiusScale,
      y: s * r * sy * radiusScale,
    });
  }

  drawSoftClosedPath(ctx, points);
}

const defaultLayerVisibility = {
  bodyGradient: true,
  edgeGlow: true,
  outline: true,
  gloss: false,
  band: false,
  blobs: false,
  bubbles: false,
  eyesWhite: true,
  pupils: true,
  pupilHighlights: true,
  squintEyes: true,
};

function resolveLayerVisibility(raw: Record<string, unknown> | null | undefined): LayerVisibility {
  if (!raw || typeof raw !== "object") return { ...defaultLayerVisibility };
  const next = { ...defaultLayerVisibility };
  for (const key of Object.keys(defaultLayerVisibility)) {
    if (typeof raw[key] === "boolean") next[key] = raw[key];
  }
  return next;
}

function drawJellyBall(ctx: CanvasRenderingContext2D, options: Record<string, any> = {}) {
  const cfg = resolveBallVisualCfg(options.cfg);
  const baseRadius = Number.isFinite(options.baseRadius) ? options.baseRadius : 24;
  const r = getVisualRadius(baseRadius, cfg);
  const speed = Math.max(0, Number(options.speed) || 0);
  const time = Number(options.time) || 0;
  const x = Number(options.x) || 0;
  const y = Number(options.y) || 0;
  const angle = Number(options.angle) || 0;
  const lookDirX = Number(options.lookDirX);
  const lookDirY = Number(options.lookDirY);
  const faceMode = typeof options.faceMode === "string" ? options.faceMode : "normal";
  const layerVisibility = resolveLayerVisibility(options.layerVisibility);
  const deformAmount = Number(options.deformAmount);
  const wobbleOffset = Number(options.wobbleOffset);
  const squash = Number.isFinite(deformAmount)
    ? clamp01(deformAmount) * cfg.squashStrength
    : clamp01(speed / Math.max(1, cfg.speedSquashDivisor)) * cfg.squashStrength;
  const wobble = Number.isFinite(wobbleOffset)
    ? Math.max(-1, Math.min(1, wobbleOffset)) * cfg.wobbleAmount
    : Math.sin(time * 0.008) * cfg.wobbleAmount;

  ctx.save();
  ctx.translate(x, y);
  const rotationMix = Math.min(1, cfg.rotationFactor + squash * 0.9);
  const renderRotation = angle * rotationMix;
  ctx.rotate(renderRotation);

  const debugLayers: LayerDebugItem[] = [];
  const debugOut: LayerDebugItem[] | null = Array.isArray(options.layerDebugOut) ? options.layerDebugOut : null;
  const collectLayerDebug = options.collectLayerDebug === true || !!debugOut;
  const rotCos = Math.cos(renderRotation);
  const rotSin = Math.sin(renderRotation);
  const markLayer = (key: string, label: string, localX: number, localY: number) => {
    if (!collectLayerDebug || layerVisibility[key] === false) return;
    const worldX = x + localX * rotCos - localY * rotSin;
    const worldY = y + localX * rotSin + localY * rotCos;
    const item = { key, label, x: worldX, y: worldY };
    debugLayers.push(item);
    if (debugOut) debugOut.push(item);
  };

  if (layerVisibility.bodyGradient) {
    const shell = ctx.createRadialGradient(-r * 0.26, -r * 0.34, r * 0.1, 0, 0, r * 1.08);
    shell.addColorStop(0, cfg.colorA);
    shell.addColorStop(0.35, cfg.colorB);
    shell.addColorStop(0.78, cfg.colorC);
    shell.addColorStop(1, cfg.colorD);
    ctx.fillStyle = shell;
    drawJellyBodyPath(ctx, r, squash, wobble, cfg, time);
    ctx.fill();
    markLayer("bodyGradient", "主体渐变", -r * 0.24, -r * 0.36);
  }

  // 轻微边缘发光：提升“糖感”和通透度，避免塑料硬壳感
  if (layerVisibility.edgeGlow && cfg.edgeGlowOpacity > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,157,194,${clamp01(cfg.edgeGlowOpacity)})`;
    if (typeof cfg.edgeGlowColor === "string" && cfg.edgeGlowColor.trim()) {
      ctx.strokeStyle = cfg.edgeGlowColor;
      ctx.globalAlpha = clamp01(cfg.edgeGlowOpacity);
    }
    ctx.lineWidth = Math.max(1, cfg.outlineWidth * Math.max(1, cfg.edgeGlowWidthMul));
    ctx.shadowColor = typeof cfg.edgeGlowColor === "string" && cfg.edgeGlowColor.trim() ? cfg.edgeGlowColor : "#ff9dc2";
    ctx.shadowBlur = Math.max(1, r * Math.max(0.02, cfg.edgeGlowBlurRatio));
    drawJellyBodyPath(ctx, r - cfg.outlineWidth * 0.1, squash, wobble, cfg, time);
    ctx.stroke();
    ctx.restore();
    markLayer("edgeGlow", "边缘发光", r * 0.38, -r * 0.74);
  }

  if (layerVisibility.outline) {
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = cfg.outlineColor;
    ctx.lineWidth = cfg.outlineWidth;
    drawJellyBodyPath(ctx, r - cfg.outlineWidth * 0.5, squash, wobble, cfg, time);
    ctx.stroke();
    markLayer("outline", "外描边", r * 0.67, -r * 0.4);
  }

  if (layerVisibility.gloss) {
    ctx.fillStyle = `rgba(255,255,255,${cfg.glossOpacity})`;
    ctx.beginPath();
    ctx.ellipse(r * cfg.glossOffsetX, r * cfg.glossOffsetY, r * cfg.glossScaleX, r * cfg.glossScaleY, -0.42, 0, Math.PI * 2);
    ctx.fill();
    markLayer("gloss", "高光", r * cfg.glossOffsetX, r * cfg.glossOffsetY);
  }

  if (layerVisibility.band) {
    ctx.fillStyle = `rgba(255,255,255,${cfg.bandOpacity})`;
    ctx.beginPath();
    ctx.ellipse(r * cfg.bandOffsetX, r * cfg.bandOffsetY, r * cfg.bandScaleX, r * cfg.bandScaleY, -0.14, 0, Math.PI * 2);
    ctx.fill();
    markLayer("band", "亮带", r * cfg.bandOffsetX, r * cfg.bandOffsetY + r * 0.12);
  }

  if (layerVisibility.blobs) {
    ctx.fillStyle = `rgba(255, 124, 156, ${cfg.blobOpacity})`;
    ctx.beginPath();
    ctx.ellipse(r * cfg.blob1OffsetX, r * cfg.blob1OffsetY, r * cfg.blob1ScaleX, r * cfg.blob1ScaleY, 0.15, 0, Math.PI * 2);
    ctx.ellipse(r * cfg.blob2OffsetX, r * cfg.blob2OffsetY, r * cfg.blob2ScaleX, r * cfg.blob2ScaleY, -0.3, 0, Math.PI * 2);
    ctx.fill();
    markLayer("blobs", "内部斑块", r * cfg.blob1OffsetX, r * cfg.blob1OffsetY);
  }

  if (layerVisibility.bubbles) {
    ctx.fillStyle = `rgba(255,236,244,${cfg.bubbleOpacity})`;
    ctx.beginPath();
    ctx.arc(r * cfg.bubble1OffsetX, r * cfg.bubble1OffsetY, r * cfg.bubble1Radius, 0, Math.PI * 2);
    ctx.arc(r * cfg.bubble2OffsetX, r * cfg.bubble2OffsetY, r * cfg.bubble2Radius, 0, Math.PI * 2);
    ctx.fill();
    markLayer("bubbles", "气泡", r * cfg.bubble1OffsetX, r * cfg.bubble1OffsetY);
  }

  const eyeY = r * cfg.eyeY;
  const eyeOffsetX = r * cfg.eyeOffsetX;
  const eyeR = r * cfg.eyeRadius;
  const pupilR = r * cfg.pupilRadius;
  // lookDir 来自世界坐标；眼睛在本地坐标里绘制，需要先反向旋转到本地坐标
  const lookWorldX = Number.isFinite(lookDirX) ? lookDirX : 0;
  const lookWorldY = Number.isFinite(lookDirY) ? lookDirY : 0;
  const lookLocalX = lookWorldX * rotCos + lookWorldY * rotSin;
  const lookLocalY = -lookWorldX * rotSin + lookWorldY * rotCos;
  const hasDynamicLook = Number.isFinite(lookDirX) && Number.isFinite(lookDirY);
  const dynamicLookLen = hasDynamicLook ? Math.hypot(lookLocalX, lookLocalY) : 0;
  const dynamicLookAmount = clamp01(dynamicLookLen);
  const dynamicLookNx = dynamicLookLen > 0.0001 ? lookLocalX / dynamicLookLen : 0;
  const dynamicLookNy = dynamicLookLen > 0.0001 ? lookLocalY / dynamicLookLen : 0;
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

  if (faceMode === "dizzy_spiral") {
    if (layerVisibility.pupils) {
      const spiralTurns = 1.95;
      const spiralSteps = 26;
      const baseSpin = 0;
      const spiralLineW = Math.max(1.05, r * 0.052);
      ctx.strokeStyle = "rgba(17,17,17,0.88)";
      ctx.lineWidth = spiralLineW;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const drawSpiral = (cx: number, cy: number, dir = 1) => {
        ctx.beginPath();
        for (let i = 0; i <= spiralSteps; i += 1) {
          const t = i / spiralSteps;
          const theta = dir * (t * spiralTurns * Math.PI * 2 + baseSpin);
          const rr = eyeR * (0.1 + t * 0.76);
          const x = cx + Math.cos(theta) * rr;
          const y = cy + Math.sin(theta) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawSpiral(leftEyeX, eyeCenterY, 1);
      drawSpiral(rightEyeX, eyeCenterY, -1);
      markLayer("pupils", "螺旋眼", rightEyeX, eyeCenterY);
    }
  } else if (faceMode === "flight_squint") {
    const squintHalfW = eyeR * 0.62;
    const squintHalfH = eyeR * 0.48;
    const squintLineW = Math.max(1.6, r * 0.085);
    ctx.strokeStyle = cfg.pupilColor;
    ctx.lineWidth = squintLineW;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 左眼: >
    ctx.beginPath();
    ctx.moveTo(leftEyeX - squintHalfW, eyeCenterY - squintHalfH);
    ctx.lineTo(leftEyeX + squintHalfW, eyeCenterY);
    ctx.lineTo(leftEyeX - squintHalfW, eyeCenterY + squintHalfH);
    if (layerVisibility.squintEyes) {
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightEyeX + squintHalfW, eyeCenterY - squintHalfH);
      ctx.lineTo(rightEyeX - squintHalfW, eyeCenterY);
      ctx.lineTo(rightEyeX + squintHalfW, eyeCenterY + squintHalfH);
      ctx.stroke();
      markLayer("squintEyes", "眯眼", rightEyeX, eyeCenterY);
    }
  } else {
    if (layerVisibility.eyesWhite) {
      ctx.fillStyle = cfg.eyeColor;
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeCenterY, eyeR, 0, Math.PI * 2);
      ctx.arc(rightEyeX, eyeCenterY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      markLayer("eyesWhite", "眼白", rightEyeX + eyeR * 0.1, eyeCenterY - eyeR * 0.1);
    }

    if (layerVisibility.pupils) {
      ctx.fillStyle = cfg.pupilColor;
      ctx.beginPath();
      ctx.arc(leftEyeX + pupilDx, eyeCenterY + pupilDy, pupilR, 0, Math.PI * 2);
      ctx.arc(rightEyeX + pupilDx, eyeCenterY + pupilDy, pupilR, 0, Math.PI * 2);
      ctx.fill();
      markLayer("pupils", "瞳孔", rightEyeX + pupilDx, eyeCenterY + pupilDy);
    }

    if (layerVisibility.pupilHighlights) {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(leftEyeX + pupilHighlightDx, eyeCenterY + pupilHighlightDy, pupilHighlightR, 0, Math.PI * 2);
      ctx.arc(rightEyeX + pupilHighlightDx, eyeCenterY + pupilHighlightDy, pupilHighlightR, 0, Math.PI * 2);
      ctx.fill();
      markLayer("pupilHighlights", "瞳孔高光", rightEyeX + pupilHighlightDx, eyeCenterY + pupilHighlightDy);
    }
  }

  ctx.restore();
  return {
    radius: r,
    layers: debugLayers,
    layerVisibility,
  };
}

export {
  defaultBallVisualCfg,
  defaultLayerVisibility,
  resolveBallVisualCfg,
  resolveLayerVisibility,
  getVisualRadius,
  drawJellyBodyPath,
  drawJellyBall,
};

declare global {
  interface Window {
    BallVisual?: {
      defaultBallVisualCfg: BallVisualCfg;
      defaultLayerVisibility: LayerVisibility;
      resolveBallVisualCfg: typeof resolveBallVisualCfg;
      resolveLayerVisibility: typeof resolveLayerVisibility;
      getVisualRadius: typeof getVisualRadius;
      drawJellyBodyPath: typeof drawJellyBodyPath;
      drawJellyBall: typeof drawJellyBall;
    };
  }
}

window.BallVisual = {
  defaultBallVisualCfg,
  defaultLayerVisibility,
  resolveBallVisualCfg,
  resolveLayerVisibility,
  getVisualRadius,
  drawJellyBodyPath,
  drawJellyBall,
};
