export const defaultHazardCfg = {
  baseTrackUnlockMeters: 22,
  gearUnlockMeters: 47,
  damageTrackUnlockMeters: 80,
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

export const hazardIntegerKeys = new Set([
  "baseTrackUnlockMeters",
  "gearUnlockMeters",
  "damageTrackUnlockMeters",
  "baseTrackSlotInterval",
  "damageTrackSlotInterval",
  "gearSlotInterval",
  "hazardDensityStartMeters",
  "hazardDensityFullMeters",
]);
