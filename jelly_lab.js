const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const panelBody = document.getElementById("panelBody");
const panelTitle = document.getElementById("panelTitle");
const saveBtn = document.getElementById("saveBtn");
const saveDefaultBtn = document.getElementById("saveDefaultBtn");
const resetBtn = document.getElementById("resetBtn");
const replayDeathBtn = document.getElementById("replayDeathBtn");
const statusText = document.getElementById("statusText");
const previewDesc = document.getElementById("previewDesc");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));

const visual = window.BallVisual;
const deathFx = window.DeathFx;
const cfg = visual.loadBallVisualCfg();

const ballSectionDefs = [
  {
    title: "整体",
    fields: [
      ["radiusScale", "整体尺寸", 0.6, 2.2, 0.01],
      ["rotationFactor", "旋转跟随", 0, 1, 0.01],
      ["speedSquashDivisor", "速度挤压阈值", 300, 3000, 10],
      ["squashStrength", "挤压强度", 0, 2, 0.01],
      ["wobbleAmount", "呼吸摆动", 0, 1.5, 0.01],
      ["outlineWidth", "描边宽度", 0, 6, 0.1],
    ],
  },
  {
    title: "高光与果冻层",
    fields: [
      ["glossOpacity", "主高光透明度", 0, 1, 0.01],
      ["glossScaleX", "主高光宽", 0.05, 0.4, 0.01],
      ["glossScaleY", "主高光高", 0.05, 0.5, 0.01],
      ["glossOffsetX", "主高光X", -0.6, 0.6, 0.01],
      ["glossOffsetY", "主高光Y", -0.6, 0.6, 0.01],
      ["bandOpacity", "带状高光透明度", 0, 1, 0.01],
      ["bandScaleX", "带状高光宽", 0.05, 0.6, 0.01],
      ["bandScaleY", "带状高光高", 0.05, 0.4, 0.01],
      ["blobOpacity", "内部斑块透明度", 0, 1, 0.01],
      ["bubbleOpacity", "内部气泡透明度", 0, 1, 0.01],
    ],
  },
  {
    title: "眼睛",
    fields: [
      ["eyeOffsetX", "眼距", 0.05, 0.6, 0.01],
      ["eyeY", "眼睛高度", -0.6, 0.4, 0.01],
      ["eyeRadius", "眼睛大小", 0.05, 0.45, 0.01],
      ["pupilRadius", "瞳孔大小", 0.02, 0.25, 0.01],
      ["pupilDirX", "瞳孔朝向X", -0.7, 0.7, 0.01],
      ["pupilDirY", "瞳孔朝向Y", -0.7, 0.7, 0.01],
      ["pupilHighlightRadius", "眼睛高光大小", 0.01, 0.12, 0.01],
    ],
  },
  {
    title: "颜色",
    colorFields: [
      ["colorA", "高光色"],
      ["colorB", "中间亮色"],
      ["colorC", "主体色"],
      ["colorD", "底部深色"],
      ["outlineColor", "描边色"],
      ["eyeColor", "眼白色"],
      ["pupilColor", "瞳孔色"],
    ],
  },
];

const previewState = {
  speed: 620,
  angle: 0,
};

const previewDefs = [
  ["speed", "预览速度", 0, 1800, 1],
  ["angle", "预览朝向", -3.14, 3.14, 0.01],
];

const defaultDeathCfg = deathFx ? deathFx.defaultDeathFxCfg : {};

const deathCfg = deathFx ? deathFx.loadDeathFxCfg() : { ...defaultDeathCfg };

