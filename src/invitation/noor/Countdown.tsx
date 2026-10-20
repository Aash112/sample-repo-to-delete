import { useEffect, useMemo, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { Lantern } from "./Lantern";
import { loadMotion } from "./motion";
import { Accent } from "./Accent";
import { petalBurst } from "./petals";
import { playSfx, prefersReducedMotion } from "./sound";

const { noor, countdown, date } = weddingConfig;
const target = new Date(date.iso).getTime();
const units = ["days", "hours", "minutes", "seconds"] as const;

export function Countdown() {
  const root = useRef<HTMLElement>(null);
  const [now, setNow] = useState<number | null>(null);
  const [lit, setLit] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values = useMemo(() => {
    const total = Math.max(0, Math.floor((target - (now ?? target)) / 1000));
    return { days: Math.floor(total / 86400), hours: Math.floor((total % 86400) / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 };
  }, [now]);

  const allLit = lit.every(Boolean);

  // All four lit: a glint runs along the rail and the lanterns flare one after another (they stay on their chains).
  useEffect(() => {
    const el = root.current;
    if (!allLit || !el) return;
    const row = el.querySelector(".noor-countdown__row")?.getBoundingClientRect();
    if (row) petalBurst(row.left + row.width / 2, row.top + row.height * 0.3, 28);
    playSfx("reveal", 0.5);
    if (prefersReducedMotion()) return;
    void loadMotion().then(({ gsap }) => {
      gsap.fromTo(el.querySelector(".noor-countdown__glint"), { xPercent: -100, opacity: 1 }, { xPercent: 100, opacity: 0, duration: 1.4, ease: "power2.inOut" });
      gsap.fromTo(el.querySelectorAll(".noor-lantern__halo"), { scale: 1 }, { scale: 1.35, duration: 0.45, stagger: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut" });
      gsap.fromTo(el.querySelectorAll(".noor-countdown__value"), { scale: 1 }, { scale: 1.12, duration: 0.35, stagger: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
    });
  }, [allLit]);

  const light = (index: number) => setLit((state) => state.map((value, i) => (i === index ? true : value)));

  return (
    <section ref={root} className={`noor-countdown noor-reveal ${allLit ? "is-complete" : ""}`} data-reveal aria-labelledby="noor-countdown-title">
      <p className="noor-eyebrow">{noor.countdown.eyebrow}</p>
      <h2 id="noor-countdown-title" className="noor-title"><Accent text={noor.countdown.title} /></h2>

      <div className="noor-countdown__rail" aria-hidden="true"><span className="noor-countdown__glint" /></div>
      <div className="noor-countdown__row" role="timer" aria-label={countdown.ariaLabel}>
        {units.map((unit, index) => {
          const value = String(values[unit]).padStart(2, "0");
          return (
            <div className={`noor-countdown__unit ${lit[index] ? "is-lit" : ""}`} key={unit} style={{ "--i": index } as React.CSSProperties}>
              <Lantern lit={!!lit[index]} onLight={() => light(index)} label={`${noor.countdown.hint}: ${noor.countdown.labels[unit]}`} />
              <strong className="noor-countdown__value" aria-label={`${values[unit]} ${noor.countdown.labels[unit]}`}>
                <span key={value} className="noor-countdown__digits">{value}</span>
              </strong>
              <span className="noor-countdown__label" aria-hidden="true">{noor.countdown.labels[unit]}</span>
            </div>
          );
        })}
      </div>
      <p className="noor-hint noor-countdown__hint" aria-live="polite">{allLit ? noor.countdown.done : noor.countdown.hint}</p>
    </section>
  );
}
