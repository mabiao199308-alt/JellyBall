const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameShell = document.getElementById("gameShell");
const resetBtn = document.getElementById("resetBtn");
const meterDisplayEl = document.getElementById("meterDisplay");
const fpsDisplayEl = document.getElementById("fpsDisplay");

const debugPanelBody = document.getElementById("debugPanelBody");
const toggleAdvancedBtn = document.getElementById("toggleAdvancedBtn");
const saveCfgBtn = document.getElementById("saveCfgBtn");
const defaultCfgBtn = document.getElementById("defaultCfgBtn");
const cfgStatus = document.getElementById("cfgStatus");

const CFG_STORAGE_KEY = "swipe_debug_cfg_v2";
const BEST_STORAGE_KEY = "swipe_best_meters_v1";
const ANCHOR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];
const LOOK_DIR_SMOOTH = 12;

const defaultCfg = {
  gravity: 2060,
  airDrag: 0.996,
  restitution: 0.62,
  wallFriction: 0.985,
  ballRadius: 24,
  maxStretch: 107,
  tetherMaxLength: 74,
  restLength: 50,
  tetherRestLength: 10,
  hookRadialDamping: 0.55,
  hookSnapStrength: 0,
  hookTangentialBoost: 1.18,
  launchPower: 17.1,
  launchCurveExp: 1.2,
  maxLaunchSpeed: 1780,
  hookRadius: 20,
  springK: 42,
  springDamping: 1.6,
  breakFlashDuration: 0.12,
  rehookCooldown: 0.2,
  pxPerMeter: 100,
  cameraFollowUp: 14,
  cameraFollowDown: 14,
  cameraFollowX: 12,
  cameraTargetRatio: 0.62,
  cameraDownLimitRatio: 0.22,
  cameraLookXPadding: 70,
  cameraLookXMaxOffset: 84,
  launchGraceSec: 0.12,
  deathBottomMargin: 8,
  anchorSpacingMin: 120,
  anchorSpacingMax: 185,
  anchorSidePadding: 70,
};

const paramDefs = [
  { key: "gravity", label: "重力", min: 600, max: 3200, step: 10 },
  { key: "maxStretch", label: "最大拉伸", min: 30, max: 300, step: 1 },
  { key: "tetherMaxLength", label: "挂绳最大拉伸", min: 30, max: 420, step: 1 },
  { key: "restLength", label: "发射默认绳长", min: 10, max: 200, step: 1 },
  { key: "tetherRestLength", label: "挂绳默认绳长", min: 10, max: 260, step: 1 },
  { key: "hookRadialDamping", label: "挂点径向保留", min: 0, max: 1, step: 0.01 },
  { key: "hookSnapStrength", label: "挂点吸附强度", min: 0, max: 1, step: 0.01 },
  { key: "hookTangentialBoost", label: "挂点切向增益", min: 0.6, max: 1.4, step: 0.01 },
  { key: "launchPower", label: "发射倍率", min: 1, max: 30, step: 0.1 },
  { key: "launchCurveExp", label: "发射曲线指数", min: 0.45, max: 1.2, step: 0.01 },
  { key: "maxLaunchSpeed", label: "最大发射速度", min: 600, max: 2800, step: 10 },
  { key: "hookRadius", label: "挂点半径", min: 4, max: 80, step: 1 },
  { key: "springK", label: "弹簧系数", min: 1, max: 120, step: 0.5 },
  { key: "springDamping", label: "弹簧阻尼", min: 0, max: 20, step: 0.1 },
  { key: "airDrag", label: "空气阻力", min: 0.95, max: 1, step: 0.001, advanced: true },
  { key: "restitution", label: "碰撞反弹", min: 0, max: 1, step: 0.01, advanced: true },
  { key: "wallFriction", label: "墙体摩擦", min: 0.8, max: 1, step: 0.001, advanced: true },
  { key: "ballRadius", label: "球半径", min: 8, max: 64, step: 1, advanced: true },
  { key: "breakFlashDuration", label: "断绳闪光秒", min: 0.02, max: 0.6, step: 0.01, advanced: true },
  { key: "rehookCooldown", label: "切点冷却秒", min: 0, max: 0.8, step: 0.01, advanced: true },
  { key: "pxPerMeter", label: "像素每米", min: 40, max: 220, step: 1, advanced: true },
  { key: "cameraFollowUp", label: "相机上跟速度", min: 1, max: 24, step: 0.5, advanced: true },
  { key: "cameraFollowDown", label: "相机下跟速度", min: 1, max: 24, step: 0.5, advanced: true },
  { key: "cameraFollowX", label: "相机横跟速度", min: 1, max: 24, step: 0.5, advanced: true },
  { key: "cameraTargetRatio", label: "球目标屏幕高度", min: 0.45, max: 0.82, step: 0.01, advanced: true },
  { key: "cameraDownLimitRatio", label: "相机下跟上限", min: 0.05, max: 0.6, step: 0.01, advanced: true },
  { key: "cameraLookXPadding", label: "横向补位边距", min: 20, max: 140, step: 1, advanced: true },
  { key: "cameraLookXMaxOffset", label: "横向最大补位", min: 0, max: 180, step: 1, advanced: true },
  { key: "launchGraceSec", label: "发射保护秒", min: 0, max: 0.5, step: 0.01, advanced: true },
  { key: "deathBottomMargin", label: "底边死亡容差", min: 0, max: 40, step: 1, advanced: true },
  { key: "anchorSpacingMin", label: "钉子最小间距", min: 70, max: 260, step: 1, advanced: true },
  { key: "anchorSpacingMax", label: "钉子最大间距", min: 100, max: 340, step: 1, advanced: true },
  { key: "anchorSidePadding", label: "钉子边距", min: 20, max: 140, step: 1, advanced: true },
];