const deathSectionDefs = [
  {
    title: "时序",
    fields: [
      ["readyDelay", "起爆前停顿", 0, 1, 0.01],
      ["fxDuration", "炸开持续时长", 0.1, 1.5, 0.01],
      ["cooldown", "结算前停顿", 0, 1, 0.01],
      ["originYRatio", "起爆高度", 0.82, 0.96, 0.01],
      ["floorYRatio", "落地区域高度", 0.9, 0.985, 0.005],
    ],
  },
  {
    title: "飞散",
    fields: [
      ["bigBurstCount", "大滴数量", 0, 12, 1],
      ["smallBurstCount", "小滴数量", 0, 24, 1],
      ["bigSpeedMin", "大滴最小速度", 100, 1800, 10],
      ["bigSpeedMax", "大滴最大速度", 100, 2200, 10],
      ["smallSpeedMin", "小滴最小速度", 100, 1600, 10],
      ["smallSpeedMax", "小滴最大速度", 100, 2000, 10],
      ["gravityMin", "最小重力", 200, 3200, 10],
      ["gravityMax", "最大重力", 200, 3600, 10],
      ["particleLifeMin", "最短飞行时间", 0.01, 0.4, 0.01],
      ["particleLifeMax", "最长飞行时间", 0.02, 0.6, 0.01],
      ["bigRadiusMin", "大滴最小半径", 2, 40, 1],
      ["bigRadiusMax", "大滴最大半径", 4, 60, 1],
      ["smallRadiusMin", "小滴最小半径", 1, 20, 1],
      ["smallRadiusMax", "小滴最大半径", 2, 24, 1],
    ],
  },
  {
    title: "圆形污渍",
    fields: [
      ["mainSplatScaleMin", "主污渍最小缩放", 0.2, 2, 0.01],
      ["mainSplatScaleMax", "主污渍最大缩放", 0.2, 2.5, 0.01],
      ["sideSplatCount", "附加污渍数量", 0, 8, 1],
      ["sideSplatScaleMin", "附加污渍最小缩放", 0.2, 1.6, 0.01],
      ["sideSplatScaleMax", "附加污渍最大缩放", 0.2, 2, 0.01],
      ["burstToSplatScaleMin", "飞滴落地最小缩放", 0.2, 1.4, 0.01],
      ["burstToSplatScaleMax", "飞滴落地最大缩放", 0.2, 1.8, 0.01],
    ],
  },
];

const labState = {
  activeTab: "ball",
  lastRenderTime: 0,
};

function createEmptyDeathFx() {
  return {
    active: false,
    timer: 0,
    floorY: 0,
    burstParticles: [],
    splats: [],
  };
}

