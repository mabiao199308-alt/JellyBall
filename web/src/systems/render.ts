export function renderMeterHud(el: HTMLElement | null, runMeters: number) {
  if (!el) return;
  el.textContent = `高度：${Math.round(runMeters)}米`;
}

export function renderFpsHud(el: HTMLElement | null, fps: number) {
  if (!el) return;
  el.textContent = `FPS: ${Math.round(fps)}`;
}
