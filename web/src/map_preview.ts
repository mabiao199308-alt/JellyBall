import { HAZARD_CFG_STORAGE_KEY } from "./config/storage_keys";

function mustEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el as T;
}

const metersInput = mustEl<HTMLInputElement>("metersInput");
const visibleMetersInput = mustEl<HTMLInputElement>("visibleMetersInput");
const viewportInput = mustEl<HTMLInputElement>("viewportInput");
const scrollRange = document.getElementById("scrollRange") as HTMLInputElement | null;
const prevScreenBtn = mustEl<HTMLButtonElement>("prevScreenBtn");
const nextScreenBtn = mustEl<HTMLButtonElement>("nextScreenBtn");
const generateBtn = mustEl<HTMLButtonElement>("generateBtn");
const regenBtn = mustEl<HTMLButtonElement>("regenBtn");
const statsPanel = mustEl<HTMLElement>("statsPanel");
const canvas = mustEl<HTMLCanvasElement>("previewCanvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("2D context unavailable");

const WORLD_W = 390;
const WORLD_H = 844;
const PX_PER_METER = 100;
const DEFAULT_VISIBLE_METERS = 50;
const CANVAS_MARGIN = 24;
let latestResult: any = null;

const ANCHOR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];
const GEAR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];

const INITIAL_PREGEN_ANCHORS = 6;
const ANCHOR_DIFFICULTY_START_METERS = 30;
const ANCHOR_DIFFICULTY_FULL_METERS = 160;
const ANCHOR_SPACING_BONUS_MIN = 26;
const ANCHOR_SPACING_BONUS_MAX = 78;
const RED_ANCHOR_CHANCE = 1 / 3;
const FIRST_BLUE_ANCHOR_COUNT = 5;

const TRACK_ENABLED = true;
const TRACK_UNLOCK_ANCHOR_COUNT = 10;
const TRACK_SLOT_INTERVAL_MIN = 3;
const TRACK_ANCHOR_BLOCK_Y = 170;
const TRACK_ANCHOR_BLOCK_X_RATIO = 0.72;

const GEAR_ENABLED = true;
const GEAR_UNLOCK_ANCHOR_COUNT = 20;
const GEAR_SLOT_INTERVAL_MIN = 3;
const GEAR_ANCHOR_BLOCK_Y = 190;
const GEAR_ANCHOR_BLOCK_X_PAD = 74;
const GEAR_SAFE_ANCHOR_MIN_X_GAP = 130;
const GEAR_SAFE_ANCHOR_Y_OFFSET_MIN = 25;
const GEAR_SAFE_ANCHOR_Y_OFFSET_MAX = 70;
const GEAR_SAFE_ANCHOR_TRY_COUNT = 14;

const cfg = {
  anchorSpacingMin: 120,
  anchorSpacingMax: 185,
  anchorSidePadding: 70,
  maxStretch: 115,
};

const defaultHazardCfg = {
  baseTrackUnlockMeters: 12,
  gearUnlockMeters: 34,
  damageTrackUnlockMeters: 61,
  baseTrackSlotInterval: 3,
  baseTrackSpawnChance: 0.52,
  baseTrackSpawnChanceMax: 0.86,
  damageTrackSlotInterval: 4,
  damageTrackSpawnChance: 0.4,
  damageTrackSpawnChanceMax: 0.74,
  gearSlotInterval: 3,
  gearSpawnChance: 0.55,
  gearSpawnChanceMax: 0.85,
  hazardDensityStartMeters: 80,
  hazardDensityFullMeters: 260,
};

const hazardCfg = { ...defaultHazardCfg };

