export function setTextStatus(el: HTMLElement | null, text: string) {
  if (!el) return;
  el.textContent = text;
}

export function syncPanelVisibility(
  panel: HTMLElement | null,
  toggleBtn: HTMLButtonElement | null,
  visible: boolean,
  visibleText: string,
  hiddenText: string,
) {
  if (!panel || !toggleBtn) return;
  panel.classList.toggle("is-hidden", !visible);
  toggleBtn.textContent = visible ? visibleText : hiddenText;
}
