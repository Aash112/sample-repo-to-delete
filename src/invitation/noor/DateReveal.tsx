import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { Accent } from "./Accent";
import { goldFlakes, petalBurst } from "./petals";
import { buzz, playSfx, prefersReducedMotion, unlockSound } from "./sound";

const { noor, scratchCard, invitation, moments } = weddingConfig;
const REVEAL_AT = 0.42;

export function DateReveal() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  const reveal = () => {
    if (started.current) return;
    started.current = true;
    setProgress(1);
    setRevealed(true);
    playSfx("reveal", 0.6);
    buzz([18, 35, 18]);
    const box = canvas.current?.getBoundingClientRect();
    if (box) petalBurst(box.left + box.width / 2, box.top + box.height / 2, 44);
  };

  useEffect(() => {
    if (prefersReducedMotion()) { started.current = true; setRevealed(true); }
  }, []);

  // Scroll: the quote lights up word by word; the medallion turns and settles into place.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let kill = () => {};
    void Promise.all([loadMotion(), import("animejs")]).then(([{ gsap }, { splitText }]) => {
      const quote = el.querySelector<HTMLElement>(".noor-hero-message");
      const split = quote ? splitText(quote, { words: true }) : null;
      const ctx = gsap.context(() => {
        if (split) {
          gsap.fromTo(split.words, { opacity: 0.14 }, {
            opacity: 1, stagger: 0.08, ease: "none",
            scrollTrigger: { trigger: quote, start: "top 88%", end: "bottom 45%", scrub: true },
          });
        }
        // only the frame turns: rotating the disc would throw off where the finger scratches
        const settle = { trigger: ".noor-date__medallion", start: "top bottom", end: "center 60%", scrub: 0.8 };
        gsap.fromTo(".noor-date__frame", { rotate: -45 }, { rotate: 0, ease: "power1.out", scrollTrigger: settle });
        gsap.fromTo(".noor-date__medallion", { scale: 0.84 }, { scale: 1, ease: "power1.out", scrollTrigger: settle });
      }, el);
      kill = () => { ctx.revert(); split?.revert(); };
    });
    return () => kill();
  }, []);

  // Paint the gold leaf.
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const leaf = new Image();
    leaf.src = img("gold-leaf");
    const paint = () => {
      const { width } = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = el.height = Math.max(1, Math.round(width * dpr));
      const s = el.width;
      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); ctx.clip();
      if (leaf.complete && leaf.naturalWidth) ctx.drawImage(leaf, 0, 0, s, s);
      else { ctx.fillStyle = "#c9a24a"; ctx.fillRect(0, 0, s, s); }
      const sheen = ctx.createLinearGradient(0, 0, s, s);
      sheen.addColorStop(0, "rgba(255,248,217,.0)"); sheen.addColorStop(0.45, "rgba(255,248,217,.28)"); sheen.addColorStop(0.55, "rgba(255,248,217,.0)");
      ctx.fillStyle = sheen; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "rgba(18,53,36,.55)"; ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath(); ctx.arc(s / 2, s / 2, s * 0.37, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#123524"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${s * 0.062}px "Cormorant Garamond", serif`;
      ctx.fillText(scratchCard.scratchGold, s / 2, s / 2 - s * 0.035);
      ctx.font = `500 ${s * 0.045}px "Cormorant Garamond", serif`;
      ctx.fillText(scratchCard.revealDate, s / 2, s / 2 + s * 0.045);
      ctx.restore();
    };
    leaf.onload = paint;
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scratching.
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d", { willReadFrequently: true });
    if (!el || !ctx || revealed) return;
    let down = false, last: { x: number; y: number } | null = null, moves = 0, lastSound = 0;

    const measure = () => {
      const { data } = ctx.getImageData(0, 0, el.width, el.height);
      const s = el.width, r = s / 2;
      let total = 0, clear = 0;
      for (let y = 0; y < s; y += 6) for (let x = 0; x < s; x += 6) {
        if ((x - r) ** 2 + (y - r) ** 2 > r * r) continue;
        total++; if (data[(y * s + x) * 4 + 3] === 0) clear++;
      }
      const ratio = total ? clear / total : 0;
      setProgress(ratio);
      if (ratio > REVEAL_AT) reveal();
    };
    const erase = (cx: number, cy: number) => {
      const rect = el.getBoundingClientRect(), dpr = el.width / rect.width;
      const x = (cx - rect.left) * dpr, y = (cy - rect.top) * dpr;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = rect.width * 0.16 * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(last?.x ?? x, last?.y ?? y); ctx.lineTo(x, y); ctx.stroke();
      last = { x, y };
      if (++moves % 3 === 0) goldFlakes(cx, cy, 2);
      if (moves % 6 === 0) measure();
      const now = performance.now();
      if (now - lastSound > 260) { playSfx("scratch", 0.25, 0.9 + Math.random() * 0.2); lastSound = now; }
    };
    const onDown = (e: PointerEvent) => { down = true; last = null; unlockSound(); el.setPointerCapture(e.pointerId); erase(e.clientX, e.clientY); };
    const onMove = (e: PointerEvent) => { if (down) erase(e.clientX, e.clientY); };
    const onUp = () => { if (!down) return; down = false; last = null; measure(); };
    el.addEventListener("pointerdown", onDown); el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp); el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp);
    };
  }, [revealed]);

  const moment = moments[0];

  return (
    <section ref={root} className={`noor-date noor-reveal ${revealed ? "is-revealed" : ""}`} data-reveal aria-labelledby="noor-date-title">
      <p className="noor-hero-message">{invitation.heroMessage}</p>
      <p className="noor-eyebrow">{noor.date.eyebrow}</p>
      <h2 id="noor-date-title" className="noor-title"><Accent text={noor.date.title} /></h2>

      <div className="noor-date__medallion">
        <img className="noor-date__frame" src={img("star-frame")} alt="" loading="lazy" aria-hidden="true" />
        <div
          className="noor-date__disc"
          role="button"
          tabIndex={0}
          aria-label={revealed ? scratchCard.revealedAria : scratchCard.hiddenAria}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unlockSound(); reveal(); } }}
        >
          <div className="noor-date__face">
            <small>{noor.date.dayLabel}</small>
            <strong>{noor.date.day}</strong>
            <span>{noor.date.monthYear}</span>
            <em>{(moment.time.split("–")[0] ?? moment.time).trim()}</em>
          </div>
          <canvas ref={canvas} className="noor-date__foil" aria-hidden="true" />
        </div>
      </div>

      <p className="noor-date__status" aria-live="polite">
        {revealed ? scratchCard.foreverBegins : `${scratchCard.scratchHint} · ${Math.round(progress * 100)}%`}
      </p>
    </section>
  );
}