const hazardIntegerKeys = new Set([
  "baseTrackUnlockMeters",
  "gearUnlockMeters",
  "damageTrackUnlockMeters",
  "baseTrackSlotInterval",
  "damageTrackSlotInterval",
  "gearSlotInterval",
  "hazardDensityStartMeters",
  "hazardDensityFullMeters",
]);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function clamp01(v) {
  return clamp(v, 0, 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalizeHazardCfg() {
  const defs: Array<[string, number, number]> = [
    ["baseTrackUnlockMeters", 0, 220],
    ["gearUnlockMeters", 0, 260],
    ["damageTrackUnlockMeters", 0, 320],
    ["baseTrackSlotInterval", 1, 10],
    ["baseTrackSpawnChance", 0.05, 1],
    ["baseTrackSpawnChanceMax", 0.05, 1],
    ["damageTrackSlotInterval", 1, 10],
    ["damageTrackSpawnChance", 0.05, 1],
    ["damageTrackSpawnChanceMax", 0.05, 1],
    ["gearSlotInterval", 1, 10],
    ["gearSpawnChance", 0.05, 1],
    ["gearSpawnChanceMax", 0.05, 1],
    ["hazardDensityStartMeters", 0, 320],
    ["hazardDensityFullMeters", 10, 500],
  ];
  for (const [key, min, max] of defs) {
    let v = Number(hazardCfg[key]);
    if (!Number.isFinite(v)) v = defaultHazardCfg[key];
    v = clamp(v, min, max);
    if (hazardIntegerKeys.has(key)) v = Math.round(v);
    hazardCfg[key] = v;
  }
  if (hazardCfg.baseTrackSpawnChance > hazardCfg.baseTrackSpawnChanceMax) {
    [hazardCfg.baseTrackSpawnChance, hazardCfg.baseTrackSpawnChanceMax] = [hazardCfg.baseTrackSpawnChanceMax, hazardCfg.baseTrackSpawnChance];
  }
  if (hazardCfg.damageTrackSpawnChance > hazardCfg.damageTrackSpawnChanceMax) {
    [hazardCfg.damageTrackSpawnChance, hazardCfg.damageTrackSpawnChanceMax] = [hazardCfg.damageTrackSpawnChanceMax, hazardCfg.damageTrackSpawnChance];
  }
  if (hazardCfg.gearSpawnChance > hazardCfg.gearSpawnChanceMax) {
    [hazardCfg.gearSpawnChance, hazardCfg.gearSpawnChanceMax] = [hazardCfg.gearSpawnChanceMax, hazardCfg.gearSpawnChance];
  }
  if (hazardCfg.hazardDensityStartMeters >= hazardCfg.hazardDensityFullMeters) {
    hazardCfg.hazardDensityFullMeters = hazardCfg.hazardDensityStartMeters + 1;
  }
}

function loadHazardCfgFromStorage() {
  try {
    const raw = localStorage.getItem(HAZARD_CFG_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    for (const key of Object.keys(defaultHazardCfg)) {
      const val = Number(parsed[key]);
      if (Number.isFinite(val)) hazardCfg[key] = val;
    }
  } catch {
    // ignore
  }
}

loadHazardCfgFromStorage();
normalizeHazardCfg();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function getVisibleMeters() {
  const v = clamp(Number(visibleMetersInput.value) || DEFAULT_VISIBLE_METERS, 10, 200);
  visibleMetersInput.value = String(Math.round(v));
  return v;
}

function resizePreviewCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(width * WORLD_H / WORLD_W));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height };
}

function createGeneratorState() {
  return {
    runMeters: 0,
    anchors: [],
    gears: [],
    tracks: [],
    movingTrack: null,
    anchorSpawnCount: 0,
    anchorLaneCursor: randInt(0, ANCHOR_X_RATIOS.length - 1),
    generatedTopY: 0,
    pendingSafeAnchorSide: 0,
    trackLaneCursor: randInt(0, ANCHOR_X_RATIOS.length - 1),
    baseTrackSlotsSinceSpawn: 0,
    damageTrackSlotsSinceSpawn: 0,
    gearLaneCursor: randInt(0, GEAR_X_RATIOS.length - 1),
    generatedGearTopY: 0,
    gearSlotsSinceSpawn: 0,
  };
}