const deathPreview = {
  phase: "ready",
  timer: 0.28,
  originX: 0,
  originY: 0,
  floorY: 0,
  fx: createEmptyDeathFx(),
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function decimals(step) {
  const text = String(step);
  if (!text.includes(".")) return 0;
  return text.split(".")[1].length;
}

function formatValue(step, value) {
  return Number(value).toFixed(decimals(step));
}

function setStatus(text) {
  statusText.textContent = text;
}

function setLivePreviewStatus() {
  setStatus(labState.activeTab === "death" ? "已实时刷新死亡动画预览。" : "已实时预览，点保存即可同步到游戏。");
}

function buildRangeRow(target, key, label, min, max, step) {
  const row = document.createElement("label");
  row.className = "row";
  const title = document.createElement("div");
  title.className = "row-title";
  const name = document.createElement("span");
  name.textContent = label;
  const value = document.createElement("span");
  value.textContent = formatValue(step, target[key]);
  title.append(name, value);

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(target[key]);
  input.addEventListener("input", () => {
    target[key] = Number(input.value);
    value.textContent = formatValue(step, target[key]);
    if (target === deathCfg) {
      normalizeDeathCfg();
      resetDeathPreview(false);
    }
    setLivePreviewStatus();
  });

  row.append(title, input);
  return row;
}

function buildColorRow(target, key, label) {
  const row = document.createElement("label");
  row.className = "row";
  const title = document.createElement("div");
  title.className = "row-title";
  const name = document.createElement("span");
  name.textContent = label;
  const value = document.createElement("span");
  value.textContent = target[key];
  title.append(name, value);

  const input = document.createElement("input");
  input.type = "color";
  const safeValue = /^#[0-9a-fA-F]{6}$/.test(target[key]) ? target[key] : "#ffffff";
  input.value = safeValue;
  input.addEventListener("input", () => {
    target[key] = input.value;
    value.textContent = target[key];
    setLivePreviewStatus();
  });

  row.append(title, input);
  return row;
}

function buildPanel() {
  panelBody.innerHTML = "";
  panelTitle.textContent = labState.activeTab === "death" ? "死亡动画参数" : "小球本体参数";

  const previewTitle = document.createElement("div");
  previewTitle.className = "group-title";
  previewTitle.textContent = "预览辅助";
  panelBody.append(previewTitle);

  if (labState.activeTab === "ball") {
    for (const def of previewDefs) {
      panelBody.append(buildRangeRow(previewState, ...def));
    }
  } else {
    const note = document.createElement("p");
    note.textContent = "这里调的是死亡动画实验参数；左侧页签切换后，这一列参数会整组替换。";
    panelBody.append(note);
  }

  const sections = labState.activeTab === "death" ? deathSectionDefs : ballSectionDefs;
  for (const section of sections) {
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = section.title;
    panelBody.append(title);

    for (const field of section.fields || []) {
      panelBody.append(buildRangeRow(labState.activeTab === "death" ? deathCfg : cfg, ...field));
    }
    for (const field of section.colorFields || []) {
      panelBody.append(buildColorRow(cfg, ...field));
    }
  }
}

function updatePreviewUi() {
  const isDeath = labState.activeTab === "death";
  previewDesc.textContent = isDeath
    ? "这里会循环播放死亡动画预览：切左侧页签后，这一页只看死亡动画和它自己的参数。"
    : "这里只预览小球本体效果，保存后会同步到游戏里的小球表现。";
  replayDeathBtn.classList.toggle("is-hidden", !isDeath);
  resetBtn.textContent = isDeath ? "恢复死亡默认" : "恢复默认";
  for (const button of tabButtons) {
    button.classList.toggle("is-active", button.dataset.tab === labState.activeTab);
  }
}

function setActiveTab(tab) {
  if (tab === labState.activeTab) return;
  labState.activeTab = tab;
  if (tab === "death") {
    resetDeathPreview(false);
    setStatus("已切到死亡动画预览，可以点【重播死亡】反复看效果。");
  } else {
    setStatus("已切回小球本体预览。");
  }
  updatePreviewUi();
  buildPanel();
}

function drawBallLabBackground(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);
}

function drawDeathLabBackground(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#fefce8");
  g.addColorStop(1, "#ecfccb");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(20, 83, 45, 0.08)";
  ctx.beginPath();
  ctx.roundRect(18, h * 0.8, w - 36, 20, 10);
  ctx.fill();
}

function getJuicePalette() {
  return [cfg.colorA, cfg.colorB, cfg.colorC, cfg.colorD].filter((c) => typeof c === "string" && c.trim());
}

function spawnJuiceBurstParticle(fx, originX, originY, palette, big = false) {
  const angle = rand(-Math.PI * 0.95, Math.PI * 0.02);
  const speed = big ? rand(deathCfg.bigSpeedMin, deathCfg.bigSpeedMax) : rand(deathCfg.smallSpeedMin, deathCfg.smallSpeedMax);
  const scale = big ? rand(1.05, 1.9) : rand(0.35, 0.8);
  fx.burstParticles.push({
    x: originX + rand(-10, 10),
    y: originY + rand(-10, 6),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(60, 180),
    gravity: rand(deathCfg.gravityMin, deathCfg.gravityMax),
    drag: rand(0.92, 0.965),
    life: rand(deathCfg.particleLifeMin, deathCfg.particleLifeMax),
    color: palette[randInt(0, palette.length - 1)],
    alpha: big ? rand(0.72, 0.9) : rand(0.45, 0.72),
    scale,
    radius: (big ? rand(deathCfg.bigRadiusMin, deathCfg.bigRadiusMax) : rand(deathCfg.smallRadiusMin, deathCfg.smallRadiusMax)) * scale,
    floorY: fx.floorY - rand(0, 10),
  });
}

