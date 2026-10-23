import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { HeroSky } from "./HeroSky";
import { Lantern } from "./Lantern";
import { ease, img, loadMotion, springEasing } from "./motion";
import { petalBurst } from "./petals";
import { buzz, playSfx, prefersReducedMotion } from "./sound";

const SKY_LANTERNS = 16;
const GOLDEN = 0.618034;
// every balloon shares one climb time, and launches are spread evenly across it: one rises about every second,
// with no lull between the first flight and the loops that follow
const CLIMB_S = 16;

type Balloon = { x: number; size: number; drift: number; dur: number; delay: number };
type Flight = { balloons: Balloon[]; floor: string };

/** Even lanes through the open background (both sides of the arch, or the full width when the arch fills the
    screen), released one by one in a scattered order so they rise from below in a steady stream. */
function balloonLayout(hero: HTMLElement): Flight {
  const r = hero.getBoundingClientRect();
  const a = hero.querySelector(".noor-hero__arch")?.getBoundingClientRect();
  const left = a ? ((a.left - r.left) / r.width) * 100 : 50;
  const right = a ? ((a.right - r.left) / r.width) * 100 : 50;
  const bands: [number, number][] = left > 14 ? [[2, left - 4], [right + 4, 98]] : [[3, 97]];
  const span = bands.reduce((sum, [from, to]) => sum + (to - from), 0);
  const out: Balloon[] = [];
  bands.forEach(([from, to]) => {
    const count = Math.round((SKY_LANTERNS * (to - from)) / span);
    for (let i = 0; i < count; i++) out.push({ x: from + ((i + 0.5) / count) * (to - from), size: 0, drift: 0, dur: 0, delay: 0 });
  });
  // when the arch fills the width (phones) there is no open background beside it: the balloons start behind the
  // arch's shoulders and float up through the sky above it, instead of climbing unseen behind it
  const floor = a && bands.length === 1 ? `${Math.round(r.bottom - (a.top + a.height * 0.42))}px` : "-12%";
  const balloons = out.map((b, i) => {
    return { ...b, size: 30 + ((i * 17) % 34), drift: ((i * 29) % 70) - 35, dur: CLIMB_S, delay: 0.3 + ((i * GOLDEN) % 1) * CLIMB_S };
  });
  return { balloons, floor };
}

const { couple, invitation, noor } = weddingConfig;