function createAnchor(x, y, isRed = null, state = null) {
  const forceBlue = state && state.anchorSpawnCount < FIRST_BLUE_ANCHOR_COUNT;
  const finalIsRed = typeof isRed === "boolean" ? isRed : (forceBlue ? false : Math.random() < RED_ANCHOR_CHANCE);
  return { x, y, isRed: finalIsRed };
}

function createMovingTrack() {
  const width = Math.max(220, Math.min(320, WORLD_W * 0.62));
  const height = Math.max(26, Math.min(38, WORLD_H * 0.045));
  const yOffset = Math.max(190, Math.min(280, WORLD_H * 0.3));
  const pinRadius = Math.max(10, Math.min(14, height * 0.44));
  return {
    x: WORLD_W * 0.5,
    y: WORLD_H * 0.75 - yOffset,
    width,
    height,
    pinRadius,
    activated: false,
    mode: "pin",
  };
}

function getDynamicAnchorSpacingRange(state) {
  const minBase = Math.min(cfg.anchorSpacingMin, cfg.anchorSpacingMax);
  const maxBase = Math.max(cfg.anchorSpacingMin, cfg.anchorSpacingMax);
  const meterSpan = Math.max(1, ANCHOR_DIFFICULTY_FULL_METERS - ANCHOR_DIFFICULTY_START_METERS);
  const t = clamp01((state.runMeters - ANCHOR_DIFFICULTY_START_METERS) / meterSpan);
  const min = minBase + ANCHOR_SPACING_BONUS_MIN * t;
  const max = maxBase + ANCHOR_SPACING_BONUS_MAX * t;
  return { min, max: Math.max(min + 6, max) };
}

function getAnchorMaxStepX() {
  return Math.max(110, Math.min(WORLD_W * 0.36, cfg.maxStretch * 1.72));
}

function getFixedAnchorXByCursor(cursor) {
  const ratio = ANCHOR_X_RATIOS[cursor % ANCHOR_X_RATIOS.length];
  const pad = cfg.anchorSidePadding;
  return clamp(WORLD_W * ratio, pad, WORLD_W - pad);
}

function getRandomizedAnchorXByCursor(cursor) {
  const base = getFixedAnchorXByCursor(cursor);
  const jitter = rand(-22, 22);
  const pad = cfg.anchorSidePadding;
  return clamp(base + jitter, pad, WORLD_W - pad);
}

function getRandomizedAnchorXBySide(side) {
  const ratios = side < 0 ? [0.2, 0.35] : [0.65, 0.8];
  const ratio = ratios[randInt(0, ratios.length - 1)];
  const jitter = rand(-18, 18);
  const pad = cfg.anchorSidePadding;
  return clamp(WORLD_W * ratio + jitter, pad, WORLD_W - pad);
}

function isAnchorBlockedByTrack(state, x, y) {
  const t = state.movingTrack;
  if (!TRACK_ENABLED || !t || !t.activated) return false;
  if (Math.abs(y - t.y) > TRACK_ANCHOR_BLOCK_Y) return false;
  const blockHalfW = t.width * TRACK_ANCHOR_BLOCK_X_RATIO;
  return Math.abs(x - t.x) < blockHalfW;
}

function isAnchorBlockedByGear(state, x, y) {
  if (!GEAR_ENABLED || !state.gears.length) return false;
  for (const g of state.gears) {
    if (Math.abs(y - g.y) > GEAR_ANCHOR_BLOCK_Y) continue;
    const blockHalfW = g.radius + GEAR_ANCHOR_BLOCK_X_PAD;
    if (Math.abs(x - g.x) < blockHalfW) return true;
  }
  return false;
}

function getMinAnchorGap(forcedSide = 0) {
  return forcedSide !== 0 ? GEAR_SAFE_ANCHOR_MIN_X_GAP : 60;
}