function createJuiceSplat(x, y, color, alpha, scale = 1) {
  const lobes = [];
  const lobeCount = randInt(4, 9);
  for (let i = 0; i < lobeCount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(10, 34) * scale;
    lobes.push({
      ox: Math.cos(angle) * dist,
      oy: Math.sin(angle) * dist * rand(0.65, 1),
      r: rand(6, 18) * scale,
    });
  }

  return {
    x,
    y,
    color,
    alpha,
    radius: rand(16, 34) * scale,
    age: 0,
    life: rand(0.82, 1.35),
    grow: rand(1.18, 1.6),
    lobes,
    dripCount: randInt(3, 7),
  };
}

function normalizeDeathCfg() {
  if (deathCfg.bigSpeedMin > deathCfg.bigSpeedMax) [deathCfg.bigSpeedMin, deathCfg.bigSpeedMax] = [deathCfg.bigSpeedMax, deathCfg.bigSpeedMin];
  if (deathCfg.smallSpeedMin > deathCfg.smallSpeedMax) [deathCfg.smallSpeedMin, deathCfg.smallSpeedMax] = [deathCfg.smallSpeedMax, deathCfg.smallSpeedMin];
  if (deathCfg.gravityMin > deathCfg.gravityMax) [deathCfg.gravityMin, deathCfg.gravityMax] = [deathCfg.gravityMax, deathCfg.gravityMin];
  if (deathCfg.particleLifeMin > deathCfg.particleLifeMax) [deathCfg.particleLifeMin, deathCfg.particleLifeMax] = [deathCfg.particleLifeMax, deathCfg.particleLifeMin];
  if (deathCfg.bigRadiusMin > deathCfg.bigRadiusMax) [deathCfg.bigRadiusMin, deathCfg.bigRadiusMax] = [deathCfg.bigRadiusMax, deathCfg.bigRadiusMin];
  if (deathCfg.smallRadiusMin > deathCfg.smallRadiusMax) [deathCfg.smallRadiusMin, deathCfg.smallRadiusMax] = [deathCfg.smallRadiusMax, deathCfg.smallRadiusMin];
  if (deathCfg.mainSplatScaleMin > deathCfg.mainSplatScaleMax) [deathCfg.mainSplatScaleMin, deathCfg.mainSplatScaleMax] = [deathCfg.mainSplatScaleMax, deathCfg.mainSplatScaleMin];
  if (deathCfg.sideSplatScaleMin > deathCfg.sideSplatScaleMax) [deathCfg.sideSplatScaleMin, deathCfg.sideSplatScaleMax] = [deathCfg.sideSplatScaleMax, deathCfg.sideSplatScaleMin];
  if (deathCfg.burstToSplatScaleMin > deathCfg.burstToSplatScaleMax) [deathCfg.burstToSplatScaleMin, deathCfg.burstToSplatScaleMax] = [deathCfg.burstToSplatScaleMax, deathCfg.burstToSplatScaleMin];
}

function resetDeathPreview(startBurst = false) {
  const w = previewCanvas.width;
  const h = previewCanvas.height;
  normalizeDeathCfg();
  deathPreview.originX = w * 0.5;
  deathPreview.originY = h * deathCfg.originYRatio;
  deathPreview.floorY = h * deathCfg.floorYRatio;
  deathPreview.fx = createEmptyDeathFx();
  deathPreview.timer = startBurst ? 0 : deathCfg.readyDelay;
  deathPreview.phase = startBurst ? "burst" : "ready";
  if (startBurst) startDeathFx();
}

