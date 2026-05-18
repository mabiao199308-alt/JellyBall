import { defaultHazardCfg } from "./hazard_defaults";
import mapDifficultyPresetJson from "./map_difficulty_presets.json";

export type DifficultyLevel = "easy" | "normal" | "hard";

export type AnchorDifficultyCfg = {
  spacingMin: number;
  spacingMax: number;
  spacingDifficultyStartMeters: number;
  spacingDifficultyFullMeters: number;
  spacingBonusMin: number;
  spacingBonusMax: number;
  redChanceStart: number;
  redChanceEnd: number;
  redChanceFullMeters: number;
  firstBlueAnchorCount: number;
};

export type HazardDifficultyCfg = Record<keyof typeof defaultHazardCfg, number>;

export type DifficultyProfile = {
  anchor: AnchorDifficultyCfg;
  hazard: HazardDifficultyCfg;
};

type DifficultyProfiles = Record<DifficultyLevel, DifficultyProfile>;

const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "normal", "hard"];

export const difficultyLevelLabels: Record<DifficultyLevel, string> = {
  easy: "简单",
  normal: "中等",
  hard: "困难",
};

function createHazardCfg(overrides: Partial<HazardDifficultyCfg>): HazardDifficultyCfg {
  return {
    ...defaultHazardCfg,
    ...overrides,
  };
}

function createAnchorCfg(overrides: Partial<AnchorDifficultyCfg>): AnchorDifficultyCfg {
  return {
    spacingMin: 120,
    spacingMax: 185,
    spacingDifficultyStartMeters: 30,
    spacingDifficultyFullMeters: 160,
    spacingBonusMin: 26,
    spacingBonusMax: 78,
    redChanceStart: 1 / 3,
    redChanceEnd: 1 / 2,
    redChanceFullMeters: 160,
    firstBlueAnchorCount: 5,
    ...overrides,
  };
}

function cloneProfiles(profiles: DifficultyProfiles): DifficultyProfiles {
  return JSON.parse(JSON.stringify(profiles)) as DifficultyProfiles;
}

function getHardcodedDifficultyProfiles(): DifficultyProfiles {
  return {
    easy: {
      anchor: createAnchorCfg({
        spacingMin: 108,
        spacingMax: 170,
        spacingDifficultyStartMeters: 45,
        spacingDifficultyFullMeters: 230,
        spacingBonusMin: 14,
        spacingBonusMax: 48,
        redChanceStart: 0.2,
        redChanceEnd: 0.36,
        redChanceFullMeters: 220,
        firstBlueAnchorCount: 8,
      }),
      hazard: createHazardCfg({
        baseTrackUnlockMeters: 28,
        gearUnlockMeters: 62,
        damageTrackUnlockMeters: 100,
        baseTrackSlotInterval: 4,
        baseTrackSpawnChance: 0.35,
        baseTrackSpawnChanceMax: 0.68,
        damageTrackSlotInterval: 5,
        damageTrackSpawnChance: 0.22,
        damageTrackSpawnChanceMax: 0.56,
        gearSlotInterval: 4,
        gearSpawnChance: 0.34,
        gearSpawnChanceMax: 0.62,
        hazardDensityStartMeters: 96,
        hazardDensityFullMeters: 300,
      }),
    },
    normal: {
      anchor: createAnchorCfg({}),
      hazard: createHazardCfg({}),
    },
    hard: {
      anchor: createAnchorCfg({
        spacingMin: 132,
        spacingMax: 208,
        spacingDifficultyStartMeters: 14,
        spacingDifficultyFullMeters: 95,
        spacingBonusMin: 36,
        spacingBonusMax: 108,
        redChanceStart: 0.38,
        redChanceEnd: 0.62,
        redChanceFullMeters: 110,
        firstBlueAnchorCount: 3,
      }),
      hazard: createHazardCfg({
        baseTrackUnlockMeters: 14,
        gearUnlockMeters: 32,
        damageTrackUnlockMeters: 58,
        baseTrackSlotInterval: 2,
        baseTrackSpawnChance: 0.68,
        baseTrackSpawnChanceMax: 0.94,
        damageTrackSlotInterval: 3,
        damageTrackSpawnChance: 0.5,
        damageTrackSpawnChanceMax: 0.88,
        gearSlotInterval: 2,
        gearSpawnChance: 0.72,
        gearSpawnChanceMax: 0.95,
        hazardDensityStartMeters: 32,
        hazardDensityFullMeters: 140,
      }),
    },
  };
}

function resolveProfilesFromJson(base: DifficultyProfiles): DifficultyProfiles {
  const raw = mapDifficultyPresetJson as {
    profiles?: Partial<Record<DifficultyLevel, { anchor?: Partial<AnchorDifficultyCfg>; hazard?: Partial<HazardDifficultyCfg> }>>;
  };
  if (!raw || typeof raw !== "object" || !raw.profiles || typeof raw.profiles !== "object") {
    return base;
  }
  const merged = cloneProfiles(base);
  for (const level of DIFFICULTY_LEVELS) {
    const item = raw.profiles[level];
    if (!item || typeof item !== "object") continue;
    if (item.anchor && typeof item.anchor === "object") {
      Object.assign(merged[level].anchor, item.anchor);
    }
    if (item.hazard && typeof item.hazard === "object") {
      Object.assign(merged[level].hazard, item.hazard);
    }
  }
  return merged;
}

export function getDefaultDifficultyLevel(): DifficultyLevel {
  const raw = (mapDifficultyPresetJson as { activeDifficultyLevel?: string }).activeDifficultyLevel;
  if (typeof raw === "string" && DIFFICULTY_LEVELS.includes(raw as DifficultyLevel)) {
    return raw as DifficultyLevel;
  }
  return "normal";
}

export function createDefaultDifficultyProfiles(): DifficultyProfiles {
  const base = getHardcodedDifficultyProfiles();
  return resolveProfilesFromJson(base);
}