function isAnchorPlacementValid(state, prev, x, y, forcedSide = 0) {
  if (isAnchorBlockedByTrack(state, x, y) || isAnchorBlockedByGear(state, x, y)) return false;
  if (!prev) return true;
  const dx = Math.abs(x - prev.x);
  return dx >= getMinAnchorGap(forcedSide) && dx <= getAnchorMaxStepX();
}

function commitAnchor(state, x, y) {
  state.anchors.push(createAnchor(x, y, null, state));
  state.anchorSpawnCount += 1;
  state.generatedTopY = y;
}

function tryAddAnchorAtY(state, y, forcedSide = 0, tryCount = ANCHOR_X_RATIOS.length + 4) {
  const prev = state.anchors[state.anchors.length - 1] || null;
  for (let i = 0; i < tryCount; i += 1) {
    const x = forcedSide === 0 ? getRandomizedAnchorXByCursor(state.anchorLaneCursor) : getRandomizedAnchorXBySide(forcedSide);
    state.anchorLaneCursor += 1;
    if (!isAnchorPlacementValid(state, prev, x, y, forcedSide)) continue;
    commitAnchor(state, x, y);
    return true;
  }
  if (forcedSide !== 0 && prev) {
    const fallbackRatios = forcedSide < 0 ? [0.35, 0.2, 0.5] : [0.65, 0.8, 0.5];
    const yOffsets = [0, -10, 10, -18, 18, -26, 26];
    const pad = cfg.anchorSidePadding;
    for (const ratio of fallbackRatios) {
      const x = clamp(WORLD_W * ratio, pad, WORLD_W - pad);
      for (const dy of yOffsets) {
        const candidateY = y + dy;
        if (!isAnchorPlacementValid(state, prev, x, candidateY, forcedSide)) continue;
        commitAnchor(state, x, candidateY);
        return true;
      }
    }
  }
  return false;
}

function addAnchorAbove(state, yOverride = null, forcedSide = 0) {
  const spacingRange = getDynamicAnchorSpacingRange(state);
  const spacing = rand(spacingRange.min, spacingRange.max);
  const y = Number.isFinite(yOverride) ? yOverride : state.generatedTopY - spacing;
  if (tryAddAnchorAtY(state, y, forcedSide)) return;
  const x = forcedSide === 0 ? getFixedAnchorXByCursor(state.anchorLaneCursor) : getRandomizedAnchorXBySide(forcedSide);
  state.anchorLaneCursor += 1;
  commitAnchor(state, x, y);
}

function createGearHazard(x, y) {
  const radius = Math.max(34, Math.min(54, WORLD_W * 0.105));
  return { x, y, radius };
}

function spawnGearAtY(state, y) {
  if (!GEAR_ENABLED) return false;
  const side = Math.random() < 0.5 ? -1 : 1;
  const pad = cfg.anchorSidePadding + 22;
  const leftX = clamp(WORLD_W * rand(0.2, 0.36), pad, WORLD_W - pad);
  const rightX = clamp(WORLD_W * rand(0.64, 0.8), pad, WORLD_W - pad);
  const x = side < 0 ? leftX : rightX;
  state.gears.push(createGearHazard(x, y));
  const safeSide = side < 0 ? 1 : -1;
  const safeYOffset = rand(GEAR_SAFE_ANCHOR_Y_OFFSET_MIN, GEAR_SAFE_ANCHOR_Y_OFFSET_MAX);
  const safeY = y - safeYOffset;
  if (!tryAddAnchorAtY(state, safeY, safeSide, GEAR_SAFE_ANCHOR_TRY_COUNT)) {
    addAnchorAbove(state, safeY, safeSide);
  }
  return true;
}

function getTrackRespawnXByCursor(cursor, width) {
  const ratio = ANCHOR_X_RATIOS[cursor % ANCHOR_X_RATIOS.length];
  const sidePad = Math.max(cfg.anchorSidePadding + 12, width * 0.5 + 14);
  return clamp(WORLD_W * ratio, sidePad, WORLD_W - sidePad);
}

