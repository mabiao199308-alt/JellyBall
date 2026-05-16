export function buildJuicePalette(ballVisualCfg: any) {
  const palette: string[] = [];
  if (ballVisualCfg) {
    palette.push(ballVisualCfg.colorA, ballVisualCfg.colorB, ballVisualCfg.colorC, ballVisualCfg.colorD);
  }
  palette.push("#ffe8f2", "#ffb8d2", "#ff8ea9", "#ff6f61", "#ff9dc2");
  return [...new Set(palette.filter((c) => typeof c === "string" && c.trim()))];
}

export function createJuiceSplat(
  x: number,
  y: number,
  color: string,
  alpha: number,
  scale = 1,
  options: Record<string, any> = {},
  rand: (min: number, max: number) => number,
  randInt: (min: number, max: number) => number,
) {
  const cluster = options.cluster !== false;
  const lobeMin = Number.isFinite(options.lobeMin) ? options.lobeMin : 4;
  const lobeMax = Number.isFinite(options.lobeMax) ? options.lobeMax : 9;
  const dotMin = Number.isFinite(options.dotMin) ? options.dotMin : (cluster ? 3 : 0);
  const dotMax = Number.isFinite(options.dotMax) ? options.dotMax : (cluster ? 7 : 0);
  if (!cluster) {
    const radius = rand(6, 12) * scale;
    return {
      x,
      y,
      color,
      alpha: 0.8,
      radius,
      age: 0,
      life: rand(0.7, 1.1),
      grow: rand(1.02, 1.14),
      lobes: [],
      dripDots: [],
    };
  }

  const lobes = [];
  const lobeCount = randInt(Math.min(lobeMin, lobeMax), Math.max(lobeMin, lobeMax));
  for (let i = 0; i < lobeCount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(10, 34) * scale;
    lobes.push({
      ox: Math.cos(angle) * dist,
      oy: Math.sin(angle) * dist * rand(0.65, 1),
      r: rand(6, 18) * scale,
    });
  }

  const radius = rand(16, 34) * scale;
  const dripDots = [];
  const dotCount = randInt(Math.max(0, Math.min(dotMin, dotMax)), Math.max(0, Math.max(dotMin, dotMax)));
  for (let i = 0; i < dotCount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const dist = radius * rand(0.82, 1.62);
    dripDots.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist * rand(0.7, 1.24),
      r: rand(2.4, 5.8) * scale,
    });
  }

  return {
    x,
    y,
    color,
    alpha,
    radius,
    age: 0,
    life: rand(0.82, 1.35),
    grow: rand(1.18, 1.6),
    lobes,
    dripDots,
  };
}

export function spawnJuiceBurstParticle(
  fx: any,
  originX: number,
  originY: number,
  palette: string[],
  deathFxCfg: any,
  rand: (min: number, max: number) => number,
  randInt: (min: number, max: number) => number,
  big = false,
) {
  const angle = -Math.PI * 0.5 + rand(-deathFxCfg.spreadAngle, deathFxCfg.spreadAngle) * 0.6;
  const speed =
    (big ? rand(deathFxCfg.bigSpeedMin, deathFxCfg.bigSpeedMax) : rand(deathFxCfg.smallSpeedMin, deathFxCfg.smallSpeedMax)) * 1.08;
  const scale = big ? rand(1.05, 1.9) : rand(0.35, 0.8);
  fx.burstParticles.push({
    x: originX + rand(-7, 7),
    y: originY + rand(-8, 4),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(40, 130),
    gravity: rand(deathFxCfg.gravityMin, deathFxCfg.gravityMax),
    drag: rand(0.92, 0.965),
    life: rand(deathFxCfg.particleLifeMin, deathFxCfg.particleLifeMax),
    color: palette[randInt(0, palette.length - 1)],
    alpha: big ? rand(0.72, 0.9) : rand(0.45, 0.72),
    scale,
    radius:
      (big ? rand(deathFxCfg.bigRadiusMin, deathFxCfg.bigRadiusMax) : rand(deathFxCfg.smallRadiusMin, deathFxCfg.smallRadiusMax)) *
      scale *
      2,
    floorY: fx.floorY - rand(0, 10),
  });
}

