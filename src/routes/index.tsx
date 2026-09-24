import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock3, Compass, Heart, MapPin, Moon, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { weddingConfig } from "@/config/wedding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: weddingConfig.seo.title },
      { name: "description", content: weddingConfig.seo.description },
      { property: "og:title", content: weddingConfig.seo.title },
      { property: "og:description", content: weddingConfig.seo.ogDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const weddingDate = new Date(weddingConfig.date.iso);
const moments = weddingConfig.moments;

function CelebrationBurst({ trigger }: { trigger: number }) {
  const pieces = useMemo(() => Array.from({ length: 42 }, (_, index) => ({
    id: `${trigger}-${index}`,
    left: 4 + ((index * 17) % 92),
    delay: (index % 7) * 0.035,
    duration: 1.5 + (index % 5) * 0.16,
    rotate: (index * 47) % 360,
    drift: ((index * 29) % 180) - 90,
    scale: 0.72 + (index % 4) * 0.1,
    shape: index % 3,
  })), [trigger]);

  if (!trigger) return null;

  return (
    <div className="celebration-burst" aria-hidden="true">
      <div className="celebration-glow" />
      {pieces.map((piece) => (
        <span
          className={`confetti-piece confetti-piece--${piece.shape}`}
          key={piece.id}
          style={{
            "--confetti-left": `${piece.left}%`,
            "--confetti-delay": `${piece.delay}s`,
            "--confetti-duration": `${piece.duration}s`,
            "--confetti-rotate": `${piece.rotate}deg`,
            "--confetti-drift": `${piece.drift}px`,
            "--confetti-scale": piece.scale,
          } as CSSProperties}
        />
      ))}
      <div className="celebration-message">
        <Sparkles aria-hidden="true" />
        <span>{weddingConfig.scratchCard.revealed}</span>
        <Heart aria-hidden="true" fill="currentColor" />
      </div>
    </div>
  );
}

function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const scratching = useRef(false);
  const revealStarted = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsRevealed(true);
      revealStarted.current = true;
      onReveal();
    }
  }, [onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paintCover = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.globalCompositeOperation = "source-over";

      const foil = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      foil.addColorStop(0, "#7e5a0b");
      foil.addColorStop(0.18, "#f1d878");
      foil.addColorStop(0.38, "#b78b22");
      foil.addColorStop(0.58, "#f5e39b");
      foil.addColorStop(0.82, "#c29a31");
      foil.addColorStop(1, "#765208");
      ctx.fillStyle = foil;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "#fff8d9";
      ctx.lineWidth = 1.5 * dpr;
      for (let x = -canvas.height; x < canvas.width + canvas.height; x += 26 * dpr) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + canvas.height, canvas.height); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const centerX = canvas.width / 2; const centerY = canvas.height / 2;
      ctx.strokeStyle = "rgba(255,248,217,.72)"; ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.arc(centerX, centerY, 38 * dpr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#123524"; ctx.font = `700 ${11 * dpr}px "Cormorant Garamond", serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(weddingConfig.scratchCard.scratchGold, centerX, centerY - 9 * dpr);
      ctx.font = `500 ${8.5 * dpr}px "Cormorant Garamond", serif`;
      ctx.fillText(weddingConfig.scratchCard.revealDate, centerX, centerY + 8 * dpr);
    };

    paintCover();
    const observer = new ResizeObserver(paintCover); observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let last: { x: number; y: number } | null = null; let moves = 0;

    const checkCleared = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cleared = 0;
      for (let i = 3; i < data.length; i += 32) if (data[i] === 0) cleared += 1;
      const ratio = Math.min(1, cleared / (data.length / 32));
      setProgress(ratio);
      if (ratio > 0.35 && !revealStarted.current) {
        revealStarted.current = true; setIsRevealed(true); onReveal();
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([18, 35, 18]);
      }
    };

    const eraseAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
      const x = (clientX - rect.left) * dpr; const y = (clientY - rect.top) * dpr;
      ctx.globalCompositeOperation = "destination-out"; ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = 46 * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
      if (last) ctx.moveTo(last.x, last.y); else ctx.moveTo(x, y); ctx.lineTo(x, y); ctx.stroke();
      last = { x, y }; moves += 1; if (moves % 5 === 0) checkCleared();
    };

    const onPointerDown = (event: PointerEvent) => { scratching.current = true; last = null; canvas.setPointerCapture(event.pointerId); eraseAt(event.clientX, event.clientY); };
    const onPointerMove = (event: PointerEvent) => { if (scratching.current) eraseAt(event.clientX, event.clientY); };
    const onPointerUp = () => { if (!scratching.current) return; scratching.current = false; last = null; checkCleared(); };

    canvas.addEventListener("pointerdown", onPointerDown); canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp); canvas.addEventListener("pointercancel", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown); canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp); canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [isRevealed, onReveal]);

  const revealWithKeyboard = () => {
    if (revealStarted.current) return; revealStarted.current = true; setProgress(1); setIsRevealed(true); onReveal();
  };

  return (
    <div
      className={`scratch-card ${isRevealed ? "scratch-card--revealed" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={isRevealed ? weddingConfig.scratchCard.revealedAria : weddingConfig.scratchCard.hiddenAria}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !revealStarted.current) {
          event.preventDefault();
          revealWithKeyboard();
        }
      }}
    >
      <div className="scratch-card__halo" aria-hidden="true" />
      <div className="scratch-card__inner">
        <div className="scratch-card__topline"><span><CalendarDays aria-hidden="true" /> {weddingConfig.date.numeric}</span><span>{isRevealed ? weddingConfig.scratchCard.revealed : `${Math.round(progress * 100)}%`}</span></div>
        <span className="scratch-date"><small>{weddingConfig.scratchCard.foreverBegins}</small><strong>{weddingConfig.date.short}</strong><em>{weddingConfig.date.yearWords}</em></span>
        {!isRevealed && <div className="scratch-hint" aria-hidden="true"><Sparkles /> <span>{weddingConfig.scratchCard.scratchHint}</span></div>}
      </div>
      {!isRevealed && <canvas ref={canvasRef} className="scratch-canvas" aria-hidden="true" />}
      <div className="scratch-card__stamp" aria-hidden="true">{weddingConfig.scratchCard.stampGroom} <span>&amp;</span> {weddingConfig.scratchCard.stampBride}</div>
    </div>
  );
}

function Index() {
  const [isOpen, setIsOpen] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const revealableSections = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    revealableSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const countdown = useMemo(() => {
    const difference = Math.max(0, weddingDate.getTime() - (now ?? weddingDate).getTime());
    const totalSeconds = Math.floor(difference / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [now]);

  const celebrateReveal = useCallback(() => setCelebrationKey((key) => key + 1), []);

  const submitRsvp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="invitation-shell">
      <div className={`envelope-screen ${isOpen ? "envelope-screen--open" : ""}`} aria-hidden={isOpen}>
        <div className="envelope-card" role="dialog" aria-label="Wedding invitation envelope">
          <div className="envelope-card__pattern" />
          <div className="envelope-card__inner">
            <div className="monogram">{weddingConfig.couple.monogram.groom} <span>&amp;</span> {weddingConfig.couple.monogram.bride}</div>
            <p className="eyebrow eyebrow--gold">{weddingConfig.invitation.envelopeEyebrow}</p>
            <h2 className="script-title">{weddingConfig.invitation.envelopeTitle}</h2>
            <p className="envelope-copy">{weddingConfig.invitation.envelopeCopy}</p>
            <Button className="button-gold" onClick={() => setIsOpen(true)}>
              {weddingConfig.invitation.openButton}
            </Button>
          </div>
        </div>
      </div>

      <article className="invitation-paper">
        <div className="floral-corner floral-corner--top" aria-hidden="true">✦ ❁</div>
        <div className="floral-corner floral-corner--bottom" aria-hidden="true">❁ ✦</div>

        {/* 1. The invitation card: couple, love note, date reveal, venue */}
        <header className="invitation-hero reveal-section" data-reveal>
          <div className="arabic-mark" lang="ar">{weddingConfig.invitation.arabic}</div>
          <p className="eyebrow">{weddingConfig.invitation.arabicMeaning}</p>
          <div className="hero-rule"><span>✦</span><i>{weddingConfig.invitation.arabicShort}</i><span>✦</span></div>
          <p className="eyebrow">{weddingConfig.invitation.familyIntro}</p>
          <h1 className="couple-names"><span>{weddingConfig.couple.groom.fullName}</span><em>&amp;</em><span>{weddingConfig.couple.bride.fullName}</span></h1>
          <p className="hero-message">{weddingConfig.invitation.heroMessage}</p>
          <div className="hero-signature" aria-hidden="true"><span>{weddingConfig.invitation.familyBlessing}</span><Heart /></div>

          <div className="date-reveal reveal-section" data-reveal aria-labelledby="date-title">
            <p className="eyebrow eyebrow--gold" id="date-title">{weddingConfig.invitation.dateEyebrow}</p>
            <ScratchCard onReveal={celebrateReveal} />
            <p className="date-note"><Sparkles aria-hidden="true" /> {weddingConfig.invitation.dateNote}</p>
            <CelebrationBurst trigger={celebrationKey} />
          </div>

        </header>

        {/* 2. A visual story instead of couple portraits */}
        <section className="story-section reveal-section" data-reveal aria-labelledby="story-title">
          <div className="story-intro">
            <div className="story-seal" aria-hidden="true"><Moon /><span>A</span><i>&amp;</i><span>O</span></div>
            <div>
              <p className="eyebrow eyebrow--gold">A little more than a date</p>
              <h2 id="story-title">A beginning written in gold.</h2>
              <p>Before the music, before the lights, before everyone gathers around us — there is simply a promise. Two families, two stories, and one beautiful chapter about to begin.</p>
            </div>
          </div>
          <div className="story-grid">
            <article className="story-panel story-panel--dark">
              <span className="story-index">{weddingConfig.story.panels[0].number}</span>
              <Star aria-hidden="true" />
              <p className="eyebrow eyebrow--gold">{weddingConfig.story.panels[0].eyebrow}</p>
              <h3>{weddingConfig.story.panels[0].title}</h3>
              <p>{weddingConfig.story.panels[0].description}</p>
            </article>
            <article className="story-panel story-panel--light">
              <span className="story-index">{weddingConfig.story.panels[1].number}</span>
              <Heart aria-hidden="true" />
              <p className="eyebrow eyebrow--gold">{weddingConfig.story.panels[1].eyebrow}</p>
              <h3>{weddingConfig.story.panels[1].title}</h3>
              <p>{weddingConfig.story.panels[1].description}</p>
            </article>
            <article className="story-panel story-panel--outline">
              <span className="story-index">{weddingConfig.story.panels[2].number}</span>
              <Compass aria-hidden="true" />
              <p className="eyebrow eyebrow--gold">{weddingConfig.story.panels[2].eyebrow}</p>
              <h3>{weddingConfig.story.panels[2].title}</h3>
              <p>{weddingConfig.story.panels[2].description}</p>
            </article>
          </div>
          <div className="story-quote">
            <span>“</span>{weddingConfig.story.quote}<span>”</span>
          </div>
        </section>

        {/* Countdown */}
        <section className="countdown-band reveal-section" data-reveal aria-label={weddingConfig.countdown.ariaLabel}>
          {Object.entries(countdown).map(([label, value]) => (
            <div className="countdown-unit" key={label}>
              <strong>{String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        {/* 3. Function details along a path */}
        <section className="moments-section reveal-section" data-reveal aria-labelledby="moments-title">
          <div className="section-heading"><p className="eyebrow eyebrow--gold">{weddingConfig.momentsSection.eyebrow}</p><h2 id="moments-title">{weddingConfig.momentsSection.title}</h2></div>
          <div className="journey-path">
            {moments.map((moment, index) => (
              <article className={`journey-stop ${index % 2 === 1 ? "journey-stop--right" : ""}`} key={moment.number}>
                <div className="journey-node" aria-hidden="true"><span>{moment.number}</span></div>
                <div className="journey-card">
                  <div className="moment-date"><span>{moment.date}</span><strong>{moment.time}</strong></div>
                  <h3>{moment.name}</h3>
                  <p>{moment.description}</p>
                  <span className="moment-location"><MapPin aria-hidden="true" /> {moment.location}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Venue */}
        <section className="venue-section reveal-section" data-reveal aria-labelledby="venue-title">
          <div className="venue-arch" aria-hidden="true"><span>✦</span></div>
          <p className="eyebrow eyebrow--gold" id="venue-title">{weddingConfig.venueSection.eyebrow}</p>
          <h2>{weddingConfig.venue.name}</h2>
          <p>{weddingConfig.venue.address}</p>
          <a className="button-outline" href={weddingConfig.venue.mapsUrl} target="_blank" rel="noreferrer">{weddingConfig.venueSection.mapsLabel} <span>↗</span></a>
        </section>


        {/* 4. A quiet pause before RSVP */}
        <section className="pause-section reveal-section" data-reveal aria-labelledby="pause-title">
          <div className="pause-card">
            <div className="pause-orbit" aria-hidden="true"><span></span><span></span><span></span></div>
            <p className="eyebrow eyebrow--gold">{weddingConfig.celebration.eyebrow}</p>
            <h2 id="pause-title">{weddingConfig.celebration.firstLine}<br /><em>{weddingConfig.celebration.secondLine}</em></h2>
            <div className="pause-meta">
              <span><Clock3 aria-hidden="true" /> {weddingConfig.celebration.time}</span>
              <span><MapPin aria-hidden="true" /> {weddingConfig.venue.name}</span>
            </div>
            <div className="pause-line" aria-hidden="true"><span>✦</span><i></i><span>✦</span></div>
            <p>{weddingConfig.celebration.description}</p>
          </div>
        </section>

        {/* 5. RSVP */}
        <section className="rsvp-section reveal-section" data-reveal aria-labelledby="rsvp-title">
          <div className="rsvp-card">
            <div className="section-heading"><p className="eyebrow eyebrow--gold">{weddingConfig.rsvp.eyebrow}</p><h2 id="rsvp-title">{weddingConfig.rsvp.title}</h2><p>{weddingConfig.rsvp.intro}</p></div>
            {submitted ? <div className="rsvp-success" role="status"><span>✦</span><h3>{weddingConfig.rsvp.successTitle}</h3><p>{weddingConfig.rsvp.successMessage}</p></div> : (
              <form onSubmit={submitRsvp} className="rsvp-form">
                <label>{weddingConfig.rsvp.nameLabel}<input name="name" required placeholder={weddingConfig.rsvp.namePlaceholder} /></label>
                <div className="rsvp-grid"><label>{weddingConfig.rsvp.guestsLabel}<select name="guests" defaultValue="1">{weddingConfig.rsvp.guestOptions.map((option, index) => <option value={String(index + 1)} key={option}>{option}</option>)}</select></label><label>{weddingConfig.rsvp.attendanceLabel}<select name="attendance" defaultValue="joyfully-accept"><option value="joyfully-accept">{weddingConfig.rsvp.attendanceOptions.accept}</option><option value="regretfully-decline">{weddingConfig.rsvp.attendanceOptions.decline}</option></select></label></div>
                <Button className="button-emerald" type="submit">{weddingConfig.rsvp.submit}</Button>
              </form>
            )}
          </div>
        </section>

        {/* 6. Thanks */}
        <footer className="invitation-footer reveal-section" data-reveal>
          <p className="script-title footer-script">{weddingConfig.footer.script}</p>
          <p className="footer-quote">{weddingConfig.footer.quote}</p>
          <div className="family-grid"><div><span>{weddingConfig.footer.groomFamilyLabel}</span><strong>{weddingConfig.footer.groomFamily}</strong><small>{weddingConfig.footer.groomFamilyNote}</small></div><div><span>{weddingConfig.footer.brideFamilyLabel}</span><strong>{weddingConfig.footer.brideFamily}</strong><small>{weddingConfig.footer.brideFamilyNote}</small></div><div><span>{weddingConfig.footer.thanksLabel}</span><strong>{weddingConfig.footer.thanksName}</strong><small>{weddingConfig.footer.thanksNote}</small></div></div>
          <div className="footer-mark">{weddingConfig.couple.displayName} · {weddingConfig.date.year}</div>
        </footer>
      </article>
    </main>
  );
}