const cfg = loadCfgFromStorage();
const ballVisualCfg = window.BallVisual ? window.BallVisual.loadBallVisualCfg() : null;
const deathFxCfg = window.DeathFx
  ? window.DeathFx.loadDeathFxCfg()
  : {
      readyDelay: 0.28,
      cooldown: 0.38,
      floorYRatio: 0.94,
      originYRatio: 0.9,
      fxDuration: 0.72,
      bigBurstCount: 5,
      smallBurstCount: 12,
      bigSpeedMin: 780,
      bigSpeedMax: 1280,
      smallSpeedMin: 520,
      smallSpeedMax: 940,
      gravityMin: 1700,
      gravityMax: 2400,
      particleLifeMin: 0.06,
      particleLifeMax: 0.16,
      bigRadiusMin: 12,
      bigRadiusMax: 26,
      smallRadiusMin: 3,
      smallRadiusMax: 8,
      mainSplatScaleMin: 0.72,
      mainSplatScaleMax: 1,
      sideSplatCount: 3,
      sideSplatScaleMin: 0.55,
      sideSplatScaleMax: 1.05,
      burstToSplatScaleMin: 0.5,
      burstToSplatScaleMax: 1.1,
    };
const uiRefs = {};
let showAdvancedParams = false;

normalizeDeathFxCfg();

function createEmptyDeathFx() {
  return {
    active: false,
    timer: 0,
    originX: 0,
    originY: 0,
    floorY: 0,
    burstParticles: [],
    splats: [],
  };
}

const world = {
  w: 0,
  h: 0,
  anchors: [],
  activeAnchor: null,
  lastReleasedAnchor: null,
  anchorIdSeed: 1,
  anchorLaneCursor: 0,
  generatedTopY: 0,

  cameraY: 0,
  cameraX: 0,
  cameraDownMaxY: 0,
  startY: 0,
  minY: 0,
  runMeters: 0,
  bestMeters: loadBestMeters(),

  ball: { x: 0, y: 0, vx: 0, vy: 0 },
  lookDir: { x: 0, y: 0 },
  state: "aiming", // aiming | launched | tethered | dying | gameover
  dragging: false,
  pointerId: null,
  pointer: { x: 0, y: 0 },
  lastTime: 0,
  fps: 0,
  breakFlash: 0,
  hookFlash: 0,
  hookCooldown: 0,
  launchGraceTimer: 0,
  deathFx: createEmptyDeathFx(),
};

function loadCfgFromStorage() {
  const next = { ...defaultCfg };
  try {
    const raw = localStorage.getItem(CFG_STORAGE_KEY);
    if (!raw) return next;
    const parsed = JSON.parse(raw);
    for (const def of paramDefs) {
      const val = Number(parsed[def.key]);
      if (Number.isFinite(val)) next[def.key] = val;
    }
  } catch {
    // ignore
  }
  return next;
}

function saveCfgToStorage() {
  const payload = {};
  for (const def of paramDefs) payload[def.key] = cfg[def.key];
  localStorage.setItem(CFG_STORAGE_KEY, JSON.stringify(payload));
}

function loadBestMeters() {
  const raw = Number(localStorage.getItem(BEST_STORAGE_KEY));
  return Number.isFinite(raw) ? raw : 0;
}

function saveBestMeters() {
  localStorage.setItem(BEST_STORAGE_KEY, String(world.bestMeters));
}

function decimals(step) {
  const text = String(step);
  if (!text.includes(".")) return 0;
  return text.split(".")[1].length;
}

function formatVal(def, val) {
  return Number(val).toFixed(decimals(def.step));
}

function setStatus(text) {
  cfgStatus.textContent = text;
}

function buildDebugPanel() {
  debugPanelBody.innerHTML = "";
  for (const key of Object.keys(uiRefs)) {
    delete uiRefs[key];
  }

  for (const def of paramDefs) {
    if (!showAdvancedParams && def.advanced) continue;
    const row = document.createElement("label");
    row.className = "debug-row";

    const title = document.createElement("div");
    title.className = "debug-row__title";
    const name = document.createElement("span");
    const value = document.createElement("span");
    name.textContent = def.label;
    value.textContent = formatVal(def, cfg[def.key]);
    title.appendChild(name);
    title.appendChild(value);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(def.min);
    input.max = String(def.max);
    input.step = String(def.step);
    input.value = String(cfg[def.key]);
    input.addEventListener("input", () => {
      const v = Number(input.value);
      if (!Number.isFinite(v)) return;
      cfg[def.key] = v;
      value.textContent = formatVal(def, v);
      onCfgChanged(def.key);
      setStatus("参数实时生效，点击保存写入本地。");
    });

    row.appendChild(title);
    row.appendChild(input);
    debugPanelBody.appendChild(row);
    uiRefs[def.key] = { def, input, value };
  }
}

function syncPanelFromCfg() {
  for (const def of paramDefs) {
    const ref = uiRefs[def.key];
    if (!ref) continue;
    ref.input.value = String(cfg[def.key]);
    ref.value.textContent = formatVal(def, cfg[def.key]);
  }
}

