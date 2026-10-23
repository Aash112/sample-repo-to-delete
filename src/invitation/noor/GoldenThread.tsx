import { useEffect, useRef } from "react";
import { loadMotion } from "./motion";
import { prefersReducedMotion } from "./sound";

const BEND_R = 9;

/**
 * Two gold threads down the paper's side margins that draw with the scroll (a spark at each tip), bending
 * inward in a small arc at every section around a diamond that sits in the arc's hollow (an even gap all round)
 * and lights up when the thread reaches it. Lives behind content
 * and only in the margins, so it never crosses text.
 */
export function GoldenThread() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const paper = box?.parentElement;
    if (!box || !paper) return;
    const svg = box.querySelector("svg")!;
    const lines = [...svg.querySelectorAll<SVGPathElement>(".noor-thread__line")];
    const glows = [...svg.querySelectorAll<SVGPathElement>(".noor-thread__glow")];
    const sparks = [...svg.querySelectorAll<SVGGElement>(".noor-thread__spark")];
    const nodeLayer = svg.querySelector<SVGGElement>(".noor-thread__nodes")!;
    // the path is straight runs plus half-circle bends, so its length at any height is computed exactly
    // (sampling it with getPointAtLength took over a second on phones, on every scroll refresh)
    let bends: number[] = [];
    let r = BEND_R, x = 0, w = 0, h = 0;
    let total = 0;
    let nodes: { y: number; els: SVGElement[] }[] = [];
    let kill = () => {};
    let cancelled = false;
    const still = prefersReducedMotion();

    const sideX = (w: number) => (w < 760 ? 7 : Math.max(22, (w - 1120) / 2 - 36));

    const build = () => {
      w = paper.clientWidth; h = paper.scrollHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.height = `${h}px`;
      const top = paper.getBoundingClientRect().top;
      const ys = [...paper.querySelectorAll<HTMLElement>(":scope > section")].slice(1)
        .map((s) => s.getBoundingClientRect().top - top + 6);
      x = sideX(w);
      r = w < 760 ? 6 : BEND_R;
      bends = ys;
      // one path per side; each bends inward (toward the content) at every section
      const make = (side: number, inward: number) => {
        let d = `M${side} 0`;
        for (const y of ys) d += ` L${side} ${y - r} A${r} ${r} 0 0 ${inward > 0 ? 1 : 0} ${side} ${y + r}`;
        return `${d} L${side} ${h}`;
      };
      const left = make(x, 1), right = make(w - x, -1);
      [lines[0], glows[0]].forEach((p) => p?.setAttribute("d", left));
      [lines[1], glows[1]].forEach((p) => p?.setAttribute("d", right));
      total = lengthAt(h);
      for (const p of [...lines, ...glows]) { p.style.strokeDasharray = `${total}`; p.style.strokeDashoffset = still ? "0" : `${total}`; }
      // the diamond is centred on the arc's centre and sized to leave the same gap to the arc on every side
      const size = r * 0.78;
      nodeLayer.replaceChildren();
      nodes = ys.map((y) => {
        const els = [x, w - x].map((cx) => {
          const n = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          n.setAttribute("x", String(cx - size / 2)); n.setAttribute("y", String(y - size / 2));
          n.setAttribute("width", String(size)); n.setAttribute("height", String(size));
          n.setAttribute("transform", `rotate(45 ${cx} ${y})`);
          n.setAttribute("class", `noor-thread__node${still ? " is-lit" : ""}`);
          nodeLayer.appendChild(n);
          return n as SVGElement;
        });
        return { y, els };
      });
      draw();
    };

    /** How far into a bend a height is: the arc's angle (0 at its top, π at its bottom), or null if outside. */
    const bendAngle = (y: number, at: number) => (Math.abs(y - at) < r ? Math.acos((at - y) / r) : null);

    const lengthAt = (y: number) => {
      const target = Math.min(Math.max(y, 0), h);
      let len = 0, from = 0;
      for (const at of bends) {
        if (target <= at - r) return len + target - from;
        len += at - r - from;
        const angle = bendAngle(target, at);
        if (angle !== null) return len + r * angle;
        len += Math.PI * r;
        from = at + r;
      }
      return len + target - from;
    };

    /** The thread's x at a height, on the side that starts at `side` and bends toward `inward`. */
    const xAt = (y: number, side: number, inward: number) => {
      for (const at of bends) { const angle = bendAngle(y, at); if (angle !== null) return side + inward * r * Math.sin(angle); }
      return side;
    };

    const draw = () => {
      if (still || !total) return;
      const tipY = window.innerHeight * 0.72 - paper.getBoundingClientRect().top;
      const len = Math.min(total, lengthAt(tipY));
      for (const p of [...lines, ...glows]) p.style.strokeDashoffset = String(total - len);
      for (const n of nodes) n.els.forEach((el) => el.classList.toggle("is-lit", tipY > n.y));
      const y = Math.min(Math.max(tipY, 0), h);
      sparks.forEach((spark, i) => {
        const sx = i === 0 ? xAt(y, x, 1) : xAt(y, w - x, -1);
        spark.setAttribute("transform", `translate(${sx} ${y})`);
        spark.style.opacity = len > 4 && len < total - 4 ? "1" : "0";
      });
    };

    build();
    const observer = new ResizeObserver(() => build());
    observer.observe(paper);
    void loadMotion().then(({ ScrollTrigger }) => {
      if (cancelled) return; // unmounted before GSAP loaded: never leave a stray copy of these animations
      const st = ScrollTrigger.create({ trigger: paper, start: "top bottom", end: "bottom top", onUpdate: draw, onRefresh: build });
      kill = () => st.kill();
    });
    return () => { cancelled = true; observer.disconnect(); kill(); };
  }, []);

  return (
    <div ref={wrap} className="noor-thread" aria-hidden="true">
      <svg preserveAspectRatio="none">
        <defs>
          <radialGradient id="noor-spark"><stop offset="0" stopColor="#fffbe8" /><stop offset="0.35" stopColor="#ffe19a" /><stop offset="1" stopColor="#f6b860" stopOpacity="0" /></radialGradient>
        </defs>
        <path className="noor-thread__glow" />
        <path className="noor-thread__glow" />
        <path className="noor-thread__line" />
        <path className="noor-thread__line" />
        <g className="noor-thread__nodes" />
        <g className="noor-thread__spark"><circle r="14" fill="url(#noor-spark)" /><circle r="2.6" fill="#fffbe8" /></g>
        <g className="noor-thread__spark"><circle r="14" fill="url(#noor-spark)" /><circle r="2.6" fill="#fffbe8" /></g>
      </svg>
    </div>
  );
}
