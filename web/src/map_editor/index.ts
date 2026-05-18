import { defaultHazardCfg, hazardIntegerKeys } from "../config/hazard_defaults";
import {
  createDefaultDifficultyProfiles,
  difficultyLevelLabels,
  getDefaultDifficultyLevel,
  type DifficultyLevel,
} from "../config/difficulty_presets";
import {
  HAZARD_CFG_STORAGE_KEY,
  MAP_EDITOR_DIFFICULTY_STORAGE_KEY,
  MAP_EDITOR_SEGMENT_DIFFICULTY_STORAGE_KEY,
} from "../config/storage_keys";
import { applyGeneratedSlotCounters, pickGeneratedSlot } from "../systems/hazard_loop";
import {
  getAnchorMaxStepX as calcAnchorMaxStepX,
  getDynamicAnchorSpacingRange as calcDynamicAnchorSpacingRange,
  getDynamicRedAnchorChance as calcDynamicRedAnchorChance,
  getFixedAnchorXByCursor as calcFixedAnchorXByCursor,
  getRandomizedAnchorXByCursor as calcRandomizedAnchorXByCursor,
  getRandomizedAnchorXBySide as calcRandomizedAnchorXBySide,
} from "../systems/spawn";

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
const templateCountInput = document.getElementById("templateCountInput") as HTMLInputElement | null;
const generateTemplatesBtn = document.getElementById("generateTemplatesBtn") as HTMLButtonElement | null;
const loadPreviewTemplatesBtn = document.getElementById("loadPreviewTemplatesBtn") as HTMLButtonElement | null;
const downloadTemplatesBtn = document.getElementById("downloadTemplatesBtn") as HTMLButtonElement | null;
const templateStatus = document.getElementById("templateStatus") as HTMLElement | null;
const saveMapBtn = document.getElementById("saveMapBtn") as HTMLButtonElement | null;
const mapSaveStatus = document.getElementById("mapSaveStatus") as HTMLElement | null;
const difficultyPanelBtn = mustEl<HTMLButtonElement>("difficultyPanelBtn");
const difficultyPanelCloseBtn = mustEl<HTMLButtonElement>("difficultyPanelCloseBtn");
const difficultyPanel = mustEl<HTMLElement>("difficultyPanel");
const difficultyActiveSelect = document.getElementById("difficultyActiveSelect") as HTMLSelectElement | null;
const difficultyEditSelect = document.getElementById("difficultyEditSelect") as HTMLSelectElement | null;
const difficultyUseEditedBtn = document.getElementById("difficultyUseEditedBtn") as HTMLButtonElement | null;
const difficultyResetLevelBtn = document.getElementById("difficultyResetLevelBtn") as HTMLButtonElement | null;
const difficultyResetAllBtn = document.getElementById("difficultyResetAllBtn") as HTMLButtonElement | null;
const segmentConfigList = document.getElementById("segmentConfigList") as HTMLElement | null;
const difficultyFields = document.getElementById("difficultyFields") as HTMLElement | null;
const statsPanel = mustEl<HTMLElement>("statsPanel");
const canvas = mustEl<HTMLCanvasElement>("previewCanvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("2D context unavailable");

const WORLD_W = 390;
const WORLD_H = 844;
const WORLD_START_Y = WORLD_H * 0.75;
const PX_PER_METER = 100;
const DEFAULT_VISIBLE_METERS = 50;
const CANVAS_MARGIN = 24;
const TEMPLATE_UNIT_METERS = 50;
const TEMPLATE_SEGMENT_COUNT = 1;
const hasSegmentDifficultyEditor = !!segmentConfigList;
let latestResult: any = null;
let latestTemplateLibrary: any = null;

const ANCHOR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];
const GEAR_X_RATIOS = [0.2, 0.35, 0.5, 0.65, 0.8];

const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "normal", "hard"];

const TEMPLATE_LIBRARY_KEYS = ["balanced", "anchorRush", "hazardRush"] as const;
type TemplateLibraryKey = (typeof TEMPLATE_LIBRARY_KEYS)[number];
type SegmentTemplateOption = "random" | TemplateLibraryKey;
type SegmentTemplateMode = "random" | "fixed";
type SegmentDifficultyConfig = {
  difficultyLevel: DifficultyLevel;
  templateMode: SegmentTemplateMode;
  templateLibraryKey: TemplateLibraryKey;
  resolvedTemplateLibraryKey: TemplateLibraryKey;
  templateLibraryFile: string | null;
};
type SegmentGenerationPlan = SegmentDifficultyConfig & {
  anchor: Record<string, number>;
  hazard: Record<string, number>;
};

const templateLibraryLabels: Record<TemplateLibraryKey, string> = {
  balanced: "模板1",
  anchorRush: "模板2",
  hazardRush: "模板3",
};

const segmentTemplateOptionLabels: Record<SegmentTemplateOption, string> = {
  random: "随机模板",
  ...templateLibraryLabels,
};

const templateLibraryModifiers: Record<TemplateLibraryKey, {
  spacingScale: number;
  redChanceScale: number;
  firstBlueOffset: number;
  hazardChanceScale: number;
  slotIntervalScale: number;
}> = {
  balanced: {
    spacingScale: 1,
    redChanceScale: 1,
    firstBlueOffset: 0,
    hazardChanceScale: 1,
    slotIntervalScale: 1,
  },
  anchorRush: {
    spacingScale: 0.86,
    redChanceScale: 0.92,
    firstBlueOffset: 1,
    hazardChanceScale: 0.9,
    slotIntervalScale: 1.08,
  },
  hazardRush: {
    spacingScale: 1.08,
    redChanceScale: 1.14,
    firstBlueOffset: -1,
    hazardChanceScale: 1.18,
    slotIntervalScale: 0.82,
  },
};

let segmentDifficultyConfigs: SegmentDifficultyConfig[] = [];
let latestSegmentPlans: SegmentGenerationPlan[] = [];

const INITIAL_PREGEN_ANCHORS = 6;

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

const difficultyProfiles = createDefaultDifficultyProfiles();
const defaultDifficultyProfiles = createDefaultDifficultyProfiles();
let activeDifficultyLevel: DifficultyLevel = getDefaultDifficultyLevel();
let editDifficultyLevel: DifficultyLevel = activeDifficultyLevel;

const cfg = {
  anchorSidePadding: 70,
  maxStretch: 115,
};

const anchorCfg = {
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
};

const hazardCfg = { ...defaultHazardCfg };

const anchorFieldDefs: Array<{ key: string; label: string; min: number; max: number; step: number; integer?: boolean }> = [
  { key: "spacingMin", label: "锚点间距最小(px)", min: 70, max: 260, step: 1, integer: true },
  { key: "spacingMax", label: "锚点间距最大(px)", min: 90, max: 320, step: 1, integer: true },
  { key: "spacingDifficultyStartMeters", label: "间距增压起点(m)", min: 0, max: 260, step: 1, integer: true },
  { key: "spacingDifficultyFullMeters", label: "间距增压满值(m)", min: 1, max: 420, step: 1, integer: true },
  { key: "spacingBonusMin", label: "额外间距最小(px)", min: 0, max: 180, step: 1, integer: true },
  { key: "spacingBonusMax", label: "额外间距最大(px)", min: 0, max: 260, step: 1, integer: true },
  { key: "redChanceStart", label: "红锚点起始概率", min: 0.05, max: 0.95, step: 0.01 },
  { key: "redChanceEnd", label: "红锚点终值概率", min: 0.05, max: 0.95, step: 0.01 },
  { key: "redChanceFullMeters", label: "红锚点满值米数", min: 10, max: 420, step: 1, integer: true },
  { key: "firstBlueAnchorCount", label: "开局强制蓝锚数量", min: 0, max: 20, step: 1, integer: true },
];

