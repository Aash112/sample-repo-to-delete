import { useEffect, useRef } from "react";
import { buzz, playSfx, prefersReducedMotion } from "./sound";

// The hero's living night: small gold eight-pointed stars (the wall's own motif) that twinkle, turn and glint,
// waking up as the pointer passes; the pointer carries a warm light across the carved wall (the torch);
// shooting stars now and then, and a tap sends one from that spot with a burst of tiny stars.

type Twinkle = { x: number; y: number; size: number; depth: number; rot: number; spin: number; phase: number; speed: number; wake: number; glint: number };
type Star = { x: number; y: number; vx: number; vy: number; life: number; max: number; trail: { x: number; y: number }[]; auto: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; rot: number };

const GOLD = "255, 214, 140";
/** Half the torch's size: its pool of light is centred on the pointer. */
const TORCH = 220;

/** An eight-pointed star (two squares, one turned 45°) as a filled path. */
function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  const inner = r * 0.62;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = rot + (i * Math.PI) / 8;
    const d = i % 2 ? inner : r;
    if (i) ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
}

export function HeroSky({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const torchRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const torch = torchRef.current;
    const host = canvas?.parentElement;
    // nothing runs until the doors open: the gate and its animation get the whole frame budget
    if (!active || !canvas || !host || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, frame = 0, last = performance.now(), nextStar = 2.5, visible = true;
    // a star's glow, drawn once and stamped (no gradient objects built per star per frame)
    const glow = document.createElement("canvas");
    glow.width = glow.height = 64;
    const gctx = glow.getContext("2d")!;
    const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${GOLD}, 0.3)`);
    grad.addColorStop(1, `rgba(${GOLD}, 0)`);
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 64, 64);

    const pointer = { x: -9999, y: -9999, on: false, px: 0, py: 0 };
    const twinkles: Twinkle[] = [];
    const stars: Star[] = [];
    const sparks: Spark[] = [];
    // the arch's box (host coordinates): the background stars and passing shooting stars stay outside it
    const arch = { x: 0, y: 0, w: 0, h: 0 };
    const measureArch = () => {
      const a = host.querySelector(".noor-hero__arch")?.getBoundingClientRect();
      const r = host.getBoundingClientRect();
      if (a) Object.assign(arch, { x: a.left - r.left, y: a.top - r.top, w: a.width, h: a.height });
    };
    const inArch = (x: number, y: number, pad: number) =>
      x > arch.x - pad && x < arch.x + arch.w + pad && y > arch.y - pad && y < arch.y + arch.h + pad;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width; h = rect.height;
      torch?.style.setProperty("--w", `${w}px`);
      torch?.style.setProperty("--h", `${h}px`);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureArch();
      const free = Math.max(0, w * h - arch.w * arch.h);
      const want = Math.round(Math.min(34, Math.max(10, free / 30000)));
      // spread over all the open background: random spots outside the arch, kept apart so they never clump
      twinkles.length = 0;
      const gap = Math.sqrt(free / want) * 0.6;
      for (let tries = 0; twinkles.length < want && tries < want * 60; tries++) {
        const x = Math.random() * w, y = Math.random() * h * 0.92;
        if (inArch(x, y, 18) || twinkles.some((t) => Math.hypot(t.x - x, t.y - y) < gap)) continue;
        twinkles.push(newTwinkle(x, y));
      }
    };
    const newTwinkle = (x: number, y: number): Twinkle => {
      const depth = 0.4 + Math.random() * 0.6;
      return {
        x, y,
        size: (3 + Math.random() * 5) * depth, depth, rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.25, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.9,
        wake: 0, glint: 0,
      };
    };

    const shoot = (x: number, y: number, auto = false, dir = Math.random() > 0.5 ? 1 : -1) => {
      const speed = 520 + Math.random() * 260;
      const angle = (0.28 + Math.random() * 0.22) * Math.PI;
      stars.push({ x, y, vx: Math.cos(angle) * speed * dir, vy: Math.sin(angle) * speed, life: 0, max: 1 + Math.random() * 0.4, trail: [], auto });
    };
    const burst = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 220;
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0, max: 0.7 + Math.random() * 0.8, r: 2 + Math.random() * 3, rot: Math.random() * Math.PI });
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // everything ambient is drawn outside the arch only (what a tap sets off may cross it)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(arch.x, arch.y, arch.w, arch.h);
      ctx.clip("evenodd");

      // eight-pointed stars: twinkle, turn, glint now and then, wake up (brighter, spinning) near the pointer
      for (const t of twinkles) {
        t.phase += dt * t.speed;
        const near = pointer.on ? Math.max(0, 1 - Math.hypot(pointer.x - t.x, pointer.y - t.y) / 180) : 0;
        t.wake += (near - t.wake) * Math.min(1, dt * 4);
        t.rot += (t.spin + t.wake * 2.4) * dt;
        if (t.glint <= 0 && Math.random() < dt * (0.04 + t.wake * 1.5)) t.glint = 1;
        t.glint = Math.max(0, t.glint - dt * 1.6);
        // depth parallax: near stars drift further with the pointer
        const x = t.x - pointer.px * 14 * t.depth, y = t.y - pointer.py * 9 * t.depth;
        const shine = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t.phase)) + t.wake * 0.5;
        const r = t.size * (1 + t.wake * 0.6);
        ctx.globalAlpha = Math.min(1, shine);
        ctx.drawImage(glow, x - r * 4, y - r * 4, r * 8, r * 8);
        ctx.fillStyle = "#f7dc96";
        starPath(ctx, x, y, r, t.rot);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (t.glint > 0) {
          // a four-ray glint flashing across the star
          const g = Math.sin(t.glint * Math.PI), len = r * (3 + 4 * g);
          ctx.strokeStyle = `rgba(255, 248, 225, ${0.85 * g})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
          ctx.moveTo(x, y - len * 0.7); ctx.lineTo(x, y + len * 0.7);
          ctx.stroke();
        }
      }

      // shooting stars with a tapering trail
      nextStar -= dt;
      if (nextStar <= 0) {
        // start beside the arch and streak outward, across the open background
        const left = Math.random() < 0.5;
        const x = left ? Math.max(10, arch.x - 30 - Math.random() * 120) : Math.min(w - 10, arch.x + arch.w + 30 + Math.random() * 120);
        shoot(x, h * Math.random() * 0.3, true, left ? -1 : 1);
        nextStar = 4 + Math.random() * 5;
      }
      for (let pass = 0; pass < 2; pass++) {
        // pass 0: ambient stars (clipped); pass 1: tapped ones, unclipped
        if (pass === 1) ctx.restore();
        for (let i = stars.length - 1; i >= 0; i--) {
          const s = stars[i]!;
          if (s.auto !== (pass === 0)) continue;
          s.life += dt; s.x += s.vx * dt; s.y += s.vy * dt;
          s.trail.unshift({ x: s.x, y: s.y });
          if (s.trail.length > 18) s.trail.pop();
          const fade = Math.min(1, s.life * 6) * Math.max(0, 1 - s.life / s.max);
          for (let t = 1; t < s.trail.length; t++) {
            const a = s.trail[t - 1]!, b = s.trail[t]!;
            ctx.strokeStyle = `rgba(255, 240, 200, ${fade * (1 - t / s.trail.length)})`;
            ctx.lineWidth = 2.6 * (1 - t / s.trail.length);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
          ctx.fillStyle = `rgba(255, 250, 235, ${fade})`;
          ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2); ctx.fill();
          if (Math.random() < 0.35) sparks.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 40, vy: 20 + Math.random() * 40, life: 0, max: 0.6, r: 1.6, rot: Math.random() * Math.PI });
          if (s.life > s.max) stars.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!;
        p.life += dt; p.vy += 140 * dt; p.vx *= 0.97; p.vy *= 0.97;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 3;
        const a = Math.max(0, 1 - p.life / p.max);
        ctx.fillStyle = `rgba(255, 226, 160, ${a})`;
        starPath(ctx, p.x, p.y, p.r * (0.4 + 0.6 * a), p.rot);
        ctx.fill();
        if (p.life > p.max) sparks.splice(i, 1);
      }

      ctx.globalCompositeOperation = "source-over";
      frame = visible ? requestAnimationFrame(step) : 0;
    };

    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      const p = local(event);
      Object.assign(pointer, p, { on: true, px: p.x / w - 0.5, py: p.y / h - 0.5 });
      // the light moves as two GPU layers (the pool, and the wall pattern inside it held still), not by
      // repainting a full-screen masked, filtered layer on every touch move
      if (torch) {
        torch.style.transform = `translate(${p.x - TORCH}px, ${p.y - TORCH}px)`;
        (torch.firstElementChild as HTMLElement | null)?.style.setProperty("transform", `translate(${TORCH - p.x}px, ${TORCH - p.y}px)`);
      }
      host.classList.add("is-lit-by-pointer");
    };
    const onLeave = () => { pointer.on = false; host.classList.remove("is-lit-by-pointer"); };
    // a finger's light lingers a moment after it lifts, then goes out
    const onTouchEnd = (event: PointerEvent) => { if (event.pointerType !== "mouse") window.setTimeout(onLeave, 900); };
    const onTap = (event: PointerEvent) => {
      // lanterns and other controls keep their own taps
      if ((event.target as HTMLElement).closest("button, a")) return;
      const { x, y } = local(event);
      onMove(event);
      burst(x, y, 22);
      shoot(x, y);
      playSfx("chime", 0.25, 1.1 + Math.random() * 0.3);
      buzz(8);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !frame) { last = performance.now(); frame = requestAnimationFrame(step); }
    });

    resize();
    // the arch settles during the entrance zoom: re-measure its box for the clip once it has (polling it would
    // force a style and layout pass every time)
    const archTimers = [1200, 3200].map((ms) => window.setTimeout(measureArch, ms));
    io.observe(host);
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerup", onTouchEnd);
    host.addEventListener("pointerdown", onTap);
    return () => {
      cancelAnimationFrame(frame);
      archTimers.forEach((t) => window.clearTimeout(t));
      io.disconnect();
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerup", onTouchEnd);
      host.removeEventListener("pointerdown", onTap);
    };
  }, [active]);

  return (
    <>
      <span ref={torchRef} className="noor-hero__torch" aria-hidden="true"><span /></span>
      <canvas ref={canvasRef} className={`noor-hero__sky-fx ${active ? "is-on" : ""}`} aria-hidden="true" />
    </>
  );
}