function onCfgChanged(key) {
  if (key === "restLength" && world.state === "aiming" && !world.dragging && world.activeAnchor) {
    world.ball.x = world.activeAnchor.x;
    world.ball.y = world.activeAnchor.y + cfg.restLength;
    world.ball.vx = 0;
    world.ball.vy = 0;
  }
  if (key === "restLength" || key === "maxStretch" || key === "tetherRestLength" || key === "tetherMaxLength") {
    let changed = false;
    if (cfg.restLength > cfg.maxStretch) {
      cfg.maxStretch = cfg.restLength;
      changed = true;
    }
    if (cfg.tetherRestLength > cfg.tetherMaxLength) {
      cfg.tetherMaxLength = cfg.tetherRestLength;
      changed = true;
    }
    if (changed) syncPanelFromCfg();
  }
  if (key === "anchorSpacingMin" || key === "anchorSpacingMax") {
    if (cfg.anchorSpacingMin > cfg.anchorSpacingMax) {
      const mid = cfg.anchorSpacingMin;
      cfg.anchorSpacingMin = cfg.anchorSpacingMax;
      cfg.anchorSpacingMax = mid;
      syncPanelFromCfg();
    }
  }
  if (key === "cameraDownLimitRatio") {
    world.cameraDownMaxY = world.cameraY + world.h * cfg.cameraDownLimitRatio;
  }
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalizeDeathFxCfg() {
  if (window.DeathFx) {
    Object.assign(deathFxCfg, window.DeathFx.coerceDeathFxCfg(deathFxCfg));
  }
  if (deathFxCfg.bigSpeedMin > deathFxCfg.bigSpeedMax) [deathFxCfg.bigSpeedMin, deathFxCfg.bigSpeedMax] = [deathFxCfg.bigSpeedMax, deathFxCfg.bigSpeedMin];
  if (deathFxCfg.smallSpeedMin > deathFxCfg.smallSpeedMax) [deathFxCfg.smallSpeedMin, deathFxCfg.smallSpeedMax] = [deathFxCfg.smallSpeedMax, deathFxCfg.smallSpeedMin];
  if (deathFxCfg.gravityMin > deathFxCfg.gravityMax) [deathFxCfg.gravityMin, deathFxCfg.gravityMax] = [deathFxCfg.gravityMax, deathFxCfg.gravityMin];
  if (deathFxCfg.particleLifeMin > deathFxCfg.particleLifeMax) [deathFxCfg.particleLifeMin, deathFxCfg.particleLifeMax] = [deathFxCfg.particleLifeMax, deathFxCfg.particleLifeMin];
  if (deathFxCfg.bigRadiusMin > deathFxCfg.bigRadiusMax) [deathFxCfg.bigRadiusMin, deathFxCfg.bigRadiusMax] = [deathFxCfg.bigRadiusMax, deathFxCfg.bigRadiusMin];
  if (deathFxCfg.smallRadiusMin > deathFxCfg.smallRadiusMax) [deathFxCfg.smallRadiusMin, deathFxCfg.smallRadiusMax] = [deathFxCfg.smallRadiusMax, deathFxCfg.smallRadiusMin];
  if (deathFxCfg.mainSplatScaleMin > deathFxCfg.mainSplatScaleMax) [deathFxCfg.mainSplatScaleMin, deathFxCfg.mainSplatScaleMax] = [deathFxCfg.mainSplatScaleMax, deathFxCfg.mainSplatScaleMin];
  if (deathFxCfg.sideSplatScaleMin > deathFxCfg.sideSplatScaleMax) [deathFxCfg.sideSplatScaleMin, deathFxCfg.sideSplatScaleMax] = [deathFxCfg.sideSplatScaleMax, deathFxCfg.sideSplatScaleMin];
  if (deathFxCfg.burstToSplatScaleMin > deathFxCfg.burstToSplatScaleMax) [deathFxCfg.burstToSplatScaleMin, deathFxCfg.burstToSplatScaleMax] = [deathFxCfg.burstToSplatScaleMax, deathFxCfg.burstToSplatScaleMin];
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function createAnchor(x, y, radius = 8) {
  return { id: world.anchorIdSeed++, x, y, radius };
}

function getFixedAnchorXByCursor(cursor) {
  const ratio = ANCHOR_X_RATIOS[cursor % ANCHOR_X_RATIOS.length];
  const pad = cfg.anchorSidePadding;
  return Math.max(pad, Math.min(world.w - pad, world.w * ratio));
}

function addAnchorAbove() {
  const spacing = rand(cfg.anchorSpacingMin, cfg.anchorSpacingMax);
  const y = world.generatedTopY - spacing;
  let x = getFixedAnchorXByCursor(world.anchorLaneCursor);
  world.anchorLaneCursor += 1;
  const prev = world.anchors[world.anchors.length - 1];
  if (prev) {
    let guard = 0;
    while (Math.abs(x - prev.x) < 60 && guard < ANCHOR_X_RATIOS.length) {
      x = getFixedAnchorXByCursor(world.anchorLaneCursor);
      world.anchorLaneCursor += 1;
      guard += 1;
    }
  }

  world.anchors.push(createAnchor(x, y));
  world.generatedTopY = y;
}

function createInitialAnchors() {
  world.anchors = [];
  world.anchorIdSeed = 1;
  world.anchorLaneCursor = 0;

  const base = createAnchor(world.w * 0.5, world.h * 0.75, 9);
  world.anchors.push(base);
  world.activeAnchor = base;
  world.generatedTopY = base.y;

  for (let i = 0; i < 26; i += 1) addAnchorAbove();
}

function resetRun() {
  createInitialAnchors();
  world.lastReleasedAnchor = null;
  world.ball.x = world.activeAnchor.x;
  world.ball.y = world.activeAnchor.y + cfg.restLength;
  world.cameraX = 0;
  world.cameraY = world.ball.y - world.h * cfg.cameraTargetRatio;
  world.cameraDownMaxY = world.cameraY + world.h * cfg.cameraDownLimitRatio;
  world.ball.vx = 0;
  world.ball.vy = 0;
  world.lookDir.x = 0;
  world.lookDir.y = 0;
  world.state = "aiming";
  world.dragging = false;
  world.pointerId = null;
  world.breakFlash = 0;
  world.hookFlash = 0;
  world.hookCooldown = 0;
  world.launchGraceTimer = 0;
  world.deathFx = createEmptyDeathFx();
  world.startY = world.ball.y;
  world.minY = world.ball.y;
  world.runMeters = 0;
  updateMeterHud();
}

function updateLookDirection(dt) {
  let targetX = 0;
  let targetY = 0;

  if (world.dragging && world.state === "aiming" && world.activeAnchor) {
    const dx = world.ball.x - world.activeAnchor.x;
    const dy = world.ball.y - world.activeAnchor.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.0001) {
      const stretchRatio = Math.max(0, Math.min(1, len / Math.max(1, cfg.maxStretch)));
      const lookStrength = Math.pow(stretchRatio, 0.5);
      targetX = (-dx / len) * lookStrength;
      targetY = (-dy / len) * lookStrength;
    }
  }

  const alpha = 1 - Math.exp(-LOOK_DIR_SMOOTH * dt);
  world.lookDir.x += (targetX - world.lookDir.x) * alpha;
  world.lookDir.y += (targetY - world.lookDir.y) * alpha;

  if (Math.abs(world.lookDir.x) < 0.0001) world.lookDir.x = 0;
  if (Math.abs(world.lookDir.y) < 0.0001) world.lookDir.y = 0;
}

function resize() {
  const host = gameShell || canvas;
  const rect = host.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  world.w = width;
  world.h = height;
  resetRun();
}

function toWorldPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left + world.cameraX,
    y: e.clientY - rect.top + world.cameraY,
  };
}

