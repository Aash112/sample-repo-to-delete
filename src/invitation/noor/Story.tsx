import { useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { Accent } from "./Accent";
import { buzz, playSfx, prefersReducedMotion, unlockSound } from "./sound";

const { story, noor } = weddingConfig;
const vignettes = ["vignette-promise", "vignette-blessing", "vignette-invitation"];

export function Story() {
  const pages = useRef<(HTMLElement | null)[]>([]);
  const [turned, setTurned] = useState(0);
  const drag = useRef<{ x: number; width: number; angle: number; moved: boolean } | null>(null);
  const busy = useRef(false);

  const turn = async (index: number, from = 0) => {
    const page = pages.current[index];
    if (!page || busy.current) return;
    busy.current = true;
    playSfx("page", 0.55);
    buzz(8);
    const { gsap } = await loadMotion();
    const duration = prefersReducedMotion() ? 0.01 : 0.9 * (1 - from / 180);
    gsap.to(page, {
      rotateY: -180, duration, ease: "power2.inOut",
      onComplete: () => { busy.current = false; setTurned(index + 1); },
    });
  };

  const settle = async (index: number) => {
    const page = pages.current[index];
    if (!page) return;
    const { gsap } = await loadMotion();
    gsap.to(page, { rotateY: 0, duration: 0.5, ease: "back.out(1.6)" });
  };

  const again = async () => {
    const { gsap } = await loadMotion();
    playSfx("page", 0.45, 1.1);
    const back = pages.current.slice(0, turned).reverse();
    gsap.to(back, { rotateY: 0, duration: 0.7, ease: "power2.inOut", stagger: 0.18, onComplete: () => setTurned(0) });
  };

  const onDown = (index: number) => (event: React.PointerEvent<HTMLElement>) => {
    if (index !== turned || busy.current) return;
    unlockSound();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, width: event.currentTarget.getBoundingClientRect().width, angle: 0, moved: false };
  };
  const onMove = (index: number) => (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || index !== turned) return;
    const dx = event.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    d.angle = Math.max(-180, Math.min(0, (dx / d.width) * 160));
    const page = pages.current[index];
    if (page) page.style.transform = `rotateY(${d.angle}deg)`;
  };
  const onUp = (index: number) => () => {
    const d = drag.current;
    drag.current = null;
    if (!d || index !== turned) return;
    if (!d.moved || d.angle < -50) void turn(index, -d.angle);
    else void settle(index);
  };

  return (
    <section className="noor-story noor-reveal" data-reveal aria-labelledby="noor-story-title">
      <div className="noor-story__intro">
        <p className="noor-eyebrow">{story.eyebrow}</p>
        <h2 id="noor-story-title" className="noor-title"><Accent text={story.title} /></h2>
        <p className="noor-lede">{story.intro}</p>
      </div>

      <div className="noor-book">
        <div className="noor-book__stack">
          <article className="noor-page noor-page--last" aria-hidden={turned < story.panels.length}>
            <img className="noor-page__paper" src={img("page")} alt="" loading="lazy" />
            <div className="noor-page__content noor-page__content--quote">
              <span className="noor-page__quote-mark" aria-hidden="true">“</span>
              <p className="noor-page__quote">{story.quote}</p>
              <button type="button" className="noor-link-button" onClick={again}>{noor.story.again}</button>
            </div>
          </article>
          {story.panels.map((panel, index) => (
            <article
              key={panel.number}
              ref={(node) => { pages.current[index] = node; }}
              className={`noor-page ${index < turned ? "is-turned" : ""} ${index === turned ? "is-top" : ""}`}
              style={{ zIndex: story.panels.length - index + 1 }}
              aria-hidden={index !== turned}
              data-first={index === 0 ? "" : undefined}
              onPointerDown={onDown(index)}
              onPointerMove={onMove(index)}
              onPointerUp={onUp(index)}
              onPointerCancel={onUp(index)}
            >
              <img className="noor-page__paper" src={img("page")} alt="" loading="lazy" draggable={false} />
              <div className="noor-page__content">
                <img className="noor-page__vignette" src={img(vignettes[index] ?? "vignette-promise")} alt="" loading="lazy" draggable={false} />
                <span className="noor-page__number">{panel.number}</span>
                <p className="noor-eyebrow">{panel.eyebrow}</p>
                <h3>{panel.title}</h3>
                <p>{panel.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="noor-book__controls">
          <div className="noor-book__thread" aria-hidden="true">
            {story.panels.map((panel, index) => (
              <img key={panel.number} src={`/images/noor/petals/${[1, 6, 9][index]}.webp`} alt="" className={index < turned ? "is-threaded" : ""} />
            ))}
          </div>
          {turned < story.panels.length && (
            <button type="button" className="noor-link-button" onClick={() => turn(turned)}>
              {noor.story.next} <span aria-hidden="true">→</span>
            </button>
          )}
          <p className="noor-hint">{noor.story.swipeHint}</p>
        </div>
      </div>
    </section>
  );
}
