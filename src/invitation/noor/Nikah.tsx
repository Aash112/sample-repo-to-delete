import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { buzz, playSfx, prefersReducedMotion } from "./sound";

const { moments, venue, couple, noor } = weddingConfig;

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function googleUrl(m: (typeof moments)[number]) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${m.name} · ${couple.displayName}`,
    dates: `${stamp(m.startIso)}/${stamp(m.endIso)}`,
    details: m.description,
    location: `${venue.name}, ${venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadIcs(m: (typeof moments)[number]) {
  const escape = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//InviteNest//Noor//EN", "BEGIN:VEVENT",
    `UID:${stamp(m.startIso)}-noor@invitenest.cc`, `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(m.startIso)}`, `DTEND:${stamp(m.endIso)}`,
    `SUMMARY:${escape(`${m.name} · ${couple.displayName}`)}`, `DESCRIPTION:${escape(m.description)}`,
    `LOCATION:${escape(`${venue.name}, ${venue.address}`)}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "nikkah.ics" });
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Nikah() {
  const root = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState(false);
  const moment = moments[0];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.classList.add("is-lit"); return; }
    let kill = () => {};
    void loadMotion().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        // the hall brightens with the scroll, so it never looks stuck in the dark
        gsap.fromTo(".noor-stage__photo", { filter: "brightness(0.66) saturate(0.75)" }, {
          filter: "brightness(1) saturate(1)", ease: "none",
          scrollTrigger: { trigger: ".noor-stage", start: "top 95%", end: "center 55%", scrub: true },
        });
        gsap.fromTo(".noor-stage__photo", { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".noor-stage", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.timeline({ scrollTrigger: { trigger: ".noor-stage", start: "top 70%", once: true } })
          .fromTo(".noor-stage__garland", { yPercent: -120 }, { yPercent: 0, duration: 1.1, ease: "bounce.out" })
          .to(".noor-stage__lamp", { opacity: 1, scale: 1, duration: 0.8, stagger: 0.25, ease: "power2.out" }, "<0.3")
          .add(() => playSfx("light", 0.4), "<")
          .from(".noor-stage__text > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }, "<0.1")
          .from(".noor-nikah__below > *", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "<0.3");
      }, el);
      kill = () => ctx.revert();
    });
    return () => kill();
  }, []);

  return (
    <section ref={root} className="noor-nikah noor-reveal" data-reveal aria-labelledby="noor-nikah-title">
      <div className="noor-stage">
        <img className="noor-stage__photo" src={img("nikah-stage")} alt="" loading="lazy" />
        <span className="noor-stage__lamp noor-stage__lamp--left" aria-hidden="true" />
        <span className="noor-stage__lamp noor-stage__lamp--right" aria-hidden="true" />
        <img className="noor-stage__garland" src={img("garland")} alt="" loading="lazy" aria-hidden="true" />
        <div className="noor-stage__text">
          <p className="noor-eyebrow">{noor.nikah.eyebrow}</p>
          <h2 id="noor-nikah-title">{moment.name}</h2>
          <span className="noor-rule" aria-hidden="true"><i>✦</i></span>
          <p className="noor-stage__day">{moment.weekday}</p>
          <p className="noor-stage__date">{moment.date}</p>
          <p className="noor-stage__time">{moment.time}</p>
        </div>
      </div>

      <div className="noor-nikah__below">
        <p className="noor-lede">{moment.description}</p>
        <p className="noor-nikah__where">{venue.name} · {venue.city}</p>
        <div className="noor-calendar">
          <button
            type="button"
            className="noor-button"
            aria-expanded={menu}
            onClick={() => { setMenu((v) => !v); buzz(8); playSfx("chime", 0.25); }}
          >
            {noor.nikah.calendar}
          </button>
          {menu && (
            <div className="noor-calendar__menu" role="menu">
              <a role="menuitem" href={googleUrl(moment)} target="_blank" rel="noreferrer" onClick={() => setMenu(false)}>{noor.nikah.google}</a>
              <button role="menuitem" type="button" onClick={() => { downloadIcs(moment); setMenu(false); }}>{noor.nikah.apple}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