export function spawnGroundJuiceSpread(
  fx: any,
  centerX: number,
  floorY: number,
  palette: string[],
  worldW: number,
  worldH: number,
  clamp: (v: number, min: number, max: number) => number,
  rand: (min: number, max: number) => number,
  randInt: (min: number, max: number) => number,
  intensity = 1,
  options: Record<string, any> = {},
) {
  const baseScale = Math.max(0.2, intensity);
  const yDir = options.yDir === -1 ? -1 : 1;
  const nearMin = Number.isFinite(options.nearMin) ? options.nearMin : 16;
  const nearMax = Number.isFinite(options.nearMax) ? options.nearMax : Math.min(130, worldH * 0.28);
  const mainBlobCount = randInt(1, 2);
  for (let i = 0; i < mainBlobCount; i += 1) {
    const mainX = clamp(centerX + rand(-38, 38), 12, worldW - 12);
    const mainY = clamp(floorY + yDir * rand(nearMin, nearMax), 12, worldH - 8);
    const mainColor = palette[randInt(0, palette.length - 1)];
    const mainScale = rand(0.76, 1.2) * baseScale;
    fx.splats.push(createJuiceSplat(mainX, mainY, mainColor, 1, mainScale, { cluster: true, lobeMin: 3, lobeMax: 5, dotMin: 6, dotMax: 8 }, rand, randInt));

    const attachCount = randInt(3, 5);
    for (let j = 0; j < attachCount; j += 1) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(12, 44);
      const attachX = clamp(mainX + Math.cos(angle) * dist, 10, worldW - 10);
      const attachY = clamp(mainY + Math.sin(angle) * dist * 0.72, 10, worldH - 8);
      fx.splats.push(createJuiceSplat(attachX, attachY, mainColor, 1, rand(0.32, 0.62) * baseScale, { cluster: false, dotMin: 0, dotMax: 0 }, rand, randInt));
    }
  }
}

export function updateDeathFxState(
  fx: any,
  dt: number,
  opts: {
    worldW: number;
    worldH: number;
    deathFxCfg: any;
    rand: (min: number, max: number) => number;
    clamp: (v: number, min: number, max: number) => number;
    randInt: (min: number, max: number) => number;
  },
) {
  if (!fx.active) return;
  const { worldW, worldH, deathFxCfg, rand, clamp, randInt } = opts;

  fx.timer = Math.max(0, fx.timer - dt);

  for (let i = fx.burstParticles.length - 1; i >= 0; i -= 1) {
    const p = fx.burstParticles[i];
    p.life -= dt;
    p.vx *= Math.pow(p.drag, dt * 60);
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const pxEdge = 10;
    if (p.x < pxEdge) {
      p.x = pxEdge;
      if (p.vx < 0) p.vx *= -0.22;
    } else if (p.x > worldW - pxEdge) {
      p.x = worldW - pxEdge;
      if (p.vx > 0) p.vx *= -0.22;
    }

    if (p.y + p.radius >= p.floorY) {
      const splatScale = clamp(p.scale * rand(deathFxCfg.burstToSplatScaleMin, deathFxCfg.burstToSplatScaleMax), 0.22, 2.4);
      fx.splats.push(
        createJuiceSplat(
          clamp(p.x, 10, worldW - 10),
          clamp(p.floorY + rand(-6, 6), 8, worldH - 8),
          p.color,
          1,
          splatScale,
          {
            cluster: p.scale > 0.95,
            lobeMin: p.scale > 0.95 ? 3 : 2,
            lobeMax: p.scale > 0.95 ? 6 : 4,
            dotMin: p.scale > 0.95 ? 4 : 2,
            dotMax: p.scale > 0.95 ? 7 : 4,
          },
          rand,
          randInt,
        ),
      );
      fx.burstParticles.splice(i, 1);
      continue;
    }

    if (p.life <= 0) {
      fx.burstParticles.splice(i, 1);
    }
  }

  for (let i = fx.splats.length - 1; i >= 0; i -= 1) {
    const splat = fx.splats[i];
    splat.age += dt;
    if (splat.age >= splat.life) fx.splats.splice(i, 1);
  }

  if (fx.timer <= 0 && fx.burstParticles.length === 0) {
    fx.active = false;
  }
}

export function drawDeathFxState(
  ctx: CanvasRenderingContext2D,
  fx: any,
  clamp01: (v: number) => number,
  lerp: (a: number, b: number, t: number) => number,
) {
  if (!fx.active) return;

  for (const p of fx.burstParticles) {
    const alpha = p.alpha * clamp01(p.life / 0.16);
    if (alpha <= 0.01) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,220,0.18)";
    ctx.beginPath();
    ctx.arc(-p.radius * 0.18, -p.radius * 0.14, p.radius * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const splat of fx.splats) {
    const t = clamp01(splat.age / Math.max(0.0001, splat.life));
    const pop = 1 - Math.pow(1 - Math.min(1, t * 2.8), 3);
    const alpha = splat.alpha;
    const scale = lerp(0.18, splat.grow, pop);
    if (alpha <= 0.01) continue;

    ctx.save();
    ctx.translate(splat.x, splat.y);
    ctx.fillStyle = splat.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, splat.radius * scale, 0, Math.PI * 2);
    ctx.fill();

    for (const lobe of splat.lobes) {
      ctx.save();
      ctx.translate(lobe.ox * scale, lobe.oy * scale);
      ctx.beginPath();
      ctx.arc(0, 0, lobe.r * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = "rgba(255,255,220,0.22)";
    ctx.beginPath();
    ctx.arc(-splat.radius * 0.2, -splat.radius * 0.18, splat.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = splat.color;
    ctx.globalAlpha = alpha * 0.82;
    const dripDots = Array.isArray(splat.dripDots) ? splat.dripDots : [];
    for (const dot of dripDots) {
      ctx.beginPath();
      ctx.arc(dot.x * scale, dot.y * scale, dot.r * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
