import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { HeroSky } from "./HeroSky";
import { Lantern } from "./Lantern";
import { img, loadMotion } from "./motion";
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

export function Hero({ opened }: { opened: boolean }) {
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
      const { animate, splitText, stagger, spring } = await import("animejs");
      if (cancelled) return;
      // the camera settles after walking through the doors; the garland drops in on its strings
      animate(el.querySelector(".noor-hero__stage")!, { scale: [1.14, 1], duration: 2600, ease: "out(4)" });
      animate(el.querySelector(".noor-hero__garland")!, { y: ["-60%", "0%"], ease: spring({ bounce: 0.45, duration: 1800 }), delay: 500 });
      for (const name of el.querySelectorAll<HTMLElement>(".noor-hero__name")) {
        const { chars } = splitText(name, { chars: true });
        animate(chars, {
          opacity: [0, 1], y: ["0.45em", "0em"], filter: ["blur(5px)", "blur(0px)"],
          delay: stagger(38, { start: 350 + (name.dataset["order"] === "2" ? 300 : 0) }), duration: 700, ease: "out(3)",
        });
      }
    })();
    return () => { cancelled = true; };
  }, [opened]);

  // Parallax: mouse on desktop, tilt on phones that allow it without a prompt.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0;
    const loop = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(loop); };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tx = (event.clientX / window.innerWidth - 0.5) * 2; ty = (event.clientY / window.innerHeight - 0.5) * 2; kick();
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      tx = Math.max(-1, Math.min(1, event.gamma / 25)); ty = Math.max(-1, Math.min(1, (event.beta - 45) / 25)); kick();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("deviceorientation", onTilt); cancelAnimationFrame(frame); };
  }, []);

  // Fonts change the page height once they load: re-measure every scroll trigger below the hero.
  useEffect(() => {
    if (!opened) return;
    void loadMotion().then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
  }, [opened]);

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
        <img
          key={i}
          src={img("sky-lantern")}
          alt=""
          style={{
            "--x": `${b.x}%`,
            "--size": `${b.size}px`,
            "--drift": `${b.drift}px`,
            "--dur": `${b.dur}s`,
            "--delay": `${b.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
