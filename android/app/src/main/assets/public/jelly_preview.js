const canvas = document.getElementById("jellyCanvas");
const ctx = canvas.getContext("2d");
const sliderPanel = document.getElementById("sliderPanel");
const layerPanel = document.getElementById("layerPanel");
const presetSelect = document.getElementById("presetSelect");
const autoAnimToggle = document.getElementById("autoAnimToggle");
const showLabelsToggle = document.getElementById("showLabelsToggle");
const showAllLayersBtn = document.getElementById("showAllLayersBtn");
const hideAllLayersBtn = document.getElementById("hideAllLayersBtn");
const showBodyOnlyBtn = document.getElementById("showBodyOnlyBtn");
const showFaceOnlyBtn = document.getElementById("showFaceOnlyBtn");
const saveLayersToGameBtn = document.getElementById("saveLayersToGameBtn");
const copyLayersConfigBtn = document.getElementById("copyLayersConfigBtn");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pauseBtn");
const saveStatus = document.getElementById("saveStatus");

const JELLY_LAYER_VISIBILITY_KEY = "swipe_jelly_layer_visibility_v1";

const visualCfg = { ...window.BallVisual.defaultBallVisualCfg };

const sliderDefs = [
  { key: "sizeMul", label: "尺寸倍率", min: 1, max: 5, step: 0.01, value: 2.6 },
  { key: "speed", label: "速度", min: 0, max: 2400, step: 1, value: 0 },
  { key: "deformAmount", label: "形变强度", min: 0, max: 1, step: 0.01, value: 0.35 },
  { key: "wobbleOffset", label: "晃动偏移", min: -1, max: 1, step: 0.01, value: 0.12 },
  { key: "lookDirX", label: "眼神X", min: -1, max: 1, step: 0.01, value: 0 },
  { key: "lookDirY", label: "眼神Y", min: -1, max: 1, step: 0.01, value: -0.25 },
  { key: "edgeGlowOpacity", label: "边缘发光透明度", min: 0, max: 0.8, step: 0.01, value: visualCfg.edgeGlowOpacity },
  { key: "edgeGlowWidthMul", label: "边缘发光宽度", min: 1, max: 4.6, step: 0.01, value: visualCfg.edgeGlowWidthMul },
  { key: "edgeGlowBlurRatio", label: "边缘发光模糊", min: 0.02, max: 0.4, step: 0.01, value: visualCfg.edgeGlowBlurRatio },
];

const layerDefs = [
  { key: "bodyGradient", label: "主体渐变", group: "body" },
  { key: "edgeGlow", label: "边缘发光", group: "body" },
  { key: "outline", label: "外描边", group: "body" },
  { key: "gloss", label: "高光", group: "body" },
  { key: "band", label: "亮带", group: "body" },
  { key: "blobs", label: "斑块", group: "body" },
  { key: "bubbles", label: "气泡", group: "body" },
  { key: "eyesWhite", label: "眼白", group: "face" },
  { key: "pupils", label: "瞳孔", group: "face" },
  { key: "pupilHighlights", label: "瞳孔高光", group: "face" },
  { key: "squintEyes", label: "眯眼", group: "face" },
];

const sliders = {};
const values = Object.fromEntries(sliderDefs.map((d) => [d.key, d.value]));
const layerToggles = {};
const layerVisibility = {
  ...(window.BallVisual.defaultLayerVisibility || {}),
};

let elapsed = 0;
let lastTime = 0;
let paused = false;