function spawnMovingTrackAtY(state, y, mode = "pin") {
  const track = state.movingTrack;
  if (!track) return;
  track.activated = true;
  track.mode = mode;
  track.x = getTrackRespawnXByCursor(state.trackLaneCursor, track.width);
  state.trackLaneCursor += 1;
  track.y = y;

  if (mode === "pin") {
    const pinIsRed = Math.random() < RED_ANCHOR_CHANCE;
    state.tracks.push({ x: track.x, y: track.y, mode, isRed: pinIsRed });
  } else {
    state.tracks.push({ x: track.x, y: track.y, mode, isRed: false });
  }
}

function canSpawnMovingTrackFromGenerator(state) {
  if (!TRACK_ENABLED || !state.movingTrack) return false;
  if (state.anchorSpawnCount < TRACK_UNLOCK_ANCHOR_COUNT) return false;
  const t = state.movingTrack;
  if (!t.activated) return true;
  const virtualCameraY = state.generatedTopY + WORLD_H * 0.6;
  return t.y > virtualCameraY + WORLD_H * 1.2;
}

function shouldSpawnBaseTrackOnNextSlot(state, slotMeters = state.runMeters) {
  if (!canSpawnMovingTrackFromGenerator(state)) return false;
  if (slotMeters < hazardCfg.baseTrackUnlockMeters) return false;
  if (!state.movingTrack.activated) return true;
  const densityT = clamp01((slotMeters - hazardCfg.hazardDensityStartMeters) / Math.max(1, hazardCfg.hazardDensityFullMeters - hazardCfg.hazardDensityStartMeters));
  const dynamicInterval = Math.max(TRACK_SLOT_INTERVAL_MIN, Math.round(lerp(hazardCfg.baseTrackSlotInterval, TRACK_SLOT_INTERVAL_MIN, densityT)));
  const dynamicChance = lerp(hazardCfg.baseTrackSpawnChance, hazardCfg.baseTrackSpawnChanceMax, densityT);
  if (state.baseTrackSlotsSinceSpawn < dynamicInterval) return false;
  return Math.random() < dynamicChance;
}

function shouldSpawnDamageTrackOnNextSlot(state, slotMeters = state.runMeters) {
  if (!canSpawnMovingTrackFromGenerator(state)) return false;
  if (slotMeters < hazardCfg.damageTrackUnlockMeters) return false;
  if (!state.movingTrack.activated) return true;
  const densityT = clamp01((slotMeters - hazardCfg.hazardDensityStartMeters) / Math.max(1, hazardCfg.hazardDensityFullMeters - hazardCfg.hazardDensityStartMeters));
  const dynamicInterval = Math.max(TRACK_SLOT_INTERVAL_MIN, Math.round(lerp(hazardCfg.damageTrackSlotInterval, TRACK_SLOT_INTERVAL_MIN, densityT)));
  const dynamicChance = lerp(hazardCfg.damageTrackSpawnChance, hazardCfg.damageTrackSpawnChanceMax, densityT);
  if (state.damageTrackSlotsSinceSpawn < dynamicInterval) return false;
  return Math.random() < dynamicChance;
}

function canSpawnGearFromGenerator(state, slotMeters = state.runMeters) {
  if (!GEAR_ENABLED) return false;
  if (slotMeters < hazardCfg.gearUnlockMeters) return false;
  if (state.anchorSpawnCount < GEAR_UNLOCK_ANCHOR_COUNT) return false;
  if (state.gearSlotsSinceSpawn < hazardCfg.gearSlotInterval) return false;
  return true;
}

