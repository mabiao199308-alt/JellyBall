export function getFixedAnchorXByCursor(cursor: number, ratios: number[], worldW: number, sidePadding: number) {
  const ratio = ratios[cursor % ratios.length];
  return Math.max(sidePadding, Math.min(worldW - sidePadding, worldW * ratio));
}

export function getAnchorMaxStepX(worldW: number, maxStretch: number) {
  return Math.max(110, Math.min(worldW * 0.36, maxStretch * 1.72));
}

export function getDynamicAnchorSpacingRange(
  runMeters: number,
  anchorSpacingMin: number,
  anchorSpacingMax: number,
  startMeters: number,
  fullMeters: number,
  bonusMin: number,
  bonusMax: number,
) {
  const minBase = Math.min(anchorSpacingMin, anchorSpacingMax);
  const maxBase = Math.max(anchorSpacingMin, anchorSpacingMax);
  const meterSpan = Math.max(1, fullMeters - startMeters);
  const t = Math.max(0, Math.min(1, (runMeters - startMeters) / meterSpan));
  const min = minBase + bonusMin * t;
  const max = maxBase + bonusMax * t;
  return { min, max: Math.max(min + 6, max) };
}

export function getDynamicRedAnchorChance(runMeters: number, fullMeters: number, chanceStart: number, chanceEnd: number) {
  const full = Math.max(1, fullMeters);
  const t = Math.max(0, Math.min(1, runMeters / full));
  return chanceStart + (chanceEnd - chanceStart) * t;
}

export function getRandomizedAnchorXByCursor(
  cursor: number,
  ratios: number[],
  worldW: number,
  sidePadding: number,
  rand: (min: number, max: number) => number,
) {
  const base = getFixedAnchorXByCursor(cursor, ratios, worldW, sidePadding);
  const jitter = rand(-22, 22);
  return Math.max(sidePadding, Math.min(worldW - sidePadding, base + jitter));
}

export function getRandomizedAnchorXBySide(
  side: number,
  worldW: number,
  sidePadding: number,
  rand: (min: number, max: number) => number,
  randInt: (min: number, max: number) => number,
) {
  const ratios = side < 0 ? [0.2, 0.35] : [0.65, 0.8];
  const ratio = ratios[randInt(0, ratios.length - 1)];
  const jitter = rand(-18, 18);
  return Math.max(sidePadding, Math.min(worldW - sidePadding, worldW * ratio + jitter));
}