function setStatus(text) {
  if (!saveStatus) return;
  saveStatus.textContent = text;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function buildSliderUi() {
  for (const def of sliderDefs) {
    const row = document.createElement("div");
    row.className = "slider-row";

    const head = document.createElement("div");
    head.className = "slider-row__head";
    const title = document.createElement("span");
    title.textContent = def.label;
    const valueText = document.createElement("span");
    valueText.textContent = String(def.value);
    head.append(title, valueText);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(def.min);
    input.max = String(def.max);
    input.step = String(def.step);
    input.value = String(def.value);
    input.addEventListener("input", () => {
      const n = Number(input.value);
      values[def.key] = n;
      valueText.textContent = def.step < 1 ? n.toFixed(2) : String(Math.round(n));
      if (def.key in visualCfg) visualCfg[def.key] = n;
    });

    row.append(head, input);
    sliderPanel.append(row);
    sliders[def.key] = input;
  }
}

function buildLayerUi() {
  for (const def of layerDefs) {
    const row = document.createElement("label");
    row.className = "switch-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = layerVisibility[def.key] !== false;
    input.addEventListener("change", () => {
      layerVisibility[def.key] = input.checked;
    });
    const title = document.createElement("span");
    title.textContent = def.label;
    row.append(input, title);
    layerPanel.append(row);
    layerToggles[def.key] = input;
  }
}

function loadLayerVisibilityFromStorage() {
  try {
    const raw = localStorage.getItem(JELLY_LAYER_VISIBILITY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    for (const def of layerDefs) {
      if (typeof parsed[def.key] === "boolean") {
        layerVisibility[def.key] = parsed[def.key];
      }
    }
  } catch {
    // ignore
  }
}

function syncLayerCheckboxes() {
  for (const def of layerDefs) {
    const input = layerToggles[def.key];
    if (!input) continue;
    input.checked = layerVisibility[def.key] !== false;
  }
}

function setLayersByGroup(group, visible) {
  for (const def of layerDefs) {
    if (!group || def.group === group) layerVisibility[def.key] = visible;
  }
  syncLayerCheckboxes();
}

function showOnlyGroup(group) {
  for (const def of layerDefs) layerVisibility[def.key] = def.group === group;
  syncLayerCheckboxes();
}

function syncVisualCfgFromValues() {
  visualCfg.edgeGlowOpacity = values.edgeGlowOpacity;
  visualCfg.edgeGlowWidthMul = values.edgeGlowWidthMul;
  visualCfg.edgeGlowBlurRatio = values.edgeGlowBlurRatio;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function drawBackdrop(w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#7dd3fc");
  g.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const gridGap = Math.max(24, Math.floor(w / 22));
  ctx.strokeStyle = "rgba(15,23,42,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += gridGap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += gridGap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawLayerLabels(layers) {
  if (!showLabelsToggle.checked || !layers || layers.length === 0) return;
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.font = "12px sans-serif";

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const alignRight = layer.x > canvas.clientWidth * 0.57;
    const lx = layer.x + (alignRight ? -84 : 16);
    const ly = layer.y + ((i % 2 === 0 ? -1 : 1) * 10);

    ctx.strokeStyle = "rgba(15,23,42,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(layer.x, layer.y);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    const textPadX = 7;
    const textPadY = 4;
    const textW = ctx.measureText(layer.label).width;
    const boxX = alignRight ? lx - textW - textPadX * 2 : lx;
    const boxY = ly - 9;
    const boxW = textW + textPadX * 2;
    const boxH = 18;

    ctx.fillStyle = "rgba(15,23,42,0.74)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "rgba(148,163,184,0.45)";
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#f8fafc";
    ctx.fillText(layer.label, boxX + textPadX, ly);
  }

  ctx.restore();
}

function getPresetState(t) {
  const preset = presetSelect.value;
  if (preset === "aiming") {
    const pulse = 0.5 + Math.sin(t * 2.6) * 0.5;
    return {
      speed: 120,
      deformAmount: 0.42 + pulse * 0.24,
      wobbleOffset: 0.16 + Math.sin(t * 8) * 0.1,
      lookDirX: 0.5,
      lookDirY: -0.65,
      angle: -0.1,
    };
  }
  if (preset === "full_hold") {
    return {
      speed: 80,
      deformAmount: 0.9,
      wobbleOffset: Math.sin(t * 13) * 0.18,
      lookDirX: 0.58,
      lookDirY: -0.78,
      angle: -0.22,
    };
  }
  if (preset === "launch") {
    return {
      speed: 1680,
      deformAmount: 0.66 + Math.sin(t * 7) * 0.1,
      wobbleOffset: Math.sin(t * 12) * 0.38,
      lookDirX: 0.95,
      lookDirY: 0.1,
      angle: 0.42,
    };
  }
  if (preset === "tether") {
    return {
      speed: 760,
      deformAmount: 0.54 + Math.sin(t * 3.2) * 0.12,
      wobbleOffset: Math.sin(t * 7.6) * 0.26,
      lookDirX: Math.sin(t * 2.8) * 0.8,
      lookDirY: -0.2,
      angle: Math.sin(t * 2) * 0.35,
    };
  }
  return {
    speed: 0,
    deformAmount: 0.3 + Math.sin(t * 1.2) * 0.05,
    wobbleOffset: Math.sin(t * 2.1) * 0.12,
    lookDirX: 0,
    lookDirY: -0.22,
    angle: 0,
  };
}

function getRenderState(t) {
  if (!autoAnimToggle.checked) {
    return {
      speed: values.speed,
      deformAmount: values.deformAmount,
      wobbleOffset: values.wobbleOffset,
      lookDirX: values.lookDirX,
      lookDirY: values.lookDirY,
      angle: 0,
    };
  }
  return getPresetState(t);
}

function drawFrame(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  if (!paused) elapsed += dt;

  const { w, h } = resizeCanvas();
  drawBackdrop(w, h);
  syncVisualCfgFromValues();

  const state = getRenderState(elapsed);
  const baseRadius = 28 * values.sizeMul;

  const renderResult = window.BallVisual.drawJellyBall(ctx, {
    cfg: visualCfg,
    x: w * 0.5,
    y: h * 0.52,
    baseRadius,
    angle: state.angle,
    speed: state.speed,
    deformAmount: clamp(state.deformAmount, 0, 1),
    wobbleOffset: clamp(state.wobbleOffset, -1, 1),
    lookDirX: clamp(state.lookDirX, -1, 1),
    lookDirY: clamp(state.lookDirY, -1, 1),
    time: elapsed * 1000,
    faceMode: state.speed > 1200 ? "flight_squint" : "normal",
    layerVisibility,
    collectLayerDebug: true,
  });

  if (renderResult && Array.isArray(renderResult.layers)) {
    drawLayerLabels(renderResult.layers);
  }

  requestAnimationFrame(drawFrame);
}

resetBtn.addEventListener("click", () => {
  Object.assign(visualCfg, window.BallVisual.defaultBallVisualCfg);
  for (const def of sliderDefs) {
    const defaultVal = def.key in window.BallVisual.defaultBallVisualCfg ? window.BallVisual.defaultBallVisualCfg[def.key] : def.value;
    values[def.key] = defaultVal;
    const input = sliders[def.key];
    if (!input) continue;
    input.value = String(defaultVal);
    const valueEl = input.previousElementSibling?.lastElementChild;
    if (valueEl) valueEl.textContent = def.step < 1 ? Number(defaultVal).toFixed(2) : String(Math.round(defaultVal));
  }
});

showAllLayersBtn.addEventListener("click", () => {
  setLayersByGroup(null, true);
});

hideAllLayersBtn.addEventListener("click", () => {
  setLayersByGroup(null, false);
});

showBodyOnlyBtn.addEventListener("click", () => {
  showOnlyGroup("body");
});

showFaceOnlyBtn.addEventListener("click", () => {
  showOnlyGroup("face");
});

if (saveLayersToGameBtn) {
  saveLayersToGameBtn.addEventListener("click", () => {
    const payload = {};
    for (const def of layerDefs) payload[def.key] = layerVisibility[def.key] !== false;
    localStorage.setItem(JELLY_LAYER_VISIBILITY_KEY, JSON.stringify(payload));
    setStatus("已保存到当前浏览器。游戏页会自动同步，或刷新后生效。");
  });
}

if (copyLayersConfigBtn) {
  copyLayersConfigBtn.addEventListener("click", async () => {
    const payload = {};
    for (const def of layerDefs) payload[def.key] = layerVisibility[def.key] !== false;
    const text = JSON.stringify(payload, null, 2);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("clipboard unavailable");
      }
      setStatus("已复制项目默认配置。把这段发我，我可直接写进代码并提交。");
    } catch {
      setStatus(`复制失败，请手动复制：${text}`);
    }
  });
}

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "继续" : "暂停";
});

buildSliderUi();
loadLayerVisibilityFromStorage();
buildLayerUi();
syncLayerCheckboxes();
window.addEventListener("resize", () => {
  lastTime = 0;
});
requestAnimationFrame(drawFrame);