function shouldSpawnGearOnNextSlot(state, slotMeters = state.runMeters) {
  if (!canSpawnGearFromGenerator(state, slotMeters)) return false;
  if (!state.gears.length) return true;
  const densityT = clamp01((slotMeters - hazardCfg.hazardDensityStartMeters) / Math.max(1, hazardCfg.hazardDensityFullMeters - hazardCfg.hazardDensityStartMeters));
  const dynamicInterval = Math.max(GEAR_SLOT_INTERVAL_MIN, Math.round(lerp(hazardCfg.gearSlotInterval, GEAR_SLOT_INTERVAL_MIN, densityT)));
  const dynamicChance = lerp(hazardCfg.gearSpawnChance, hazardCfg.gearSpawnChanceMax, densityT);
  if (state.gearSlotsSinceSpawn < dynamicInterval) return false;
  return Math.random() < dynamicChance;
}

function addGeneratedSlotAbove(state) {
  const spacingRange = getDynamicAnchorSpacingRange(state);
  const spacing = rand(spacingRange.min, spacingRange.max);
  const y = state.generatedTopY - spacing;
  const slotMeters = Math.max(0, -y / PX_PER_METER);

  const spawnBaseTrack = shouldSpawnBaseTrackOnNextSlot(state, slotMeters);
  const spawnDamageTrack = shouldSpawnDamageTrackOnNextSlot(state, slotMeters);
  const spawnGear = shouldSpawnGearOnNextSlot(state, slotMeters);

  const candidates = [];
  if (spawnBaseTrack) candidates.push("baseTrack");
  if (spawnDamageTrack) candidates.push("damageTrack");
  if (spawnGear) candidates.push("gear");
  const selected = candidates.length > 0 ? candidates[randInt(0, candidates.length - 1)] : "anchor";

  if (selected === "baseTrack") {
    spawnMovingTrackAtY(state, y, "pin");
    state.generatedTopY = y;
    state.baseTrackSlotsSinceSpawn = 0;
    state.damageTrackSlotsSinceSpawn += 1;
    state.gearSlotsSinceSpawn += 1;
    return;
  }

  if (selected === "damageTrack") {
    spawnMovingTrackAtY(state, y, "gear");
    state.generatedTopY = y;
    state.damageTrackSlotsSinceSpawn = 0;
    state.baseTrackSlotsSinceSpawn += 1;
    state.gearSlotsSinceSpawn += 1;
    return;
  }

  if (selected === "gear") {
    spawnGearAtY(state, y);
    state.gearSlotsSinceSpawn = 0;
    state.baseTrackSlotsSinceSpawn += 1;
    state.damageTrackSlotsSinceSpawn += 1;
    return;
  }

  addAnchorAbove(state, y);
  state.baseTrackSlotsSinceSpawn += 1;
  state.damageTrackSlotsSinceSpawn += 1;
  state.gearSlotsSinceSpawn += 1;
}

function generateMap(targetMeters) {
  const state = createGeneratorState();
  state.movingTrack = createMovingTrack();

  state.anchors.push(createAnchor(WORLD_W * 0.5, 0, false, state));
  state.anchorSpawnCount += 1;
  state.generatedTopY = 0;
  state.generatedGearTopY = state.generatedTopY;

  for (let i = 0; i < INITIAL_PREGEN_ANCHORS; i += 1) addAnchorAbove(state);

  const targetPx = targetMeters * PX_PER_METER;
  while (-state.generatedTopY < targetPx) {
    state.runMeters = Math.max(0, -state.generatedTopY / PX_PER_METER);
    addGeneratedSlotAbove(state);
  }

  return {
    targetMeters,
    targetPx,
    anchors: state.anchors.filter((a) => -a.y <= targetPx),
    gears: state.gears.filter((g) => -g.y <= targetPx),
    tracks: state.tracks.filter((t) => -t.y <= targetPx),
  };
}

function getViewportBounds(result) {
  const visibleMeters = getVisibleMeters();
  const maxStart = Math.max(0, result.targetMeters - visibleMeters);
  const start = clamp(Number(viewportInput.value) || 0, 0, maxStart);
  const end = Math.min(result.targetMeters, start + visibleMeters);
  return { start, end, maxStart, visibleMeters };
}

