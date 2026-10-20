import { useRef, type CSSProperties, type ReactNode } from "react";
import { img } from "./motion";
import { buzz, playSfx, prefersReducedMotion } from "./sound";

type Props = {
  lit: boolean;
  onLight?: () => void;
  label: string;
  className?: string;
  style?: CSSProperties;
  /** Shown on the lantern's glass once it's lit (countdown numbers). */
  children?: ReactNode;
};

/** A hanging brass lantern: tap to light it, and it swings on its chain. */
export function Lantern({ lit, onLight, label, className = "", style, children }: Props) {
  const body = useRef<HTMLSpanElement>(null);

  const swing = async () => {
    const el = body.current;
    if (!el || prefersReducedMotion()) return;
    const { animate, spring } = await import("animejs");
    const push = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 8);
    animate(el, { rotate: [push, 0], ease: spring({ bounce: 0.65, duration: 2200 }) });
  };

  return (
    <button
      type="button"
      className={`noor-lantern ${lit ? "is-lit" : ""} ${className}`}
      style={style}
      aria-label={label}
      aria-pressed={lit}
      onClick={() => {
        void swing();
        buzz(12);
        if (!lit) { playSfx("light", 0.55); onLight?.(); }
        playSfx("chime", 0.35, 0.9 + Math.random() * 0.25);
      }}
    >
      <span className="noor-lantern__chain" aria-hidden="true" />
      <span ref={body} className="noor-lantern__body">
        <img className="noor-lantern__img" src={img("lantern")} alt="" loading="lazy" draggable={false} />
        <img className="noor-lantern__img noor-lantern__img--lit" src={img("lantern-lit")} alt="" loading="lazy" draggable={false} />
        <span className="noor-lantern__halo" aria-hidden="true" />
        {children && <span className="noor-lantern__glass">{children}</span>}
      </span>
    </button>
  );
}