function onPointerDown(e) {
  if (world.state === "gameover") {
    resetRun();
    setStatus("已重开本局。");
    return;
  }
  if (world.state === "dying") return;
  if (world.state === "launched") return;
  const p = toWorldPoint(e);
  const d = Math.hypot(p.x - world.ball.x, p.y - world.ball.y);
  if (d <= cfg.ballRadius * 1.35) {
    world.dragging = true;
    world.state = "aiming";
    world.pointerId = e.pointerId;
    world.pointer = p;
    world.ball.vx = 0;
    world.ball.vy = 0;
    canvas.setPointerCapture(e.pointerId);
  }
}

function onPointerMove(e) {
  if (!world.dragging || e.pointerId !== world.pointerId) return;
  world.pointer = toWorldPoint(e);
}

function onPointerUp(e) {
  if (e.pointerId !== world.pointerId) return;
  if (world.dragging && world.state === "aiming") launchBall();
  world.dragging = false;
  world.pointerId = null;
}

function clampToMaxStretch(x, y, anchor) {
  const dx = x - anchor.x;
  const dy = y - anchor.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= cfg.maxStretch) return { x, y };
  const ratio = cfg.maxStretch / dist;
  return { x: anchor.x + dx * ratio, y: anchor.y + dy * ratio };
}

function launchBall() {
  if (!world.activeAnchor) return;
  const a = world.activeAnchor;
  const b = world.ball;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;

  const stretch = Math.min(dist, cfg.maxStretch);
  const stretchRatio = cfg.maxStretch > 0 ? stretch / cfg.maxStretch : 0;
  // 指数曲线：小拉伸更有力（exp < 1），并通过 maxLaunchSpeed 限制满力上限
  const curvedStretch = cfg.maxStretch * Math.pow(Math.max(0, Math.min(1, stretchRatio)), cfg.launchCurveExp);
  const launchSpeed = Math.min(curvedStretch * cfg.launchPower, cfg.maxLaunchSpeed);
  b.vx = (-dx / dist) * launchSpeed;
  b.vy = (-dy / dist) * launchSpeed;
  world.lastReleasedAnchor = world.activeAnchor;
  // 发射后释放当前挂点；这样冷却结束后可重新挂回同一锚点
  world.activeAnchor = null;
  world.state = "launched";
  world.breakFlash = cfg.breakFlashDuration;
  world.hookCooldown = cfg.rehookCooldown;
  world.launchGraceTimer = cfg.launchGraceSec;
}

function hookToAnchor(anchor) {
  const b = world.ball;
  let dx = b.x - anchor.x;
  let dy = b.y - anchor.y;
  let dist = Math.hypot(dx, dy);
  if (dist < 0.0001) {
    dx = 0;
    dy = 1;
    dist = 1;
  }

  const ux = dx / dist;
  const uy = dy / dist;
  const hookLength = Math.min(cfg.tetherRestLength, cfg.tetherMaxLength);
  const snapStrength = Math.max(0, Math.min(1, cfg.hookSnapStrength));
  const snappedLength = dist + (hookLength - dist) * snapStrength;
  b.x = anchor.x + ux * snappedLength;
  b.y = anchor.y + uy * snappedLength;

  const tx = -uy;
  const ty = ux;
  const radialSpeed = b.vx * ux + b.vy * uy;
  const tangentialSpeed = b.vx * tx + b.vy * ty;
  const radialKeep = Math.max(0, Math.min(1, cfg.hookRadialDamping));
  const tangentialBoost = Math.max(0, cfg.hookTangentialBoost);
  // 只抑制“向外拉长绳子”的径向速度；向内速度保留，避免像撞停
  const nextRadial = radialSpeed > 0 ? radialSpeed * radialKeep : radialSpeed;
  const nextTangential = tangentialSpeed * tangentialBoost;
  b.vx = nextRadial * ux + nextTangential * tx;
  b.vy = nextRadial * uy + nextTangential * ty;

  world.activeAnchor = anchor;
  world.state = "tethered";
  world.hookFlash = cfg.breakFlashDuration;
  world.hookCooldown = cfg.rehookCooldown;
  world.cameraDownMaxY = world.cameraY + world.h * cfg.cameraDownLimitRatio;
}

function applyFreeFlightPhysics(dt) {
  const b = world.ball;
  b.vy += cfg.gravity * dt;
  b.vx *= cfg.airDrag;
  b.vy *= cfg.airDrag;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  collideBounds();
}