function filterInViewport(result, startMeter, endMeter) {
  const inRange = (y) => {
    const meter = -y / PX_PER_METER;
    return meter >= startMeter && meter <= endMeter;
  };
  return {
    anchors: result.anchors.filter((a) => inRange(a.y)),
    gears: result.gears.filter((g) => inRange(g.y)),
    tracks: result.tracks.filter((t) => inRange(t.y)),
  };
}

function renderStats(result, viewportData, startMeter, endMeter) {
  const redAnchors = result.anchors.filter((a) => a.isRed).length;
  const blueAnchors = result.anchors.length - redAnchors;
  const pinTracks = result.tracks.filter((t) => t.mode === "pin");
  const trackGears = result.tracks.filter((t) => t.mode === "gear");
  const redTrackPins = pinTracks.filter((t) => t.isRed).length;

  const cards = [
    ["总锚点", result.anchors.length],
    ["红锚点", redAnchors],
    ["蓝锚点", blueAnchors],
    ["齿轮", result.gears.length],
    ["轨道-pin", pinTracks.length],
    ["轨道-gear", trackGears.length],
    ["红轨道-pin", redTrackPins],
    ["当前屏锚点", viewportData.anchors.length],
    ["当前屏齿轮", viewportData.gears.length],
    ["当前屏轨道", viewportData.tracks.length],
    ["当前屏范围", `${startMeter.toFixed(1)}-${endMeter.toFixed(1)}m`],
  ];

  statsPanel.innerHTML = cards
    .map(
      ([label, value]) => `
        <div class="stat-card">
          <div class="stat-card__label">${label}</div>
          <div class="stat-card__value">${value}</div>
        </div>
      `,
    )
    .join("");
}

function drawLegend(x, y) {
  const items = [
    ["普通锚点", "#38bdf8"],
    ["红锚点", "#ef4444"],
    ["齿轮", "#94a3b8"],
    ["轨道-pin", "#e2e8f0"],
    ["轨道-gear", "#fbbf24"],
  ];
  const rowH = 22;
  const width = 166;
  const height = items.length * rowH + 14;
  ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
  ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = '11px "JYHPYY", sans-serif';
  ctx.textBaseline = "middle";
  for (let i = 0; i < items.length; i += 1) {
    const [label, color] = items[i];
    const cy = y + 16 + i * rowH;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 14, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(label, x + 26, cy);
  }
}

function renderMap(result, viewportData, startMeter, endMeter, visibleMeters) {
  const { width, height } = resizePreviewCanvas();
  const padX = CANVAS_MARGIN;
  const padY = CANVAS_MARGIN;
  const drawW = width - padX * 2;
  const drawH = height - padY * 2;
  const xScale = drawW / WORLD_W;
  const yScale = drawH / (visibleMeters * PX_PER_METER);

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#0b1326");
  bg.addColorStop(1, "#020617");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const stepM = 1;
  for (let m = Math.floor(startMeter); m <= Math.ceil(endMeter); m += stepM) {
    const py = padY + ((m * PX_PER_METER) - (startMeter * PX_PER_METER)) * yScale;
    const major = m % 5 === 0;
    ctx.strokeStyle = major ? "rgba(148, 163, 184, 0.42)" : "rgba(71, 85, 105, 0.2)";
    ctx.lineWidth = major ? 1.2 : 1;
    ctx.beginPath();
    ctx.moveTo(padX, py);
    ctx.lineTo(width - padX, py);
    ctx.stroke();

    if (major) {
      ctx.fillStyle = "#bfdbfe";
      ctx.font = '11px "JYHPYY", sans-serif';
      ctx.fillText(`${m}m`, 12, py + 4);
    }
  }

  const toX = (x) => padX + x * xScale;
  const toY = (y) => padY + ((-y) - (startMeter * PX_PER_METER)) * yScale;

  for (const t of viewportData.tracks) {
    const x = toX(t.x);
    const y = toY(t.y);
    const w = Math.max(12, 220 * xScale);
    const h = Math.max(5, 14 * yScale);
    ctx.fillStyle = "rgba(100, 116, 139, 0.55)";
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
    ctx.fill();

    if (t.mode === "pin") {
      ctx.fillStyle = t.isRed ? "#ef4444" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, 8 * xScale), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(4, 10 * xScale), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const g of viewportData.gears) {
    const x = toX(g.x);
    const y = toY(g.y);
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(4, g.radius * xScale * 0.32), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const a of viewportData.anchors) {
    const x = toX(a.x);
    const y = toY(a.y);
    ctx.fillStyle = a.isRed ? "#ef4444" : "#38bdf8";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2.5, 7 * xScale), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, padY, drawW, drawH);

  ctx.fillStyle = "rgba(15, 23, 42, 0.62)";
  ctx.fillRect(padX, 6, 160, 20);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = '12px "JYHPYY", sans-serif';
  ctx.fillText(`视口：${startMeter.toFixed(1)}-${endMeter.toFixed(1)}m`, padX + 8, 20);

  drawLegend(width - 182, 16);
}

