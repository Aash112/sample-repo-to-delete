import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { petalBurst, petalDrizzle } from "./petals";
import { buzz, playSfx, prefersReducedMotion, unlockSound } from "./sound";

const HOLD_MS = 1100;
const RING = 2 * Math.PI * 47;

type Props = {
  /** Pointer went down on the seal: a user gesture, so audio can be unlocked here. */
  onHoldStart: () => void;
  onHoldCancel: () => void;
  /** The seal broke; doors are opening. */
  onUnseal: () => void;
  /** The doors start to open: the hero can start its entrance underneath. */
  onReveal: () => void;
  /** The doors have moved out of view and the gate is gone. */
  onOpened: () => void;
};

export function Gate({ onHoldStart, onHoldCancel, onUnseal, onReveal, onOpened }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const holdStart = useRef(0);
  const raf = useRef(0);
  const done = useRef(false);
  const [holding, setHolding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("noor-locked");
    return () => document.documentElement.classList.remove("noor-locked");
  }, []);

  const setProgress = (value: number) => {
    if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - value));
  };

  const finish = () => {
    document.documentElement.classList.remove("noor-locked");
    setGone(true);
    onOpened();
  };

  const open = async () => {
    if (done.current) return;
    done.current = true;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setProgress(1);
    onUnseal();
    playSfx("seal-crack", 0.7);
    buzz([20, 40, 30]);
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      onReveal();
      el.classList.add("noor-gate--fade");
      window.setTimeout(finish, 600);
      return;
    }
    const { gsap } = await loadMotion();
    const q = gsap.utils.selector(el);
    const seal = q(".noor-gate__seal")[0]?.getBoundingClientRect();
    gsap.timeline({ onComplete: finish })
      // the seal pops and falls away
      .to(q(".noor-gate__seal"), { scale: 1.15, duration: 0.16, ease: "power2.out" })
      .to(q(".noor-gate__seal"), { scale: 0.5, rotate: 28, y: 120, opacity: 0, duration: 0.55, ease: "power2.in" })
      .add(() => { if (seal) petalBurst(seal.left + seal.width / 2, seal.top + seal.height / 2, 22); }, "<")
      .to(q(".noor-gate__intro, .noor-gate__hint, .noor-gate__motes"), { opacity: 0, y: -10, duration: 0.4, stagger: 0.05 }, "<")
      // the doors swing open onto the hero, which starts its entrance behind them
      .add(() => { el.classList.add("is-opening"); onReveal(); playSfx("doors", 0.6); }, "-=0.15")
      .to(q(".noor-gate__door--left"), { rotateY: -108, duration: 1.7, ease: "power2.inOut" }, "<")
      .to(q(".noor-gate__door--right"), { rotateY: 108, duration: 1.7, ease: "power2.inOut" }, "<")
      .add(() => petalDrizzle(5, 2), "<0.6")
      // then walk through: the doorway (and the wall around it) grows past the screen edges
      .add(() => el.classList.add("is-through"), "<0.4")
      .to(q(".noor-gate__lanterns"), { opacity: 0, y: -40, duration: 0.6, ease: "power1.in" }, "<")
      .to(q(".noor-gate__stage"), { scale: 3.4, duration: 1.2, ease: "power2.in" }, "<")
      // the wall dissolves as you pass through, so its edge never reads as a frame around the hero
      .to(q(".noor-gate__wall"), { opacity: 0, duration: 0.7, ease: "sine.inOut" }, "<0.1")
      .to(q(".noor-gate__stage"), { opacity: 0, duration: 0.4, ease: "power1.in" }, "-=0.4");
  };

  const tick = () => {
    const value = Math.min(1, (performance.now() - holdStart.current) / HOLD_MS);
    setProgress(value);
    if (value >= 1) { void open(); return; }
    raf.current = requestAnimationFrame(tick);
  };

  const start = (event: React.PointerEvent) => {
    if (done.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    unlockSound();
    onHoldStart();
    buzz(10);
    setHolding(true);
    holdStart.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (done.current || !holding) return;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setProgress(0);
    onHoldCancel();
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  if (gone) return null;

  const { couple, invitation, noor } = weddingConfig;

  return (
    <div ref={root} className="noor-gate" role="dialog" aria-modal="true" aria-label={invitation.envelopeTitle}>
      <div className="noor-gate__lanterns" aria-hidden="true">
        <img className="noor-gate__wall-lantern noor-gate__wall-lantern--left" src={img("lantern-lit")} alt="" />
        <img className="noor-gate__wall-lantern noor-gate__wall-lantern--right" src={img("lantern-lit")} alt="" />
      </div>
      <div className="noor-gate__motes" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>

      <header className="noor-gate__intro">
        <p className="noor-arabic noor-gate__arabic" lang="ar">{invitation.arabicShort}</p>
        <p className="noor-eyebrow noor-eyebrow--light">{noor.gate.eyebrow}</p>
        <h1 className="noor-gate__names">
          {couple.groom.firstName} <em>&amp;</em> {couple.bride.firstName}
        </h1>
      </header>

      <div className="noor-gate__stage">
        {/* the wall around the doors, with one doorway-shaped hole cut out of it from the start: the hero
            underneath shows through as the doors swing, and the wall zooms with the doors (it lives in the stage) */}
        <div className="noor-gate__wall" aria-hidden="true" />
        <div className="noor-gate__doors">
          <img className="noor-gate__door noor-gate__door--left" src={img("door-left")} alt="" fetchPriority="high" draggable={false} />
          <img className="noor-gate__door noor-gate__door--right" src={img("door-right")} alt="" fetchPriority="high" draggable={false} />
          <span className="noor-gate__seam" aria-hidden="true" />
          <button
            type="button"
            className={`noor-gate__seal ${holding ? "is-holding" : ""}`}
            aria-label={noor.gate.hint}
            onPointerDown={start}
            onPointerUp={cancel}
            onPointerCancel={cancel}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); unlockSound(); onHoldStart(); void open(); }
            }}
          >
            <img src={img("seal")} alt="" draggable={false} />
            <span className="noor-gate__mono" aria-hidden="true">
              {couple.monogram.groom}<i>&amp;</i>{couple.monogram.bride}
            </span>
            <svg className="noor-gate__ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="47" className="noor-gate__ring-track" />
              <circle ref={ring} cx="50" cy="50" r="47" className="noor-gate__ring-fill" style={{ strokeDasharray: RING, strokeDashoffset: RING }} />
            </svg>
          </button>
        </div>
      </div>

      <p className="noor-gate__hint" aria-hidden="true">
        <span className="noor-gate__hint-dot" /> {noor.gate.hint}
      </p>
    </div>
  );
}