function applyTetheredPhysics(dt) {
  const b = world.ball;
  const a = world.activeAnchor;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 0.0001;

  const stretch = dist - cfg.tetherRestLength;
  const springForce = -cfg.springK * stretch;
  const fxSpring = (dx / dist) * springForce;
  const fySpring = (dy / dist) * springForce;
  const fxDamping = -cfg.springDamping * b.vx;
  const fyDamping = -cfg.springDamping * b.vy;

  b.vx += (fxSpring + fxDamping) * dt;
  b.vy += (fySpring + fyDamping + cfg.gravity) * dt;
  b.vx *= cfg.airDrag;
  b.vy *= cfg.airDrag;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  const nx = b.x - a.x;
  const ny = b.y - a.y;
  const nd = Math.hypot(nx, ny) || 0.0001;
  if (nd > cfg.tetherMaxLength) {
    const ratio = cfg.tetherMaxLength / nd;
    const rx = nx / nd;
    const ry = ny / nd;
    b.x = a.x + nx * ratio;
    b.y = a.y + ny * ratio;
    const radialSpeed = b.vx * rx + b.vy * ry;
    if (radialSpeed > 0) {
      b.vx -= radialSpeed * rx;
      b.vy -= radialSpeed * ry;
    }
  }

  collideBounds();
}

function checkAnchorHook() {
  if (world.hookCooldown > 0 || world.state === "gameover") return;
  const b = world.ball;
  for (const a of world.anchors) {
    if (a === world.activeAnchor) continue;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= cfg.ballRadius + cfg.hookRadius + a.radius) {
      hookToAnchor(a);
      return;
    }
  }
}

function ensureAnchorsCoverage() {
  const targetTop = world.cameraY - world.h * 2.4;
  while (world.generatedTopY > targetTop) addAnchorAbove();

  const pruneBottom = world.cameraY + world.h * 2.2;
  world.anchors = world.anchors.filter(
    (a) => a === world.activeAnchor || a === world.lastReleasedAnchor || a.y < pruneBottom,
  );
}

function updateMeters() {
  world.minY = Math.min(world.minY, world.ball.y);
  const risePx = Math.max(0, world.startY - world.minY);
  world.runMeters = risePx / cfg.pxPerMeter;
  if (world.runMeters > world.bestMeters) {
    world.bestMeters = world.runMeters;
    saveBestMeters();
  }
  updateMeterHud();
}

function updateMeterHud() {
  if (meterDisplayEl) {
    meterDisplayEl.textContent = `米数：${world.runMeters.toFixed(1)}`;
  }
}

function updateFpsHud() {
  if (fpsDisplayEl) {
    fpsDisplayEl.textContent = `FPS: ${Math.round(world.fps)}`;
  }
}

function updateCamera(dt) {
  const desired = world.ball.y - world.h * cfg.cameraTargetRatio;

  if (desired < world.cameraY) {
    const alpha = 1 - Math.exp(-cfg.cameraFollowUp * dt);
    world.cameraY += (desired - world.cameraY) * alpha;
  } else if (world.state === "aiming" || world.state === "tethered") {
    // 下跟只在可操作阶段生效，且有下跟上限，避免无限下坠
    const downDesired = Math.min(desired, world.cameraDownMaxY);
    const alpha = 1 - Math.exp(-cfg.cameraFollowDown * dt);
    world.cameraY += (downDesired - world.cameraY) * alpha;
  }

  const xAlpha = 1 - Math.exp(-cfg.cameraFollowX * dt);
  let desiredCameraX = 0;
  if (world.state === "aiming" || world.state === "tethered") {
    const padding = Math.min(cfg.cameraLookXPadding, world.w * 0.45);
    const leftLimit = padding;
    const rightLimit = world.w - padding;
    if (world.ball.x < leftLimit) {
      desiredCameraX = world.ball.x - leftLimit;
    } else if (world.ball.x > rightLimit) {
      desiredCameraX = world.ball.x - rightLimit;
    }
    desiredCameraX = clamp(desiredCameraX, -cfg.cameraLookXMaxOffset, cfg.cameraLookXMaxOffset);
  }
  world.cameraX += (desiredCameraX - world.cameraX) * xAlpha;
}

function getJuicePalette() {
  const palette = [];
  if (ballVisualCfg) {
    palette.push(ballVisualCfg.colorA, ballVisualCfg.colorB, ballVisualCfg.colorC, ballVisualCfg.colorD);
  }
  palette.push("#f4ff9a", "#d8f55d", "#acd726", "#7aa90f");
  return [...new Set(palette.filter((c) => typeof c === "string" && c.trim()))];
}

function spawnJuiceBurstParticle(fx, originX, originY, palette, big = false) {
  const angle = rand(-Math.PI * 0.95, Math.PI * 0.02);
  const speed = big ? rand(deathFxCfg.bigSpeedMin, deathFxCfg.bigSpeedMax) : rand(deathFxCfg.smallSpeedMin, deathFxCfg.smallSpeedMax);
  const scale = big ? rand(1.05, 1.9) : rand(0.35, 0.8);
  fx.burstParticles.push({
    x: originX + rand(-10, 10),
    y: originY + rand(-10, 6),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(60, 180),
    gravity: rand(deathFxCfg.gravityMin, deathFxCfg.gravityMax),
    drag: rand(0.92, 0.965),
    life: rand(deathFxCfg.particleLifeMin, deathFxCfg.particleLifeMax),
    color: palette[randInt(0, palette.length - 1)],
    alpha: big ? rand(0.72, 0.9) : rand(0.45, 0.72),
    scale,
    radius: (big ? rand(deathFxCfg.bigRadiusMin, deathFxCfg.bigRadiusMax) : rand(deathFxCfg.smallRadiusMin, deathFxCfg.smallRadiusMax)) * scale,
    floorY: fx.floorY - rand(0, 10),
  });
}