const hazardFieldDefs: Array<{ key: string; label: string; min: number; max: number; step: number; integer?: boolean }> = [
  { key: "baseTrackUnlockMeters", label: "基础轨道解锁(m)", min: 0, max: 260, step: 1, integer: true },
  { key: "gearUnlockMeters", label: "齿轮解锁(m)", min: 0, max: 320, step: 1, integer: true },
  { key: "damageTrackUnlockMeters", label: "伤害轨道解锁(m)", min: 0, max: 360, step: 1, integer: true },
  { key: "baseTrackSlotInterval", label: "基础轨道最小槽位间隔", min: 1, max: 10, step: 1, integer: true },
  { key: "baseTrackSpawnChance", label: "基础轨道起始概率", min: 0.05, max: 1, step: 0.01 },
  { key: "baseTrackSpawnChanceMax", label: "基础轨道满值概率", min: 0.05, max: 1, step: 0.01 },
  { key: "damageTrackSlotInterval", label: "伤害轨道最小槽位间隔", min: 1, max: 10, step: 1, integer: true },
  { key: "damageTrackSpawnChance", label: "伤害轨道起始概率", min: 0.05, max: 1, step: 0.01 },
  { key: "damageTrackSpawnChanceMax", label: "伤害轨道满值概率", min: 0.05, max: 1, step: 0.01 },
  { key: "gearSlotInterval", label: "齿轮最小槽位间隔", min: 1, max: 10, step: 1, integer: true },
  { key: "gearSpawnChance", label: "齿轮起始概率", min: 0.05, max: 1, step: 0.01 },
  { key: "gearSpawnChanceMax", label: "齿轮满值概率", min: 0.05, max: 1, step: 0.01 },
  { key: "hazardDensityStartMeters", label: "障碍增密起点(m)", min: 0, max: 360, step: 1, integer: true },
  { key: "hazardDensityFullMeters", label: "障碍增密满值(m)", min: 10, max: 520, step: 1, integer: true },
];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function clamp01(v) {
  return clamp(v, 0, 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalizeHazardCfgObject(target, fallback = defaultHazardCfg) {
  for (const def of hazardFieldDefs) {
    let v = Number(target[def.key]);
    if (!Number.isFinite(v)) v = fallback[def.key];
    v = clamp(v, def.min, def.max);
    if (def.integer || hazardIntegerKeys.has(def.key)) v = Math.round(v);
    target[def.key] = v;
  }
  if (target.baseTrackSpawnChance > target.baseTrackSpawnChanceMax) {
    [target.baseTrackSpawnChance, target.baseTrackSpawnChanceMax] = [target.baseTrackSpawnChanceMax, target.baseTrackSpawnChance];
  }
  if (target.damageTrackSpawnChance > target.damageTrackSpawnChanceMax) {
    [target.damageTrackSpawnChance, target.damageTrackSpawnChanceMax] = [target.damageTrackSpawnChanceMax, target.damageTrackSpawnChance];
  }
  if (target.gearSpawnChance > target.gearSpawnChanceMax) {
    [target.gearSpawnChance, target.gearSpawnChanceMax] = [target.gearSpawnChanceMax, target.gearSpawnChance];
  }
  if (target.hazardDensityStartMeters >= target.hazardDensityFullMeters) {
    target.hazardDensityFullMeters = target.hazardDensityStartMeters + 1;
  }
}

function normalizeAnchorCfgObject(target, fallback = defaultDifficultyProfiles.normal.anchor) {
  for (const def of anchorFieldDefs) {
    let v = Number(target[def.key]);
    if (!Number.isFinite(v)) v = fallback[def.key];
    v = clamp(v, def.min, def.max);
    if (def.integer) v = Math.round(v);
    target[def.key] = v;
  }
  if (target.spacingMin > target.spacingMax) {
    [target.spacingMin, target.spacingMax] = [target.spacingMax, target.spacingMin];
  }
  if (target.spacingBonusMin > target.spacingBonusMax) {
    [target.spacingBonusMin, target.spacingBonusMax] = [target.spacingBonusMax, target.spacingBonusMin];
  }
  if (target.redChanceStart > target.redChanceEnd) {
    [target.redChanceStart, target.redChanceEnd] = [target.redChanceEnd, target.redChanceStart];
  }
  if (target.spacingDifficultyStartMeters >= target.spacingDifficultyFullMeters) {
    target.spacingDifficultyFullMeters = target.spacingDifficultyStartMeters + 1;
  }
}

function normalizeDifficultyProfiles() {
  for (const level of DIFFICULTY_LEVELS) {
    normalizeAnchorCfgObject(difficultyProfiles[level].anchor, defaultDifficultyProfiles[level].anchor);
    normalizeHazardCfgObject(difficultyProfiles[level].hazard, defaultDifficultyProfiles[level].hazard);
  }
}

function applyDifficultyProfile(anchorSource, hazardSource) {
  Object.assign(anchorCfg, anchorSource);
  Object.assign(hazardCfg, hazardSource);
  normalizeAnchorCfgObject(anchorCfg, anchorSource);
  normalizeHazardCfgObject(hazardCfg, hazardSource);
}

function applyActiveDifficultyProfile() {
  const profile = difficultyProfiles[activeDifficultyLevel];
  applyDifficultyProfile(profile.anchor, profile.hazard);
}

function getSegmentCountByMeters(targetMeters: number) {
  return Math.max(1, Math.ceil(targetMeters / TEMPLATE_UNIT_METERS));
}

function pickRandomTemplateLibraryKey(): TemplateLibraryKey {
  return TEMPLATE_LIBRARY_KEYS[randInt(0, TEMPLATE_LIBRARY_KEYS.length - 1)];
}

type ConfigTemplateGroups = Record<DifficultyLevel, string[]>;
const EMPTY_TEMPLATE_GROUPS: ConfigTemplateGroups = { easy: [], normal: [], hard: [] };
let configTemplateGroups: ConfigTemplateGroups = { ...EMPTY_TEMPLATE_GROUPS };
let configTemplateGroupsLoaded = false;
let configTemplateGroupsPromise: Promise<ConfigTemplateGroups> | null = null;

async function fetchConfigTemplateGroups(): Promise<ConfigTemplateGroups> {
  try {
    const resp = await fetch("/api/template-library/list");
    const data = await resp.json().catch(() => null);
    if (resp.ok && data?.ok && data.groups && typeof data.groups === "object") {
      const groups = data.groups as Record<string, unknown>;
      const next: ConfigTemplateGroups = { easy: [], normal: [], hard: [] };
      for (const level of DIFFICULTY_LEVELS) {
        const list = groups[level];
        if (Array.isArray(list)) next[level] = list.filter((v): v is string => typeof v === "string");
      }
      return next;
    }
  } catch {
    // ignore
  }
  return { easy: [], normal: [], hard: [] };
}

function ensureConfigTemplateFilesLoaded(): Promise<ConfigTemplateGroups> {
  if (configTemplateGroupsLoaded) return Promise.resolve(configTemplateGroups);
  if (configTemplateGroupsPromise) return configTemplateGroupsPromise;
  configTemplateGroupsPromise = fetchConfigTemplateGroups().then((groups) => {
    configTemplateGroups = groups;
    configTemplateGroupsLoaded = true;
    configTemplateGroupsPromise = null;
    return groups;
  });
  return configTemplateGroupsPromise;
}

function refreshConfigTemplateFiles(): Promise<ConfigTemplateGroups> {
  configTemplateGroupsLoaded = false;
  configTemplateGroupsPromise = null;
  return ensureConfigTemplateFilesLoaded();
}

const templateLibraryCache: Record<DifficultyLevel, Record<string, any>> = { easy: {}, normal: {}, hard: {} };

async function fetchTemplateLibraryFile(difficulty: DifficultyLevel, name: string): Promise<any | null> {
  const cached = templateLibraryCache[difficulty]?.[name];
  if (cached) return cached;
  try {
    const url = `/api/template-library/get?difficulty=${encodeURIComponent(difficulty)}&name=${encodeURIComponent(name)}`;
    const resp = await fetch(url);
    const data = await resp.json().catch(() => null);
    if (resp.ok && data?.ok && data.library && typeof data.library === "object") {
      templateLibraryCache[difficulty][name] = data.library;
      return data.library;
    }
  } catch {
    // ignore
  }
  return null;
}

async function preloadFixedTemplatesForPlans(plans: SegmentGenerationPlan[]): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  const seen = new Set<string>();
  for (const plan of plans) {
    if (plan.templateMode !== "fixed" || !plan.templateLibraryFile) continue;
    const key = `${plan.difficultyLevel}/${plan.templateLibraryFile}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (templateLibraryCache[plan.difficultyLevel]?.[plan.templateLibraryFile]) continue;
    tasks.push(fetchTemplateLibraryFile(plan.difficultyLevel, plan.templateLibraryFile));
  }
  if (tasks.length) await Promise.all(tasks);
}

function metersToY(meter: number) {
  return WORLD_START_Y - meter * PX_PER_METER;
}

function applyFixedTemplatesToMapResult(mapResult: any, plans: SegmentGenerationPlan[]) {
  if (!mapResult || !plans?.length) return;

  type Anchor = { x: number; y: number; isRed?: boolean };
  type Gear = { x: number; y: number; radius: number };
  type Track = { x: number; y: number; mode: string; isRed?: boolean };

  const anchors: Anchor[] = mapResult.anchors;
  const gears: Gear[] = mapResult.gears;
  const tracks: Track[] = mapResult.tracks;

  const baseAnchorY = WORLD_START_Y;

  for (let i = 0; i < plans.length; i += 1) {
    const plan = plans[i];
    if (plan.templateMode !== "fixed" || !plan.templateLibraryFile) continue;
    const library = templateLibraryCache[plan.difficultyLevel]?.[plan.templateLibraryFile];
    if (!library) continue;

    const tpl = Array.isArray(library.templates) ? library.templates[0] : null;
    if (!tpl) continue;

    const startMeter = i * TEMPLATE_UNIT_METERS;
    const endMeter = startMeter + TEMPLATE_UNIT_METERS;
    const isFirstSegment = i === 0;
    const isLastSegment = i === plans.length - 1;

    const inRange = (meter: number) => {
      if (meter < startMeter) return false;
      return isLastSegment ? meter <= endMeter : meter < endMeter;
    };

    for (let j = anchors.length - 1; j >= 0; j -= 1) {
      const m = yToMeters(anchors[j].y);
      if (!inRange(m)) continue;
      if (isFirstSegment && anchors[j].y === baseAnchorY) continue;
      anchors.splice(j, 1);
    }
    for (let j = gears.length - 1; j >= 0; j -= 1) {
      if (inRange(yToMeters(gears[j].y))) gears.splice(j, 1);
    }
    for (let j = tracks.length - 1; j >= 0; j -= 1) {
      if (inRange(yToMeters(tracks[j].y))) tracks.splice(j, 1);
    }

    for (const a of tpl.anchors || []) {
      const worldMeter = startMeter + Number(a.localMeter || 0);
      const y = metersToY(worldMeter);
      if (isFirstSegment && y === baseAnchorY) continue;
      anchors.push({ x: Number(a.x), y, isRed: !!a.isRed });
    }
    for (const g of tpl.gears || []) {
      const worldMeter = startMeter + Number(g.localMeter || 0);
      gears.push({ x: Number(g.x), y: metersToY(worldMeter), radius: Number(g.radius) });
    }
    for (const t of tpl.tracks || []) {
      const worldMeter = startMeter + Number(t.localMeter || 0);
      tracks.push({ x: Number(t.x), y: metersToY(worldMeter), mode: String(t.mode), isRed: !!t.isRed });
    }
  }

  anchors.sort((a, b) => b.y - a.y);
  gears.sort((a, b) => b.y - a.y);
  tracks.sort((a, b) => b.y - a.y);
}

function createDefaultSegmentDifficultyConfig(segmentIndex: number, segmentCount: number): SegmentDifficultyConfig {
  const ratio = segmentCount <= 1 ? 0 : segmentIndex / (segmentCount - 1);
  const level: DifficultyLevel = ratio < 0.34 ? "easy" : ratio < 0.72 ? "normal" : "hard";
  return {
    difficultyLevel: level,
    templateMode: "random",
    templateLibraryKey: "balanced",
    resolvedTemplateLibraryKey: "balanced",
    templateLibraryFile: null,
  };
}

function normalizeSegmentDifficultyConfig(config, fallback: SegmentDifficultyConfig): SegmentDifficultyConfig {
  const difficultyLevel = DIFFICULTY_LEVELS.includes(config?.difficultyLevel)
    ? config.difficultyLevel
    : fallback.difficultyLevel;
  const templateMode: SegmentTemplateMode = config?.templateMode === "fixed" ? "fixed" : "random";
  const templateLibraryKey = TEMPLATE_LIBRARY_KEYS.includes(config?.templateLibraryKey)
    ? config.templateLibraryKey
    : fallback.templateLibraryKey;
  const rawFile = typeof config?.templateLibraryFile === "string" ? config.templateLibraryFile.trim() : "";
  const templateLibraryFile = rawFile && /^[A-Za-z0-9._-]+\.json$/.test(rawFile) ? rawFile : null;
  return {
    difficultyLevel,
    templateMode,
    templateLibraryKey,
    resolvedTemplateLibraryKey: templateLibraryKey,
    templateLibraryFile,
  };
}

function saveSegmentDifficultyConfigsToStorage() {
  if (!hasSegmentDifficultyEditor) return;
  try {
    localStorage.setItem(MAP_EDITOR_SEGMENT_DIFFICULTY_STORAGE_KEY, JSON.stringify(segmentDifficultyConfigs));
  } catch {
    // ignore
  }
}

function loadSegmentDifficultyConfigsFromStorage() {
  if (!hasSegmentDifficultyEditor) return;
  try {
    const raw = localStorage.getItem(MAP_EDITOR_SEGMENT_DIFFICULTY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    segmentDifficultyConfigs = parsed
      .map((item, index) => normalizeSegmentDifficultyConfig(item, createDefaultSegmentDifficultyConfig(index, parsed.length || 1)));
  } catch {
    // ignore
  }
}

function ensureSegmentDifficultyConfigs(targetMeters: number, save = true) {
  if (!hasSegmentDifficultyEditor) return;
  const segmentCount = getSegmentCountByMeters(targetMeters);
  let changed = false;
  if (segmentDifficultyConfigs.length > segmentCount) {
    segmentDifficultyConfigs = segmentDifficultyConfigs.slice(0, segmentCount);
    changed = true;
  }
  for (let i = 0; i < segmentCount; i += 1) {
    const fallback = createDefaultSegmentDifficultyConfig(i, segmentCount);
    const current = segmentDifficultyConfigs[i];
    const normalized = normalizeSegmentDifficultyConfig(current, fallback);
    if (!current) {
      segmentDifficultyConfigs[i] = normalized;
      changed = true;
      continue;
    }
    if (
      current.difficultyLevel !== normalized.difficultyLevel
      || current.templateMode !== normalized.templateMode
      || current.templateLibraryKey !== normalized.templateLibraryKey
    ) {
      segmentDifficultyConfigs[i] = normalized;
      changed = true;
    }
  }
  if (changed && save) saveSegmentDifficultyConfigsToStorage();
}

function buildSegmentPlanProfile(config: SegmentDifficultyConfig) {
  const mod = templateLibraryModifiers[config.resolvedTemplateLibraryKey];
  const source = difficultyProfiles[config.difficultyLevel];
  const anchor = {
    ...source.anchor,
    spacingMin: source.anchor.spacingMin * mod.spacingScale,
    spacingMax: source.anchor.spacingMax * mod.spacingScale,
    spacingBonusMin: source.anchor.spacingBonusMin * mod.spacingScale,
    spacingBonusMax: source.anchor.spacingBonusMax * mod.spacingScale,
    redChanceStart: source.anchor.redChanceStart * mod.redChanceScale,
    redChanceEnd: source.anchor.redChanceEnd * mod.redChanceScale,
    firstBlueAnchorCount: source.anchor.firstBlueAnchorCount + mod.firstBlueOffset,
  };
  const hazard = {
    ...source.hazard,
    baseTrackSpawnChance: source.hazard.baseTrackSpawnChance * mod.hazardChanceScale,
    baseTrackSpawnChanceMax: source.hazard.baseTrackSpawnChanceMax * mod.hazardChanceScale,
    damageTrackSpawnChance: source.hazard.damageTrackSpawnChance * mod.hazardChanceScale,
    damageTrackSpawnChanceMax: source.hazard.damageTrackSpawnChanceMax * mod.hazardChanceScale,
    gearSpawnChance: source.hazard.gearSpawnChance * mod.hazardChanceScale,
    gearSpawnChanceMax: source.hazard.gearSpawnChanceMax * mod.hazardChanceScale,
    baseTrackSlotInterval: source.hazard.baseTrackSlotInterval * mod.slotIntervalScale,
    damageTrackSlotInterval: source.hazard.damageTrackSlotInterval * mod.slotIntervalScale,
    gearSlotInterval: source.hazard.gearSlotInterval * mod.slotIntervalScale,
  };
  normalizeAnchorCfgObject(anchor, source.anchor);
  normalizeHazardCfgObject(hazard, source.hazard);
  return { anchor, hazard };
}

function buildSegmentGenerationPlans(targetMeters: number): SegmentGenerationPlan[] {
  if (!hasSegmentDifficultyEditor) return [];
  ensureSegmentDifficultyConfigs(targetMeters);
  return segmentDifficultyConfigs.map((config) => {
    const resolvedTemplateLibraryKey = config.templateMode === "random"
      ? pickRandomTemplateLibraryKey()
      : config.templateLibraryKey;
    const resolvedConfig: SegmentDifficultyConfig = {
      ...config,
      resolvedTemplateLibraryKey,
    };
    const profile = buildSegmentPlanProfile(resolvedConfig);
    return {
      ...resolvedConfig,
      ...profile,
    };
  });
}

function getSegmentPlanByMeter(meter: number, plans: SegmentGenerationPlan[]) {
  if (!plans.length) return null;
  const idx = clamp(Math.floor(Math.max(0, meter) / TEMPLATE_UNIT_METERS), 0, plans.length - 1);
  return plans[idx];
}

function saveDifficultyProfilesToStorage() {
  try {
    localStorage.setItem(
      MAP_EDITOR_DIFFICULTY_STORAGE_KEY,
      JSON.stringify({
        activeDifficultyLevel,
        profiles: difficultyProfiles,
      }),
    );
  } catch {
    // ignore
  }
}

function loadLegacyHazardCfg() {
  try {
    const raw = localStorage.getItem(HAZARD_CFG_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    const target = difficultyProfiles.normal.hazard;
    for (const key of Object.keys(defaultHazardCfg)) {
      const val = Number(parsed[key]);
      if (Number.isFinite(val)) target[key] = val;
    }
  } catch {
    // ignore
  }
}

function loadDifficultyProfilesFromStorage() {
  let hasNewState = false;
  try {
    const raw = localStorage.getItem(MAP_EDITOR_DIFFICULTY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const profiles = parsed.profiles;
        for (const level of DIFFICULTY_LEVELS) {
          const storedProfile = profiles && typeof profiles === "object" ? profiles[level] : null;
          if (storedProfile && typeof storedProfile === "object") {
            Object.assign(difficultyProfiles[level].anchor, storedProfile.anchor || {});
            Object.assign(difficultyProfiles[level].hazard, storedProfile.hazard || {});
            hasNewState = true;
          }
        }
        if (typeof parsed.activeDifficultyLevel === "string" && DIFFICULTY_LEVELS.includes(parsed.activeDifficultyLevel as DifficultyLevel)) {
          activeDifficultyLevel = parsed.activeDifficultyLevel as DifficultyLevel;
          editDifficultyLevel = activeDifficultyLevel;
        }
      }
    }
  } catch {
    // ignore
  }
  if (!hasNewState) loadLegacyHazardCfg();
  normalizeDifficultyProfiles();
  applyActiveDifficultyProfile();
}

loadDifficultyProfilesFromStorage();
loadSegmentDifficultyConfigsFromStorage();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function yToMeters(y) {
  return Math.max(0, (WORLD_START_Y - y) / PX_PER_METER);
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
  const forceBlue = state && state.anchorSpawnCount < anchorCfg.firstBlueAnchorCount;
  const dynamicRedChance = calcDynamicRedAnchorChance(
    state ? state.runMeters : 0,
    anchorCfg.redChanceFullMeters,
    anchorCfg.redChanceStart,
    anchorCfg.redChanceEnd,
  );
  const finalIsRed = typeof isRed === "boolean" ? isRed : (forceBlue ? false : Math.random() < dynamicRedChance);
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
  return calcDynamicAnchorSpacingRange(
    state.runMeters,
    anchorCfg.spacingMin,
    anchorCfg.spacingMax,
    anchorCfg.spacingDifficultyStartMeters,
    anchorCfg.spacingDifficultyFullMeters,
    anchorCfg.spacingBonusMin,
    anchorCfg.spacingBonusMax,
  );
}

function getAnchorMaxStepX() {
  return calcAnchorMaxStepX(WORLD_W, cfg.maxStretch);
}

function getFixedAnchorXByCursor(cursor) {
  return calcFixedAnchorXByCursor(cursor, ANCHOR_X_RATIOS, WORLD_W, cfg.anchorSidePadding);
}

function getRandomizedAnchorXByCursor(cursor) {
  return calcRandomizedAnchorXByCursor(cursor, ANCHOR_X_RATIOS, WORLD_W, cfg.anchorSidePadding, rand);
}

function getRandomizedAnchorXBySide(side) {
  return calcRandomizedAnchorXBySide(side, WORLD_W, cfg.anchorSidePadding, rand, randInt);
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
    const pinIsRed = Math.random() < calcDynamicRedAnchorChance(
      state.runMeters,
      anchorCfg.redChanceFullMeters,
      anchorCfg.redChanceStart,
      anchorCfg.redChanceEnd,
    );
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

function addGeneratedSlotAbove(state, segmentPlans: SegmentGenerationPlan[] = []) {
  const spacingRange = getDynamicAnchorSpacingRange(state);
  const spacing = rand(spacingRange.min, spacingRange.max);
  const y = state.generatedTopY - spacing;
  const slotMeters = yToMeters(y);
  const slotPlan = getSegmentPlanByMeter(slotMeters, segmentPlans);
  if (slotPlan) applyDifficultyProfile(slotPlan.anchor, slotPlan.hazard);

  const spawnBaseTrack = shouldSpawnBaseTrackOnNextSlot(state, slotMeters);
  const spawnDamageTrack = shouldSpawnDamageTrackOnNextSlot(state, slotMeters);
  const spawnGear = shouldSpawnGearOnNextSlot(state, slotMeters);

  const selected = pickGeneratedSlot(spawnBaseTrack, spawnDamageTrack, spawnGear, randInt);

  if (selected === "baseTrack") {
    spawnMovingTrackAtY(state, y, "pin");
    state.generatedTopY = y;
    applyGeneratedSlotCounters(selected, state);
    return;
  }

  if (selected === "damageTrack") {
    spawnMovingTrackAtY(state, y, "gear");
    state.generatedTopY = y;
    applyGeneratedSlotCounters(selected, state);
    return;
  }

  if (selected === "gear") {
    spawnGearAtY(state, y);
    applyGeneratedSlotCounters(selected, state);
    return;
  }

  addAnchorAbove(state, y);
  applyGeneratedSlotCounters(selected, state);
}

function generateMap(targetMeters, segmentPlans: SegmentGenerationPlan[] = []) {
  const state = createGeneratorState();
  state.movingTrack = createMovingTrack();
  const firstPlan = segmentPlans[0];
  if (firstPlan) {
    applyDifficultyProfile(firstPlan.anchor, firstPlan.hazard);
  } else {
    applyActiveDifficultyProfile();
  }

  state.anchors.push(createAnchor(WORLD_W * 0.5, WORLD_START_Y, false, state));
  state.anchorSpawnCount += 1;
  state.generatedTopY = WORLD_START_Y;
  state.generatedGearTopY = state.generatedTopY;

  for (let i = 0; i < INITIAL_PREGEN_ANCHORS; i += 1) addAnchorAbove(state);

  while (yToMeters(state.generatedTopY) < targetMeters) {
    state.runMeters = yToMeters(state.generatedTopY);
    const plan = getSegmentPlanByMeter(state.runMeters, segmentPlans);
    if (plan) {
      applyDifficultyProfile(plan.anchor, plan.hazard);
    } else {
      applyActiveDifficultyProfile();
    }
    addGeneratedSlotAbove(state, segmentPlans);
  }

  return {
    targetMeters,
    targetPx: targetMeters * PX_PER_METER,
    anchors: state.anchors.filter((a) => yToMeters(a.y) <= targetMeters),
    gears: state.gears.filter((g) => yToMeters(g.y) <= targetMeters),
    tracks: state.tracks.filter((t) => yToMeters(t.y) <= targetMeters),
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
  const inRange = (y) => yToMeters(y) >= startMeter && yToMeters(y) <= endMeter;
  return {
    anchors: result.anchors.filter((a) => inRange(a.y)),
    gears: result.gears.filter((g) => inRange(g.y)),
    tracks: result.tracks.filter((t) => inRange(t.y)),
  };
}

function roundValue(v, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(v * scale) / scale;
}

function isMeterInTemplateRange(meter, startMeter, endMeter, isLastSegment) {
  if (meter < startMeter) return false;
  if (isLastSegment) return meter <= endMeter;
  return meter < endMeter;
}

function mapAnchorToTemplate(anchor, startMeter) {
  const meter = yToMeters(anchor.y);
  return {
    x: roundValue(anchor.x, 2),
    y: roundValue(anchor.y, 2),
    meter: roundValue(meter),
    localMeter: roundValue(clamp(meter - startMeter, 0, TEMPLATE_UNIT_METERS)),
    isRed: !!anchor.isRed,
  };
}

function mapGearToTemplate(gear, startMeter) {
  const meter = yToMeters(gear.y);
  return {
    x: roundValue(gear.x, 2),
    y: roundValue(gear.y, 2),
    radius: roundValue(gear.radius, 2),
    meter: roundValue(meter),
    localMeter: roundValue(clamp(meter - startMeter, 0, TEMPLATE_UNIT_METERS)),
  };
}

function mapTrackToTemplate(track, startMeter) {
  const meter = yToMeters(track.y);
  return {
    x: roundValue(track.x, 2),
    y: roundValue(track.y, 2),
    mode: track.mode,
    isRed: !!track.isRed,
    meter: roundValue(meter),
    localMeter: roundValue(clamp(meter - startMeter, 0, TEMPLATE_UNIT_METERS)),
  };
}

function buildTemplateSegment(mapResult, segmentIndex, segmentCount) {
  const startMeter = segmentIndex * TEMPLATE_UNIT_METERS;
  const endMeter = Math.min(mapResult.targetMeters, startMeter + TEMPLATE_UNIT_METERS);
  const isLastSegment = segmentIndex === segmentCount - 1;

  const anchors = mapResult.anchors
    .filter((item) => isMeterInTemplateRange(yToMeters(item.y), startMeter, endMeter, isLastSegment))
    .map((item) => mapAnchorToTemplate(item, startMeter));

  const gears = mapResult.gears
    .filter((item) => isMeterInTemplateRange(yToMeters(item.y), startMeter, endMeter, isLastSegment))
    .map((item) => mapGearToTemplate(item, startMeter));

  const tracks = mapResult.tracks
    .filter((item) => isMeterInTemplateRange(yToMeters(item.y), startMeter, endMeter, isLastSegment))
    .map((item) => mapTrackToTemplate(item, startMeter));

  return {
    id: `tpl_${String(segmentIndex + 1).padStart(3, "0")}`,
    index: segmentIndex,
    startMeter,
    endMeter,
    lengthMeters: roundValue(endMeter - startMeter),
    anchors,
    gears,
    tracks,
    summary: {
      anchors: anchors.length,
      redAnchors: anchors.filter((item) => item.isRed).length,
      gears: gears.length,
      tracks: tracks.length,
      pinTracks: tracks.filter((item) => item.mode === "pin").length,
      damageTracks: tracks.filter((item) => item.mode === "gear").length,
    },
  };
}

function createTemplateLibrary(templateCount = TEMPLATE_SEGMENT_COUNT) {
  const normalizedCount = clamp(Math.round(Number(templateCount) || TEMPLATE_SEGMENT_COUNT), TEMPLATE_SEGMENT_COUNT, TEMPLATE_SEGMENT_COUNT);
  const totalMeters = normalizedCount * TEMPLATE_UNIT_METERS;
  const mapResult = generateMap(totalMeters);
  const templates = [];
  for (let i = 0; i < normalizedCount; i += 1) {
    templates.push(buildTemplateSegment(mapResult, i, normalizedCount));
  }

  const totalAnchors = templates.reduce((sum, tpl) => sum + tpl.summary.anchors, 0);
  const totalRedAnchors = templates.reduce((sum, tpl) => sum + tpl.summary.redAnchors, 0);
  const totalGears = templates.reduce((sum, tpl) => sum + tpl.summary.gears, 0);
  const totalTracks = templates.reduce((sum, tpl) => sum + tpl.summary.tracks, 0);

  const profilesSnapshot: Record<string, any> = {};
  for (const level of DIFFICULTY_LEVELS) {
    profilesSnapshot[level] = {
      anchor: { ...difficultyProfiles[level].anchor },
      hazard: { ...difficultyProfiles[level].hazard },
    };
  }

  const library = {
    schema: "jellyball.map-template-library.v1",
    generatedAt: new Date().toISOString(),
    unitMeters: TEMPLATE_UNIT_METERS,
    templateCount: normalizedCount,
    totalMeters,
    activeDifficultyLevel,
    world: {
      width: WORLD_W,
      height: WORLD_H,
      startY: WORLD_START_Y,
      pxPerMeter: PX_PER_METER,
    },
    difficulty: {
      active: {
        anchor: { ...anchorCfg },
        hazard: { ...hazardCfg },
      },
      profiles: profilesSnapshot,
    },
    summary: {
      anchors: totalAnchors,
      redAnchors: totalRedAnchors,
      gears: totalGears,
      tracks: totalTracks,
      pinTracks: templates.reduce((sum, tpl) => sum + tpl.summary.pinTracks, 0),
      damageTracks: templates.reduce((sum, tpl) => sum + tpl.summary.damageTracks, 0),
    },
    templates,
  };

  return { library, mapResult };
}

function setTemplateStatus(message) {
  if (templateStatus) templateStatus.textContent = message;
}

function resetTemplateLibraryStatus(message = "模版库尚未生成。") {
  latestTemplateLibrary = null;
  if (downloadTemplatesBtn) downloadTemplatesBtn.disabled = true;
  setTemplateStatus(message);
}

function generateTemplateLibraryAndRender() {
  if (!downloadTemplatesBtn) return;
  const count = TEMPLATE_SEGMENT_COUNT;
  if (templateCountInput) templateCountInput.value = String(count);
  const { library, mapResult } = createTemplateLibrary(count);
  latestSegmentPlans = [];
  latestTemplateLibrary = library;
  latestResult = mapResult;
  metersInput.value = String(mapResult.targetMeters);
  viewportInput.value = "0";
  syncViewportInput(latestResult);
  renderCurrentViewport();
  downloadTemplatesBtn.disabled = false;
  setTemplateStatus(`已生成 ${count} 段模版（${TEMPLATE_UNIT_METERS}m）。可点击“保存JSON”。`);
}

function makeTemplateLibraryFileName() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const diff = activeDifficultyLevel;
  const count = latestTemplateLibrary?.templateCount || 0;
  return `map_templates_${diff}_${count}x${TEMPLATE_UNIT_METERS}m_${yyyy}${mm}${dd}_${hh}${mi}${ss}.json`;
}

function browserDownloadTemplateLibraryJSON(fileName: string, json: string) {
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setMapSaveStatus(message: string) {
  if (mapSaveStatus) mapSaveStatus.textContent = message;
}

function makeMapFileName() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const meters = Number(latestResult?.targetMeters ?? metersInput.value) || 0;
  return `map_${activeDifficultyLevel}_${Math.round(meters)}m_${yyyy}${mm}${dd}_${hh}${mi}${ss}.json`;
}

function buildMapSnapshot() {
  if (!latestResult) return null;
  const targetMeters = Number(latestResult.targetMeters) || 0;
  const profilesSnapshot: Record<string, any> = {};
  for (const level of DIFFICULTY_LEVELS) {
    profilesSnapshot[level] = {
      anchor: { ...difficultyProfiles[level].anchor },
      hazard: { ...difficultyProfiles[level].hazard },
    };
  }
  const anchors = (latestResult.anchors || []).map((a: any) => ({
    x: roundValue(a.x, 2),
    y: roundValue(a.y, 2),
    meter: roundValue(yToMeters(a.y)),
    isRed: !!a.isRed,
  }));
  const gears = (latestResult.gears || []).map((g: any) => ({
    x: roundValue(g.x, 2),
    y: roundValue(g.y, 2),
    radius: roundValue(g.radius, 2),
    meter: roundValue(yToMeters(g.y)),
  }));
  const tracks = (latestResult.tracks || []).map((t: any) => ({
    x: roundValue(t.x, 2),
    y: roundValue(t.y, 2),
    mode: t.mode,
    isRed: !!t.isRed,
    meter: roundValue(yToMeters(t.y)),
  }));
  return {
    schema: "jellyball.map.v1",
    generatedAt: new Date().toISOString(),
    targetMeters,
    unitMeters: TEMPLATE_UNIT_METERS,
    activeDifficultyLevel,
    world: {
      width: WORLD_W,
      height: WORLD_H,
      startY: WORLD_START_Y,
      pxPerMeter: PX_PER_METER,
    },
    difficulty: {
      active: {
        anchor: { ...anchorCfg },
        hazard: { ...hazardCfg },
      },
      profiles: profilesSnapshot,
    },
    segmentConfigs: hasSegmentDifficultyEditor
      ? segmentDifficultyConfigs.map((c) => ({ ...c }))
      : [],
    segmentPlans: (latestSegmentPlans || []).map((p) => ({
      difficultyLevel: p.difficultyLevel,
      templateMode: p.templateMode,
      templateLibraryKey: p.templateLibraryKey,
      resolvedTemplateLibraryKey: p.resolvedTemplateLibraryKey,
      templateLibraryFile: p.templateLibraryFile,
    })),
    summary: {
      anchors: anchors.length,
      redAnchors: anchors.filter((a) => a.isRed).length,
      gears: gears.length,
      tracks: tracks.length,
      pinTracks: tracks.filter((t) => t.mode === "pin").length,
      damageTracks: tracks.filter((t) => t.mode === "gear").length,
    },
    anchors,
    gears,
    tracks,
  };
}

async function saveCurrentMapJSON() {
  if (!latestResult) {
    setMapSaveStatus("请先生成预览，再保存地图 JSON。");
    return;
  }
  const snapshot = buildMapSnapshot();
  if (!snapshot) {
    setMapSaveStatus("当前没有可保存的地图。");
    return;
  }
  const fileName = makeMapFileName();
  const json = JSON.stringify(snapshot, null, 2);
  try {
    const resp = await fetch("/api/maps/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fileName, map: snapshot }),
    });
    const data = await resp.json().catch(() => null);
    if (resp.ok && data?.ok) {
      setMapSaveStatus(`已保存到 web/src/config/maps/${fileName}`);
      return;
    }
    const msg = data?.error || `HTTP ${resp.status}`;
    browserDownloadTemplateLibraryJSON(fileName, json);
    setMapSaveStatus(`写入仓库目录失败（${msg}），已回退为浏览器下载：${fileName}`);
  } catch (err) {
    browserDownloadTemplateLibraryJSON(fileName, json);
    const msg = err instanceof Error ? err.message : String(err);
    setMapSaveStatus(`未连接 dev 服务器（${msg}），已回退为浏览器下载：${fileName}`);
  }
}

async function downloadTemplateLibraryJSON() {
  if (!downloadTemplatesBtn) return;
  if (!latestTemplateLibrary) {
    setTemplateStatus("请先生成模版库，再保存 JSON。");
    return;
  }
  const fileName = makeTemplateLibraryFileName();
  const json = JSON.stringify(latestTemplateLibrary, null, 2);

  const difficulty: DifficultyLevel = DIFFICULTY_LEVELS.includes(activeDifficultyLevel)
    ? activeDifficultyLevel
    : "easy";
  try {
    const resp = await fetch("/api/template-library/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, name: fileName, library: latestTemplateLibrary }),
    });
    const data = await resp.json().catch(() => null);
    if (resp.ok && data?.ok) {
      setTemplateStatus(`已保存到 web/src/config/map_templates/${difficulty}/${fileName}`);
      refreshConfigTemplateFiles().then(() => renderSegmentDifficultyConfigs());
      return;
    }
    const msg = data?.error || `HTTP ${resp.status}`;
    browserDownloadTemplateLibraryJSON(fileName, json);
    setTemplateStatus(`写入仓库目录失败（${msg}），已回退为浏览器下载：${fileName}`);
  } catch (err) {
    browserDownloadTemplateLibraryJSON(fileName, json);
    const msg = err instanceof Error ? err.message : String(err);
    setTemplateStatus(`未连接 dev 服务器（${msg}），已回退为浏览器下载：${fileName}`);
  }
}

function buildMapResultFromLibrary(library: any) {
  const anchors: any[] = [];
  const gears: any[] = [];
  const tracks: any[] = [];
  for (const tpl of library?.templates || []) {
    for (const a of tpl.anchors || []) anchors.push({ x: a.x, y: a.y, isRed: !!a.isRed });
    for (const g of tpl.gears || []) gears.push({ x: g.x, y: g.y, radius: g.radius });
    for (const t of tpl.tracks || []) tracks.push({ x: t.x, y: t.y, mode: t.mode, isRed: !!t.isRed });
  }
  return {
    targetMeters: library?.totalMeters ?? TEMPLATE_UNIT_METERS,
    anchors,
    gears,
    tracks,
  };
}

function applyLoadedTemplateLibrary(library: any, sourceName: string) {
  latestSegmentPlans = [];
  latestTemplateLibrary = library;
  latestResult = buildMapResultFromLibrary(library);
  metersInput.value = String(latestResult.targetMeters);
  viewportInput.value = "0";
  syncViewportInput(latestResult);
  renderCurrentViewport();
  if (downloadTemplatesBtn) downloadTemplatesBtn.disabled = false;
  setTemplateStatus(`已加载：${sourceName}`);
}

const templateFilePicker: HTMLInputElement = (() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.style.display = "none";
  input.addEventListener("change", handleTemplateFilePicked);
  document.body.appendChild(input);
  return input;
})();

function handleTemplateFilePicked() {
  const file = templateFilePicker.files?.[0];
  templateFilePicker.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const library = JSON.parse(String(reader.result));
      applyLoadedTemplateLibrary(library, file.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTemplateStatus(`JSON 解析失败：${msg}`);
    }
  };
  reader.onerror = () => {
    setTemplateStatus(`读取文件失败：${reader.error?.message || "未知错误"}`);
  };
  reader.readAsText(file);
}

function loadPreviewTemplateAndRender() {
  templateFilePicker.click();
}

function formatDifficultyValue(v, integer = false) {
  return integer ? String(Math.round(v)) : String(Number(v.toFixed(3)));
}

function setDifficultyPanelVisible(visible) {
  difficultyPanel.classList.toggle("is-hidden", !visible);
  difficultyPanel.setAttribute("aria-hidden", visible ? "false" : "true");
}

function openSegmentConfigPanel() {
  if (!hasSegmentDifficultyEditor) return;
  setDifficultyPanelVisible(true);
  const firstSelect = segmentConfigList?.querySelector<HTMLSelectElement>('select[data-field="difficultyLevel"]');
  if (firstSelect) {
    firstSelect.focus();
  } else {
    segmentConfigList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function createSelectOptions<T extends string>(
  options: T[],
  labels: Record<T, string>,
  selectedValue: T,
) {
  return options
    .map((value) => `<option value="${value}"${value === selectedValue ? " selected" : ""}>${labels[value]}</option>`)
    .join("");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      default: return "&#39;";
    }
  });
}

function buildTemplateSelectOptionsHTML(config: SegmentDifficultyConfig) {
  const files = configTemplateGroups[config.difficultyLevel] || [];
  const fileMatches = config.templateMode === "fixed"
    && !!config.templateLibraryFile
    && files.includes(config.templateLibraryFile);
  const parts: string[] = [];
  parts.push(`<option value="random"${!fileMatches ? " selected" : ""}>随机模板</option>`);

  if (!files.length) {
    parts.push(`<option value="" disabled>— ${escapeHtml(config.difficultyLevel)}/ 下暂无 JSON —</option>`);
  } else {
    for (const fileName of files) {
      const escaped = escapeHtml(fileName);
      const selected = fileMatches && config.templateLibraryFile === fileName ? " selected" : "";
      parts.push(`<option value="file:${escaped}"${selected}>${escaped}</option>`);
    }
    if (config.templateMode === "fixed" && config.templateLibraryFile && !fileMatches) {
      const escaped = escapeHtml(config.templateLibraryFile);
      parts.push(`<option value="file:${escaped}" disabled>${escaped}（不在 ${escapeHtml(config.difficultyLevel)}/ 下）</option>`);
    }
  }

  return parts.join("");
}

function renderSegmentDifficultyConfigs() {
  if (!segmentConfigList) return;
  segmentConfigList.innerHTML = "";
  const segmentCount = segmentDifficultyConfigs.length;
  if (!segmentCount) return;

  const difficultyLabelMap = difficultyLevelLabels as Record<DifficultyLevel, string>;

  for (let i = 0; i < segmentCount; i += 1) {
    const config = segmentDifficultyConfigs[i];
    const startMeter = i * TEMPLATE_UNIT_METERS;
    const endMeter = startMeter + TEMPLATE_UNIT_METERS;

    const row = document.createElement("div");
    row.className = "segment-config-row";

    const range = document.createElement("div");
    range.className = "segment-config__range";
    range.textContent = `${startMeter}-${endMeter}m`;

    const difficultyLabel = document.createElement("label");
    difficultyLabel.innerHTML = `
      难度
      <select data-segment-index="${i}" data-field="difficultyLevel">
        ${createSelectOptions(DIFFICULTY_LEVELS, difficultyLabelMap, config.difficultyLevel)}
      </select>
    `;

    const templateLabel = document.createElement("label");
    templateLabel.innerHTML = `
      模板
      <select data-segment-index="${i}" data-field="templateOption">
        ${buildTemplateSelectOptionsHTML(config)}
      </select>
    `;

    row.appendChild(range);
    row.appendChild(difficultyLabel);
    row.appendChild(templateLabel);
    segmentConfigList.appendChild(row);
  }

  const selects = segmentConfigList.querySelectorAll<HTMLSelectElement>("select[data-segment-index][data-field]");
  for (const select of selects) {
    select.addEventListener("change", onSegmentConfigFieldChange);
  }
}

function onSegmentConfigFieldChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const index = Number(select.dataset.segmentIndex);
  const field = select.dataset.field;
  if (!Number.isInteger(index) || index < 0 || index >= segmentDifficultyConfigs.length || !field) return;
  const config = segmentDifficultyConfigs[index];

  if (field === "difficultyLevel" && DIFFICULTY_LEVELS.includes(select.value as DifficultyLevel)) {
    config.difficultyLevel = select.value as DifficultyLevel;
  } else if (field === "templateOption") {
    const raw = select.value;
    if (raw === "random") {
      config.templateMode = "random";
      config.templateLibraryFile = null;
    } else if (raw.startsWith("file:")) {
      const fileName = raw.slice(5);
      if (/^[A-Za-z0-9._-]+\.json$/.test(fileName)) {
        config.templateMode = "fixed";
        config.templateLibraryFile = fileName;
      }
    }
  }

  config.resolvedTemplateLibraryKey = config.templateLibraryKey;
  saveSegmentDifficultyConfigsToStorage();
  renderSegmentDifficultyConfigs();
  generateAndRender(false);
}

function createDifficultyGroup(title, defs, source, section) {
  const group = document.createElement("section");
  group.className = "difficulty-group";

  const head = document.createElement("h3");
  head.textContent = title;
  group.appendChild(head);

  const grid = document.createElement("div");
  grid.className = "difficulty-group__grid";
  for (const def of defs) {
    const label = document.createElement("label");
    label.className = "difficulty-field";

    const text = document.createElement("span");
    text.textContent = def.label;

    const input = document.createElement("input");
    input.type = "number";
    input.min = String(def.min);
    input.max = String(def.max);
    input.step = String(def.step);
    input.value = formatDifficultyValue(Number(source[def.key]), !!def.integer);
    input.dataset.section = section;
    input.dataset.key = def.key;
    input.addEventListener("change", onDifficultyFieldChange);

    label.appendChild(text);
    label.appendChild(input);
    grid.appendChild(label);
  }

  group.appendChild(grid);
  return group;
}

function renderDifficultyFields() {
  if (!difficultyFields) return;
  const profile = difficultyProfiles[editDifficultyLevel];
  difficultyFields.innerHTML = "";
  difficultyFields.appendChild(createDifficultyGroup("锚点参数", anchorFieldDefs, profile.anchor, "anchor"));
  difficultyFields.appendChild(createDifficultyGroup("障碍参数", hazardFieldDefs, profile.hazard, "hazard"));
}

function setActiveDifficultyLevel(level, regenerate = true) {
  if (!DIFFICULTY_LEVELS.includes(level)) return;
  activeDifficultyLevel = level;
  editDifficultyLevel = level;
  if (difficultyActiveSelect) difficultyActiveSelect.value = level;
  if (difficultyEditSelect) difficultyEditSelect.value = level;
  renderDifficultyFields();
  applyActiveDifficultyProfile();
  saveDifficultyProfilesToStorage();
  if (regenerate) {
    generateAndRender(false);
  } else {
    renderCurrentViewport();
  }
}

function onDifficultyFieldChange(e) {
  const input = e.target as HTMLInputElement;
  const section = input.dataset.section;
  const key = input.dataset.key;
  if (!section || !key) return;

  const profile = difficultyProfiles[editDifficultyLevel];
  const defs = section === "anchor" ? anchorFieldDefs : hazardFieldDefs;
  const def = defs.find((item) => item.key === key);
  if (!def) return;

  const target = section === "anchor" ? profile.anchor : profile.hazard;
  let next = Number(input.value);
  if (!Number.isFinite(next)) next = Number(target[key]);
  next = clamp(next, def.min, def.max);
  if (def.integer) next = Math.round(next);
  target[key] = next;

  normalizeDifficultyProfiles();
  input.value = formatDifficultyValue(Number(target[key]), !!def.integer);
  saveDifficultyProfilesToStorage();

  if (hasSegmentDifficultyEditor || editDifficultyLevel === activeDifficultyLevel) {
    applyActiveDifficultyProfile();
    generateAndRender(false);
  }
}

function resetDifficultyLevel(level) {
  Object.assign(difficultyProfiles[level].anchor, defaultDifficultyProfiles[level].anchor);
  Object.assign(difficultyProfiles[level].hazard, defaultDifficultyProfiles[level].hazard);
}

function initDifficultyPanel() {
  const options = DIFFICULTY_LEVELS
    .map((level) => `<option value="${level}">${difficultyLevelLabels[level]}</option>`)
    .join("");
  if (difficultyActiveSelect) {
    difficultyActiveSelect.innerHTML = options;
    difficultyActiveSelect.value = activeDifficultyLevel;
  }
  if (difficultyEditSelect) {
    difficultyEditSelect.innerHTML = options;
    difficultyEditSelect.value = editDifficultyLevel;
  }
  renderDifficultyFields();
  renderSegmentDifficultyConfigs();

  if (hasSegmentDifficultyEditor) {
    ensureConfigTemplateFilesLoaded().then(() => renderSegmentDifficultyConfigs());
  }

  difficultyPanelBtn.addEventListener("click", () => {
    const hidden = difficultyPanel.classList.contains("is-hidden");
    setDifficultyPanelVisible(hidden);
    if (hidden && hasSegmentDifficultyEditor) {
      refreshConfigTemplateFiles().then(() => renderSegmentDifficultyConfigs());
    }
  });

  difficultyPanelCloseBtn.addEventListener("click", () => setDifficultyPanelVisible(false));

  if (difficultyActiveSelect) {
    difficultyActiveSelect.addEventListener("change", () => {
      setActiveDifficultyLevel(difficultyActiveSelect.value as DifficultyLevel, true);
    });
  }

  if (difficultyEditSelect) {
    difficultyEditSelect.addEventListener("change", () => {
      editDifficultyLevel = difficultyEditSelect.value as DifficultyLevel;
      renderDifficultyFields();
    });
  }

  if (difficultyUseEditedBtn) {
    difficultyUseEditedBtn.addEventListener("click", () => {
      setActiveDifficultyLevel(editDifficultyLevel, true);
    });
  }

  if (difficultyResetLevelBtn) {
    difficultyResetLevelBtn.addEventListener("click", () => {
      resetDifficultyLevel(editDifficultyLevel);
      normalizeDifficultyProfiles();
      saveDifficultyProfilesToStorage();
      renderDifficultyFields();
      if (hasSegmentDifficultyEditor || editDifficultyLevel === activeDifficultyLevel) {
        applyActiveDifficultyProfile();
        generateAndRender(false);
      }
    });
  }

  if (difficultyResetAllBtn) {
    difficultyResetAllBtn.addEventListener("click", () => {
      for (const level of DIFFICULTY_LEVELS) resetDifficultyLevel(level);
      normalizeDifficultyProfiles();
      applyActiveDifficultyProfile();
      saveDifficultyProfilesToStorage();
      renderDifficultyFields();
      generateAndRender(false);
    });
  }
}

function renderStats(result, viewportData, startMeter, endMeter) {
  const redAnchors = result.anchors.filter((a) => a.isRed).length;
  const blueAnchors = result.anchors.length - redAnchors;
  const pinTracks = result.tracks.filter((t) => t.mode === "pin");
  const trackGears = result.tracks.filter((t) => t.mode === "gear");
  const redTrackPins = pinTracks.filter((t) => t.isRed).length;

  const cards: Array<{ label: string; value: string | number; action?: string }> = [
    ...(hasSegmentDifficultyEditor
      ? [{ label: "分段配置", value: `${Math.max(1, latestSegmentPlans.length || segmentDifficultyConfigs.length)} 段（50m/段）`, action: "open-segment-config" }]
      : [{ label: "难度档位", value: difficultyLevelLabels[activeDifficultyLevel] }]),
    { label: "总锚点", value: result.anchors.length },
    { label: "红锚点", value: redAnchors },
    { label: "蓝锚点", value: blueAnchors },
    { label: "齿轮", value: result.gears.length },
    { label: "轨道-pin", value: pinTracks.length },
    { label: "轨道-gear", value: trackGears.length },
    { label: "红轨道-pin", value: redTrackPins },
    { label: "当前屏锚点", value: viewportData.anchors.length },
    { label: "当前屏齿轮", value: viewportData.gears.length },
    { label: "当前屏轨道", value: viewportData.tracks.length },
    { label: "当前屏范围", value: `${startMeter.toFixed(1)}-${endMeter.toFixed(1)}m` },
  ];

  statsPanel.innerHTML = cards
    .map(
      (card) => `
        <div class="stat-card${card.action ? " stat-card--action" : ""}"${card.action ? ` data-action="${card.action}" role="button" tabindex="0"` : ""}>
          <div class="stat-card__label">${card.label}</div>
          <div class="stat-card__value">${card.value}</div>
        </div>
      `,
    )
    .join("");
}

statsPanel.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const actionCard = target.closest<HTMLElement>("[data-action]");
  if (!actionCard) return;
  const action = actionCard.dataset.action;
  if (action === "open-segment-config") {
    openSegmentConfigPanel();
  }
});

statsPanel.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement;
  const actionCard = target.closest<HTMLElement>("[data-action]");
  if (!actionCard) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  const action = actionCard.dataset.action;
  if (action === "open-segment-config") {
    openSegmentConfigPanel();
  }
});

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
    const py = padY + ((endMeter * PX_PER_METER) - (m * PX_PER_METER)) * yScale;
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
  const toY = (y) => {
    const meters = yToMeters(y);
    return padY + ((endMeter * PX_PER_METER) - (meters * PX_PER_METER)) * yScale;
  };

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

async function generateAndRender(resetViewport = true) {
  const meters = clamp(Number(metersInput.value) || 200, 50, 1000);
  metersInput.value = String(meters);
  let segmentPlans: SegmentGenerationPlan[] = [];
  if (hasSegmentDifficultyEditor) {
    ensureSegmentDifficultyConfigs(meters);
    segmentPlans = buildSegmentGenerationPlans(meters);
    latestSegmentPlans = segmentPlans;
    renderSegmentDifficultyConfigs();
  } else {
    latestSegmentPlans = [];
  }

  if (segmentPlans.some((p) => p.templateMode === "fixed" && p.templateLibraryFile)) {
    await preloadFixedTemplatesForPlans(segmentPlans);
  }

  latestResult = generateMap(meters, segmentPlans);
  applyFixedTemplatesToMapResult(latestResult, segmentPlans);
  resetTemplateLibraryStatus("当前预览为临时随机结果，若要存档请先生成模版库。");
  if (resetViewport) viewportInput.value = "0";
  syncViewportInput(latestResult);
  renderCurrentViewport();
}

initDifficultyPanel();

generateBtn.addEventListener("click", () => generateAndRender(true));
regenBtn.addEventListener("click", () => generateAndRender(false));
if (generateTemplatesBtn) {
  generateTemplatesBtn.addEventListener("click", generateTemplateLibraryAndRender);
}
if (loadPreviewTemplatesBtn) {
  loadPreviewTemplatesBtn.addEventListener("click", loadPreviewTemplateAndRender);
}
if (downloadTemplatesBtn) {
  downloadTemplatesBtn.addEventListener("click", downloadTemplateLibraryJSON);
}
if (saveMapBtn) {
  saveMapBtn.addEventListener("click", saveCurrentMapJSON);
}

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

if (hasSegmentDifficultyEditor) {
  metersInput.addEventListener("input", () => {
    const meters = clamp(Number(metersInput.value) || 200, 50, 1000);
    ensureSegmentDifficultyConfigs(meters, false);
    renderSegmentDifficultyConfigs();
  });
}

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