function startDeathFx() {
  normalizeDeathCfg();
  const palette = getJuicePalette();
  const fx = createEmptyDeathFx();
  fx.active = true;
  fx.timer = deathCfg.fxDuration;
  fx.floorY = deathPreview.floorY;

  fx.splats.push(
    createJuiceSplat(
      deathPreview.originX + rand(-10, 10),
      fx.floorY - rand(3, 8),
      palette[randInt(0, palette.length - 1)],
      rand(0.16, 0.24),
      rand(deathCfg.mainSplatScaleMin, deathCfg.mainSplatScaleMax),
    ),
  );

  for (let i = 0; i < deathCfg.bigBurstCount; i += 1) spawnJuiceBurstParticle(fx, deathPreview.originX, deathPreview.originY, palette, true);
  for (let i = 0; i < deathCfg.smallBurstCount; i += 1) spawnJuiceBurstParticle(fx, deathPreview.originX, deathPreview.originY, palette, false);

  for (let i = 0; i < deathCfg.sideSplatCount; i += 1) {
    fx.splats.push(
      createJuiceSplat(
        deathPreview.originX + rand(-34, 34),
        fx.floorY - rand(2, 10),
        palette[randInt(0, palette.length - 1)],
        rand(0.14, 0.24),
        rand(deathCfg.sideSplatScaleMin, deathCfg.sideSplatScaleMax),
      ),
    );
  }

  deathPreview.fx = fx;
}