function createJuiceSplat(x, y, color, alpha, scale = 1) {
  const lobes = [];
  const lobeCount = randInt(4, 9);
  for (let i = 0; i < lobeCount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(10, 34) * scale;
    lobes.push({
      ox: Math.cos(angle) * dist,
      oy: Math.sin(angle) * dist * rand(0.65, 1),
      r: rand(6, 18) * scale,
    });
  }

  return {
    x,
    y,
    color,
    alpha,
    radius: rand(16, 34) * scale,
    age: 0,
    life: rand(0.82, 1.35),
    grow: rand(1.18, 1.6),
    lobes,
    dripCount: randInt(3, 7),
  };
}

function startDeathFx() {
  normalizeDeathFxCfg();
  const originX = clamp(toScreenX(world.ball.x), 24, world.w - 24);
  const originY = clamp(toScreenY(world.ball.y), world.h * deathFxCfg.originYRatio, world.h - 24);
  const palette = getJuicePalette();
  const fx = createEmptyDeathFx();
  fx.active = true;
  fx.timer = deathFxCfg.fxDuration + deathFxCfg.cooldown;
  fx.originX = originX;
  fx.originY = originY;
  fx.floorY = world.h * deathFxCfg.floorYRatio;

  fx.splats.push(
    createJuiceSplat(
      originX + rand(-10, 10),
      fx.floorY - rand(3, 8),
      palette[randInt(0, palette.length - 1)],
      rand(0.16, 0.24),
      rand(deathFxCfg.mainSplatScaleMin, deathFxCfg.mainSplatScaleMax),
    ),
  );

  for (let i = 0; i < deathFxCfg.bigBurstCount; i += 1) spawnJuiceBurstParticle(fx, originX, originY, palette, true);
  for (let i = 0; i < deathFxCfg.smallBurstCount; i += 1) spawnJuiceBurstParticle(fx, originX, originY, palette, false);

  for (let i = 0; i < deathFxCfg.sideSplatCount; i += 1) {
    fx.splats.push(
      createJuiceSplat(
        originX + rand(-34, 34),
        fx.floorY - rand(2, 10),
        palette[randInt(0, palette.length - 1)],
        rand(0.14, 0.24),
        rand(deathFxCfg.sideSplatScaleMin, deathFxCfg.sideSplatScaleMax),
      ),
    );
  }

  world.deathFx = fx;
  world.state = "dying";
  world.dragging = false;
  world.pointerId = null;
  world.lookDir.x = 0;
  world.lookDir.y = 0;
  world.ball.vx = 0;
  world.ball.vy = 0;
}

function updateDeathFx(dt) {
  const fx = world.deathFx;
  if (!fx.active) return;

  fx.timer = Math.max(0, fx.timer - dt);

  for (let i = fx.burstParticles.length - 1; i >= 0; i -= 1) {
    const p = fx.burstParticles[i];
    p.life -= dt;
    p.vx *= Math.pow(p.drag, dt * 60);
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.y + p.radius >= p.floorY || p.life <= 0) {
      fx.splats.push(
        createJuiceSplat(
          p.x,
          p.floorY - rand(0, 4),
          p.color,
          p.alpha * 0.96,
          p.scale * rand(deathFxCfg.burstToSplatScaleMin, deathFxCfg.burstToSplatScaleMax),
        ),
      );
      fx.burstParticles.splice(i, 1);
    }
  }

  for (let i = fx.splats.length - 1; i >= 0; i -= 1) {
    const splat = fx.splats[i];
    splat.age += dt;
    if (splat.age >= splat.life) fx.splats.splice(i, 1);
  }

  if (fx.timer <= 0 && fx.burstParticles.length === 0) {
    fx.active = false;
    world.state = "gameover";
  }
}

function checkGameOver() {
  if (world.state === "gameover" || world.state === "dying") return;
  if (world.state !== "launched") return;
  if (world.launchGraceTimer > 0) return;
  const screenBottomY = world.cameraY + world.h;
  if (world.ball.y + cfg.ballRadius >= screenBottomY + cfg.deathBottomMargin) {
    startDeathFx();
  }
}

function collideBounds() {
  const b = world.ball;
  const r = cfg.ballRadius;
  if (b.x < r) {
    b.x = r;
    b.vx = -b.vx * cfg.restitution;
    b.vy *= cfg.wallFriction;
  }
  if (b.x > world.w - r) {
    b.x = world.w - r;
    b.vx = -b.vx * cfg.restitution;
    b.vy *= cfg.wallFriction;
  }
  const top = world.cameraY + r;
  if (b.y < top) {
    b.y = top;
    b.vy = -b.vy * cfg.restitution;
    b.vx *= cfg.wallFriction;
  }
}

function update(dt) {
  if (world.state === "dying") {
    updateDeathFx(dt);
    return;
  }

  const draggingAim = world.dragging && world.state === "aiming";
  if (draggingAim) {
    const clamped = clampToMaxStretch(world.pointer.x, world.pointer.y, world.activeAnchor);
    world.ball.x = clamped.x;
    world.ball.y = clamped.y;
    world.ball.vx = 0;
    world.ball.vy = 0;
  }

  world.breakFlash = Math.max(0, world.breakFlash - dt);
  world.hookFlash = Math.max(0, world.hookFlash - dt);
  world.hookCooldown = Math.max(0, world.hookCooldown - dt);
  world.launchGraceTimer = Math.max(0, world.launchGraceTimer - dt);
  updateLookDirection(dt);

  if (draggingAim) {
    // dragging 时仍继续更新镜头，让左右补位能及时生效
  } else if (world.state === "launched") {
    applyFreeFlightPhysics(dt);
    checkAnchorHook();
  } else if (world.state === "tethered") {
    applyTetheredPhysics(dt);
    checkAnchorHook();
  } else if (world.state === "gameover") {
    return;
  }

  checkGameOver();
  if (world.state === "dying") {
    updateDeathFx(dt);
    return;
  }
  if (world.state === "launched" || world.state === "tethered") {
    updateMeters();
  }
  if (world.state !== "gameover") {
    updateCamera(dt);
    ensureAnchorsCoverage();
  }
}

