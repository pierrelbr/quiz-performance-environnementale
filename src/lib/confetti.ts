import confetti from "canvas-confetti";

const colors = ["#E2250C", "#F9D3CE", "#5AD5D9", "#AA89E3", "#03DFB2", "#D81E88"];

function reduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function burst() {
  if (reduced()) return;
  confetti({ particleCount: 60, spread: 70, startVelocity: 35, origin: { y: 0.7 }, colors, scalar: 0.9 });
}

export function celebrate() {
  if (reduced()) return;
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
