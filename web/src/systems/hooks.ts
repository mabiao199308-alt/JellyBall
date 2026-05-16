export function canTryAnchorHook(world: { hookCooldown: number; state: string; hasHookedSinceLaunch: boolean }) {
  if (world.hookCooldown > 0 || world.state === "gameover") return false;
  if (world.hasHookedSinceLaunch) return false;
  return true;
}

export function getAnchorHookHitRadius(cfg: { ballRadius: number; hookRadius: number }, anchor: { radius: number }) {
  return cfg.ballRadius + cfg.hookRadius + anchor.radius;
}

export function canHookCandidate(
  anchor: unknown,
  context: {
    activeAnchor: unknown;
    lastReleasedAnchor: unknown;
    launchGraceTimer: number;
  },
) {
  if (anchor === context.activeAnchor) return false;
  if (anchor === context.lastReleasedAnchor && context.launchGraceTimer > 0) return false;
  return true;
}
