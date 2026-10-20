import { useMemo, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { img } from "./motion";
import { buzz, playSfx, prefersReducedMotion } from "./sound";

const { footer, couple, date, brand, noor } = weddingConfig;
const STARS = 30;

export function Footer() {
  const sky = useRef<HTMLDivElement>(null);
  const [heart, setHeart] = useState(false);

  const stars = useMemo(() => Array.from({ length: STARS }, (_, i) => {
    const t = (i / STARS) * Math.PI * 2;
    // heart curve, normalised to 0–100 within the sky box
    const hx = 50 + (16 * Math.sin(t) ** 3) * 2.2;
    const hy = 46 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 2.4;
    // scattered start: R2 low-discrepancy sequence, so the sky looks evenly random
    const frac = (n: number) => n - Math.floor(n);
    // rounded so the server and browser render identical styles
    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      hx: round(hx), hy: round(hy),
      sx: round(4 + frac(0.3 + i * 0.7548777) * 92), sy: round(6 + frac(0.6 + i * 0.5698403) * 80),
      size: round(2 + frac(i * 0.618034) * 3), twinkle: round(frac(i * 0.414214) * 4),
    };
  }), []);

  const toggle = async () => {
    const next = !heart;
    setHeart(next);
    buzz(next ? [10, 30, 10] : 8);
    playSfx(next ? "reveal" : "chime", 0.4);
    const el = sky.current;
    if (!el) return;
    const dots = [...el.querySelectorAll<HTMLElement>(".noor-footer__star")];
    const spotFor = (i: number) => {
      const s = stars[i] ?? { hx: 50, hy: 50, sx: 50, sy: 50 };
      return { left: `${next ? s.hx : s.sx}%`, top: `${next ? s.hy : s.sy}%` };
    };
    if (prefersReducedMotion()) {
      dots.forEach((d, i) => Object.assign(d.style, spotFor(i)));
      return;
    }
    const { animate, spring } = await import("animejs");
    dots.forEach((d, i) => {
      animate(d, {
        ...spotFor(i),
        scale: next ? [1, 1.6, 1.2] : 1,
        delay: Math.abs(i - STARS / 2) * 28,
        ease: spring({ bounce: 0.35, duration: 1200 }),
      });
    });
  };

  const families = [
    [footer.groomFamilyLabel, footer.groomFamily, footer.groomFamilyNote],
    [footer.brideFamilyLabel, footer.brideFamily, footer.brideFamilyNote],
    [footer.thanksLabel, footer.thanksName, footer.thanksNote],
  ];

  return (
    <footer className="noor-footer">
      <img className="noor-footer__border" src={img("border")} alt="" loading="lazy" aria-hidden="true" />

      <div ref={sky} className={`noor-footer__sky ${heart ? "is-heart" : ""}`}>
        {stars.map((s, i) => (
          <span key={i} className="noor-footer__star" style={{ left: `${s.sx}%`, top: `${s.sy}%`, width: s.size, height: s.size, animationDelay: `${s.twinkle}s` }} aria-hidden="true" />
        ))}
        <button type="button" className="noor-footer__moon" onClick={toggle} aria-pressed={heart} aria-label={noor.footer.crescentHint}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M40 6a26 26 0 1 0 18 44A22 22 0 1 1 40 6z" /></svg>
        </button>
        <span className="noor-footer__mono" aria-hidden="true">{couple.monogram.groom}<i>&amp;</i>{couple.monogram.bride}</span>
        <p className="noor-hint noor-hint--light">{noor.footer.crescentHint}</p>
      </div>

      <p className="noor-footer__script">{footer.script}</p>
      <p className="noor-footer__quote">{footer.quote}</p>

      <div className="noor-footer__families">
        {families.map(([label, names, note]) => (
          <div key={label} className="noor-reveal" data-reveal>
            <span>{label}</span>
            <strong>{names}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>


      <p className="noor-footer__mark">{couple.displayName} · {date.year}</p>
      <a className="noor-footer__brand" href={brand.url} target="_blank" rel="noreferrer">
        {brand.credit} <span aria-hidden="true">·</span> <u>{brand.cta}</u>
      </a>
    </footer>
  );
}
