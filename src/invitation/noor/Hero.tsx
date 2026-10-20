import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { Lantern } from "./Lantern";
import { img, loadMotion } from "./motion";
import { prefersReducedMotion } from "./sound";

const { couple, invitation, noor } = weddingConfig;

export function Hero({ opened }: { opened: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [lit, setLit] = useState([false, false]);

  // Entrance once the doors open: Bismillah writes in (right to left), names rise letter by letter.
  useEffect(() => {
    const el = root.current;
    if (!opened || !el) return;
    el.classList.add("is-awake");
    if (prefersReducedMotion()) return;
    let cancelled = false;
    void (async () => {
      const { animate, splitText, stagger } = await import("animejs");
      if (cancelled) return;
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

  return (
    <section ref={root} className="noor-hero" aria-label={couple.displayName}>
      <div className="noor-hero__wall" aria-hidden="true" />
      <img className="noor-hero__garland" src={img("garland")} alt="" aria-hidden="true" />

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
