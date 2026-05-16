type Point = { x: number; y: number };

export function toScreenPointFromEvent(canvas: HTMLCanvasElement, e: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function toWorldPointFromEvent(canvas: HTMLCanvasElement, cameraX: number, cameraY: number, e: PointerEvent): Point {
  const p = toScreenPointFromEvent(canvas, e);
  return {
    x: p.x + cameraX,
    y: p.y + cameraY,
  };
}

export function screenToWorldPoint(cameraX: number, cameraY: number, p: Point): Point {
  return {
    x: p.x + cameraX,
    y: p.y + cameraY,
  };
}
