import { useEffect, useRef } from "react";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { prefersReducedMotion } from "./sound";

const { celebration } = weddingConfig;
// a few sky lanterns drifting in the margins, clear of the text: [left %, top %, size, float seconds, delay seconds]
const LANTERNS = [
  [7, 14, 0.8, 9, -1], [93, 6, 1, 8, -4], [9, 68, 0.55, 10, -6], [91, 58, 0.65, 11, -2],
] as const;

export function Evening() {
  const root = useRef<HTMLElement>(null);

  // Dusk turns to night and the arcade drifts up as the section scrolls in.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let kill = () => {};
    void loadMotion().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        const t = { trigger: el, start: "top bottom", end: "top -30%", scrub: true };
        gsap.fromTo(".noor-evening__dusk", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: t });
        gsap.fromTo(".noor-arcade", { yPercent: 0 }, { yPercent: -8, ease: "none", scrollTrigger: t });
        gsap.fromTo(".noor-evening__sky img", { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.fromTo(".noor-evening__lantern", { y: 120, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: "power1.out", scrollTrigger: { trigger: el, start: "top 70%", end: "center 60%", scrub: 0.8 } });
      }, el);
      kill = () => ctx.revert();
    });
    return () => kill();
  }, []);

  return (
    <section ref={root} className="noor-evening" aria-labelledby="noor-evening-title">
      <div className="noor-evening__sky" aria-hidden="true">
        <img src={img("night-sky")} alt="" loading="lazy" />
      </div>
      {/* dusk glow that fades into night as you scroll, seen through the courtyard's arches */}
      <div className="noor-evening__dusk" aria-hidden="true" />
      <div className="noor-arcade" aria-hidden="true"><span className="noor-arcade__trim" /></div>

      <div className="noor-evening__lanterns" aria-hidden="true">
        {LANTERNS.map(([x, y, size, speed, delay]) => (
          <span key={`${x}-${y}`} className="noor-evening__lantern" style={{ left: `${x}%`, top: `${y}%`, "--size": size } as React.CSSProperties}>
            <img src={img("sky-lantern")} alt="" loading="lazy" style={{ animationDuration: `${speed}s`, animationDelay: `${delay}s` }} />
          </span>
        ))}
      </div>

      <div className="noor-evening__intro noor-reveal" data-reveal>
        <p className="noor-eyebrow noor-eyebrow--light">{celebration.eyebrow}</p>
        <h2 id="noor-evening-title" className="noor-evening__title">
          {celebration.firstLine}<br /><em>{celebration.secondLine}</em>
        </h2>
        <p className="noor-lede noor-lede--light">{celebration.description}</p>
      </div>
    </section>
  );
}
