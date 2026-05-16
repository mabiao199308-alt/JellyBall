export function applyGravity(body: { vy: number }, gravity: number, dt: number) {
  body.vy += gravity * dt;
}

export function applyAirDrag(body: { vx: number; vy: number }, airDrag: number) {
  body.vx *= airDrag;
  body.vy *= airDrag;
}

export function integrateBody(body: { x: number; y: number; vx: number; vy: number }, dt: number) {
  body.x += body.vx * dt;
  body.y += body.vy * dt;
}
