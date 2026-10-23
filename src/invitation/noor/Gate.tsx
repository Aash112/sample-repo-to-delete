import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { ease, img } from "./motion";
import { petalBurst, petalDrizzle, preloadPetals } from "./petals";
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
    // every visit starts at the top, behind the gate (the browser would otherwise restore the last position)
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("noor-locked");
    // decode the petals while the guest reads the gate, not during the first burst
    const idle = window.setTimeout(preloadPetals, 1200);
    return () => { window.clearTimeout(idle); document.documentElement.classList.remove("noor-locked"); };
  }, []);

  const setProgress = (value: number) => {
    if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - value));
  };

  const finish = () => {
    window.scrollTo(0, 0);
    document.documentElement.classList.remove("noor-locked");
    setGone(true);
    onOpened();
  };

  const open = () => {
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
    // Web Animations, not a GSAP timeline: they run on the compositor, so the work that lands mid-opening (the
    // hero's entrance, React commits, petal and audio decoding) can't make the doors stutter on phones.
    const q = (selector: string) => [...el.querySelectorAll<HTMLElement>(selector)];
    const play = (selector: string, keyframes: Keyframe[], at: number, duration: number, easing: string) =>
      q(selector).map((node) => node.animate(keyframes, { delay: at * 1000, duration: duration * 1000, easing, fill: "both" }));
    const later = (at: number, fn: () => void) => window.setTimeout(fn, at * 1000);
    const seal = q(".noor-gate__seal")[0]?.getBoundingClientRect();
    // How far the camera has to push so the doorway (and the open doors on its hinges) clears every screen edge.
    const stage = q(".noor-gate__stage")[0]?.getBoundingClientRect();
    const through = stage
      ? Math.max(window.innerWidth / stage.width, window.innerHeight / stage.height) * 2.4
      : 8;
    // the seal pops and falls away
    q(".noor-gate__seal").forEach((node) => node.animate([
      { transform: "none", easing: ease.outCubic },
      { transform: "scale(1.15)", opacity: 1, offset: 0.16 / 0.71, easing: ease.inCubic },
      { transform: "translateY(120px) rotate(28deg) scale(0.5)", opacity: 0 },
    ], { duration: 710, fill: "forwards" }));
    later(0.16, () => { if (seal) petalBurst(seal.left + seal.width / 2, seal.top + seal.height / 2, 22); });
    [".noor-gate__motes", ".noor-gate__intro", ".noor-gate__hint"].forEach((selector, i) =>
      play(selector, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-10px)" }], 0.16 + i * 0.05, 0.4, ease.outQuad));
    // the doors swing open onto the hero, which starts its entrance behind them
    later(0.56, () => { el.classList.add("is-opening"); onReveal(); playSfx("doors", 0.6); });
    // the doors keep swinging (stopping short of edge-on, so they never vanish) for the whole walk-through
    play(".noor-gate__door--left", [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-82deg)" }], 0.56, 2.3, ease.inOutCubic);
    play(".noor-gate__door--right", [{ transform: "rotateY(0deg)" }, { transform: "rotateY(82deg)" }], 0.56, 2.3, ease.inOutCubic);
    later(1.16, () => petalDrizzle(5, 2));
    // then walk through: no fades — the camera pushes until the doors and the wall have left every screen edge
    later(1.86, () => el.classList.add("is-through"));
    play(".noor-gate__lanterns", [{ transform: "none" }, { transform: "translateY(-110%)" }], 1.86, 1.1, ease.inCubic);
    const walk = play(".noor-gate__stage", [{ transform: "none" }, { transform: `scale(${through})` }], 1.86, 1.6, ease.inQuart)[0];
    if (walk) void walk.finished.then(finish, finish); else later(3.46, finish);
  };

  const tick = () => {
    const value = Math.min(1, (performance.now() - holdStart.current) / HOLD_MS);
    setProgress(value);
    if (value >= 1) { open(); return; }
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
        {/* the glow sits on the image, the sway on its wrapper: the shadow is painted once instead of re-blurred every frame */}
        <span className="noor-gate__wall-lantern noor-gate__wall-lantern--left"><img src={img("lantern-lit")} alt="" /></span>
        <span className="noor-gate__wall-lantern noor-gate__wall-lantern--right"><img src={img("lantern-lit")} alt="" /></span>
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
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); unlockSound(); onHoldStart(); open(); }
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