function toScreenY(worldY) {
  return worldY - world.cameraY;
}

function toScreenX(worldX) {
  return worldX - world.cameraX;
}

function drawBackground() {
  const skyOffsetX = -world.cameraX * 0.18;
  const g = ctx.createLinearGradient(0, 0, 0, world.h);
  g.addColorStop(0, "#7dd3fc");
  g.addColorStop(0.45, "#bae6fd");
  g.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, world.w, world.h);

  const sunX = world.w * 0.78 + skyOffsetX;
  const sunGlow = ctx.createRadialGradient(sunX, world.h * 0.16, 12, sunX, world.h * 0.16, world.w * 0.22);
  sunGlow.addColorStop(0, "rgba(255, 245, 180, 0.95)");
  sunGlow.addColorStop(0.45, "rgba(255, 236, 153, 0.45)");
  sunGlow.addColorStop(1, "rgba(255, 236, 153, 0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, world.h * 0.16, world.w * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 244, 186, 0.95)";
  ctx.beginPath();
  ctx.arc(sunX, world.h * 0.16, Math.min(world.w, world.h) * 0.06, 0, Math.PI * 2);
  ctx.fill();

  const haze = ctx.createLinearGradient(0, world.h * 0.55, 0, world.h);
  haze.addColorStop(0, "rgba(255,255,255,0)");
  haze.addColorStop(1, "rgba(255,255,255,0.22)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, world.h * 0.55, world.w, world.h * 0.45);
}

function getBallRenderAngle() {
  if (world.activeAnchor) {
    const dx = world.ball.x - world.activeAnchor.x;
    const dy = world.ball.y - world.activeAnchor.y;
    if (Math.hypot(dx, dy) > 0.001) return Math.atan2(dy, dx) - Math.PI / 2;
  }

  const speed = Math.hypot(world.ball.vx, world.ball.vy);
  if (speed > 40) return Math.atan2(world.ball.vy, world.ball.vx) - Math.PI / 2;
  return 0;
}

function drawVerticalCapsulePath(x, y, width, height) {
  const r = width * 0.5;
  const topCy = y - height * 0.5 + r;
  const bottomCy = y + height * 0.5 - r;

  ctx.beginPath();
  ctx.arc(x, topCy, r, Math.PI, 0, false);
  ctx.lineTo(x + r, bottomCy);
  ctx.arc(x, bottomCy, r, 0, Math.PI, false);
  ctx.closePath();
}

function getAnchorVisualStyle(anchor) {
  return anchor.id % 2 === 0
    ? { core: "#ff5046", coreDark: "#d9362c", rimLight: "#fff5eb", rimDark: "#bb9a78" }
    : { core: "#37a9ff", coreDark: "#167fe0", rimLight: "#fff7ef", rimDark: "#b59a79" };
}

function getBallVisualRadius() {
  if (window.BallVisual && ballVisualCfg) {
    return window.BallVisual.getVisualRadius(cfg.ballRadius, ballVisualCfg);
  }
  return Math.max(cfg.ballRadius * 1.2, 30);
}

function drawRubberBand() {
  if (world.state !== "aiming" && world.state !== "tethered") return;
  const a = world.activeAnchor;
  if (!a) return;
  const dx = world.ball.x - a.x;
  const dy = world.ball.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return;
  const stretchCap = world.state === "tethered" ? cfg.tetherMaxLength : cfg.maxStretch;
  const stretchRatio = clamp01(dist / Math.max(1, stretchCap));
  const ux = dx / dist;
  const uy = dy / dist;
  const px = -uy;
  const py = ux;
  const sx = toScreenX(a.x);
  const sy = toScreenY(a.y);
  const ballSx = toScreenX(world.ball.x);
  const ballSy = toScreenY(world.ball.y);

  const outerR = a.radius + 10;
  const ballR = getBallVisualRadius();
  const topCenterX = ballSx - ux * (ballR * 0.82);
  const topCenterY = ballSy - uy * (ballR * 0.82);
  const startBaseX = sx + ux * (outerR * 0.88);
  const startBaseY = sy + uy * (outerR * 0.88);
  const startSep = 4 + stretchRatio * 1.5;
  const endSep = ballR * 0.34;
  const strapWidth = 7.8 - stretchRatio * 3.2;

  for (const dir of [-1, 1]) {
    const sx = startBaseX + px * startSep * dir;
    const sy1 = startBaseY + py * startSep * dir;
    const ex = topCenterX + px * endSep * dir;
    const ey = topCenterY + py * endSep * dir;

    ctx.save();
    ctx.lineCap = "round";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = strapWidth;
    const cx = lerp(sx, ex, 0.56) - ux * ballR * 0.08;
    const cy = lerp(sy1, ey, 0.56) - uy * ballR * 0.08;
    ctx.beginPath();
    ctx.moveTo(sx, sy1);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
    ctx.restore();
  }

}

function drawAnchors() {
  for (const a of world.anchors) {
    const sx = toScreenX(a.x);
    const sy = toScreenY(a.y);
    if (sx < -80 || sx > world.w + 80 || sy < -80 || sy > world.h + 80) continue;

    const isActive = a === world.activeAnchor;
    const pulse = isActive ? 1 + world.hookFlash * 4 : 1;
    const style = getAnchorVisualStyle(a);
    const outerR = a.radius + 10;
    const ringR = outerR - 4;
    const coreR = outerR - 8.5;

    ctx.save();
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

    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.beginPath();
    ctx.arc(sx - coreR * 0.28, sy - coreR * 0.32, coreR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (isActive) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.9, 0.4 + world.hookFlash * 2)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sx, sy, outerR + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawDeathFx() {
  const fx = world.deathFx;
  if (!fx.active) return;

  for (const p of fx.burstParticles) {
    const alpha = p.alpha * clamp01(p.life / 0.16);
    if (alpha <= 0.01) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,220,0.18)";
    ctx.beginPath();
    ctx.arc(-p.radius * 0.18, -p.radius * 0.14, p.radius * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const splat of fx.splats) {
    const t = clamp01(splat.age / Math.max(0.0001, splat.life));
    const pop = 1 - Math.pow(1 - Math.min(1, t * 2.8), 3);
    const alpha = splat.alpha * (1 - t * 0.52);
    const scale = lerp(0.18, splat.grow, pop);
    if (alpha <= 0.01) continue;

    ctx.save();
    ctx.translate(splat.x, splat.y);
    ctx.fillStyle = splat.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, splat.radius * scale, 0, Math.PI * 2);
    ctx.fill();

    for (const lobe of splat.lobes) {
      ctx.save();
      ctx.translate(lobe.ox * scale, lobe.oy * scale);
      ctx.beginPath();
      ctx.arc(0, 0, lobe.r * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = "rgba(255,255,220,0.22)";
    ctx.beginPath();
    ctx.arc(-splat.radius * 0.2, -splat.radius * 0.18, splat.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = splat.color;
    ctx.globalAlpha = alpha * 0.82;
    for (let i = 0; i < splat.dripCount; i += 1) {
      const dripX = lerp(-splat.radius * 1.1, splat.radius * 1.1, (i + 1) / (splat.dripCount + 1));
      const dripY = splat.radius * (0.9 + (i % 2) * 0.28) * scale;
      ctx.beginPath();
      ctx.arc(dripX, dripY, (3.4 + i * 0.8) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawBall() {
  if (world.state === "dying") return;
  const sy = toScreenY(world.ball.y);
  const sx = toScreenX(world.ball.x);
  const angle = getBallRenderAngle();

  if (window.BallVisual && ballVisualCfg) {
    window.BallVisual.drawJellyBall(ctx, {
      x: sx,
      y: sy,
      angle,
      baseRadius: cfg.ballRadius,
      speed: Math.hypot(world.ball.vx, world.ball.vy),
      time: world.lastTime,
      lookDirX: world.lookDir.x,
      lookDirY: world.lookDir.y,
      cfg: ballVisualCfg,
    });
    return;
  }

  ctx.fillStyle = "#84cc16";
  ctx.beginPath();
  ctx.arc(sx, sy, cfg.ballRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBreakFlash() {
  if (world.breakFlash <= 0 || !world.lastReleasedAnchor) return;
  const t = world.breakFlash / cfg.breakFlashDuration;
  const sx = toScreenX(world.lastReleasedAnchor.x);
  const sy = toScreenY(world.lastReleasedAnchor.y);
  ctx.strokeStyle = `rgba(255, 255, 255, ${t * 0.9})`;
  ctx.lineWidth = 2 + t * 6;
  ctx.beginPath();
  ctx.arc(sx, sy, 12 + (1 - t) * 18, 0, Math.PI * 2);
  ctx.stroke();
}

function drawGameOver() {
  if (world.state !== "gameover") return;
  ctx.fillStyle = "rgba(2, 6, 23, 0.56)";
  ctx.fillRect(0, 0, world.w, world.h);
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("本局结束", world.w * 0.5, world.h * 0.42);
  ctx.font = "22px sans-serif";
  ctx.fillText(`本局 ${world.runMeters.toFixed(1)}m`, world.w * 0.5, world.h * 0.5);
  ctx.fillText(`最高 ${world.bestMeters.toFixed(1)}m`, world.w * 0.5, world.h * 0.56);
  ctx.font = "16px sans-serif";
  ctx.fillText("点击【重置】继续挑战", world.w * 0.5, world.h * 0.64);
}

function draw() {
  drawBackground();
  drawRubberBand();
  drawAnchors();
  drawBall();
  drawBreakFlash();
  drawDeathFx();
  drawGameOver();
}

function tick(t) {
  if (!world.lastTime) {
    world.lastTime = t;
    world.fps = 60;
  }
  const dt = Math.min((t - world.lastTime) / 1000, 1 / 30);
  const rawDt = Math.max((t - world.lastTime) / 1000, 0.0001);
  world.lastTime = t;
  const currentFps = 1 / rawDt;
  world.fps += (currentFps - world.fps) * 0.12;
  updateFpsHud();
  update(dt);
  draw();
  requestAnimationFrame(tick);
}

buildDebugPanel();
syncPanelFromCfg();
updateMeterHud();
updateFpsHud();

toggleAdvancedBtn.addEventListener("click", () => {
  showAdvancedParams = !showAdvancedParams;
  toggleAdvancedBtn.textContent = showAdvancedParams ? "隐藏高级" : "显示全部";
  buildDebugPanel();
  syncPanelFromCfg();
});

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    resetRun();
    setStatus("已重开本局。");
  });
}

saveCfgBtn.addEventListener("click", () => {
  saveCfgToStorage();
  setStatus("已保存到本地，下次打开会自动读取。");
});

defaultCfgBtn.addEventListener("click", () => {
  Object.assign(cfg, defaultCfg);
  syncPanelFromCfg();
  onCfgChanged("restLength");
  setStatus("已恢复默认参数（如需持久化请点保存）。");
});

window.addEventListener("storage", (e) => {
  if (window.BallVisual && ballVisualCfg && e.key === window.BallVisual.BALL_VISUAL_STORAGE_KEY) {
    Object.assign(ballVisualCfg, window.BallVisual.loadBallVisualCfg());
  }
  if (window.DeathFx && e.key === window.DeathFx.DEATH_FX_STORAGE_KEY) {
    Object.assign(deathFxCfg, window.DeathFx.loadDeathFxCfg());
    normalizeDeathFxCfg();
  }
});

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);

resize();
requestAnimationFrame(tick);
