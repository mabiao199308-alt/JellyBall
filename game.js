const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameShell = document.getElementById("gameShell");
const resetBtn = document.getElementById("resetBtn");
const meterDisplayEl = document.getElementById("meterDisplay");
const fpsDisplayEl = document.getElementById("fpsDisplay");
const tutorialOverlay = document.getElementById("tutorialOverlay");

const debugPanelBody = document.getElementById("debugPanelBody");
const debugPanel = document.getElementById("debugPanel");
const debugToggleBtn = document.getElementById("debugToggleBtn");
const deathFxDebugPanelBody = document.getElementById("deathFxDebugPanelBody");
const deathFxDebugPanel = document.getElementById("deathFxDebugPanel");
const deathFxDebugToggleBtn = document.getElementById("deathFxDebugToggleBtn");
const deathFxPreviewBtn = document.getElementById("deathFxPreviewBtn");
const deathFxPlaySfxBtn = document.getElementById("deathFxPlaySfxBtn");
const deathFxDefaultBtn = document.getElementById("deathFxDefaultBtn");
const jellyDebugPanelBody = document.getElementById("jellyDebugPanelBody");
const jellyDebugPanel = document.getElementById("jellyDebugPanel");
const jellyDebugToggleBtn = document.getElementById("jellyDebugToggleBtn");
const jellyDefaultBtn = document.getElementById("jellyDefaultBtn");
const jellyCfgStatus = document.getElementById("jellyCfgStatus");
const hazardDebugPanelBody = document.getElementById("hazardDebugPanelBody");
const hazardDebugPanel = document.getElementById("hazardDebugPanel");
const hazardDebugToggleBtn = document.getElementById("hazardDebugToggleBtn");
const hazardSaveBtn = document.getElementById("hazardSaveBtn");
const hazardSaveAsDefaultBtn = document.getElementById("hazardSaveAsDefaultBtn");
const hazardSaveCodeBtn = document.getElementById("hazardSaveCodeBtn");
const hazardDefaultBtn = document.getElementById("hazardDefaultBtn");
const hazardCfgStatus = document.getElementById("hazardCfgStatus");
const toggleAdvancedBtn = document.getElementById("toggleAdvancedBtn");
const saveCfgBtn = document.getElementById("saveCfgBtn");
const saveAsDefaultBtn = document.getElementById("saveAsDefaultBtn");
const copyCfgCodeBtn = document.getElementById("copyCfgCodeBtn");
const defaultCfgBtn = document.getElementById("defaultCfgBtn");
const cfgStatus = document.getElementById("cfgStatus");
const deathFxCfgStatus = document.getElementById("deathFxCfgStatus");
const clearDataBtn = document.getElementById("clearDataBtn");

function isLocalDevHost() {
  const host = (window.location.hostname || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

const IS_LOCAL_DEV_HOST = isLocalDevHost();
if (!IS_LOCAL_DEV_HOST) {
  document.body.classList.add("hide-dev-controls");
}

const CFG_STORAGE_KEY = "swipe_debug_cfg_v2";
const CFG_DEFAULT_OVERRIDE_KEY = "swipe_debug_default_cfg_v1";
const BEST_STORAGE_KEY = "swipe_best_meters_v1";
const JELLY_CFG_STORAGE_KEY = "swipe_jelly_cfg_v1";
const JELLY_LAYER_VISIBILITY_KEY = "swipe_jelly_layer_visibility_v1";
const HAZARD_CFG_STORAGE_KEY = "swipe_hazard_cfg_v1";
const HAZARD_DEFAULT_OVERRIDE_KEY = "swipe_hazard_default_cfg_v1";
const CODE_DEFAULT_SAVE_ENDPOINT = "/__save_code_defaults";
const CODE_DEFAULT_SAVE_ENDPOINT_FALLBACK = "http://127.0.0.1:8130/__save_code_defaults";
const TUTORIAL_SEEN_STORAGE_KEY = "swipe_tutorial_seen_v1";
const ANCHOR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];
const LOOK_DIR_SMOOTH = 12;
const JELLY_DEFORM_DECAY = 3.8;
const JELLY_WOBBLE_DECAY = 3.2;
const JELLY_OSC_BASE = 10;
const JELLY_HANG_IDLE_ENTER_SPEED = 24;
const JELLY_HANG_IDLE_EXIT_SPEED = 42;
const JELLY_HANG_IDLE_ENTER_LEN_EPS = 4;
const JELLY_HANG_IDLE_EXIT_LEN_EPS = 8;
const JELLY_HANG_IDLE_TETHER_ENTER_LEN_EPS = 14;
const JELLY_HANG_IDLE_TETHER_EXIT_LEN_EPS = 24;
const JELLY_HANG_IDLE_SETTLE = 14;
const JELLY_TETHER_DEFORM_DEADZONE_PX = 3;
const JELLY_TETHER_SPEED_DEADZONE = 18;
const JELLY_TETHER_RADIAL_DEADZONE = 12;
const WALL_HIT_SFX_CANDIDATES = ["./Arrive_1.wav", "./Arrive_1.mp3", "./Arrive_1.ogg", "./Arrive_1.m4a"];
const WALL_HIT_SFX_COOLDOWN_SEC = 0.06;
const WALL_HIT_SFX_MIN_IMPACT = 80;
const WALL_HIT_SFX_GAIN = 0.65;
const WALL_HIT_SFX_MUTE_AFTER_DEATH_SEC = 0.28;
const DEATH_POP_SFX_CANDIDATES = ["./dead.mp3"];
const DEATH_POP_GAIN = 0.92;
const TRACK_ENABLED = true;
const TRACK_PIN_SPEED = 90;
const TRACK_EXCLUSIVE_OPENING = false;
const TRACK_TO_ANCHOR_GAP_PX = 24;
const TRACK_UNLOCK_ANCHOR_COUNT = 10;
const TRACK_SLOT_INTERVAL = 4;
const TRACK_SPAWN_CHANCE = 0.75;
const TRACK_SPAWN_CHANCE_MAX = 0.96;
const TRACK_SLOT_INTERVAL_MIN = 3;
const TRACK_ANCHOR_BLOCK_Y = 170;
const TRACK_ANCHOR_BLOCK_X_RATIO = 0.72;
const INITIAL_PREGEN_ANCHORS = 10;
const ANCHOR_DIFFICULTY_START_METERS = 30;
const ANCHOR_DIFFICULTY_FULL_METERS = 160;
const ANCHOR_SPACING_BONUS_MIN = 26;
const ANCHOR_SPACING_BONUS_MAX = 78;
const GEAR_ENABLED = true;
const GEAR_ROT_SPEED = 2.6;
const GEAR_TEETH = 12;
const GEAR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];
const GEAR_SPACING_MIN = 280;
const GEAR_SPACING_MAX = 420;
const GEAR_UNLOCK_ANCHOR_COUNT = 20;
const GEAR_SLOT_INTERVAL = 4;
const GEAR_SPAWN_CHANCE = 0.55;
const GEAR_SPAWN_CHANCE_MAX = 0.85;
const GEAR_SLOT_INTERVAL_MIN = 3;
const GEAR_ANCHOR_BLOCK_Y = 190;
const GEAR_ANCHOR_BLOCK_X_PAD = 74;
const GEAR_SAFE_ANCHOR_MIN_X_GAP = 130;
const GEAR_SAFE_ANCHOR_Y_OFFSET_MIN = 25;
const GEAR_SAFE_ANCHOR_Y_OFFSET_MAX = 70;
const GEAR_SAFE_ANCHOR_TRY_COUNT = 14;
const TRACK_UNLOCK_METERS = 20;
const GEAR_UNLOCK_METERS = 50;
const TRACK_GEAR_UNLOCK_METERS = 100;
const TRACK_GEAR_SPAWN_RATIO = 0.4;
const HAZARD_DENSITY_START_METERS = 80;
const HAZARD_DENSITY_FULL_METERS = 260;
const defaultHazardCfg = {
  trackUnlockMeters: 12,
  gearUnlockMeters: 34,
  trackGearUnlockMeters: 61,
  trackGearSpawnRatio: 0.4,
  trackSlotInterval: 4,
  trackSpawnChance: 0.75,
  trackSpawnChanceMax: 0.96,
  gearSlotInterval: 4,
  gearSpawnChance: 0.55,
  gearSpawnChanceMax: 0.85,
  hazardDensityStartMeters: 80,
  hazardDensityFullMeters: 260,
};
const RED_ANCHOR_BLINK_DELAY = 0.5;
const RED_ANCHOR_VANISH_DELAY = 3;
const RED_ANCHOR_RESPAWN_DELAY = 2;
const RED_ANCHOR_CHANCE = 1 / 3;
const RED_ANCHOR_BLINK_PERIOD_START = 0.5;
const RED_ANCHOR_BLINK_PERIOD_END = 0.2;
const RED_ANCHOR_BLINK_ACCEL_START = 0.36;
const RED_ANCHOR_SPAWN_ANIM_DURATION = 0.22;
const RED_ALARM_BEEP_DURATION = 0.055;
const RED_ALARM_GAIN = 0.032;
const BG_CLOUD_BAND_HEIGHT = 340;
const BG_CLOUD_BAND_PADDING = 8;
const BG_CLOUD_PARALLAX_MIN = 0.16;
const BG_CLOUD_PARALLAX_MAX = 0.34;
const BG_HAZE_PARTICLE_DENSITY = 1 / 17000;
const BG_HAZE_PARTICLE_MIN = 20;
const BG_HAZE_PARTICLE_MAX = 44;
const BG_METER_MARK_INTERVAL = 50;
const BEST_MARKER_MIN_METERS = 0.1;
const BEST_FIREWORK_DURATION = 1.6;
const BEST_FIREWORK_EMIT_INTERVAL = 0.045;

const defaultCfg = {
  gravity: 2060,
  airDrag: 0.996,
  restitution: 0.62,
  wallFriction: 0.985,
  ballRadius: 24,
  maxStretch: 115,
  tetherMaxLength: 74,
  restLength: 55,
  tetherRestLength: 10,
  hookRadialDamping: 0.55,
  hookSnapStrength: 0,
  hookTangentialBoost: 1.18,
  launchPower: 14,
  launchCurveExp: 1.2,
  maxLaunchSpeed: 1960,
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
  aimJellyCurve: 0.29,
  aimJellyMaxDeform: 1,
  aimJellyFullStart: 0.72,
  aimJellyNearFullBoost: 0.6,
  aimJellyHoldWobble: 0.26,
  tetherJellyDeformBoost: 1,
};

const jellyParamDefs = [
  { key: "aimJellyCurve", label: "蓄力形变曲线(越小越明显)", min: 0.25, max: 1.2, step: 0.01 },
  { key: "aimJellyMaxDeform", label: "蓄力最大形变", min: 0.3, max: 1, step: 0.01 },
  { key: "aimJellyFullStart", label: "拉满判定起点", min: 0.45, max: 0.95, step: 0.01 },
  { key: "aimJellyNearFullBoost", label: "拉满额外形变", min: 0, max: 0.6, step: 0.01 },
  { key: "aimJellyHoldWobble", label: "拉满按住晃动", min: 0, max: 0.6, step: 0.01 },
  { key: "tetherJellyDeformBoost", label: "挂绳持续形变倍率", min: 0.2, max: 4, step: 0.01 },
];

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

const deathFxParamDefs = [
  { key: "fxDuration", label: "特效时长", min: 0.08, max: 1.8, step: 0.01 },
  { key: "spreadAngle", label: "喷射角度", min: 0.1, max: 1.75, step: 0.01 },
  { key: "bigBurstCount", label: "大颗粒数量", min: 0, max: 16, step: 1 },
  { key: "smallBurstCount", label: "小颗粒数量", min: 0, max: 40, step: 1 },
  { key: "sideSplatCount", label: "侧向污渍数量", min: 0, max: 10, step: 1 },
];
const deathFxIntegerKeys = new Set(["bigBurstCount", "smallBurstCount", "sideSplatCount"]);

const hazardParamDefs = [
  { key: "trackUnlockMeters", label: "轨道解锁米数", min: 0, max: 220, step: 1 },
  { key: "gearUnlockMeters", label: "齿轮解锁米数", min: 0, max: 260, step: 1 },
  { key: "trackGearUnlockMeters", label: "轨道齿轮解锁", min: 0, max: 320, step: 1 },
  { key: "trackGearSpawnRatio", label: "轨道齿轮占比", min: 0, max: 1, step: 0.01 },
  { key: "trackSlotInterval", label: "轨道槽位间隔", min: 1, max: 10, step: 1 },
  { key: "trackSpawnChance", label: "轨道基础概率", min: 0.05, max: 1, step: 0.01 },
  { key: "trackSpawnChanceMax", label: "轨道最高概率", min: 0.05, max: 1, step: 0.01 },
  { key: "gearSlotInterval", label: "齿轮槽位间隔", min: 1, max: 10, step: 1 },
  { key: "gearSpawnChance", label: "齿轮基础概率", min: 0.05, max: 1, step: 0.01 },
  { key: "gearSpawnChanceMax", label: "齿轮最高概率", min: 0.05, max: 1, step: 0.01 },
  { key: "hazardDensityStartMeters", label: "增密起始米数", min: 0, max: 320, step: 1 },
  { key: "hazardDensityFullMeters", label: "增密满值米数", min: 10, max: 500, step: 1 },
];
const hazardIntegerKeys = new Set([
  "trackUnlockMeters",
  "gearUnlockMeters",
  "trackGearUnlockMeters",
  "trackSlotInterval",
  "gearSlotInterval",
  "hazardDensityStartMeters",
  "hazardDensityFullMeters",
]);

applyCfgDefaultOverrideFromStorage();
applyHazardDefaultOverrideFromStorage();

const cfg = loadCfgFromStorage();
const ballVisualCfg = { ...window.BallVisual.defaultBallVisualCfg };
const jellyLayerVisibility = { ...(window.BallVisual.defaultLayerVisibility || {}) };
const deathFxCfg = { ...window.DeathFx.defaultDeathFxCfg };
const hazardCfg = { ...defaultHazardCfg };
const uiRefs = {};
const deathFxUiRefs = {};
const jellyUiRefs = {};
const hazardUiRefs = {};
let showAdvancedParams = false;
let debugPanelVisible = false;
let deathFxPanelVisible = false;
let jellyPanelVisible = false;
let hazardPanelVisible = false;
let audioCtx = null;
let redAlarmMasterGain = null;
let wallHitMasterGain = null;
let wallHitAudioBuffer = null;
let wallHitAudioLoadStarted = false;
let wallHitLastPlaySec = -999;
let wallHitMuteUntilSec = -999;
let deathPopMasterGain = null;
let deathPopAudioBuffer = null;
let deathPopAudioLoadStarted = false;
let deathPopLastPlaySec = -999;

