// One full-screen canvas for jasmine petals and gold flakes: bursts (date reveal, RSVP, gate) and a gentle drizzle.

import { prefersReducedMotion } from "./sound";

type Particle = {
  img: HTMLImageElement | null;
  color?: string;
  x: number; y: number; vx: number; vy: number;
  size: number; rot: number; vr: number; sway: number; phase: number;
  life: number; maxLife: number; gravity: number;
};

const PETAL_COUNT = 16;
const images: HTMLImageElement[] = [];
const particles: Particle[] = [];
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let frame = 0;
let last = 0;
let drizzleTimer = 0;
let dpr = 1;
/** Phones get fewer petals per burst: the effect still reads, at a fraction of the drawing work. */
const scaled = (count: number) => (window.innerWidth < 760 ? Math.ceil(count * 0.6) : count);

function ensureCanvas() {
  if (canvas || typeof document === "undefined") return;
  canvas = document.createElement("canvas");
  canvas.className = "noor-petal-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  const resize = () => {
    if (!canvas) return;
    // petals are soft and small: 1.5x is sharp enough, and a 3x full-screen canvas is a lot to clear and fill
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  preloadPetals();
}

/** Fetch and decode the petal images ahead of time (the gate calls this while it waits for the hold), so the
    first burst doesn't decode sixteen images on the main thread mid-animation. */
export function preloadPetals() {
  if (images.length || typeof document === "undefined") return;
  for (let i = 1; i <= PETAL_COUNT; i++) {
    const img = new Image();
    img.decoding = "async";
    img.src = `/images/noor/petals/${i}.webp`;
    void img.decode?.().catch(() => {});
    images.push(img);
  }
}

function tick(now: number) {
  if (!ctx || !canvas) return;
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (!p) continue;
    p.life += dt;
    p.vy += p.gravity * dt;
    p.vx *= 0.985;
    p.x += (p.vx + Math.sin(p.life * 2 + p.phase) * p.sway) * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    const fade = Math.min(1, (p.maxLife - p.life) / 0.6);
    if (p.life > p.maxLife || p.y > window.innerHeight + 60) { particles.splice(i, 1); continue; }
    // one transform per petal (position, rotation and pixel ratio) instead of save/translate/rotate/restore
    const cos = Math.cos(p.rot) * dpr, sin = Math.sin(p.rot) * dpr;
    ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
    ctx.globalAlpha = Math.max(0, fade);
    if (p.img?.complete && p.img.naturalWidth) {
      const ratio = p.img.naturalHeight / p.img.naturalWidth;
      ctx.drawImage(p.img, -p.size / 2, (-p.size * ratio) / 2, p.size, p.size * ratio);
    } else {
      ctx.fillStyle = p.color ?? "#fffdf6";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  frame = particles.length ? requestAnimationFrame(tick) : 0;
}

function start() {
  if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
}

// petals/4 and 12 are gold-leaf shards, 6 and 14 gold leaves: they read as debris in a drizzle,
// so drifting petals use jasmine only and bursts get the odd gold leaf.
const JASMINE = [1, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15, 16];
const BURST = [...JASMINE, 6, 14];
const pickFrom = (set: number[]) => images[(set[Math.floor(Math.random() * set.length)] ?? 1) - 1] ?? null;
const pick = () => pickFrom(BURST);

/** Petals burst outward from a screen point. */
export function petalBurst(x: number, y: number, count = 36) {
  if (prefersReducedMotion()) return;
  ensureCanvas();
  for (let i = 0; i < scaled(count); i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 160 + Math.random() * 420;
    particles.push({
      img: pick(), x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 260,
      size: 12 + Math.random() * 14, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 6,
      sway: 20 + Math.random() * 40, phase: Math.random() * 6,
      life: 0, maxLife: 3 + Math.random() * 1.6, gravity: 380,
    });
  }
  start();
}

/** Small gold flakes that drop from where the guest scratches. */
export function goldFlakes(x: number, y: number, count = 3) {
  if (prefersReducedMotion()) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    particles.push({
      img: null, color: ["#f3d98a", "#c9a24a", "#e2bd5e"][i % 3] ?? "#c9a24a", x: x + (Math.random() - 0.5) * 30, y,
      vx: (Math.random() - 0.5) * 90, vy: -40 - Math.random() * 60,
      size: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12,
      sway: 10, phase: Math.random() * 6, life: 0, maxLife: 1.6, gravity: 520,
    });
  }
  start();
}

/** Petals drifting down from the top for a while. */
export function petalDrizzle(seconds = 5, perSecond = 2) {
  if (prefersReducedMotion()) return;
  ensureCanvas();
  window.clearInterval(drizzleTimer);
  const end = performance.now() + seconds * 1000;
  drizzleTimer = window.setInterval(() => {
    if (performance.now() > end) { window.clearInterval(drizzleTimer); return; }
    particles.push({
      img: pickFrom(JASMINE), x: Math.random() * window.innerWidth, y: -30,
      vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 40,
      size: 10 + Math.random() * 10, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 2,
      sway: 30 + Math.random() * 30, phase: Math.random() * 6,
      life: 0, maxLife: 14, gravity: 6,
    });
    start();
  }, 1000 / perSecond);
}
