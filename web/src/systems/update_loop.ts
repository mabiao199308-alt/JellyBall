type UpdateCallbacks = {
  syncTutorialOverlay: () => void;
  updateBestFireworks: (dt: number) => void;
  updateGear: (dt: number) => void;
  updateMovingTrack: (dt: number) => void;
  updateDeathFx: (dt: number) => void;
  updateAnchorFuse: () => void;
  updateRedAlarm: () => void;
  screenToWorldPoint: (p: { x: number; y: number }) => { x: number; y: number };
  clampToMaxStretch: (x: number, y: number, anchor: any) => { x: number; y: number };
  clamp: (v: number, min: number, max: number) => number;
  updateLookDirection: (dt: number) => void;
  updateJellyState: (dt: number) => void;
  applyFreeFlightPhysics: (dt: number) => void;
  applyTetheredPhysics: (dt: number) => void;
  checkAnchorHook: () => void;
  checkGearHit: () => void;
  checkMovingTrackHit: () => void;
  updateCamera: (dt: number) => void;
  ensureAnchorsCoverage: () => void;
  checkGameOver: () => void;
  updateMeters: () => void;
};

export function runMainUpdateStep(world: any, cfg: any, dt: number, callbacks: UpdateCallbacks) {
  world.timeSec += dt;
  callbacks.syncTutorialOverlay();
  callbacks.updateBestFireworks(dt);
  callbacks.updateGear(dt);
  callbacks.updateMovingTrack(dt);
  if (world.deathFx.active && world.deathFx.previewOnly) {
    callbacks.updateDeathFx(dt);
  }
  if (world.state === "dying") {
    callbacks.updateDeathFx(dt);
    return;
  }

  callbacks.updateAnchorFuse();
  callbacks.updateRedAlarm();

  const draggingAim = world.dragging && world.state === "aiming";
  if (draggingAim) {
    world.pointer = callbacks.screenToWorldPoint(world.pointerScreen);
    const clamped = callbacks.clampToMaxStretch(world.pointer.x, world.pointer.y, world.activeAnchor);
    const minAimX = world.cameraX + cfg.ballRadius;
    const maxAimX = world.cameraX + world.w - cfg.ballRadius;
    const minAimY = world.cameraY + cfg.ballRadius;
    world.ball.x = callbacks.clamp(clamped.x, minAimX, maxAimX);
    world.ball.y = Math.max(minAimY, clamped.y);
    world.ball.vx = 0;
    world.ball.vy = 0;
  }

  world.breakFlash = Math.max(0, world.breakFlash - dt);
  world.hookFlash = Math.max(0, world.hookFlash - dt);
  world.hookCooldown = Math.max(0, world.hookCooldown - dt);
  world.launchGraceTimer = Math.max(0, world.launchGraceTimer - dt);
  callbacks.updateLookDirection(dt);
  callbacks.updateJellyState(dt);

  if (!draggingAim) {
    if (world.state === "launched") {
      callbacks.applyFreeFlightPhysics(dt);
      callbacks.checkAnchorHook();
    } else if (world.state === "tethered") {
      callbacks.applyTetheredPhysics(dt);
      callbacks.checkAnchorHook();
    } else if (world.state === "gameover") {
      return;
    }
  }

  callbacks.checkGearHit();
  callbacks.checkMovingTrackHit();
  if (world.state === "dying") {
    callbacks.updateDeathFx(dt);
    return;
  }

  if (world.state !== "gameover") {
    callbacks.updateCamera(dt);
    callbacks.ensureAnchorsCoverage();
  }

  callbacks.checkGameOver();
  if (world.state === "dying") {
    callbacks.updateDeathFx(dt);
    return;
  }
  if (world.state === "launched" || world.state === "tethered") {
    callbacks.updateMeters();
  }
  callbacks.syncTutorialOverlay();
}