function updateDeathFx(dt) {
  const fx = deathPreview.fx;
  if (!fx.active) return;

  fx.timer = Math.max(0, fx.timer - dt);

  for (let i = fx.burstParticles.length - 1; i >= 0; i -= 1) {
    const p = fx.burstParticles[i];
    p.life -= dt;
    p.vx *= Math.pow(p.drag, dt * 60);
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.y + p.radius >= p.floorY || p.life <= 0) {
      fx.splats.push(
        createJuiceSplat(
          p.x,
          p.floorY - rand(0, 4),
          p.color,
          p.alpha * 0.96,
          p.scale * rand(deathCfg.burstToSplatScaleMin, deathCfg.burstToSplatScaleMax),
        ),
      );
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

function updateDeathPreview(dt) {
  if (deathPreview.phase === "ready") {
    deathPreview.timer -= dt;
    if (deathPreview.timer <= 0) {
      deathPreview.phase = "burst";
      startDeathFx();
    }
    return;
  }

  if (deathPreview.phase === "burst") {
    updateDeathFx(dt);
    if (!deathPreview.fx.active) {
      deathPreview.phase = "cooldown";
      deathPreview.timer = deathCfg.cooldown;
    }
    return;
  }

  deathPreview.timer -= dt;
  if (deathPreview.timer <= 0) {
    resetDeathPreview(false);
  }
}

function drawDeathFx(ctx) {
  const fx = deathPreview.fx;

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
    const alpha = splat.alpha * (1 - t * 0.52);
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
      ctx.beginPath();
      ctx.arc(lobe.ox * scale, lobe.oy * scale, lobe.r * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,220,0.22)";
    ctx.beginPath();
    ctx.arc(-splat.radius * 0.2, -splat.radius * 0.18, splat.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = splat.color;
    ctx.globalAlpha = alpha * 0.82;
    for (let i = 0; i < splat.dripCount; i += 1) {
      const dripX = lerp(-splat.radius * 1.1, splat.radius * 1.1, (i + 1) / (splat.dripCount + 1));
      const dripY = splat.radius * (0.9 + (i % 2) * 0.28) * scale;
      ctx.beginPath();
      ctx.arc(dripX, dripY, (3.4 + i * 0.8) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawBallPreview(t) {
  const w = previewCanvas.width;
  const h = previewCanvas.height;
  drawBallLabBackground(previewCtx, w, h);
  visual.drawJellyBall(previewCtx, {
    x: w * 0.5,
    y: h * 0.5,
    angle: previewState.angle,
    baseRadius: 78,
    speed: previewState.speed,
    time: t,
    cfg,
  });
}

function drawDeathPreview(t, dt) {
  const w = previewCanvas.width;
  const h = previewCanvas.height;
  drawDeathLabBackground(previewCtx, w, h);
  updateDeathPreview(dt);

  if (deathPreview.phase === "ready") {
    visual.drawJellyBall(previewCtx, {
      x: deathPreview.originX,
      y: deathPreview.originY,
      angle: 0,
      baseRadius: 62,
      speed: 420,
      time: t,
      cfg,
    });
  }

  drawDeathFx(previewCtx);
}

function render(t) {
  const dt = labState.lastRenderTime ? Math.min((t - labState.lastRenderTime) / 1000, 1 / 30) : 1 / 60;
  labState.lastRenderTime = t;

  if (labState.activeTab === "death") {
    drawDeathPreview(t, dt);
  } else {
    drawBallPreview(t);
  }

  requestAnimationFrame(render);
}

saveBtn.addEventListener("click", () => {
  if (labState.activeTab === "death") {
    if (!deathFx) {
      setStatus("死亡动画保存不可用：缺少 DeathFx 模块。");
      return;
    }
    Object.assign(deathCfg, deathFx.saveDeathFxCfg(deathCfg));
    resetDeathPreview(false);
    setStatus("已保存死亡动画到本地，游戏页刷新/同步后会使用这套参数。");
    return;
  }

  Object.assign(cfg, visual.saveBallVisualCfg(cfg));
  setStatus("已保存到本地。游戏页若开着会自动同步；否则刷新游戏页即可。");
});

saveDefaultBtn.addEventListener("click", async () => {
  if (labState.activeTab === "death") {
    if (!deathFx) {
      setStatus("死亡动画保存默认不可用：缺少 DeathFx 模块。");
      return;
    }
    try {
      saveDefaultBtn.disabled = true;
      Object.assign(deathCfg, deathFx.saveDeathFxCfg(deathCfg));
      const response = await fetch("/api/save-death-fx-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cfg: deathCfg }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "保存默认失败");
      }
      Object.assign(deathFx.defaultDeathFxCfg, deathFx.coerceDeathFxCfg(deathCfg));
      setStatus("已写回 death_fx.js 默认值，之后游戏默认就是这套死亡动画。");
    } catch (error) {
      setStatus(`保存死亡动画到默认失败：${error.message}`);
    } finally {
      saveDefaultBtn.disabled = false;
    }
    return;
  }

  try {
    saveDefaultBtn.disabled = true;
    Object.assign(cfg, visual.saveBallVisualCfg(cfg));
    const response = await fetch("/api/save-ball-visual-defaults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cfg }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "保存默认失败");
    }
    Object.assign(visual.defaultBallVisualCfg, visual.coerceBallVisualCfg(cfg));
    setStatus("已写回 ball_visual.js 默认值，之后游戏默认就是这套。");
  } catch (error) {
    setStatus(`保存到默认失败：${error.message}`);
  } finally {
    saveDefaultBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", () => {
  if (labState.activeTab === "death") {
    if (!deathFx) {
      setStatus("死亡动画恢复默认不可用：缺少 DeathFx 模块。");
      return;
    }
    Object.assign(deathCfg, deathFx.resetDeathFxCfg());
    buildPanel();
    resetDeathPreview(false);
    setStatus("已恢复死亡动画实验参数默认值。");
    return;
  }

  Object.assign(cfg, visual.resetBallVisualCfg());
  buildPanel();
  setStatus("已恢复果冻默认视觉。记得按保存同步到游戏。");
});

replayDeathBtn.addEventListener("click", () => {
  resetDeathPreview(true);
  setStatus("已重播死亡动画预览。");
});

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
}

updatePreviewUi();
buildPanel();
resetDeathPreview(false);
requestAnimationFrame(render);