function syncViewportInput(result) {
  const visibleMeters = getVisibleMeters();
  const maxStart = Math.max(0, result.targetMeters - visibleMeters);
  viewportInput.max = maxStart.toFixed(1);
  viewportInput.min = "0";
  viewportInput.step = "0.1";
  viewportInput.value = String(clamp(Number(viewportInput.value) || 0, 0, maxStart).toFixed(1));
  if (scrollRange) {
    scrollRange.min = "0";
    scrollRange.max = maxStart.toFixed(1);
    scrollRange.step = "0.1";
    scrollRange.value = viewportInput.value;
  }
}

function renderCurrentViewport() {
  if (!latestResult) return;
  const { start, end, visibleMeters } = getViewportBounds(latestResult);
  viewportInput.value = start.toFixed(1);
  if (scrollRange) scrollRange.value = viewportInput.value;
  const viewportData = filterInViewport(latestResult, start, end);
  renderStats(latestResult, viewportData, start, end);
  renderMap(latestResult, viewportData, start, end, visibleMeters);
}

function generateAndRender(resetViewport = true) {
  const meters = clamp(Number(metersInput.value) || 200, 50, 1000);
  metersInput.value = String(meters);
  latestResult = generateMap(meters);
  if (resetViewport) viewportInput.value = "0";
  syncViewportInput(latestResult);
  renderCurrentViewport();
}

generateBtn.addEventListener("click", () => generateAndRender(true));
regenBtn.addEventListener("click", () => generateAndRender(false));

viewportInput.addEventListener("input", renderCurrentViewport);
if (scrollRange) {
  scrollRange.addEventListener("input", () => {
    viewportInput.value = scrollRange.value;
    renderCurrentViewport();
  });
}

visibleMetersInput.addEventListener("input", () => {
  syncViewportInput(latestResult || { targetMeters: clamp(Number(metersInput.value) || 200, 50, 1000) });
  renderCurrentViewport();
});

prevScreenBtn.addEventListener("click", () => {
  if (!latestResult) return;
  const step = getVisibleMeters() * 0.9;
  viewportInput.value = String((Number(viewportInput.value) || 0) - step);
  renderCurrentViewport();
});

nextScreenBtn.addEventListener("click", () => {
  if (!latestResult) return;
  const step = getVisibleMeters() * 0.9;
  viewportInput.value = String((Number(viewportInput.value) || 0) + step);
  renderCurrentViewport();
});

canvas.addEventListener("wheel", (e) => {
  if (!latestResult) return;
  e.preventDefault();
  const delta = (e.deltaY > 0 ? 1 : -1) * Math.max(0.4, getVisibleMeters() * 0.12);
  viewportInput.value = String((Number(viewportInput.value) || 0) + delta);
  renderCurrentViewport();
}, { passive: false });

window.addEventListener("resize", renderCurrentViewport);

generateAndRender();
