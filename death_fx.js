const defaultDeathFxCfg = {
  readyDelay: 0.28,
  cooldown: 0.38,
  floorYRatio: 0.94,
  originYRatio: 0.9,
  fxDuration: 0.72,
  spreadAngle: 1.68,
  bigBurstCount: 4,
  smallBurstCount: 10,
  bigSpeedMin: 1680,
  bigSpeedMax: 2680,
  smallSpeedMin: 1280,
  smallSpeedMax: 2080,
  gravityMin: 520,
  gravityMax: 940,
  particleLifeMin: 0.14,
  particleLifeMax: 0.3,
  bigRadiusMin: 12,
  bigRadiusMax: 26,
  smallRadiusMin: 3,
  smallRadiusMax: 8,
  mainSplatScaleMin: 0.2,
  mainSplatScaleMax: 0.34,
  sideSplatCount: 3,
  sideSplatScaleMin: 1,
  sideSplatScaleMax: 1.6,
  burstToSplatScaleMin: 1.12,
  burstToSplatScaleMax: 1.86,
};

function resolveDeathFxCfg(raw) {
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
  next.spreadAngle = Math.max(0.1, Math.min(1.75, next.spreadAngle));
  return next;
}

window.DeathFx = {
  defaultDeathFxCfg,
  resolveDeathFxCfg,
};
