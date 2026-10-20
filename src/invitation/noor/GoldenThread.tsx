import { useEffect, useRef } from "react";
import { loadMotion } from "./motion";
import { prefersReducedMotion } from "./sound";

const NODE_R = 9;

/**
 * Two gold threads down the paper's side margins that draw with the scroll (a spark at each tip), bulging
 * around a diamond node at every section, which lights up when the thread reaches it. Lives behind content
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
    let table: { y: number; len: number }[] = [];
    let total = 0;
    let nodes: { y: number; els: SVGElement[] }[] = [];
    let kill = () => {};
    const still = prefersReducedMotion();

    const sideX = (w: number) => (w < 760 ? 7 : Math.max(22, (w - 1120) / 2 - 36));

    const build = () => {
      const w = paper.clientWidth, h = paper.scrollHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.height = `${h}px`;
      const top = paper.getBoundingClientRect().top;
      const ys = [...paper.querySelectorAll<HTMLElement>(":scope > section")].slice(1)
        .map((s) => s.getBoundingClientRect().top - top + 6);
      const x = sideX(w);
      const r = w < 760 ? 6 : NODE_R;
      // one path per side; each bulges inward (toward the content) around every node
      const make = (side: number, inward: number) => {
        let d = `M${side} 0`;
        for (const y of ys) d += ` L${side} ${y - r} A${r} ${r} 0 0 ${inward > 0 ? 1 : 0} ${side} ${y + r}`;
        return `${d} L${side} ${h}`;
      };
      const left = make(x, 1), right = make(w - x, -1);
      [lines[0], glows[0]].forEach((p) => p?.setAttribute("d", left));
      [lines[1], glows[1]].forEach((p) => p?.setAttribute("d", right));
      // length lookup by height (the path only ever goes down)
      const probe = lines[0]!;
      total = probe.getTotalLength();
      table = [];
      for (let len = 0; len <= total; len += 6) table.push({ y: probe.getPointAtLength(len).y, len });
      table.push({ y: h, len: total });
      for (const p of [...lines, ...glows]) { p.style.strokeDasharray = `${total}`; p.style.strokeDashoffset = still ? "0" : `${total}`; }
      nodeLayer.replaceChildren();
      nodes = ys.map((y) => {
        const els = [x + r, w - x - r].map((cx) => {
          const n = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          n.setAttribute("x", String(cx - 4)); n.setAttribute("y", String(y - 4));
          n.setAttribute("width", "8"); n.setAttribute("height", "8");
          n.setAttribute("transform", `rotate(45 ${cx} ${y})`);
          n.setAttribute("class", `noor-thread__node${still ? " is-lit" : ""}`);
          nodeLayer.appendChild(n);
          return n as SVGElement;
        });
        return { y, els };
      });
      draw();
    };

    const lengthAt = (y: number) => {
      if (y <= 0) return 0;
      let lo = 0, hi = table.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if ((table[mid]?.y ?? 0) < y) lo = mid + 1; else hi = mid; }
      return table[lo]?.len ?? total;
    };

    const draw = () => {
      if (still || !table.length) return;
      const tipY = window.innerHeight * 0.72 - paper.getBoundingClientRect().top;
      const len = Math.min(total, lengthAt(tipY));
      for (const p of [...lines, ...glows]) p.style.strokeDashoffset = String(total - len);
      sparks.forEach((spark, i) => {
        const pt = (lines[i] ?? lines[0]!).getPointAtLength(len);
        spark.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        spark.style.opacity = len > 4 && len < total - 4 ? "1" : "0";
      });
      for (const n of nodes) n.els.forEach((el) => el.classList.toggle("is-lit", tipY > n.y));
    };

    build();
    const observer = new ResizeObserver(() => build());
    observer.observe(paper);
    void loadMotion().then(({ ScrollTrigger }) => {
      const st = ScrollTrigger.create({ trigger: paper, start: "top bottom", end: "bottom top", onUpdate: draw, onRefresh: build });
      kill = () => st.kill();
    });
    return () => { observer.disconnect(); kill(); };
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
