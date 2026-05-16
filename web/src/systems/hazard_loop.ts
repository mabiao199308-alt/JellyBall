export type GeneratedSlotType = "baseTrack" | "damageTrack" | "gear" | "anchor";

export function pickGeneratedSlot(
  spawnBaseTrack: boolean,
  spawnDamageTrack: boolean,
  spawnGear: boolean,
  randInt: (min: number, max: number) => number,
): GeneratedSlotType {
  const candidates: GeneratedSlotType[] = [];
  if (spawnBaseTrack) candidates.push("baseTrack");
  if (spawnDamageTrack) candidates.push("damageTrack");
  if (spawnGear) candidates.push("gear");
  return candidates.length > 0 ? candidates[randInt(0, candidates.length - 1)] : "anchor";
}

export function applyGeneratedSlotCounters(
  selected: GeneratedSlotType,
  counters: { baseTrackSlotsSinceSpawn: number; damageTrackSlotsSinceSpawn: number; gearSlotsSinceSpawn: number },
) {
  if (selected === "baseTrack") {
    counters.baseTrackSlotsSinceSpawn = 0;
    counters.damageTrackSlotsSinceSpawn += 1;
    counters.gearSlotsSinceSpawn += 1;
    return;
  }
  if (selected === "damageTrack") {
    counters.damageTrackSlotsSinceSpawn = 0;
    counters.baseTrackSlotsSinceSpawn += 1;
    counters.gearSlotsSinceSpawn += 1;
    return;
  }
  if (selected === "gear") {
    counters.gearSlotsSinceSpawn = 0;
    counters.baseTrackSlotsSinceSpawn += 1;
    counters.damageTrackSlotsSinceSpawn += 1;
    return;
  }
  counters.baseTrackSlotsSinceSpawn += 1;
  counters.damageTrackSlotsSinceSpawn += 1;
  counters.gearSlotsSinceSpawn += 1;
}