normalizeDeathFxCfg();
loadHazardCfgFromStorage();
normalizeHazardCfg();

function createEmptyDeathFx() {
  return {
    active: false,
    previewOnly: false,
    timer: 0,
    originX: 0,
    originY: 0,
    floorY: 0,
    burstParticles: [],
    splats: [],
  };
}

function createEmptyBestFireworks() {
  return {
    active: false,
    timer: 0,
    emitTimer: 0,
    particles: [],
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
  anchorSpawnCount: 0,
  redAnchorRespawns: [],
  gears: [],
  gearLaneCursor: 0,
  generatedGearTopY: 0,
  gearSlotsSinceSpawn: 0,
  pendingSafeAnchorSide: 0,
  movingTrack: null,
  trackLaneCursor: 0,
  trackSlotsSinceSpawn: 0,

  cameraY: 0,
  cameraX: 0,
  cameraDownMaxY: 0,
  launchDeathBottomY: 0,
  startY: 0,
  minY: 0,
  runMeters: 0,
  bestMeters: loadBestMeters(),
  runStartBestMeters: loadBestMeters(),
  bestCelebratePlayed: false,

  ball: { x: 0, y: 0, vx: 0, vy: 0 },
  lookDir: { x: 0, y: 0 },
  jellyDeform: 0,
  jellyWobble: 0,
  jellyHangIdleBlend: 0,
  jellyHangIdleLocked: false,
  jellyPhase: 0,
  timeSec: 0,
  state: "aiming", // aiming | launched | tethered | dying | gameover
  dragging: false,
  pointerId: null,
  pointer: { x: 0, y: 0 },
  lastTime: 0,
  fps: 0,
  breakFlash: 0,
  hookFlash: 0,
  hookCooldown: 0,
  redAlarmFlashOn: false,
  lastTetherSnapSec: -999,
  lastHookSec: -999,
  tetheredSinceSec: -999,
  launchGraceTimer: 0,
  hasHookedSinceLaunch: false,
  deathFx: createEmptyDeathFx(),
  bestFireworks: createEmptyBestFireworks(),
  background: createBackgroundState(),
};

function createBackgroundState() {
  return {
    seed: rand(0, Math.PI * 2),
    cloudBands: new Map(),
    hazeParticles: [],
  };
}

function createCloudBand(bandIndex) {
  const bandTop = bandIndex * BG_CLOUD_BAND_HEIGHT;
  const clouds = [];
  const cloudCount = randInt(2, 4);
  const widthBase = Math.max(120, world.w * 0.22);
  const widthMax = Math.max(widthBase + 60, world.w * 0.58);

  for (let i = 0; i < cloudCount; i += 1) {
    const width = rand(widthBase, widthMax);
    const height = width * rand(0.2, 0.34);
    clouds.push({
      x: rand(-world.w * 0.25, world.w * 1.25),
      y: bandTop + rand(40, BG_CLOUD_BAND_HEIGHT - 42),
      width,
      height,
      alpha: rand(0.15, 0.34),
      driftAmp: rand(8, 26),
      driftFreq: rand(0.045, 0.1),
      phase: rand(0, Math.PI * 2),
      parallax: rand(BG_CLOUD_PARALLAX_MIN, BG_CLOUD_PARALLAX_MAX),
      tint: rand(0, 1),
    });
  }

  return { bandIndex, clouds };
}

function rebuildBackground() {
  const bg = world.background || createBackgroundState();
  bg.cloudBands.clear();
  bg.hazeParticles.length = 0;

  const particleTarget = clamp(
    Math.round(world.w * world.h * BG_HAZE_PARTICLE_DENSITY),
    BG_HAZE_PARTICLE_MIN,
    BG_HAZE_PARTICLE_MAX,
  );

  for (let i = 0; i < particleTarget; i += 1) {
    bg.hazeParticles.push({
      nx: rand(0, 1),
      ny: rand(0, 1),
      radius: rand(18, 64),
      alpha: rand(0.035, 0.12),
      driftAmp: rand(5, 28),
      driftFreq: rand(0.06, 0.22),
      phase: rand(0, Math.PI * 2),
    });
  }

  world.background = bg;
}

function ensureBackgroundCloudBands() {
  const bg = world.background;
  if (!bg) return;

  const viewTop = world.cameraY - world.h * 0.75;
  const viewBottom = world.cameraY + world.h * 1.35;
  const minBand = Math.floor(viewTop / BG_CLOUD_BAND_HEIGHT);
  const maxBand = Math.floor(viewBottom / BG_CLOUD_BAND_HEIGHT);

  for (let band = minBand; band <= maxBand; band += 1) {
    if (!bg.cloudBands.has(band)) bg.cloudBands.set(band, createCloudBand(band));
  }

  const keepMin = minBand - BG_CLOUD_BAND_PADDING;
  const keepMax = maxBand + BG_CLOUD_BAND_PADDING;
  for (const band of bg.cloudBands.keys()) {
    if (band < keepMin || band > keepMax) bg.cloudBands.delete(band);
  }
}

function drawSoftCloud(cx, cy, width, height, alpha, tint) {
  const left = cx - width * 0.5;
  const right = cx + width * 0.5;
  const tone = Math.round(248 - tint * 16);

  ctx.fillStyle = `rgba(${tone}, ${tone + 3}, 255, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, width * 0.34, height * 0.34, 0, 0, Math.PI * 2);
  ctx.ellipse(left + width * 0.34, cy + height * 0.05, width * 0.22, height * 0.24, 0, 0, Math.PI * 2);
  ctx.ellipse(right - width * 0.28, cy + height * 0.03, width * 0.2, height * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  const rim = ctx.createLinearGradient(cx, cy - height * 0.4, cx, cy + height * 0.45);
  rim.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
  rim.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(cx, cy - height * 0.05, width * 0.36, height * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
}

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

function applyCfgDefaultOverrideFromStorage() {
  try {
    const raw = localStorage.getItem(CFG_DEFAULT_OVERRIDE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    for (const def of paramDefs) {
      const val = Number(parsed[def.key]);
      if (!Number.isFinite(val)) continue;
      defaultCfg[def.key] = clamp(val, def.min, def.max);
    }
  } catch {
    // ignore
  }
}

function applyHazardDefaultOverrideFromStorage() {
  try {
    const raw = localStorage.getItem(HAZARD_DEFAULT_OVERRIDE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    for (const def of hazardParamDefs) {
      const val = Number(parsed[def.key]);
      if (!Number.isFinite(val)) continue;
      let next = clamp(val, def.min, def.max);
      if (hazardIntegerKeys.has(def.key)) next = Math.round(next);
      defaultHazardCfg[def.key] = next;
    }
  } catch {
    // ignore
  }
}

function saveCfgToStorage() {
  const payload = {};
  for (const def of paramDefs) payload[def.key] = cfg[def.key];
  localStorage.setItem(CFG_STORAGE_KEY, JSON.stringify(payload));
}

function loadJellyCfgFromStorage() {
  try {
    const raw = localStorage.getItem(JELLY_CFG_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    for (const def of jellyParamDefs) {
      const val = Number(parsed[def.key]);
      if (Number.isFinite(val)) cfg[def.key] = clamp(val, def.min, def.max);
    }
  } catch {
    // ignore
  }
}

function saveJellyCfgToStorage() {
  const payload = {};
  for (const def of jellyParamDefs) payload[def.key] = cfg[def.key];
  localStorage.setItem(JELLY_CFG_STORAGE_KEY, JSON.stringify(payload));
}

function applyJellyLayerVisibilityFromStorage() {
  try {
    const defaults = window.BallVisual.defaultLayerVisibility || {};
    for (const key of Object.keys(defaults)) jellyLayerVisibility[key] = defaults[key];

    const raw = localStorage.getItem(JELLY_LAYER_VISIBILITY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    for (const key of Object.keys(defaults)) {
      if (typeof parsed[key] === "boolean") jellyLayerVisibility[key] = parsed[key];
    }
  } catch {
    // ignore
  }
}

function normalizeHazardCfg() {
  for (const def of hazardParamDefs) {
    let v = Number(hazardCfg[def.key]);
    if (!Number.isFinite(v)) v = defaultHazardCfg[def.key];
    v = clamp(v, def.min, def.max);
    if (hazardIntegerKeys.has(def.key)) v = Math.round(v);
    hazardCfg[def.key] = v;
  }
  if (hazardCfg.trackSpawnChance > hazardCfg.trackSpawnChanceMax) {
    [hazardCfg.trackSpawnChance, hazardCfg.trackSpawnChanceMax] = [hazardCfg.trackSpawnChanceMax, hazardCfg.trackSpawnChance];
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
    for (const def of hazardParamDefs) {
      const val = Number(parsed[def.key]);
      if (Number.isFinite(val)) hazardCfg[def.key] = val;
    }
    normalizeHazardCfg();
  } catch {
    // ignore
  }
}

function saveHazardCfgToStorage() {
  const payload = {};
  for (const def of hazardParamDefs) payload[def.key] = hazardCfg[def.key];
  localStorage.setItem(HAZARD_CFG_STORAGE_KEY, JSON.stringify(payload));
}

async function saveCodeDefaultsToFile(section, payload) {
  async function postTo(endpoint) {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, values: payload }),
    });
    let data = null;
    try {
      data = await resp.json();
    } catch {
      // ignore json parse errors
    }
    if (!resp.ok || !data || !data.ok) {
      return {
        ok: false,
        message: (data && data.error) || `HTTP ${resp.status}`,
        status: resp.status,
      };
    }
    return { ok: true, message: data.message || "ok", status: resp.status };
  }

  try {
    const primary = await postTo(CODE_DEFAULT_SAVE_ENDPOINT);
    if (primary.ok) return primary;
    // 当前静态服务器没有该接口时，尝试本地 dev_server.py 兜底
    if (primary.status === 404 || primary.status === 405) {
      try {
        const fallback = await postTo(CODE_DEFAULT_SAVE_ENDPOINT_FALLBACK);
        if (fallback.ok) return fallback;
        return {
          ok: false,
          message: `${primary.message}；本地开发服务兜底也失败：${fallback.message}`,
        };
      } catch {
        return {
          ok: false,
          message: "当前页面服务不支持写入接口，请启动 dev_server.py（8130）后重试",
        };
      }
    }
    return { ok: false, message: primary.message };
  } catch {
    try {
      const fallback = await postTo(CODE_DEFAULT_SAVE_ENDPOINT_FALLBACK);
      if (fallback.ok) return fallback;
      return { ok: false, message: fallback.message };
    } catch {
      // ignore
    }
    return {
      ok: false,
      message: "未连接到可写入代码的开发服务器（请用 dev_server.py 启动）",
    };
  }
}

function loadBestMeters() {
  const raw = Number(localStorage.getItem(BEST_STORAGE_KEY));
  return Number.isFinite(raw) ? raw : 0;
}

function saveBestMeters() {
  localStorage.setItem(BEST_STORAGE_KEY, String(world.bestMeters));
}

function loadTutorialSeen() {
  try {
    return localStorage.getItem(TUTORIAL_SEEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let tutorialSeen = loadTutorialSeen();

function markTutorialSeen() {
  if (tutorialSeen) return;
  tutorialSeen = true;
  try {
    localStorage.setItem(TUTORIAL_SEEN_STORAGE_KEY, "1");
  } catch {
    // ignore storage write error
  }
}

function clearAllSavedData() {
  const keys = [
    CFG_STORAGE_KEY,
    CFG_DEFAULT_OVERRIDE_KEY,
    BEST_STORAGE_KEY,
    JELLY_CFG_STORAGE_KEY,
    JELLY_LAYER_VISIBILITY_KEY,
    HAZARD_CFG_STORAGE_KEY,
    HAZARD_DEFAULT_OVERRIDE_KEY,
    TUTORIAL_SEEN_STORAGE_KEY,
  ];
  try {
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    // ignore storage delete error
  }
}

function shouldShowTutorialOverlay() {
  if (tutorialSeen) return false;
  if (!world.activeAnchor) return false;
  if (world.state !== "aiming") return false;
  if (world.dragging) return false;
  return true;
}

function syncTutorialOverlay() {
  if (!tutorialOverlay) return;
  tutorialOverlay.classList.toggle("is-hidden", !shouldShowTutorialOverlay());
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

function setDeathFxStatus(text) {
  if (!deathFxCfgStatus) return;
  deathFxCfgStatus.textContent = text;
}

function setJellyStatus(text) {
  if (!jellyCfgStatus) return;
  jellyCfgStatus.textContent = text;
}

function setHazardStatus(text) {
  if (!hazardCfgStatus) return;
  hazardCfgStatus.textContent = text;
}

function syncDebugPanelVisibility() {
  if (!debugPanel || !debugToggleBtn) return;
  debugPanel.classList.toggle("is-hidden", !debugPanelVisible);
  debugToggleBtn.textContent = debugPanelVisible ? "隐藏调试" : "显示调试";
}

function syncDeathFxPanelVisibility() {
  if (!deathFxDebugPanel || !deathFxDebugToggleBtn) return;
  deathFxDebugPanel.classList.toggle("is-hidden", !deathFxPanelVisible);
  deathFxDebugToggleBtn.textContent = deathFxPanelVisible ? "隐藏死亡特效调试" : "显示死亡特效调试";
}

function syncJellyPanelVisibility() {
  if (!jellyDebugPanel || !jellyDebugToggleBtn) return;
  jellyDebugPanel.classList.toggle("is-hidden", !jellyPanelVisible);
  jellyDebugToggleBtn.textContent = jellyPanelVisible ? "隐藏果冻形变调试" : "显示果冻形变调试";
}

function syncHazardPanelVisibility() {
  if (!hazardDebugPanel || !hazardDebugToggleBtn) return;
  hazardDebugPanel.classList.toggle("is-hidden", !hazardPanelVisible);
  hazardDebugToggleBtn.textContent = hazardPanelVisible ? "隐藏障碍生成调试" : "显示障碍生成调试";
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

function buildDeathFxDebugPanel() {
  if (!deathFxDebugPanelBody) return;
  deathFxDebugPanelBody.innerHTML = "";
  for (const key of Object.keys(deathFxUiRefs)) {
    delete deathFxUiRefs[key];
  }

  for (const def of deathFxParamDefs) {
    const row = document.createElement("label");
    row.className = "debug-row";

    const title = document.createElement("div");
    title.className = "debug-row__title";
    const name = document.createElement("span");
    const value = document.createElement("span");
    name.textContent = def.label;
    value.textContent = formatVal(def, deathFxCfg[def.key]);
    title.appendChild(name);
    title.appendChild(value);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(def.min);
    input.max = String(def.max);
    input.step = String(def.step);
    input.value = String(deathFxCfg[def.key]);
    input.addEventListener("input", () => {
      let v = Number(input.value);
      if (!Number.isFinite(v)) return;
      if (deathFxIntegerKeys.has(def.key)) v = Math.round(v);
      deathFxCfg[def.key] = v;
      normalizeDeathFxCfg();
      const next = deathFxCfg[def.key];
      input.value = String(next);
      value.textContent = formatVal(def, next);
      setDeathFxStatus("死亡特效参数实时生效。");
    });

    row.appendChild(title);
    row.appendChild(input);
    deathFxDebugPanelBody.appendChild(row);
    deathFxUiRefs[def.key] = { def, input, value };
  }
}

function buildJellyDebugPanel() {
  if (!jellyDebugPanelBody) return;
  jellyDebugPanelBody.innerHTML = "";
  for (const key of Object.keys(jellyUiRefs)) {
    delete jellyUiRefs[key];
  }

  for (const def of jellyParamDefs) {
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
      setJellyStatus("果冻参数实时生效，已自动保存。");
      saveJellyCfgToStorage();
    });

    row.appendChild(title);
    row.appendChild(input);
    jellyDebugPanelBody.appendChild(row);
    jellyUiRefs[def.key] = { def, input, value };
  }
}

function buildHazardDebugPanel() {
  if (!hazardDebugPanelBody) return;
  hazardDebugPanelBody.innerHTML = "";
  for (const key of Object.keys(hazardUiRefs)) {
    delete hazardUiRefs[key];
  }

  for (const def of hazardParamDefs) {
    const row = document.createElement("label");
    row.className = "debug-row";

    const title = document.createElement("div");
    title.className = "debug-row__title";
    const name = document.createElement("span");
    const value = document.createElement("span");
    name.textContent = def.label;
    value.textContent = formatVal(def, hazardCfg[def.key]);
    title.appendChild(name);
    title.appendChild(value);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(def.min);
    input.max = String(def.max);
    input.step = String(def.step);
    input.value = String(hazardCfg[def.key]);
    input.addEventListener("input", () => {
      let v = Number(input.value);
      if (!Number.isFinite(v)) return;
      if (hazardIntegerKeys.has(def.key)) v = Math.round(v);
      hazardCfg[def.key] = v;
      normalizeHazardCfg();
      syncHazardPanelFromCfg();
      setHazardStatus("障碍生成参数实时生效，点击保存写入本地。");
    });

    row.appendChild(title);
    row.appendChild(input);
    hazardDebugPanelBody.appendChild(row);
    hazardUiRefs[def.key] = { def, input, value };
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

function syncDeathFxPanelFromCfg() {
  for (const def of deathFxParamDefs) {
    const ref = deathFxUiRefs[def.key];
    if (!ref) continue;
    ref.input.value = String(deathFxCfg[def.key]);
    ref.value.textContent = formatVal(def, deathFxCfg[def.key]);
  }
}

function syncJellyPanelFromCfg() {
  for (const def of jellyParamDefs) {
    const ref = jellyUiRefs[def.key];
    if (!ref) continue;
    ref.input.value = String(cfg[def.key]);
    ref.value.textContent = formatVal(def, cfg[def.key]);
  }
}

function syncHazardPanelFromCfg() {
  for (const def of hazardParamDefs) {
    const ref = hazardUiRefs[def.key];
    if (!ref) continue;
    ref.input.value = String(hazardCfg[def.key]);
    ref.value.textContent = formatVal(def, hazardCfg[def.key]);
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

function mixRgb(a, b, t) {
  const clamped = clamp01(t);
  const r = Math.round(lerp(a[0], b[0], clamped));
  const g = Math.round(lerp(a[1], b[1], clamped));
  const b2 = Math.round(lerp(a[2], b[2], clamped));
  return `rgb(${r}, ${g}, ${b2})`;
}

function normalizeDeathFxCfg() {
  Object.assign(deathFxCfg, window.DeathFx.resolveDeathFxCfg(deathFxCfg));
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

function getAudioCtx() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  redAlarmMasterGain = audioCtx.createGain();
  redAlarmMasterGain.gain.value = RED_ALARM_GAIN;
  redAlarmMasterGain.connect(audioCtx.destination);
  wallHitMasterGain = audioCtx.createGain();
  wallHitMasterGain.gain.value = WALL_HIT_SFX_GAIN;
  wallHitMasterGain.connect(audioCtx.destination);
  deathPopMasterGain = audioCtx.createGain();
  deathPopMasterGain.gain.value = DEATH_POP_GAIN;
  deathPopMasterGain.connect(audioCtx.destination);
  return audioCtx;
}

async function loadWallHitAudioBuffer() {
  const aCtx = getAudioCtx();
  if (!aCtx || wallHitAudioLoadStarted || wallHitAudioBuffer) return;
  wallHitAudioLoadStarted = true;
  for (const src of WALL_HIT_SFX_CANDIDATES) {
    try {
      const res = await fetch(src);
      if (!res.ok) continue;
      const arr = await res.arrayBuffer();
      const decoded = await aCtx.decodeAudioData(arr.slice(0));
      if (decoded) {
        wallHitAudioBuffer = decoded;
        return;
      }
    } catch {
      // try next candidate
    }
  }
}

async function loadDeathPopAudioBuffer() {
  const aCtx = getAudioCtx();
  if (!aCtx || deathPopAudioLoadStarted || deathPopAudioBuffer) return;
  deathPopAudioLoadStarted = true;
  for (const src of DEATH_POP_SFX_CANDIDATES) {
    try {
      const res = await fetch(src);
      if (!res.ok) continue;
      const arr = await res.arrayBuffer();
      const decoded = await aCtx.decodeAudioData(arr.slice(0));
      if (decoded) {
        deathPopAudioBuffer = decoded;
        return;
      }
    } catch {
      // try next candidate
    }
  }
}

function ensureAudioReady() {
  const aCtx = getAudioCtx();
  if (!aCtx) return;
  if (aCtx.state === "suspended") {
    aCtx.resume().catch(() => {
      // ignore resume rejection
    });
  }
  if (!wallHitAudioBuffer && !wallHitAudioLoadStarted) {
    loadWallHitAudioBuffer();
  }
  if (!deathPopAudioBuffer && !deathPopAudioLoadStarted) {
    loadDeathPopAudioBuffer();
  }
}

function playWallHitSfx(impact, options = {}) {
  const force = options.force === true;
  const aCtx = getAudioCtx();
  if (!aCtx || !wallHitMasterGain || aCtx.state !== "running") return false;
  if (world.state === "dying") return false;
  if (world.timeSec < wallHitMuteUntilSec) return false;
  if (!wallHitAudioBuffer) return false;
  if (!force && impact < WALL_HIT_SFX_MIN_IMPACT) return false;
  const minGap = force ? 0.015 : WALL_HIT_SFX_COOLDOWN_SEC;
  if (world.timeSec - wallHitLastPlaySec < minGap) return false;
  wallHitLastPlaySec = world.timeSec;

  const src = aCtx.createBufferSource();
  src.buffer = wallHitAudioBuffer;
  const gain = aCtx.createGain();
  gain.gain.value = clamp(0.25 + (impact - WALL_HIT_SFX_MIN_IMPACT) / 500, 0.25, 1);
  src.connect(gain);
  gain.connect(wallHitMasterGain);
  src.start(aCtx.currentTime + 0.001);
  return true;
}

function playDeathPopShot() {
  const aCtx = getAudioCtx();
  if (!aCtx || !deathPopMasterGain || aCtx.state !== "running") return false;
  if (world.timeSec - deathPopLastPlaySec < 0.08) return false;
  if (!deathPopAudioBuffer) return false;
  deathPopLastPlaySec = world.timeSec;

  const src = aCtx.createBufferSource();
  src.buffer = deathPopAudioBuffer;
  const gain = aCtx.createGain();
  gain.gain.value = 1;
  src.connect(gain);
  gain.connect(deathPopMasterGain);
  src.start(aCtx.currentTime + 0.001);

  return true;
}

function playRedAlarmFlashShot() {
  const aCtx = getAudioCtx();
  if (!aCtx || !redAlarmMasterGain || aCtx.state !== "running") return false;
  const startAt = aCtx.currentTime + 0.005;

  // 每次闪烁仅播放一次短促提示音
  const osc = aCtx.createOscillator();
  const gain = aCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1760, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.62, startAt + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + RED_ALARM_BEEP_DURATION);
  osc.connect(gain);
  gain.connect(redAlarmMasterGain);
  osc.start(startAt);
  osc.stop(startAt + RED_ALARM_BEEP_DURATION + 0.015);

  return true;
}

function isAnchorInBlinkPhase(anchor) {
  if (!anchor || !anchor.isRed || !anchor.fuseStarted) return false;
  const elapsed = world.timeSec - anchor.fuseStartSec;
  return elapsed > RED_ANCHOR_BLINK_DELAY && elapsed < RED_ANCHOR_VANISH_DELAY;
}

function hasBlinkingRedAnchorFlash() {
  for (const a of world.anchors) {
    if (!isAnchorInBlinkPhase(a)) continue;
    if (getAnchorFuseState(a).flash > 0.5) return true;
  }
  const t = world.movingTrack;
  if (t && t.activated && world.timeSec >= t.hiddenUntilSec && isAnchorInBlinkPhase(t.pinAnchor)) {
    if (getAnchorFuseState(t.pinAnchor).flash > 0.5) return true;
  }
  return false;
}

function updateRedAlarm() {
  const flashNow = hasBlinkingRedAnchorFlash();
  if (flashNow && !world.redAlarmFlashOn) {
    playRedAlarmFlashShot();
  }
  world.redAlarmFlashOn = flashNow;
}

function createAnchor(x, y, radius = 8, options = {}) {
  const useFixedId = Number.isInteger(options.id);
  const id = useFixedId ? options.id : world.anchorIdSeed++;
  if (id >= world.anchorIdSeed) world.anchorIdSeed = id + 1;
  const isRed = typeof options.isRed === "boolean" ? options.isRed : Math.random() < RED_ANCHOR_CHANCE;
  return {
    id,
    x,
    y,
    radius,
    isRed,
    fuseStarted: false,
    fuseStartSec: 0,
    spawnAnimStartSec: Number.isFinite(options.spawnAnimStartSec) ? options.spawnAnimStartSec : -999,
  };
}

function triggerRedAnchorSpawnAnim(anchor) {
  if (!anchor || !anchor.isRed) return;
  anchor.spawnAnimStartSec = world.timeSec;
}

function startRedAnchorFuse(anchor) {
  if (!anchor || !anchor.isRed || anchor.fuseStarted) return;
  anchor.fuseStarted = true;
  anchor.fuseStartSec = world.timeSec;
}

function getFixedAnchorXByCursor(cursor) {
  const ratio = ANCHOR_X_RATIOS[cursor % ANCHOR_X_RATIOS.length];
  const pad = cfg.anchorSidePadding;
  return Math.max(pad, Math.min(world.w - pad, world.w * ratio));
}

function getAnchorMaxStepX() {
  return Math.max(110, Math.min(world.w * 0.36, cfg.maxStretch * 1.72));
}

function getDynamicAnchorSpacingRange() {
  const minBase = Math.min(cfg.anchorSpacingMin, cfg.anchorSpacingMax);
  const maxBase = Math.max(cfg.anchorSpacingMin, cfg.anchorSpacingMax);
  const meterSpan = Math.max(1, ANCHOR_DIFFICULTY_FULL_METERS - ANCHOR_DIFFICULTY_START_METERS);
  const t = clamp01((world.runMeters - ANCHOR_DIFFICULTY_START_METERS) / meterSpan);
  const min = minBase + ANCHOR_SPACING_BONUS_MIN * t;
  const max = maxBase + ANCHOR_SPACING_BONUS_MAX * t;
  return { min, max: Math.max(min + 6, max) };
}

function getRandomizedAnchorXByCursor(cursor) {
  const base = getFixedAnchorXByCursor(cursor);
  const jitter = rand(-22, 22);
  const pad = cfg.anchorSidePadding;
  return clamp(base + jitter, pad, world.w - pad);
}

function getRandomizedAnchorXBySide(side) {
  const ratios = side < 0 ? [0.2, 0.35] : [0.65, 0.8];
  const ratio = ratios[randInt(0, ratios.length - 1)];
  const jitter = rand(-18, 18);
  const pad = cfg.anchorSidePadding;
  return clamp(world.w * ratio + jitter, pad, world.w - pad);
}

function isAnchorBlockedByTrack(x, y) {
  if (!TRACK_ENABLED || !world.movingTrack || !world.movingTrack.activated) return false;
  const t = world.movingTrack;
  if (Math.abs(y - t.y) > TRACK_ANCHOR_BLOCK_Y) return false;
  const blockHalfW = t.width * TRACK_ANCHOR_BLOCK_X_RATIO;
  return Math.abs(x - t.x) < blockHalfW;
}

function isAnchorBlockedByGear(x, y) {
  if (!GEAR_ENABLED || !world.gears.length) return false;
  for (const g of world.gears) {
    if (Math.abs(y - g.y) > GEAR_ANCHOR_BLOCK_Y) continue;
    const blockHalfW = g.radius + GEAR_ANCHOR_BLOCK_X_PAD;
    if (Math.abs(x - g.x) < blockHalfW) return true;
  }
  return false;
}

function isAnchorPlacementValid(prev, x, y, forcedSide = 0) {
  if (isAnchorBlockedByTrack(x, y) || isAnchorBlockedByGear(x, y)) return false;
  if (!prev) return true;
  const dx = Math.abs(x - prev.x);
  const maxStep = getAnchorMaxStepX();
  const minGap = forcedSide !== 0 ? GEAR_SAFE_ANCHOR_MIN_X_GAP : 60;
  return dx >= minGap && dx <= maxStep;
}

function commitAnchor(x, y) {
  world.anchors.push(createAnchor(x, y));
  world.anchorSpawnCount += 1;
  world.generatedTopY = y;
}

function tryAddAnchorAtY(y, forcedSide = 0, tryCount = ANCHOR_X_RATIOS.length + 4) {
  const prev = world.anchors[world.anchors.length - 1] || null;
  for (let i = 0; i < tryCount; i += 1) {
    const x = forcedSide === 0 ? getRandomizedAnchorXByCursor(world.anchorLaneCursor) : getRandomizedAnchorXBySide(forcedSide);
    world.anchorLaneCursor += 1;
    if (!isAnchorPlacementValid(prev, x, y, forcedSide)) continue;
    commitAnchor(x, y);
    return true;
  }

  if (forcedSide !== 0 && prev) {
    const fallbackRatios = forcedSide < 0 ? [0.35, 0.2, 0.5] : [0.65, 0.8, 0.5];
    const yOffsets = [0, -10, 10, -18, 18, -26, 26];
    const pad = cfg.anchorSidePadding;
    for (const ratio of fallbackRatios) {
      const x = clamp(world.w * ratio, pad, world.w - pad);
      for (const dy of yOffsets) {
        const candidateY = y + dy;
        if (!isAnchorPlacementValid(prev, x, candidateY, forcedSide)) continue;
        commitAnchor(x, candidateY);
        return true;
      }
    }

    const dir = forcedSide < 0 ? -1 : 1;
    const sidePad = cfg.anchorSidePadding;
    const maxStep = getAnchorMaxStepX();
    const relaxedMinGap = 76;
    const nearX = clamp(prev.x + dir * relaxedMinGap, sidePad, world.w - sidePad);
    const farX = clamp(prev.x + dir * maxStep * 0.92, sidePad, world.w - sidePad);
    const start = dir < 0 ? farX : nearX;
    const end = dir < 0 ? nearX : farX;
    const scanYOffsets = [0, -8, 8, -16, 16, -24, 24];
    for (const dy of scanYOffsets) {
      const candidateY = y + dy;
      for (let i = 0; i <= 24; i += 1) {
        const t = i / 24;
        const x = lerp(start, end, t);
        if (isAnchorBlockedByTrack(x, candidateY) || isAnchorBlockedByGear(x, candidateY)) continue;
        const dx = Math.abs(x - prev.x);
        if (dx < relaxedMinGap || dx > maxStep) continue;
        commitAnchor(x, candidateY);
        return true;
      }
    }
  }

  return false;
}

function addAnchorAbove(yOverride = null, forcedSide = 0) {
  const spacingRange = getDynamicAnchorSpacingRange();
  const spacing = rand(spacingRange.min, spacingRange.max);
  const y = Number.isFinite(yOverride) ? yOverride : world.generatedTopY - spacing;
  const ok = tryAddAnchorAtY(y, forcedSide);
  if (ok) return;

  const fallbackX = forcedSide === 0 ? getFixedAnchorXByCursor(world.anchorLaneCursor) : getRandomizedAnchorXBySide(forcedSide);
  world.anchorLaneCursor += 1;
  const prev = world.anchors[world.anchors.length - 1] || null;
  if (forcedSide !== 0 && prev && !isAnchorPlacementValid(prev, fallbackX, y, forcedSide)) {
    const relaxedOk = tryAddAnchorAtY(y, forcedSide, GEAR_SAFE_ANCHOR_TRY_COUNT);
    if (relaxedOk) return;
  }
  commitAnchor(fallbackX, y);
}

function canSpawnTrackFromGenerator() {
  if (!TRACK_ENABLED || !world.movingTrack) return false;
  if (world.runMeters < hazardCfg.trackUnlockMeters) return false;
  if (world.anchorSpawnCount < TRACK_UNLOCK_ANCHOR_COUNT) return false;
  const t = world.movingTrack;
  if (!t.activated) return true;
  return t.y > world.cameraY + world.h * 1.2 && (t.mode !== "pin" || world.activeAnchor !== t.pinAnchor);
}

function shouldSpawnTrackOnNextSlot() {
  if (!canSpawnTrackFromGenerator()) return false;
  if (!world.movingTrack.activated) return true;
  const densityT = clamp01((world.runMeters - hazardCfg.hazardDensityStartMeters) / Math.max(1, hazardCfg.hazardDensityFullMeters - hazardCfg.hazardDensityStartMeters));
  const dynamicInterval = Math.max(TRACK_SLOT_INTERVAL_MIN, Math.round(lerp(hazardCfg.trackSlotInterval, TRACK_SLOT_INTERVAL_MIN, densityT)));
  const dynamicChance = lerp(hazardCfg.trackSpawnChance, hazardCfg.trackSpawnChanceMax, densityT);
  if (world.trackSlotsSinceSpawn < dynamicInterval) return false;
  return Math.random() < dynamicChance;
}

function canSpawnGearFromGenerator() {
  if (!GEAR_ENABLED) return false;
  if (world.runMeters < hazardCfg.gearUnlockMeters) return false;
  if (world.anchorSpawnCount < GEAR_UNLOCK_ANCHOR_COUNT) return false;
  if (world.gearSlotsSinceSpawn < hazardCfg.gearSlotInterval) return false;
  return true;
}

function shouldSpawnGearOnNextSlot() {
  if (!canSpawnGearFromGenerator()) return false;
  if (!world.gears.length) return true;
  const densityT = clamp01((world.runMeters - hazardCfg.hazardDensityStartMeters) / Math.max(1, hazardCfg.hazardDensityFullMeters - hazardCfg.hazardDensityStartMeters));
  const dynamicInterval = Math.max(GEAR_SLOT_INTERVAL_MIN, Math.round(lerp(hazardCfg.gearSlotInterval, GEAR_SLOT_INTERVAL_MIN, densityT)));
  const dynamicChance = lerp(hazardCfg.gearSpawnChance, hazardCfg.gearSpawnChanceMax, densityT);
  if (world.gearSlotsSinceSpawn < dynamicInterval) return false;
  return Math.random() < dynamicChance;
}

function createInitialAnchors() {
  world.anchors = [];
  world.anchorIdSeed = 1;
  world.anchorSpawnCount = 0;
  world.anchorLaneCursor = randInt(0, ANCHOR_X_RATIOS.length - 1);

  if (TRACK_ENABLED && TRACK_EXCLUSIVE_OPENING && world.movingTrack && world.movingTrack.pinAnchor) {
    const trackAnchor = world.movingTrack.pinAnchor;
    world.activeAnchor = trackAnchor;
    world.generatedTopY = trackAnchor.y - TRACK_TO_ANCHOR_GAP_PX;
    for (let i = 0; i < INITIAL_PREGEN_ANCHORS; i += 1) addAnchorAbove();
    return;
  }

  const base = createAnchor(world.w * 0.5, world.h * 0.75, 9, { isRed: false });
  world.anchors.push(base);
  world.anchorSpawnCount += 1;
  world.activeAnchor = base;
  world.generatedTopY = base.y;

  for (let i = 0; i < INITIAL_PREGEN_ANCHORS; i += 1) addAnchorAbove();
}

function createGearHazard(x, y) {
  const radius = Math.max(34, Math.min(54, world.w * 0.105));
  return {
    x,
    y,
    radius,
    innerRadius: radius * 0.42,
    toothDepth: Math.max(8, radius * 0.24),
    angle: rand(0, Math.PI * 2),
    spinDir: Math.random() < 0.5 ? -1 : 1,
  };
}

function spawnGearAtY(y) {
  if (!GEAR_ENABLED) return false;
  const side = Math.random() < 0.5 ? -1 : 1;
  const pad = cfg.anchorSidePadding + 22;
  const leftX = clamp(world.w * rand(0.2, 0.36), pad, world.w - pad);
  const rightX = clamp(world.w * rand(0.64, 0.8), pad, world.w - pad);
  const x = side < 0 ? leftX : rightX;
  world.gears.push(createGearHazard(x, y));
  const safeSide = side < 0 ? 1 : -1;
  const safeYOffset = rand(GEAR_SAFE_ANCHOR_Y_OFFSET_MIN, GEAR_SAFE_ANCHOR_Y_OFFSET_MAX);
  const safeY = y - safeYOffset;
  if (!tryAddAnchorAtY(safeY, safeSide, GEAR_SAFE_ANCHOR_TRY_COUNT)) {
    addAnchorAbove(safeY, safeSide);
  }
  return true;
}

function getFixedGearXByCursor(cursor) {
  const ratio = GEAR_X_RATIOS[cursor % GEAR_X_RATIOS.length];
  const pad = cfg.anchorSidePadding + 18;
  return Math.max(pad, Math.min(world.w - pad, world.w * ratio));
}

function addGearAbove() {
  const spacing = rand(GEAR_SPACING_MIN, GEAR_SPACING_MAX);
  const y = world.generatedGearTopY - spacing;
  let x = getFixedGearXByCursor(world.gearLaneCursor);
  world.gearLaneCursor += 1;
  const prev = world.gears[world.gears.length - 1];
  if (prev) {
    let guard = 0;
    while (Math.abs(x - prev.x) < 88 && guard < GEAR_X_RATIOS.length) {
      x = getFixedGearXByCursor(world.gearLaneCursor);
      world.gearLaneCursor += 1;
      guard += 1;
    }
  }

  world.gears.push(createGearHazard(x, y));
  world.generatedGearTopY = y;
}

function createInitialGears() {
  world.gears = [];
  world.gearLaneCursor = randInt(0, GEAR_X_RATIOS.length - 1);
  world.generatedGearTopY = world.generatedTopY;
  world.gearSlotsSinceSpawn = 0;
  world.pendingSafeAnchorSide = 0;
}

function createMovingTrack() {
  const width = Math.max(220, Math.min(320, world.w * 0.62));
  const height = Math.max(26, Math.min(38, world.h * 0.045));
  const yOffset = Math.max(190, Math.min(280, world.h * 0.3));
  const travelHalf = Math.max(40, width * 0.5 - 28);
  const pinX = world.w * 0.5;
  const pinRadius = Math.max(10, Math.min(14, height * 0.44));
  const gearRadius = Math.max(20, Math.min(30, height * 0.95));
  return {
    x: world.w * 0.5,
    y: world.h * 0.75 - yOffset,
    width,
    height,
    travelHalf,
    mode: "pin", // pin | gear
    pinOffset: 0,
    pinDir: Math.random() < 0.5 ? -1 : 1,
    pinSpeed: TRACK_PIN_SPEED,
    pinRadius,
    hiddenUntilSec: 0,
    wasPinVisible: true,
    activated: false,
    pinAnchor: createAnchor(pinX, world.h * 0.75 - yOffset, pinRadius, {
      isRed: Math.random() < RED_ANCHOR_CHANCE,
    }),
    trackGear: {
      x: pinX,
      y: world.h * 0.75 - yOffset,
      radius: gearRadius,
      innerRadius: gearRadius * 0.42,
      toothDepth: Math.max(6, gearRadius * 0.24),
      angle: rand(0, Math.PI * 2),
      spinDir: Math.random() < 0.5 ? -1 : 1,
    },
  };
}

function chooseMovingTrackMode() {
  if (world.runMeters < hazardCfg.trackGearUnlockMeters) return "pin";
  return Math.random() < hazardCfg.trackGearSpawnRatio ? "gear" : "pin";
}

function getTrackRespawnXByCursor(cursor, width) {
  const ratio = ANCHOR_X_RATIOS[cursor % ANCHOR_X_RATIOS.length];
  const sidePad = Math.max(cfg.anchorSidePadding + 12, width * 0.5 + 14);
  return clamp(world.w * ratio, sidePad, world.w - sidePad);
}

function spawnMovingTrackAtY(track, y, mode = "pin") {
  if (!track) return;
  track.activated = true;
  track.mode = mode;
  track.x = getTrackRespawnXByCursor(world.trackLaneCursor, track.width);
  world.trackLaneCursor += 1;
  track.y = y;
  track.pinOffset = 0;
  track.pinDir = Math.random() < 0.5 ? -1 : 1;

  const pinX = track.x;
  if (track.pinAnchor) {
    track.pinAnchor.x = pinX;
    track.pinAnchor.y = track.y;
    track.pinAnchor.radius = track.pinRadius;
    track.pinAnchor.fuseStarted = false;
    track.pinAnchor.fuseStartSec = 0;
    track.pinAnchor.spawnAnimStartSec = -999;
  }

  if (mode === "pin") {
    if (track.pinAnchor) {
      track.pinAnchor.isRed = Math.random() < RED_ANCHOR_CHANCE;
      if (track.pinAnchor.isRed) triggerRedAnchorSpawnAnim(track.pinAnchor);
    }
    track.hiddenUntilSec = world.timeSec;
    track.wasPinVisible = true;
  } else {
    track.hiddenUntilSec = Number.POSITIVE_INFINITY;
    track.wasPinVisible = false;
  }

  if (track.trackGear) {
    track.trackGear.x = pinX;
    track.trackGear.y = track.y;
    track.trackGear.angle = rand(0, Math.PI * 2);
    track.trackGear.spinDir = Math.random() < 0.5 ? -1 : 1;
  }
}

function addGeneratedSlotAbove() {
  const spacingRange = getDynamicAnchorSpacingRange();
  const spacing = rand(spacingRange.min, spacingRange.max);
  const y = world.generatedTopY - spacing;

  const spawnTrack = shouldSpawnTrackOnNextSlot();
  const spawnGear = !spawnTrack && shouldSpawnGearOnNextSlot();

  if (spawnTrack) {
    spawnMovingTrackAtY(world.movingTrack, y, chooseMovingTrackMode());
    world.generatedTopY = y;
    world.trackSlotsSinceSpawn = 0;
    world.gearSlotsSinceSpawn += 1;
    return;
  }

  if (spawnGear) {
    spawnGearAtY(y);
    world.gearSlotsSinceSpawn = 0;
    world.trackSlotsSinceSpawn += 1;
    return;
  }

  addAnchorAbove(y);
  world.trackSlotsSinceSpawn += 1;
  world.gearSlotsSinceSpawn += 1;
}

function resetRun() {
  world.movingTrack = createMovingTrack();
  world.trackLaneCursor = randInt(0, ANCHOR_X_RATIOS.length - 1);
  world.trackSlotsSinceSpawn = 0;
  world.gearSlotsSinceSpawn = 0;
  world.pendingSafeAnchorSide = 0;
  createInitialAnchors();
  createInitialGears();
  world.lastReleasedAnchor = null;
  world.ball.x = world.activeAnchor.x;
  world.ball.y = world.activeAnchor.y + cfg.restLength;
  world.cameraX = 0;
  world.cameraY = world.ball.y - world.h * cfg.cameraTargetRatio;
  world.cameraDownMaxY = world.cameraY + world.h * cfg.cameraDownLimitRatio;
  world.launchDeathBottomY = world.cameraY + world.h;
  world.ball.vx = 0;
  world.ball.vy = 0;
  world.lookDir.x = 0;
  world.lookDir.y = 0;
  world.jellyDeform = 0;
  world.jellyWobble = 0;
  world.jellyHangIdleBlend = 0;
  world.jellyHangIdleLocked = false;
  world.jellyPhase = 0;
  world.timeSec = 0;
  world.redAnchorRespawns = [];
  world.state = "aiming";
  world.dragging = false;
  world.pointerId = null;
  world.breakFlash = 0;
  world.hookFlash = 0;
  world.hookCooldown = 0;
  world.redAlarmFlashOn = false;
  world.lastTetherSnapSec = -999;
  world.lastHookSec = -999;
  world.tetheredSinceSec = -999;
  world.launchGraceTimer = 0;
  world.hasHookedSinceLaunch = false;
  world.deathFx = createEmptyDeathFx();
  world.bestFireworks = createEmptyBestFireworks();
  wallHitLastPlaySec = -999;
  wallHitMuteUntilSec = -999;
  deathPopLastPlaySec = -999;
  world.startY = world.ball.y;
  world.minY = world.ball.y;
  world.runMeters = 0;
  world.runStartBestMeters = world.bestMeters;
  world.bestCelebratePlayed = false;
  updateMeterHud();
  syncTutorialOverlay();
}

function kickJelly(amount, wobbleBoost = amount * 1.1) {
  const nextDeform = Math.max(0, Math.min(1, amount));
  const nextWobble = Math.max(0, Math.min(1, wobbleBoost));
  if (nextDeform > world.jellyDeform) world.jellyDeform = nextDeform;
  if (nextWobble > world.jellyWobble) world.jellyWobble = nextWobble;
  world.jellyPhase += Math.PI * 0.85;
}

function updateJellyState(dt) {
  const deformDamp = Math.exp(-JELLY_DEFORM_DECAY * dt);
  const wobbleDamp = Math.exp(-JELLY_WOBBLE_DECAY * dt);
  world.jellyDeform *= deformDamp;
  world.jellyWobble *= wobbleDamp;
  world.jellyPhase += dt * (JELLY_OSC_BASE + world.jellyWobble * 20);

  let canCheckHangingIdle = false;
  let hangingIdleLenError = Infinity;
  let hangingIdleEnterLenEps = JELLY_HANG_IDLE_ENTER_LEN_EPS;
  let hangingIdleExitLenEps = JELLY_HANG_IDLE_EXIT_LEN_EPS;
  let hangingIdleSpeed = Infinity;
  if ((world.state === "aiming" || world.state === "tethered") && !world.dragging && world.activeAnchor) {
    canCheckHangingIdle = true;
    const dx = world.ball.x - world.activeAnchor.x;
    const dy = world.ball.y - world.activeAnchor.y;
    const dist = Math.hypot(dx, dy);
    hangingIdleSpeed = Math.hypot(world.ball.vx, world.ball.vy);
    if (world.state === "tethered") {
      // tethered 的静止平衡长度不是 tetherRestLength，而是受重力拉长后的平衡点
      const springEqOffset = cfg.gravity / Math.max(1, cfg.springK);
      const targetLen = clamp(
        cfg.tetherRestLength + springEqOffset,
        cfg.tetherRestLength,
        cfg.tetherMaxLength,
      );
      hangingIdleLenError = Math.abs(dist - targetLen);
      hangingIdleEnterLenEps = JELLY_HANG_IDLE_TETHER_ENTER_LEN_EPS;
      hangingIdleExitLenEps = JELLY_HANG_IDLE_TETHER_EXIT_LEN_EPS;
    } else {
      hangingIdleLenError = Math.abs(dist - cfg.restLength);
      hangingIdleEnterLenEps = JELLY_HANG_IDLE_ENTER_LEN_EPS;
      hangingIdleExitLenEps = JELLY_HANG_IDLE_EXIT_LEN_EPS;
    }
  }

  if (!canCheckHangingIdle) {
    world.jellyHangIdleLocked = false;
  } else if (world.jellyHangIdleLocked) {
    const shouldExitIdle =
      hangingIdleSpeed > JELLY_HANG_IDLE_EXIT_SPEED || hangingIdleLenError > hangingIdleExitLenEps;
    if (shouldExitIdle) world.jellyHangIdleLocked = false;
  } else {
    const shouldEnterIdle =
      hangingIdleSpeed < JELLY_HANG_IDLE_ENTER_SPEED && hangingIdleLenError < hangingIdleEnterLenEps;
    if (shouldEnterIdle) world.jellyHangIdleLocked = true;
  }

  const isHangingIdle = world.jellyHangIdleLocked;
  const idleBlendTarget = isHangingIdle ? 1 : 0;
  const idleBlendAlpha = 1 - Math.exp(-10 * dt);
  world.jellyHangIdleBlend += (idleBlendTarget - world.jellyHangIdleBlend) * idleBlendAlpha;
  const hangIdleBlend = clamp01(world.jellyHangIdleBlend);
  const activeFactor = 1 - hangIdleBlend;

  if (world.dragging && world.state === "aiming" && world.activeAnchor) {
    const dx = world.ball.x - world.activeAnchor.x;
    const dy = world.ball.y - world.activeAnchor.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const stretchRatio = Math.max(0, Math.min(1, dist / Math.max(1, cfg.maxStretch)));
    const curve = Math.max(0.2, cfg.aimJellyCurve);
    const fullStart = clamp01(cfg.aimJellyFullStart);
    const nearFull = fullStart >= 0.999 ? 0 : clamp01((stretchRatio - fullStart) / (1 - fullStart));
    const aimDeform = Math.min(1, Math.pow(stretchRatio, curve) * cfg.aimJellyMaxDeform + nearFull * cfg.aimJellyNearFullBoost);
    const aimHoldWobble = nearFull * cfg.aimJellyHoldWobble;
    if (aimDeform > world.jellyDeform) world.jellyDeform = aimDeform;
    if (aimHoldWobble > world.jellyWobble) world.jellyWobble = aimHoldWobble;
  }

  if (world.state === "launched") {
    const speedRatio = Math.max(0, Math.min(1, Math.hypot(world.ball.vx, world.ball.vy) / 1400));
    const flightDeform = Math.pow(speedRatio, 0.82) * 0.82;
    const flightWobble = speedRatio * 0.34;
    if (flightDeform > world.jellyDeform) world.jellyDeform = flightDeform;
    if (flightWobble > world.jellyWobble) world.jellyWobble = flightWobble;
  }

  if (world.state === "tethered" && world.activeAnchor) {
    const dx = world.ball.x - world.activeAnchor.x;
    const dy = world.ball.y - world.activeAnchor.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const springEqOffset = cfg.gravity / Math.max(1, cfg.springK);
    const equilibriumLen = clamp(
      cfg.tetherRestLength + springEqOffset,
      cfg.tetherRestLength,
      cfg.tetherMaxLength,
    );
    const lenDelta = Math.abs(dist - equilibriumLen);
    const deformLenDelta = Math.max(0, lenDelta - JELLY_TETHER_DEFORM_DEADZONE_PX);
    const stretchRatio = clamp01(deformLenDelta / Math.max(1, cfg.tetherMaxLength - equilibriumLen));
    const speed = Math.hypot(world.ball.vx, world.ball.vy);
    const speedRatio = clamp01(Math.max(0, speed - JELLY_TETHER_SPEED_DEADZONE) / 900);
    const radialSpeed = Math.abs((world.ball.vx * dx + world.ball.vy * dy) / dist);
    const radialRatio = clamp01(Math.max(0, radialSpeed - JELLY_TETHER_RADIAL_DEADZONE) / 760);
    const tensionRatio = Math.pow(stretchRatio, 0.62);
    // 先算基础形变，再由倍率做“可见增益”，避免滑杆变化不明显
    const holdDeformBase = Math.min(1, tensionRatio * 0.84 + radialRatio * 0.2 + speedRatio * 0.08);
    const holdDeform = Math.min(1, holdDeformBase * (0.3 + cfg.tetherJellyDeformBoost * 0.95) * activeFactor);
    if (holdDeform > world.jellyDeform) world.jellyDeform = holdDeform;
  }

  // 统一“挂在钉子上的静止态”观感：初始静止与挂钩后静止都收敛到同一基线
  if (hangIdleBlend > 0.001) {
    const settleAlpha = (1 - Math.exp(-JELLY_HANG_IDLE_SETTLE * dt)) * hangIdleBlend;
    world.jellyDeform += (0 - world.jellyDeform) * settleAlpha;
    world.jellyWobble += (0 - world.jellyWobble) * settleAlpha;
  }

  if (world.jellyDeform < 0.003) world.jellyDeform = 0;
  if (world.jellyWobble < 0.003) world.jellyWobble = 0;
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
  rebuildBackground();
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
  ensureAudioReady();
  if (world.state === "gameover") {
    resetRun();
    setStatus("已重开本局。");
    return;
  }
  if (world.state === "dying") return;
  if (world.state === "launched") return;
  const p = toWorldPoint(e);
  const d = Math.hypot(p.x - world.ball.x, p.y - world.ball.y);
  if (d <= cfg.ballRadius * 2) {
    world.dragging = true;
    world.state = "aiming";
    world.pointerId = e.pointerId;
    world.pointer = p;
    world.ball.vx = 0;
    world.ball.vy = 0;
    canvas.setPointerCapture(e.pointerId);
    syncTutorialOverlay();
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
  syncTutorialOverlay();
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
  kickJelly(0.55 + stretchRatio * 0.45, 0.5 + stretchRatio * 0.5);
  world.lastReleasedAnchor = world.activeAnchor;
  // 发射后释放当前挂点；这样冷却结束后可重新挂回同一锚点
  world.activeAnchor = null;
  world.state = "launched";
  world.breakFlash = cfg.breakFlashDuration;
  // 向下发射时尽快允许挂到下方新钉子，避免先触底判死
  const downwardLaunchCooldown = 0.06;
  world.hookCooldown = b.vy > 0 ? Math.min(cfg.rehookCooldown, downwardLaunchCooldown) : cfg.rehookCooldown;
  world.launchGraceTimer = cfg.launchGraceSec;
  world.hasHookedSinceLaunch = false;
  markTutorialSeen();
  syncTutorialOverlay();
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
  const hookImpact = Math.max(Math.abs(radialSpeed), Math.abs(tangentialSpeed) * 0.55);
  const hookImpactRatio = Math.max(0, Math.min(1, hookImpact / 1200));
  const hookDeform = 0.38 + hookImpactRatio * 0.62;
  playWallHitSfx(Math.max(hookImpact, WALL_HIT_SFX_MIN_IMPACT + 30), { force: true });
  kickJelly(hookDeform, 0);
  world.lastHookSec = world.timeSec;
  world.tetheredSinceSec = world.timeSec;

  world.activeAnchor = anchor;
  world.state = "tethered";
  world.hookFlash = cfg.breakFlashDuration;
  world.hookCooldown = cfg.rehookCooldown;
  world.hasHookedSinceLaunch = true;
  world.cameraDownMaxY = world.cameraY + world.h * cfg.cameraDownLimitRatio;
  world.launchDeathBottomY = world.cameraY + world.h;
  startRedAnchorFuse(anchor);
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
  if (!a) {
    world.state = "launched";
    world.hasHookedSinceLaunch = false;
    return;
  }
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
    const excessRatio = Math.max(0, Math.min(1, (nd - cfg.tetherMaxLength) / Math.max(1, cfg.tetherMaxLength)));
    const ratio = cfg.tetherMaxLength / nd;
    const rx = nx / nd;
    const ry = ny / nd;
    b.x = a.x + nx * ratio;
    b.y = a.y + ny * ratio;
    const radialSpeed = b.vx * rx + b.vy * ry;
    const snapImpact = Math.max(excessRatio * 0.75, Math.max(0, radialSpeed) / 900);
    if (snapImpact > 0.06 && world.timeSec - world.lastTetherSnapSec > 0.055) {
      const snapDeform = Math.min(0.68, 0.22 + snapImpact * 0.48);
      const snapWobbleBase = Math.min(0.6, 0.2 + snapImpact * 0.4);
      const snapWobble = Math.min(0.85, snapWobbleBase * 0.55);
      kickJelly(snapDeform, snapWobble);
      world.lastTetherSnapSec = world.timeSec;
    }
    if (radialSpeed > 0) {
      b.vx -= radialSpeed * rx;
      b.vy -= radialSpeed * ry;
    }
  }

  collideBounds();
}

function updateAnchorFuse() {
  for (let i = world.redAnchorRespawns.length - 1; i >= 0; i -= 1) {
    const pending = world.redAnchorRespawns[i];
    if (world.timeSec < pending.respawnAtSec) continue;
    const respawned = createAnchor(pending.x, pending.y, pending.radius, {
      id: pending.id,
      isRed: true,
      spawnAnimStartSec: world.timeSec,
    });
    world.anchors.push(respawned);
    world.redAnchorRespawns.splice(i, 1);
  }

  for (let i = world.anchors.length - 1; i >= 0; i -= 1) {
    const a = world.anchors[i];
    if (!a.isRed || !a.fuseStarted) continue;
    const elapsed = world.timeSec - a.fuseStartSec;
    if (elapsed < RED_ANCHOR_VANISH_DELAY) continue;

    world.redAnchorRespawns.push({
      id: a.id,
      x: a.x,
      y: a.y,
      radius: a.radius,
      respawnAtSec: world.timeSec + RED_ANCHOR_RESPAWN_DELAY,
    });

    const isActive = a === world.activeAnchor;
    world.anchors.splice(i, 1);

    if (world.lastReleasedAnchor === a) world.lastReleasedAnchor = null;
    if (!isActive) continue;

    world.lastReleasedAnchor = a;
    world.breakFlash = cfg.breakFlashDuration;
    world.activeAnchor = null;
    world.state = "launched";
    world.hookCooldown = Math.max(world.hookCooldown, cfg.rehookCooldown);
    world.hasHookedSinceLaunch = false;
  }
}

function checkAnchorHook() {
  if (world.hookCooldown > 0 || world.state === "gameover") return;
  if (world.hasHookedSinceLaunch) return;
  const b = world.ball;
  for (const a of world.anchors) {
    if (a === world.activeAnchor) continue;
    // 发射后的保护帧内，不允许立刻吸回刚松开的旧钉子
    if (a === world.lastReleasedAnchor && world.launchGraceTimer > 0) continue;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= cfg.ballRadius + cfg.hookRadius + a.radius) {
      hookToAnchor(a);
      return;
    }
  }
}

function updateGear(dt) {
  if (!GEAR_ENABLED) return;
  for (const g of world.gears) {
    g.angle = (g.angle + GEAR_ROT_SPEED * g.spinDir * dt) % (Math.PI * 2);
  }
}

function updateMovingTrack(dt) {
  if (!TRACK_ENABLED || !world.movingTrack) return;
  const t = world.movingTrack;
  if (!t.activated) return;
  const wasPinVisible = world.timeSec >= t.hiddenUntilSec;

  if (t.mode === "pin" && t.pinAnchor && t.pinAnchor.isRed && t.pinAnchor.fuseStarted) {
    const elapsed = world.timeSec - t.pinAnchor.fuseStartSec;
    if (elapsed >= RED_ANCHOR_VANISH_DELAY) {
      if (world.activeAnchor === t.pinAnchor) {
        world.lastReleasedAnchor = t.pinAnchor;
        world.breakFlash = cfg.breakFlashDuration;
        world.activeAnchor = null;
        world.state = "launched";
        world.hookCooldown = Math.max(world.hookCooldown, cfg.rehookCooldown);
        world.hasHookedSinceLaunch = false;
      }
      t.hiddenUntilSec = world.timeSec + RED_ANCHOR_RESPAWN_DELAY;
      t.pinAnchor.fuseStarted = false;
      t.pinAnchor.fuseStartSec = 0;
    }
  }

  t.pinOffset += t.pinDir * t.pinSpeed * dt;
  if (t.pinOffset > t.travelHalf) {
    t.pinOffset = t.travelHalf;
    t.pinDir = -1;
  } else if (t.pinOffset < -t.travelHalf) {
    t.pinOffset = -t.travelHalf;
    t.pinDir = 1;
  }

  const pinX = t.x + t.pinOffset;
  if (t.mode === "pin" && t.pinAnchor) {
    t.pinAnchor.x = pinX;
    t.pinAnchor.y = t.y;
    t.pinAnchor.radius = t.pinRadius;
  }
  if (t.trackGear) {
    t.trackGear.x = pinX;
    t.trackGear.y = t.y;
    if (t.mode === "gear") {
      t.trackGear.angle = (t.trackGear.angle + GEAR_ROT_SPEED * t.trackGear.spinDir * dt) % (Math.PI * 2);
    }
  }

  const pinVisibleNow = world.timeSec >= t.hiddenUntilSec;
  if (t.mode === "pin" && !wasPinVisible && pinVisibleNow && t.pinAnchor && t.pinAnchor.isRed) {
    triggerRedAnchorSpawnAnim(t.pinAnchor);
  }
  t.wasPinVisible = pinVisibleNow;
}

function checkMovingTrackHit() {
  if (!TRACK_ENABLED || !world.movingTrack) return;
  if (world.state !== "launched" && world.state !== "tethered") return;
  if (world.state === "gameover" || world.state === "dying") return;
  const t = world.movingTrack;
  if (!t.activated) return;
  if (t.mode === "pin") {
    if (world.hookCooldown > 0) return;
    if (world.hasHookedSinceLaunch) return;
    if (world.timeSec < t.hiddenUntilSec) return;
    if (!t.pinAnchor) return;
    if (world.activeAnchor === t.pinAnchor) return;
    const hitRadius = cfg.ballRadius + cfg.hookRadius + t.pinAnchor.radius;
    const d = Math.hypot(world.ball.x - t.pinAnchor.x, world.ball.y - t.pinAnchor.y);
    if (d <= hitRadius) {
      hookToAnchor(t.pinAnchor);
    }
    return;
  }

  if (t.mode === "gear" && t.trackGear) {
    const g = t.trackGear;
    const hitRadius = g.radius + cfg.ballRadius - g.toothDepth * 0.35;
    const d = Math.hypot(world.ball.x - g.x, world.ball.y - g.y);
    if (d <= hitRadius) {
      startDeathFx(toScreenX(world.ball.x), toScreenY(world.ball.y));
    }
  }
}

function checkGearHit() {
  if (!GEAR_ENABLED) return;
  if (!world.gears.length) return;
  if (world.state === "gameover" || world.state === "dying") return;
  for (const g of world.gears) {
    const hitRadius = g.radius + cfg.ballRadius - g.toothDepth * 0.35;
    const d = Math.hypot(world.ball.x - g.x, world.ball.y - g.y);
    if (d <= hitRadius) {
      startDeathFx(toScreenX(world.ball.x), toScreenY(world.ball.y));
      return;
    }
  }
}

function ensureAnchorsCoverage() {
  const targetTop = world.cameraY - world.h * 2.4;
  while (world.generatedTopY > targetTop) addGeneratedSlotAbove();

  const pruneBottom = world.cameraY + world.h * 2.2;
  world.anchors = world.anchors.filter(
    (a) => a === world.activeAnchor || a === world.lastReleasedAnchor || a.y < pruneBottom,
  );

  const gearPruneBottom = world.cameraY + world.h * 1.8;
  world.gears = world.gears.filter((g) => g.y < gearPruneBottom);
}

function updateMeters() {
  world.minY = Math.min(world.minY, world.ball.y);
  const risePx = Math.max(0, world.startY - world.minY);
  world.runMeters = risePx / cfg.pxPerMeter;

  if (!world.bestCelebratePlayed
      && world.runStartBestMeters > BEST_MARKER_MIN_METERS
      && world.runMeters > world.runStartBestMeters) {
    world.bestCelebratePlayed = true;
    triggerBestFireworks();
  }

  if (world.runMeters > world.bestMeters) {
    world.bestMeters = world.runMeters;
    saveBestMeters();
  }
  updateMeterHud();
}

function createBestFireworkParticle(side) {
  const fromLeft = side < 0;
  const x = fromLeft ? 24 : world.w - 24;
  const y = world.h - 14;
  const vxBase = rand(220, 460);
  const vx = fromLeft ? vxBase : -vxBase;
  const vy = rand(-900, -520);
  const radius = rand(2.2, 4.6);
  const life = rand(0.7, 1.1);
  const colors = ["#fef08a", "#fdba74", "#67e8f9", "#c4b5fd", "#f9a8d4"];
  return {
    x,
    y,
    vx,
    vy,
    radius,
    life,
    maxLife: life,
    gravity: rand(900, 1300),
    drag: rand(0.976, 0.988),
    color: colors[randInt(0, colors.length - 1)],
  };
}

function emitBestFireworksBurst() {
  const fx = world.bestFireworks;
  for (let i = 0; i < 7; i += 1) {
    fx.particles.push(createBestFireworkParticle(-1));
    fx.particles.push(createBestFireworkParticle(1));
  }
}

function triggerBestFireworks() {
  world.bestFireworks = createEmptyBestFireworks();
  world.bestFireworks.active = true;
  world.bestFireworks.timer = BEST_FIREWORK_DURATION;
  world.bestFireworks.emitTimer = 0;
  emitBestFireworksBurst();
}

function updateBestFireworks(dt) {
  const fx = world.bestFireworks;
  if (!fx || (!fx.active && fx.particles.length === 0)) return;

  if (fx.active) {
    fx.timer = Math.max(0, fx.timer - dt);
    fx.emitTimer -= dt;
    while (fx.emitTimer <= 0 && fx.timer > 0) {
      emitBestFireworksBurst();
      fx.emitTimer += BEST_FIREWORK_EMIT_INTERVAL;
    }
    if (fx.timer <= 0) fx.active = false;
  }

  for (let i = fx.particles.length - 1; i >= 0; i -= 1) {
    const p = fx.particles[i];
    p.life -= dt;
    p.vx *= Math.pow(p.drag, dt * 60);
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0 || p.y > world.h + 18 || p.x < -24 || p.x > world.w + 24) {
      fx.particles.splice(i, 1);
    }
  }
}

function updateMeterHud() {
  if (meterDisplayEl) {
    meterDisplayEl.textContent = `高度：${world.runMeters.toFixed(1)}`;
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
  } else if (world.state === "launched") {
    // 发射后允许镜头下跟，但最多跟到最近一次挂钩时记录的底线
    const launchBottomY = Number.isFinite(world.launchDeathBottomY) ? world.launchDeathBottomY : world.cameraY + world.h;
    const launchDownMaxY = launchBottomY - world.h;
    const downDesired = Math.max(world.cameraY, Math.min(desired, launchDownMaxY));
    const alpha = 1 - Math.exp(-cfg.cameraFollowDown * dt);
    world.cameraY += (downDesired - world.cameraY) * alpha;
  }

  const xAlpha = 1 - Math.exp(-cfg.cameraFollowX * dt);
  let desiredCameraX = 0;
  if (world.state === "aiming" && world.dragging) {
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
  // 粉桃系兜底，避免视觉配置缺失时退回旧黄绿配色
  palette.push("#ffe8f2", "#ffb8d2", "#ff8ea9", "#ff6f61", "#ff9dc2");
  return [...new Set(palette.filter((c) => typeof c === "string" && c.trim()))];
}

function spawnJuiceBurstParticle(fx, originX, originY, palette, big = false) {
  const angle = -Math.PI * 0.5 + rand(-deathFxCfg.spreadAngle, deathFxCfg.spreadAngle) * 0.6;
  const speed = (big ? rand(deathFxCfg.bigSpeedMin, deathFxCfg.bigSpeedMax) : rand(deathFxCfg.smallSpeedMin, deathFxCfg.smallSpeedMax)) * 1.08;
  const scale = big ? rand(1.05, 1.9) : rand(0.35, 0.8);
  fx.burstParticles.push({
    x: originX + rand(-7, 7),
    y: originY + rand(-8, 4),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(40, 130),
    gravity: rand(deathFxCfg.gravityMin, deathFxCfg.gravityMax),
    drag: rand(0.92, 0.965),
    life: rand(deathFxCfg.particleLifeMin, deathFxCfg.particleLifeMax),
    color: palette[randInt(0, palette.length - 1)],
    alpha: big ? rand(0.72, 0.9) : rand(0.45, 0.72),
    scale,
    radius: (big ? rand(deathFxCfg.bigRadiusMin, deathFxCfg.bigRadiusMax) : rand(deathFxCfg.smallRadiusMin, deathFxCfg.smallRadiusMax)) * scale * 2,
    floorY: fx.floorY - rand(0, 10),
  });
}

function createJuiceSplat(x, y, color, alpha, scale = 1, options = {}) {
  const cluster = options.cluster !== false;
  const lobeMin = Number.isFinite(options.lobeMin) ? options.lobeMin : 4;
  const lobeMax = Number.isFinite(options.lobeMax) ? options.lobeMax : 9;
  const dotMin = Number.isFinite(options.dotMin) ? options.dotMin : (cluster ? 3 : 0);
  const dotMax = Number.isFinite(options.dotMax) ? options.dotMax : (cluster ? 7 : 0);
  if (!cluster) {
    const radius = rand(6, 12) * scale;
    return {
      x,
      y,
      color,
      alpha: 0.8,
      radius,
      age: 0,
      life: rand(0.7, 1.1),
      grow: rand(1.02, 1.14),
      lobes: [],
      dripDots: [],
    };
  }

  const lobes = [];
  const lobeCount = randInt(Math.min(lobeMin, lobeMax), Math.max(lobeMin, lobeMax));
  for (let i = 0; i < lobeCount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(10, 34) * scale;
    lobes.push({
      ox: Math.cos(angle) * dist,
      oy: Math.sin(angle) * dist * rand(0.65, 1),
      r: rand(6, 18) * scale,
    });
  }

  const radius = rand(16, 34) * scale;
  const dripDots = [];
  const dotCount = randInt(Math.max(0, Math.min(dotMin, dotMax)), Math.max(0, Math.max(dotMin, dotMax)));
  for (let i = 0; i < dotCount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const dist = radius * rand(0.82, 1.62);
    dripDots.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist * rand(0.7, 1.24),
      r: rand(2.4, 5.8) * scale,
    });
  }

  return {
    x,
    y,
    color,
    alpha: 0.8,
    radius,
    age: 0,
    life: rand(0.82, 1.35),
    grow: rand(1.18, 1.6),
    lobes,
    dripDots,
  };
}

function spawnGroundJuiceSpread(fx, centerX, floorY, palette, intensity = 1, options = {}) {
  const baseScale = Math.max(0.2, intensity);
  const yDir = options.yDir === -1 ? -1 : 1;
  const nearMin = Number.isFinite(options.nearMin) ? options.nearMin : 16;
  const nearMax = Number.isFinite(options.nearMax) ? options.nearMax : Math.min(130, world.h * 0.28);
  const mainBlobCount = randInt(1, 2);
  for (let i = 0; i < mainBlobCount; i += 1) {
    const mainX = clamp(centerX + rand(-38, 38), 12, world.w - 12);
    const mainY = clamp(floorY + yDir * rand(nearMin, nearMax), 12, world.h - 8);
    const mainColor = palette[randInt(0, palette.length - 1)];
    const mainScale = rand(0.76, 1.2) * baseScale;
    fx.splats.push(
      createJuiceSplat(mainX, mainY, mainColor, 1, mainScale, {
        cluster: true,
        lobeMin: 3,
        lobeMax: 5,
        dotMin: 6,
        dotMax: 8,
      }),
    );

    const attachCount = randInt(3, 5);
    for (let j = 0; j < attachCount; j += 1) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(12, 44);
      const attachX = clamp(mainX + Math.cos(angle) * dist, 10, world.w - 10);
      const attachY = clamp(mainY + Math.sin(angle) * dist * 0.72, 10, world.h - 8);
      fx.splats.push(
        createJuiceSplat(attachX, attachY, mainColor, 1, rand(0.32, 0.62) * baseScale, {
          cluster: false,
          dotMin: 0,
          dotMax: 0,
        }),
      );
    }
  }
}

function startDeathFx(originX, originY, options = {}) {
  const previewOnly = options.previewOnly === true;
  normalizeDeathFxCfg();
  const palette = getJuicePalette();
  const fx = createEmptyDeathFx();
  const safeEdge = 18;
  const impactX = clamp(originX, safeEdge, world.w - safeEdge);
  const impactY = clamp(originY, 18, world.h - 18);
  const floorY = clamp(impactY + cfg.ballRadius * 0.68, impactY + 4, world.h - 6);
  fx.active = true;
  fx.previewOnly = previewOnly;
  fx.timer = deathFxCfg.fxDuration + deathFxCfg.cooldown;
  fx.originX = impactX;
  fx.originY = impactY;
  fx.floorY = floorY;

  const bigCount = Math.max(0, Math.round(deathFxCfg.bigBurstCount));
  const smallCount = Math.max(0, Math.round(deathFxCfg.smallBurstCount));
  for (let i = 0; i < bigCount; i += 1) {
    spawnJuiceBurstParticle(fx, impactX, impactY, palette, true);
  }
  for (let i = 0; i < smallCount; i += 1) {
    spawnJuiceBurstParticle(fx, impactX, impactY, palette, false);
  }

  const topBand = world.h * 0.24;
  const bottomBand = world.h * 0.76;
  const yDir = impactY > bottomBand ? -1 : 1;
  const isNearEdge = impactY < topBand || impactY > bottomBand;
  const nearMin = isNearEdge ? 8 : 6;
  const nearMax = isNearEdge ? Math.min(72, world.h * 0.16) : Math.min(56, world.h * 0.12);

  // 保底：死亡点本身一定有一坨可见污渍（避免只在偏移区域出现）
  const impactColor = palette[randInt(0, palette.length - 1)];
  fx.splats.push(
    createJuiceSplat(
      impactX,
      impactY,
      impactColor,
      1,
      0.88,
      {
        cluster: true,
        lobeMin: 3,
        lobeMax: 5,
        dotMin: 4,
        dotMax: 6,
      },
    ),
  );

  // 仅保留一段“死亡点附近”扩散，不再做更下方铺层
  spawnGroundJuiceSpread(fx, impactX, impactY, palette, 1.2, { yDir, nearMin, nearMax });

  world.deathFx = fx;
  if (!previewOnly) {
    wallHitMuteUntilSec = world.timeSec + WALL_HIT_SFX_MUTE_AFTER_DEATH_SEC;
    playDeathPopShot();
    world.state = "dying";
    world.dragging = false;
    world.pointerId = null;
    world.lookDir.x = 0;
    world.lookDir.y = 0;
    world.ball.vx = 0;
    world.ball.vy = 0;
  }
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

    const pxEdge = 10;
    if (p.x < pxEdge) {
      p.x = pxEdge;
      if (p.vx < 0) p.vx *= -0.22;
    } else if (p.x > world.w - pxEdge) {
      p.x = world.w - pxEdge;
      if (p.vx > 0) p.vx *= -0.22;
    }

    if (p.y + p.radius >= p.floorY) {
      const splatScale = clamp(
        p.scale * rand(deathFxCfg.burstToSplatScaleMin, deathFxCfg.burstToSplatScaleMax),
        0.22,
        2.4,
      );
      fx.splats.push(
        createJuiceSplat(
          clamp(p.x, 10, world.w - 10),
          clamp(p.floorY + rand(-6, 6), 8, world.h - 8),
          p.color,
          1,
          splatScale,
          {
            cluster: p.scale > 0.95,
            lobeMin: p.scale > 0.95 ? 3 : 2,
            lobeMax: p.scale > 0.95 ? 6 : 4,
            dotMin: p.scale > 0.95 ? 4 : 2,
            dotMax: p.scale > 0.95 ? 7 : 4,
          },
        ),
      );
      fx.burstParticles.splice(i, 1);
      continue;
    }

    if (p.life <= 0) {
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
    if (!fx.previewOnly) world.state = "gameover";
  }
}

function checkGameOver() {
  if (world.state === "gameover" || world.state === "dying") return;
  if (world.state !== "launched") return;
  if (world.launchGraceTimer > 0) return;
  const cameraBottomY = world.cameraY + world.h;
  const launchBottomY = Number.isFinite(world.launchDeathBottomY) ? world.launchDeathBottomY : cameraBottomY;
  const deathBottomY = Math.max(cameraBottomY, launchBottomY);
  // 用球心判定，避免视觉上“还没到底就死亡”
  if (world.ball.y >= deathBottomY + cfg.deathBottomMargin) {
    startDeathFx(toScreenX(world.ball.x), toScreenY(world.ball.y));
  }
}

function collideBounds() {
  const b = world.ball;
  const r = cfg.ballRadius;
  if (b.x < r) {
    const impact = Math.abs(b.vx);
    b.x = r;
    b.vx = -b.vx * cfg.restitution;
    b.vy *= cfg.wallFriction;
    playWallHitSfx(impact);
    if (impact > 80) kickJelly(Math.min(0.62, 0.18 + impact / 1050), Math.min(0.56, 0.16 + impact / 1300));
  }
  if (b.x > world.w - r) {
    const impact = Math.abs(b.vx);
    b.x = world.w - r;
    b.vx = -b.vx * cfg.restitution;
    b.vy *= cfg.wallFriction;
    playWallHitSfx(impact);
    if (impact > 80) kickJelly(Math.min(0.62, 0.18 + impact / 1050), Math.min(0.56, 0.16 + impact / 1300));
  }
  const top = world.cameraY + r;
  if (b.y < top) {
    const impact = Math.abs(b.vy);
    b.y = top;
    b.vy = -b.vy * cfg.restitution;
    b.vx *= cfg.wallFriction;
    playWallHitSfx(impact);
    if (impact > 80) kickJelly(Math.min(0.54, 0.16 + impact / 1200), Math.min(0.48, 0.14 + impact / 1550));
  }
}

function update(dt) {
  world.timeSec += dt;
  syncTutorialOverlay();
  updateBestFireworks(dt);
  updateGear(dt);
  updateMovingTrack(dt);
  if (world.deathFx.active && world.deathFx.previewOnly) {
    updateDeathFx(dt);
  }
  if (world.state === "dying") {
    updateDeathFx(dt);
    return;
  }

  updateAnchorFuse();
  updateRedAlarm();

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
  updateJellyState(dt);

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

  checkGearHit();
  checkMovingTrackHit();
  if (world.state === "dying") {
    updateDeathFx(dt);
    return;
  }

  if (world.state !== "gameover") {
    updateCamera(dt);
    ensureAnchorsCoverage();
  }

  checkGameOver();
  if (world.state === "dying") {
    updateDeathFx(dt);
    return;
  }
  if (world.state === "launched" || world.state === "tethered") {
    updateMeters();
  }
  syncTutorialOverlay();
}

function toScreenY(worldY) {
  return worldY - world.cameraY;
}

function toScreenX(worldX) {
  return worldX - world.cameraX;
}

function drawBackgroundMeterMarks() {
  const pxPerMeter = Math.max(1, cfg.pxPerMeter || 100);
  const interval = BG_METER_MARK_INTERVAL;
  const startY = Number.isFinite(world.startY) ? world.startY : world.ball.y;
  const topWorldY = world.cameraY;
  const bottomWorldY = world.cameraY + world.h;
  const topMeter = Math.max(0, (startY - topWorldY) / pxPerMeter);
  const bottomMeter = Math.max(0, (startY - bottomWorldY) / pxPerMeter);
  const firstMark = Math.max(interval, Math.ceil(bottomMeter / interval) * interval);
  const lastMark = Math.floor(topMeter / interval) * interval;

  if (lastMark < firstMark) return;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.lineWidth = 2.4;
  ctx.font = "700 44px sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(15, 23, 42, 0.45)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  const centerX = world.w * 0.5;
  const lineGap = 20;
  const lineLen = Math.max(40, Math.min(120, world.w * 0.2));

  for (let meter = firstMark; meter <= lastMark; meter += interval) {
    const worldY = startY - meter * pxPerMeter;
    const sy = toScreenY(worldY);
    if (sy < -24 || sy > world.h + 24) continue;
    const label = `${meter}m`;
    const labelHalfW = ctx.measureText(label).width * 0.5;
    const leftEndX = centerX - labelHalfW - lineGap;
    const leftStartX = Math.max(18, leftEndX - lineLen);
    const rightStartX = centerX + labelHalfW + lineGap;
    const rightEndX = Math.min(world.w - 18, rightStartX + lineLen);

    ctx.beginPath();
    if (leftStartX < leftEndX) {
      ctx.moveTo(leftStartX, sy);
      ctx.lineTo(leftEndX, sy);
    }
    if (rightStartX < rightEndX) {
      ctx.moveTo(rightStartX, sy);
      ctx.lineTo(rightEndX, sy);
    }
    ctx.stroke();
    ctx.fillText(label, centerX, sy);
  }

  ctx.restore();
}

function drawBackgroundBestMeterMark() {
  const bestMeters = world.runStartBestMeters;
  if (!Number.isFinite(bestMeters) || bestMeters <= BEST_MARKER_MIN_METERS) return;

  const pxPerMeter = Math.max(1, cfg.pxPerMeter || 100);
  const startY = Number.isFinite(world.startY) ? world.startY : world.ball.y;
  const worldY = startY - bestMeters * pxPerMeter;
  const sy = toScreenY(worldY);
  if (sy < -36 || sy > world.h + 36) return;

  const rightPad = 14;
  const markerLen = 54;
  const markerEndX = world.w - rightPad;
  const markerStartX = markerEndX - markerLen;

  ctx.save();
  ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
  ctx.fillStyle = "rgba(255, 247, 196, 0.98)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.font = "700 18px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.shadowColor = "rgba(120, 53, 15, 0.55)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();
  ctx.moveTo(markerStartX, sy);
  ctx.lineTo(markerEndX, sy);
  ctx.stroke();

  ctx.fillText(`历史最高 ${bestMeters.toFixed(1)}m`, markerEndX, sy - 8);
  ctx.restore();
}

function drawBackground() {
  ensureBackgroundCloudBands();

  const bg = world.background;
  const altitudeT = clamp01((-world.cameraY) / (cfg.pxPerMeter * 520));
  const skyTop = mixRgb([125, 211, 252], [56, 189, 248], altitudeT * 0.6);
  const skyMid = mixRgb([186, 230, 253], [125, 211, 252], altitudeT * 0.5);
  const skyBottom = mixRgb([224, 242, 254], [186, 230, 253], altitudeT * 0.42);

  const g = ctx.createLinearGradient(0, 0, 0, world.h);
  g.addColorStop(0, skyTop);
  g.addColorStop(0.46, skyMid);
  g.addColorStop(1, skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, world.w, world.h);

  if (bg && bg.cloudBands.size > 0) {
    const sortedBands = Array.from(bg.cloudBands.keys()).sort((a, b) => a - b);
    for (const band of sortedBands) {
      const data = bg.cloudBands.get(band);
      if (!data) continue;
      for (const cloud of data.clouds) {
        const drift = Math.sin(world.timeSec * cloud.driftFreq + cloud.phase) * cloud.driftAmp;
        const sx = cloud.x - world.cameraX * cloud.parallax + drift;
        const sy = cloud.y - world.cameraY * cloud.parallax;
        if (sx < -cloud.width || sx > world.w + cloud.width) continue;
        if (sy < -cloud.height || sy > world.h + cloud.height) continue;
        drawSoftCloud(sx, sy, cloud.width, cloud.height, cloud.alpha, cloud.tint);
      }
    }
  }

  if (bg && bg.hazeParticles.length > 0) {
    for (const p of bg.hazeParticles) {
      const driftX = Math.sin(world.timeSec * p.driftFreq + p.phase) * p.driftAmp;
      const driftY = Math.cos(world.timeSec * (p.driftFreq * 0.7) + p.phase) * p.driftAmp * 0.45;
      const x = p.nx * world.w + driftX - world.cameraX * 0.05;
      const y = p.ny * world.h + driftY - world.cameraY * 0.02;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, p.radius);
      glow.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBackgroundMeterMarks();
  drawBackgroundBestMeterMark();

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

function drawHorizontalCapsulePath(x, y, width, height) {
  const r = height * 0.5;
  const leftCx = x - width * 0.5 + r;
  const rightCx = x + width * 0.5 - r;
  ctx.beginPath();
  ctx.arc(rightCx, y, r, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.lineTo(leftCx, y + r);
  ctx.arc(leftCx, y, r, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.closePath();
}

function drawMovingTrack() {
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
  drawHorizontalCapsulePath(sx, sy, t.width, t.height);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#334155";
  drawHorizontalCapsulePath(sx, sy, t.width, t.height);
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  drawHorizontalCapsulePath(sx, sy, t.width - 8, slotH);
  ctx.fill();

  const lane = ctx.createLinearGradient(sx, sy - slotH * 0.5, sx, sy + slotH * 0.5);
  lane.addColorStop(0, "rgba(125, 211, 252, 0.25)");
  lane.addColorStop(1, "rgba(59, 130, 246, 0.32)");
  ctx.fillStyle = lane;
  drawHorizontalCapsulePath(sx, sy, t.width - 16, slotH - 6);
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
    const pinAnchorRadius = Math.max(6, t.pinRadius - 4);
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

function getAnchorVisualStyle(anchor, flash = 0) {
  if (!anchor.isRed) {
    return {
      core: "#2ca7ff",
      coreDark: "#0f73d4",
      rimLight: "#fff7ef",
      rimDark: "#b59a79",
      highlight: "rgba(255,255,255,0.48)",
    };
  }

  const w = clamp01(flash);
  return {
    core: mixRgb([255, 18, 18], [255, 255, 255], w),
    coreDark: mixRgb([176, 0, 0], [214, 214, 214], w * 0.92),
    rimLight: mixRgb([255, 239, 233], [255, 255, 255], w * 0.75),
    rimDark: mixRgb([187, 154, 120], [205, 205, 205], w * 0.68),
    highlight: `rgba(255,255,255,${0.52 + 0.38 * w})`,
  };
}

function getAnchorFuseState(anchor) {
  if (!anchor.isRed || !anchor.fuseStarted) {
    return { alpha: 1, flash: 0 };
  }
  const elapsed = world.timeSec - anchor.fuseStartSec;
  if (elapsed <= RED_ANCHOR_BLINK_DELAY) {
    return { alpha: 1, flash: 0 };
  }
  const blinkElapsed = Math.max(0, elapsed - RED_ANCHOR_BLINK_DELAY);
  const blinkDuration = Math.max(0.0001, RED_ANCHOR_VANISH_DELAY - RED_ANCHOR_BLINK_DELAY);
  const t = clamp01(blinkElapsed / blinkDuration);
  let period = RED_ANCHOR_BLINK_PERIOD_START;
  let accel = 0;
  if (t > RED_ANCHOR_BLINK_ACCEL_START) {
    const fastT = (t - RED_ANCHOR_BLINK_ACCEL_START) / Math.max(0.0001, 1 - RED_ANCHOR_BLINK_ACCEL_START);
    accel = Math.pow(clamp01(fastT), 1.8);
    period = lerp(RED_ANCHOR_BLINK_PERIOD_START, RED_ANCHOR_BLINK_PERIOD_END, accel);
  }
  const phase = (blinkElapsed / Math.max(0.001, period)) % 1;
  const isOn = phase < 0.5;
  const alpha = isOn ? 1 : lerp(0.78, 0.66, accel);
  const flash = isOn ? 1 : 0;
  return { alpha, flash };
}

function getRedAnchorSpawnAnimState(anchor) {
  if (!anchor || !anchor.isRed || !Number.isFinite(anchor.spawnAnimStartSec)) {
    return { scale: 1, alpha: 1, ringAlpha: 0, ringRadiusMul: 1 };
  }
  const elapsed = world.timeSec - anchor.spawnAnimStartSec;
  if (elapsed < 0 || elapsed >= RED_ANCHOR_SPAWN_ANIM_DURATION) {
    return { scale: 1, alpha: 1, ringAlpha: 0, ringRadiusMul: 1 };
  }

  const t = clamp01(elapsed / RED_ANCHOR_SPAWN_ANIM_DURATION);
  const popT = t < 0.7 ? t / 0.7 : (t - 0.7) / 0.3;
  const easedPop = Math.pow(clamp01(popT), 0.72);
  const scale = t < 0.7 ? lerp(0.65, 1.08, easedPop) : lerp(1.08, 1, Math.pow(clamp01(popT), 0.9));
  const alpha = lerp(0.35, 1, Math.pow(t, 0.65));
  const ringAlpha = (1 - t) * (1 - t) * 0.44;
  const ringRadiusMul = 0.82 + t * 1.05;
  return { scale, alpha, ringAlpha, ringRadiusMul };
}

function getBallVisualRadius() {
  return window.BallVisual.getVisualRadius(cfg.ballRadius, ballVisualCfg);
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
    const cx = lerp(sx, ex, 0.56) - ux * ballR * 0.08;
    const cy = lerp(sy1, ey, 0.56) - uy * ballR * 0.08;

    const startHalf = strapWidth * 0.55;
    const midHalf = strapWidth * 0.5;
    const endHalf = Math.max(2.2, strapWidth * 0.46);
    const midX = (sx + ex + cx) / 3;
    const midY = (sy1 + ey + cy) / 3;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const ropeGrad = ctx.createLinearGradient(
      midX - px * strapWidth * 0.7,
      midY - py * strapWidth * 0.7,
      midX + px * strapWidth * 0.7,
      midY + py * strapWidth * 0.7,
    );
    ropeGrad.addColorStop(0, ballVisualCfg.colorD || "#7aa90f");
    ropeGrad.addColorStop(0.35, ballVisualCfg.colorC || "#acd726");
    ropeGrad.addColorStop(0.7, ballVisualCfg.colorB || "#d8f55d");
    ropeGrad.addColorStop(1, ballVisualCfg.colorA || "#f4ff9a");

    ctx.globalAlpha = 0.92 - stretchRatio * 0.08;
    ctx.fillStyle = ropeGrad;
    ctx.beginPath();
    ctx.moveTo(sx - px * startHalf, sy1 - py * startHalf);
    ctx.quadraticCurveTo(cx - px * midHalf, cy - py * midHalf, ex - px * endHalf, ey - py * endHalf);
    ctx.lineTo(ex + px * endHalf, ey + py * endHalf);
    ctx.quadraticCurveTo(cx + px * midHalf, cy + py * midHalf, sx + px * startHalf, sy1 + py * startHalf);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.36;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = Math.max(1.2, strapWidth * 0.24);
    ctx.beginPath();
    ctx.moveTo(sx - px * startHalf * 0.42, sy1 - py * startHalf * 0.42);
    ctx.quadraticCurveTo(cx - px * midHalf * 0.44, cy - py * midHalf * 0.44, ex - px * endHalf * 0.36, ey - py * endHalf * 0.36);
    ctx.stroke();

    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = ballVisualCfg.outlineColor || "#f8ffbc";
    ctx.lineWidth = Math.max(0.9, strapWidth * 0.1);
    ctx.beginPath();
    ctx.moveTo(sx - px * startHalf, sy1 - py * startHalf);
    ctx.quadraticCurveTo(cx - px * midHalf, cy - py * midHalf, ex - px * endHalf, ey - py * endHalf);
    ctx.moveTo(sx + px * startHalf, sy1 + py * startHalf);
    ctx.quadraticCurveTo(cx + px * midHalf, cy + py * midHalf, ex + px * endHalf, ey + py * endHalf);
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

function drawGearHazard() {
  if (!GEAR_ENABLED) return;
  for (const g of world.gears) {
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
    const alpha = splat.alpha;
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
    const dripDots = Array.isArray(splat.dripDots) ? splat.dripDots : [];
    for (const dot of dripDots) {
      ctx.beginPath();
      ctx.arc(dot.x * scale, dot.y * scale, dot.r * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawBestFireworks() {
  const fx = world.bestFireworks;
  if (!fx || fx.particles.length === 0) return;

  for (const p of fx.particles) {
    const alpha = clamp01(p.life / Math.max(0.0001, p.maxLife));
    if (alpha <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(p.x - p.radius * 0.25, p.y - p.radius * 0.22, p.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawBall() {
  if (world.state === "dying" || world.state === "gameover") return;
  const sy = toScreenY(world.ball.y);
  const sx = toScreenX(world.ball.x);
  let angle = getBallRenderAngle();
  const idleAngleBlend = clamp01((world.jellyHangIdleBlend - 0.55) / 0.45);
  angle = lerp(angle, 0, idleAngleBlend);
  let renderDeform = world.jellyDeform;
  let renderWobble = Math.sin(world.jellyPhase) * world.jellyWobble;
  const idleBlend = clamp01(world.jellyHangIdleBlend);
  const activeBlend = 1 - idleBlend;
  renderDeform *= 1 - idleBlend * 0.88;
  renderWobble *= activeBlend * activeBlend;

  // 让“蓄力拉满按住”在渲染层有更强的可见形变，避免体感不明显
  if (world.dragging && world.state === "aiming" && world.activeAnchor) {
    const dx = world.ball.x - world.activeAnchor.x;
    const dy = world.ball.y - world.activeAnchor.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const stretchRatio = clamp01(dist / Math.max(1, cfg.maxStretch));
    const fullStart = clamp01(cfg.aimJellyFullStart);
    const nearFull = fullStart >= 0.999 ? 0 : clamp01((stretchRatio - fullStart) / (1 - fullStart));
    const deformBonus = nearFull * (0.18 + cfg.aimJellyNearFullBoost * 0.95);
    const wobbleBonus = nearFull * (0.08 + cfg.aimJellyHoldWobble * 0.55);
    renderDeform = clamp01(renderDeform + deformBonus);
    renderWobble += Math.sin(world.jellyPhase * 1.35) * wobbleBonus;
  }

  window.BallVisual.drawJellyBall(ctx, {
    x: sx,
    y: sy,
    angle,
    baseRadius: cfg.ballRadius,
    speed: Math.hypot(world.ball.vx, world.ball.vy),
    time: world.lastTime,
    deformAmount: renderDeform,
    wobbleOffset: renderWobble,
    lookDirX: world.lookDir.x,
    lookDirY: world.lookDir.y,
    faceMode: world.state === "launched" ? "flight_squint" : "normal",
    cfg: ballVisualCfg,
    layerVisibility: jellyLayerVisibility,
  });
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
  ctx.fillText("点击任意位置重新挑战", world.w * 0.5, world.h * 0.64);
}

function draw() {
  drawBackground();
  drawMovingTrack();
  drawGearHazard();
  drawRubberBand();
  drawAnchors();
  drawBall();
  drawBreakFlash();
  drawBestFireworks();
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

loadJellyCfgFromStorage();
applyJellyLayerVisibilityFromStorage();
buildDebugPanel();
buildDeathFxDebugPanel();
buildJellyDebugPanel();
buildHazardDebugPanel();
syncPanelFromCfg();
syncDeathFxPanelFromCfg();
syncJellyPanelFromCfg();
syncHazardPanelFromCfg();
updateMeterHud();
updateFpsHud();
syncDebugPanelVisibility();
syncDeathFxPanelVisibility();
syncJellyPanelVisibility();
syncHazardPanelVisibility();

if (debugToggleBtn) {
  debugToggleBtn.addEventListener("click", () => {
    const nextVisible = !debugPanelVisible;
    debugPanelVisible = nextVisible;
    if (nextVisible) deathFxPanelVisible = false;
    if (nextVisible) jellyPanelVisible = false;
    if (nextVisible) hazardPanelVisible = false;
    syncDebugPanelVisibility();
    syncDeathFxPanelVisibility();
    syncJellyPanelVisibility();
    syncHazardPanelVisibility();
  });
}

if (deathFxDebugToggleBtn) {
  deathFxDebugToggleBtn.addEventListener("click", () => {
    const nextVisible = !deathFxPanelVisible;
    deathFxPanelVisible = nextVisible;
    if (nextVisible) debugPanelVisible = false;
    if (nextVisible) jellyPanelVisible = false;
    if (nextVisible) hazardPanelVisible = false;
    syncDeathFxPanelVisibility();
    syncDebugPanelVisibility();
    syncJellyPanelVisibility();
    syncHazardPanelVisibility();
  });
}

if (jellyDebugToggleBtn) {
  jellyDebugToggleBtn.addEventListener("click", () => {
    const nextVisible = !jellyPanelVisible;
    jellyPanelVisible = nextVisible;
    if (nextVisible) debugPanelVisible = false;
    if (nextVisible) deathFxPanelVisible = false;
    if (nextVisible) hazardPanelVisible = false;
    syncJellyPanelVisibility();
    syncDebugPanelVisibility();
    syncDeathFxPanelVisibility();
    syncHazardPanelVisibility();
  });
}

if (hazardDebugToggleBtn) {
  hazardDebugToggleBtn.addEventListener("click", () => {
    const nextVisible = !hazardPanelVisible;
    hazardPanelVisible = nextVisible;
    if (nextVisible) debugPanelVisible = false;
    if (nextVisible) deathFxPanelVisible = false;
    if (nextVisible) jellyPanelVisible = false;
    syncHazardPanelVisibility();
    syncDebugPanelVisibility();
    syncDeathFxPanelVisibility();
    syncJellyPanelVisibility();
  });
}

if (deathFxPreviewBtn) {
  deathFxPreviewBtn.addEventListener("click", () => {
    if (world.state === "dying") {
      setDeathFxStatus("死亡中无法预览，请稍后。");
      return;
    }
    if (world.state !== "aiming" && world.state !== "gameover") {
      setDeathFxStatus("请在瞄准或结算状态预览。");
      return;
    }
    const originX = world.state === "gameover" ? world.w * 0.5 : toScreenX(world.ball.x);
    const originY = world.state === "gameover" ? world.h * 0.78 : toScreenY(world.ball.y);
    startDeathFx(originX, originY, { previewOnly: true });
    setDeathFxStatus("已触发死亡特效预览。");
  });
}

if (deathFxPlaySfxBtn) {
  deathFxPlaySfxBtn.addEventListener("click", () => {
    ensureAudioReady();
    const played = playDeathPopShot();
    setDeathFxStatus(played ? "已播放气球爆裂音效。" : "音频未就绪，请先点击画布再试。");
  });
}

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

if (saveAsDefaultBtn) {
  saveAsDefaultBtn.addEventListener("click", async () => {
    const payload = {};
    for (const def of paramDefs) {
      payload[def.key] = cfg[def.key];
      defaultCfg[def.key] = cfg[def.key];
    }
    localStorage.setItem(CFG_DEFAULT_OVERRIDE_KEY, JSON.stringify(payload));
    const result = await saveCodeDefaultsToFile("cfg", payload);
    if (result.ok) {
      setStatus("已写入代码默认值 + 本地默认值（全设备将使用这套默认）。");
    } else {
      setStatus(`已保存本地默认值；代码默认值写入失败：${result.message}`);
    }
  });
}

if (copyCfgCodeBtn) {
  copyCfgCodeBtn.addEventListener("click", async () => {
    const payload = {};
    for (const def of paramDefs) payload[def.key] = cfg[def.key];
    const result = await saveCodeDefaultsToFile("cfg", payload);
    if (result.ok) {
      setStatus("已保存到代码默认值（全员生效，需提交代码）。");
    } else {
      setStatus(`保存到代码默认值失败：${result.message}`);
    }
  });
}

defaultCfgBtn.addEventListener("click", () => {
  Object.assign(cfg, defaultCfg);
  syncPanelFromCfg();
  onCfgChanged("restLength");
  setStatus("已恢复默认参数（如需持久化请点保存）。");
});

if (deathFxDefaultBtn) {
  deathFxDefaultBtn.addEventListener("click", () => {
    Object.assign(deathFxCfg, window.DeathFx.defaultDeathFxCfg);
    normalizeDeathFxCfg();
    syncDeathFxPanelFromCfg();
    setDeathFxStatus("已恢复死亡特效默认参数。");
  });
}

if (jellyDefaultBtn) {
  jellyDefaultBtn.addEventListener("click", () => {
    for (const def of jellyParamDefs) {
      cfg[def.key] = defaultCfg[def.key];
    }
    syncJellyPanelFromCfg();
    saveJellyCfgToStorage();
    setJellyStatus("已恢复果冻形变默认参数。");
  });
}

if (clearDataBtn) {
  clearDataBtn.addEventListener("click", () => {
    clearAllSavedData();
    setStatus("已清除本地数据，正在重置…");
    window.location.reload();
  });
}

if (hazardDefaultBtn) {
  hazardDefaultBtn.addEventListener("click", () => {
    Object.assign(hazardCfg, defaultHazardCfg);
    normalizeHazardCfg();
    syncHazardPanelFromCfg();
    setHazardStatus("已恢复障碍生成默认参数（如需持久化请点保存）。");
  });
}

if (hazardSaveBtn) {
  hazardSaveBtn.addEventListener("click", () => {
    saveHazardCfgToStorage();
    setHazardStatus("已保存障碍生成参数到本地。");
  });
}

if (hazardSaveAsDefaultBtn) {
  hazardSaveAsDefaultBtn.addEventListener("click", async () => {
    const payload = {};
    for (const def of hazardParamDefs) {
      payload[def.key] = hazardCfg[def.key];
      defaultHazardCfg[def.key] = hazardCfg[def.key];
    }
    localStorage.setItem(HAZARD_DEFAULT_OVERRIDE_KEY, JSON.stringify(payload));
    const result = await saveCodeDefaultsToFile("hazard", payload);
    if (result.ok) {
      setHazardStatus("已写入代码默认值 + 本地默认值（全设备将使用这套默认）。");
    } else {
      setHazardStatus(`已保存本地默认值；代码默认值写入失败：${result.message}`);
    }
  });
}

if (hazardSaveCodeBtn) {
  hazardSaveCodeBtn.addEventListener("click", async () => {
    const payload = {};
    for (const def of hazardParamDefs) {
      payload[def.key] = hazardCfg[def.key];
    }
    const result = await saveCodeDefaultsToFile("hazard", payload);
    if (result.ok) {
      setHazardStatus("已保存到代码默认值（全员生效，需提交代码）。");
    } else {
      setHazardStatus(`保存到代码默认值失败：${result.message}`);
    }
  });
}

window.addEventListener("storage", (e) => {
  if (e.key === JELLY_LAYER_VISIBILITY_KEY) {
    applyJellyLayerVisibilityFromStorage();
  }
});

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);

resize();
requestAnimationFrame(tick);
