import { useEffect, useRef, useState } from "react";
import { Copy, MapPin, Navigation, RotateCcw } from "lucide-react";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { Accent } from "./Accent";
import { buzz, playSfx, prefersReducedMotion } from "./sound";

const { venue, venueSection, noor, moments } = weddingConfig;
// Traced along the painted road of venue-map.webp (1536×1024), from the bottom-left corner to the hall's steps.
const ROUTE = "M30 972 C80 955, 232 903, 329 867 C427 831, 542 788, 615 757 C688 726, 724 710, 768 681 C812 652, 845 613, 878 582 C911 551, 937 520, 966 494 C995 468, 1026 444, 1050 425 C1074 406, 1098 388, 1108 380";
// pin tip on the steps (y + 40); the label sits above the green dome
const HALL = { x: 1117, y: 330 };

export function Venue() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [arrived, setArrived] = useState(false);
  const [copied, setCopied] = useState(false);
  const drawing = useRef(false);
  const moment = moments[0];

  const draw = async () => {
    const el = svg.current;
    if (!el || drawing.current) return;
    drawing.current = true;
    setArrived(false);
    if (prefersReducedMotion()) { setArrived(true); drawing.current = false; return; }
    const { createTimeline, svg: svgTools } = await import("animejs");
    const path = el.querySelector(".noor-map__route") as SVGPathElement;
    const [line] = svgTools.createDrawable(path);
    if (!line) { setArrived(true); drawing.current = false; return; }
    el.classList.add("is-drawing");
    createTimeline({
      onComplete: () => { el.classList.remove("is-drawing"); setArrived(true); drawing.current = false; playSfx("chime", 0.4); },
    })
      .add(line, { draw: ["0 0", "0 1"], duration: 2400, ease: "inOut(2)" }, 0)
      .add(el.querySelector(".noor-map__traveller") as SVGElement, { ...svgTools.createMotionPath(path), duration: 2400, ease: "inOut(2)" }, 0);
  };

  // Draw the route once the map is properly on screen.
  useEffect(() => {
    const el = root.current?.querySelector(".noor-map");
    if (!el) return;
    let kill = () => {};
    let cancelled = false;
    void loadMotion().then(({ ScrollTrigger }) => {
      if (cancelled) return; // unmounted before GSAP loaded: never leave a stray copy of these animations
      const st = ScrollTrigger.create({ trigger: el, start: "top 65%", once: true, onEnter: () => void draw() });
      kill = () => st.kill();
    });
    return () => { cancelled = true; kill(); };
  }, []);

  const copy = async () => {
    buzz(8);
    try {
      await navigator.clipboard.writeText(`${venue.name}, ${venue.address}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch { /* clipboard blocked: the address is on screen to copy by hand */ }
  };

  return (
    <section ref={root} className={`noor-venue noor-reveal ${arrived ? "is-arrived" : ""}`} data-reveal aria-labelledby="noor-venue-title">
      <header className="noor-venue__head">
        <p className="noor-eyebrow">{venueSection.eyebrow}</p>
        <h2 id="noor-venue-title" className="noor-title"><Accent text={venue.name} /></h2>
        <address className="noor-venue__address">{venue.address}</address>
        <ul className="noor-venue__chips" aria-label={noor.venue.title}>
          <li>{moment.weekday}, {moment.date}</li>
          <li>{moment.time}</li>
        </ul>
      </header>

      <div className="noor-venue__body">
        <figure className="noor-map">
          <img className="noor-map__art" src={img("venue-map")} alt={`Illustrated map of ${venue.city} showing the way to ${venue.name}`} loading="lazy" />
          <svg ref={svg} className="noor-map__overlay" viewBox="0 0 1536 1024" aria-hidden="true">
            <defs>
              <radialGradient id="noor-hall-glow"><stop offset="0" stopColor="#ffe7a8" stopOpacity=".9" /><stop offset="1" stopColor="#ffe7a8" stopOpacity="0" /></radialGradient>
            </defs>
            <circle className="noor-map__glow" cx={HALL.x} cy={HALL.y} r="190" fill="url(#noor-hall-glow)" />
            <path className="noor-map__route" d={ROUTE} />
            <g className="noor-map__traveller"><circle r="16" className="noor-map__dot" /><circle r="30" className="noor-map__dot-ring" /></g>
            <g className="noor-map__pin" transform={`translate(${HALL.x} ${HALL.y + 40})`}>
              <circle r="44" className="noor-map__pulse" />
              <path d="M0 0 C -26 -34, -30 -54, -30 -66 A 30 30 0 1 1 30 -66 C 30 -54, 26 -34, 0 0 Z" className="noor-map__pin-shape" />
              <circle cy="-66" r="11" fill="#123524" />
            </g>
          </svg>
          <span className="noor-map__label" aria-hidden="true">{venue.name}</span>
          <button type="button" className="noor-map__replay" onClick={() => void draw()} aria-label={noor.venue.showWay}>
            <RotateCcw aria-hidden="true" /> <span>{noor.venue.showWay}</span>
          </button>
        </figure>

        <div className="noor-venue__panel">
          <MapPin className="noor-venue__icon" aria-hidden="true" />
          <p className="noor-venue__panel-title">{noor.venue.title}</p>
          <a className="noor-button" href={venue.mapsUrl} target="_blank" rel="noreferrer">
            <Navigation aria-hidden="true" /> {venueSection.mapsLabel}
          </a>
          <button type="button" className="noor-button noor-button--ghost" onClick={copy}>
            <Copy aria-hidden="true" /> {copied ? noor.venue.copied : noor.venue.copy}
          </button>
          <span className="sr-only" role="status" aria-live="polite">{copied ? noor.venue.copied : ""}</span>
        </div>
      </div>
    </section>
  );
}
