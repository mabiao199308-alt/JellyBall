type CameraWorld = {
  ball: { x: number; y: number };
  h: number;
  w: number;
  cameraY: number;
  cameraX: number;
  cameraDownMaxY: number;
  launchDeathBottomY: number;
  state: "aiming" | "launched" | "tethered" | "dying" | "gameover";
  dragging: boolean;
};

type CameraCfg = {
  cameraTargetRatio: number;
  cameraFollowUp: number;
  cameraFollowDown: number;
  cameraFollowX: number;
  cameraLookXPadding: number;
  cameraLookXMaxOffset: number;
};

export function updateCameraState(world: CameraWorld, cfg: CameraCfg, dt: number, clamp: (v: number, min: number, max: number) => number) {
  const desired = world.ball.y - world.h * cfg.cameraTargetRatio;

  if (desired < world.cameraY) {
    const alpha = 1 - Math.exp(-cfg.cameraFollowUp * dt);
    world.cameraY += (desired - world.cameraY) * alpha;
  } else if (world.state === "aiming" || world.state === "tethered") {
    const downDesired = Math.min(desired, world.cameraDownMaxY);
    const alpha = 1 - Math.exp(-cfg.cameraFollowDown * dt);
    world.cameraY += (downDesired - world.cameraY) * alpha;
  } else if (world.state === "launched") {
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
