const DEATH_FX_STORAGE_KEY = "swipe_death_fx_cfg_v1";

const defaultDeathFxCfg = {
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

function coerceDeathFxCfg(raw) {
  const next = { ...defaultDeathFxCfg };
  if (!raw || typeof raw !== "object") return next;
  for (const [key, defaultVal] of Object.entries(defaultDeathFxCfg)) {
    const incoming = raw[key];
    if (typeof defaultVal === "number") {
      const n = Number(incoming);
      if (Number.isFinite(n)) next[key] = n;
    }
  }
  next.readyDelay = Math.max(0, Math.min(1.5, next.readyDelay));
  next.cooldown = Math.max(0, Math.min(1.5, next.cooldown));
  next.originYRatio = Math.max(0.82, Math.min(0.96, next.originYRatio));
  next.floorYRatio = Math.max(0.9, Math.min(0.985, next.floorYRatio));
  next.fxDuration = Math.max(0.08, Math.min(2, next.fxDuration));
  return next;
}

function loadDeathFxCfg() {
  try {
    const raw = localStorage.getItem(DEATH_FX_STORAGE_KEY);
    if (!raw) return { ...defaultDeathFxCfg };
    return coerceDeathFxCfg(JSON.parse(raw));
  } catch {
    return { ...defaultDeathFxCfg };
  }
}

function saveDeathFxCfg(cfg) {
  const next = coerceDeathFxCfg(cfg);
  localStorage.setItem(DEATH_FX_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function resetDeathFxCfg() {
  localStorage.setItem(DEATH_FX_STORAGE_KEY, JSON.stringify(defaultDeathFxCfg));
  return { ...defaultDeathFxCfg };
}

window.DeathFx = {
  DEATH_FX_STORAGE_KEY,
  defaultDeathFxCfg,
  coerceDeathFxCfg,
  loadDeathFxCfg,
  saveDeathFxCfg,
  resetDeathFxCfg,
};