/** `opened`: the doors have started to open (entrance plays); `settled`: the gate is gone (heavy work may run). */
export function Hero({ opened, settled }: { opened: boolean; settled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [lit, setLit] = useState([false, false]);
  const [flight, setFlight] = useState<Flight | null>(null);

  // Entrance once the doors open: Bismillah writes in (right to left), names rise letter by letter.
  useEffect(() => {
    const el = root.current;
    if (!opened || !el) return;
    el.classList.add("is-awake");
    if (prefersReducedMotion()) return;
    let cancelled = false;
    void (async () => {
      const { splitText, spring } = await import("animejs");
      if (cancelled) return;
      // Web Animations throughout: they run on the compositor while the doors are still opening above, so a
      // busy main thread can't stutter them, and nothing here repaints the arch, couple or text per frame
      // the camera settles after walking through the doors; the garland drops in on its strings
      el.querySelector(".noor-hero__stage")?.animate([{ transform: "scale(1.14)" }, { transform: "none" }], { duration: 2600, easing: ease.outQuart });
      el.querySelector(".noor-hero__garland")?.animate([{ transform: "translateY(-60%)" }, { transform: "none" }], { ...springEasing(spring({ bounce: 0.45, duration: 1800 })), delay: 500, fill: "backwards" });
      // the soft focus-in is desktop only: phones get the rise and fade
      const blur = window.innerWidth >= 760;
      for (const name of el.querySelectorAll<HTMLElement>(".noor-hero__name")) {
        const { chars } = splitText(name, { chars: true });
        const start = 350 + (name.dataset["order"] === "2" ? 300 : 0);
        chars.forEach((char, i) => char.animate([
          { opacity: 0, transform: "translateY(0.45em)", ...(blur ? { filter: "blur(5px)" } : {}) },
          { opacity: 1, transform: "none", ...(blur ? { filter: "blur(0px)" } : {}) },
        ], { duration: 700, delay: start + i * 38, easing: ease.outCubic, fill: "backwards" }));
      }
    })();
    return () => { cancelled = true; };
  }, [opened]);

  // Parallax: mouse on desktop, tilt on phones that allow it without a prompt. Each layer gets its own inline
  // translate (no CSS variables on the hero, which would restyle everything in it) and is promoted while the
  // effect runs, so a phone's constant tilt events move GPU layers instead of repainting the arch and couple.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const layers = ([
      [".noor-hero__garland", 10, 4, "-50%"], [".noor-hero__stage", 5, 3], [".noor-hero__sky", -10, -6],
      [".noor-hero__skyline", -4, 0], [".noor-hero__couple", 8, 0],
    ] as const).flatMap(([selector, fx, fy, base]) => {
      const node = el.querySelector<HTMLElement>(selector);
      return node ? [{ node, fx, fy, base: base ?? "0px" }] : [];
    });
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0, promoted = false;
    const loop = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      for (const { node, fx, fy, base } of layers) node.style.translate = `calc(${base} + ${(x * fx).toFixed(2)}px) ${(y * fy).toFixed(2)}px`;
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const kick = (nx: number, ny: number) => {
      // ignore sensor jitter, so the loop can come to rest while the phone is held still
      if (Math.abs(nx - tx) + Math.abs(ny - ty) < 0.01) return;
      tx = nx; ty = ny;
      if (!promoted) { promoted = true; layers.forEach(({ node }) => { node.style.willChange = "transform"; }); }
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      kick((event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      kick(Math.max(-1, Math.min(1, event.gamma / 25)), Math.max(-1, Math.min(1, (event.beta - 45) / 25)));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("deviceorientation", onTilt); cancelAnimationFrame(frame); };
  }, []);

  // Fonts change the page height once they load: re-measure every scroll trigger below the hero. Waits until the
  // gate is gone, so this layout work never lands on top of the door animation.
  useEffect(() => {
    if (!settled) return;
    void loadMotion().then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
  }, [settled]);

  const light = (index: number) => setLit((state) => state.map((value, i) => (i === index ? true : value)));

  // Both lanterns lit: a sky full of paper balloons floats up past the arch.
  useEffect(() => {
    if (flight || !lit.every(Boolean) || !root.current) return;
    setFlight(balloonLayout(root.current));
    const rect = root.current.getBoundingClientRect();
    if (rect) petalBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 40);
    playSfx("release", 0.6);
    buzz([15, 60, 15]);
  }, [lit, flight]);

  return (
    <section ref={root} className="noor-hero" aria-label={couple.displayName}>
      <div className="noor-hero__wall" aria-hidden="true" />
      <img className="noor-hero__garland" src={img("garland")} alt="" aria-hidden="true" />

      <HeroSky active={opened} />
      {flight && <SkyLanterns flight={flight} />}

      <div className="noor-hero__stage">
        <div className="noor-hero__window" aria-hidden="true">
          <img className="noor-hero__sky" src={img("sky")} alt="" />
          <span className="noor-hero__moon-glow" />
          <img className="noor-hero__skyline" src={img("skyline")} alt="" />
          <span className="noor-hero__sea-shimmer" />
        </div>
        <img className="noor-hero__arch" src={img("arch")} alt="" aria-hidden="true" />
        <img className="noor-hero__couple" src={img("couple")} alt={invitation.envelopeCopy} />

        <div className="noor-hero__text">
          <p className="noor-arabic noor-hero__bismillah" lang="ar" aria-label={invitation.arabicMeaning}>{invitation.arabic}</p>
          <p className="noor-eyebrow noor-eyebrow--light noor-hero__families">{invitation.familyIntro}</p>
          <h2 className="noor-hero__names">
            <span className="noor-hero__name" data-order="1">{couple.groom.fullName}</span>
            <em className="noor-hero__amp">&amp;</em>
            <span className="noor-hero__name" data-order="2">{couple.bride.fullName}</span>
          </h2>
          <p className="noor-hero__date">{noor.date.dayLabel} · {weddingConfig.date.display}</p>
        </div>
      </div>

      <Lantern className="noor-hero__lantern noor-hero__lantern--left" lit={!!lit[0]} onLight={() => light(0)} label={noor.hero.lanternHint} />
      <Lantern className="noor-hero__lantern noor-hero__lantern--right" lit={!!lit[1]} onLight={() => light(1)} label={noor.hero.lanternHint} />
      {!lit.every(Boolean) && <p className="noor-hero__hint" aria-hidden="true">{noor.hero.lanternHint}</p>}

      <div className="noor-hero__scroll" aria-hidden="true"><span>{noor.hero.scroll}</span><i /></div>
    </section>
  );
}

/** Paper sky lanterns (the balloons from the evening section) released once both lamps are lit: each one rises
    from below the hero, spread across the open background, behind the arch so they never cross it. */
function SkyLanterns({ flight }: { flight: Flight }) {
  if (prefersReducedMotion()) return null;
  return (
    <div className="noor-hero__sky-lanterns" style={{ "--floor": flight.floor } as React.CSSProperties} aria-hidden="true">
      {flight.balloons.map((b, i) => (
        // the glow sits on the image, the rise on its wrapper: the shadow is painted once instead of re-blurred every frame
        <span
          key={i}
          style={{
            "--x": `${b.x}%`,
            "--size": `${b.size}px`,
            "--drift": `${b.drift}px`,
            "--dur": `${b.dur}s`,
            "--delay": `${b.delay}s`,
          } as React.CSSProperties}
        ><img src={img("sky-lantern")} alt="" /></span>
      ))}
    </div>
  );
}
