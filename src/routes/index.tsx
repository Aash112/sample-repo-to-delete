import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock3, Compass, Heart, MapPin, Moon, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aaroon & Olivia — Wedding Invitation" },
      {
        name: "description",
        content: "A royal Muslim wedding invitation for Aaroon and Olivia, with ceremony details, RSVP, and directions.",
      },
      { property: "og:title", content: "Aaroon & Olivia — Wedding Invitation" },
      {
        property: "og:description",
        content: "Join Aaroon and Olivia as they celebrate their wedding with family and friends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const weddingDate = new Date("2027-04-26T20:00:00");

const moments = [
  {
    number: "01",
    name: "Mehendi Ceremony",
    date: "April 24, 2027",
    time: "6:00 PM onwards",
    location: "The Garden Courtyard",
    description: "An evening of music, laughter, sweets, and intricate henna designs with the women of our families.",
  },
  {
    number: "02",
    name: "Wedding Ceremony",
    date: "April 26, 2027",
    time: "8:00 PM sharp",
    location: "Liceria Grand Ballroom",
    description: "The Nikah and formal union of two souls, surrounded by the prayers and blessings of our loved ones.",
  },
  {
    number: "03",
    name: "Valima Reception",
    date: "April 27, 2027",
    time: "7:00 PM",
    location: "Liceria Grand Ballroom",
    description: "A grand feast and a joyful evening to celebrate our first days as husband and wife.",
  },
];

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
        <span>The date is revealed</span>
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
      ctx.fillText("SCRATCH THE GOLD", centerX, centerY - 9 * dpr);
      ctx.font = `500 ${8.5 * dpr}px "Cormorant Garamond", serif`;
      ctx.fillText("TO REVEAL OUR DATE", centerX, centerY + 8 * dpr);
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
      aria-label={isRevealed ? "Wedding date revealed: April 26, 2027" : "Scratch to reveal the wedding date"}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !revealStarted.current) {
          event.preventDefault();
          revealWithKeyboard();
        }
      }}
    >
      <div className="scratch-card__halo" aria-hidden="true" />
      <div className="scratch-card__inner">
        <div className="scratch-card__topline"><span><CalendarDays aria-hidden="true" /> 26 · 04 · 27</span><span>{isRevealed ? "REVEALED" : `${Math.round(progress * 100)}%`}</span></div>
        <span className="scratch-date"><small>Our forever begins</small><strong>April 26</strong><em>Two Thousand Twenty Seven</em></span>
        {!isRevealed && <div className="scratch-hint" aria-hidden="true"><Sparkles /> <span>Scratch gently to uncover</span></div>}
      </div>
      {!isRevealed && <canvas ref={canvasRef} className="scratch-canvas" aria-hidden="true" />}
      <div className="scratch-card__stamp" aria-hidden="true">A <span>&amp;</span> O</div>
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
            <div className="monogram">A <span>&amp;</span> O</div>
            <p className="eyebrow eyebrow--gold">You are cordially invited to celebrate</p>
            <h2 className="script-title">Aaroon &amp; Olivia</h2>
            <p className="envelope-copy">A celebration of love, family and a beautiful beginning</p>
            <Button className="button-gold" onClick={() => setIsOpen(true)}>
              Open invitation
            </Button>
          </div>
        </div>
      </div>

      <article className="invitation-paper">
        <div className="floral-corner floral-corner--top" aria-hidden="true">✦ ❁</div>
        <div className="floral-corner floral-corner--bottom" aria-hidden="true">❁ ✦</div>

        {/* 1. The invitation card: couple, love note, date reveal, venue */}
        <header className="invitation-hero reveal-section" data-reveal>
          <div className="arabic-mark" lang="ar">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <p className="eyebrow">In the name of Allah, the Most Gracious, the Most Merciful</p>
          <div className="hero-rule"><span>✦</span><i>بِسْمِ اللَّهِ</i><span>✦</span></div>
          <p className="eyebrow">Together with their families</p>
          <h1 className="couple-names"><span>Aaroon Ahmed</span><em>&amp;</em><span>Olivia Khan</span></h1>
          <p className="hero-message">“Two souls, one heart, a lifetime of love — we invite you to witness the beginning of our forever.”</p>
          <div className="hero-signature" aria-hidden="true"><span>With the blessings of our families</span><Heart /></div>

          <div className="date-reveal reveal-section" data-reveal aria-labelledby="date-title">
            <p className="eyebrow eyebrow--gold" id="date-title">The day we wed</p>
            <ScratchCard onReveal={celebrateReveal} />
            <p className="date-note"><Sparkles aria-hidden="true" /> Liceria Grand Ballroom · Any City</p>
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
              <span className="story-index">01</span>
              <Star aria-hidden="true" />
              <p className="eyebrow eyebrow--gold">The promise</p>
              <h3>To choose each other, every day.</h3>
              <p>Not only for the celebration, but for every ordinary morning, every difficult evening, and every quiet moment in between.</p>
            </article>
            <article className="story-panel story-panel--light">
              <span className="story-index">02</span>
              <Heart aria-hidden="true" />
              <p className="eyebrow eyebrow--gold">The blessing</p>
              <h3>Two families become one circle.</h3>
              <p>With the blessings of our parents, grandparents, siblings, and everyone who has loved us into becoming who we are.</p>
            </article>
            <article className="story-panel story-panel--outline">
              <span className="story-index">03</span>
              <Compass aria-hidden="true" />
              <p className="eyebrow eyebrow--gold">The invitation</p>
              <h3>Your presence completes the picture.</h3>
              <p>Come for the Nikah. Stay for the laughter. Leave with a memory we will carry for years.</p>
            </article>
          </div>
          <div className="story-quote">
            <span>“</span>What begins as two names on an invitation becomes a lifetime of memories.<span>”</span>
          </div>
        </section>

        {/* 3. Function details along a path */}
        <section className="moments-section reveal-section" data-reveal aria-labelledby="moments-title">
          <div className="section-heading"><p className="eyebrow eyebrow--gold">Three moments, one celebration</p><h2 id="moments-title">The journey of our celebration</h2></div>
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

        {/* Countdown — placed after the celebration schedule so the rhythm reads as story → moments → anticipation. */}
        <section className="countdown-band reveal-section" data-reveal aria-label="Countdown to the wedding">
          <div className="countdown-intro">
            <p className="eyebrow eyebrow--gold">Until we say &ldquo;I do&rdquo;</p>
          </div>
          <div className="countdown-values">
            {Object.entries(countdown).map(([label, value]) => (
              <div className="countdown-unit" key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Venue + invitation close — one visual destination instead of two consecutive dark sections. */}
        <section className="venue-section reveal-section" data-reveal aria-labelledby="venue-title">
          <div className="venue-arch" aria-hidden="true"><span>✦</span></div>
          <p className="eyebrow eyebrow--gold" id="venue-title">The place we gather</p>
          <div className="venue-title-row">
  <h2>Liceria Grand Ballroom</h2>

  <a
    className="venue-map-link"
    href="https://www.google.com/maps/search/?api=1&query=Liceria+Grand+Ballroom+123+Anywhere+St+Any+City"
    target="_blank"
    rel="noreferrer"
    aria-label="Open Liceria Grand Ballroom in Google Maps"
  >
    <MapPin size={15} />
    <span>Open Google Maps</span>
    <span aria-hidden="true">↗</span>
  </a>
</div>
          <p className="venue-address">123 Anywhere St., Any City, ST 12345</p>
          <div className="venue-divider" aria-hidden="true"><span>✦</span><i></i><span>✦</span></div>
          <div className="venue-invite">
            <p className="eyebrow eyebrow--gold">And then, we celebrate</p>
            <h3>Come as our guest.<br /><em>Leave as family.</em></h3>
            <div className="venue-meta">
              <span><Clock3 aria-hidden="true" /> 8:00 PM</span>
              <span><MapPin aria-hidden="true" /> Liceria Grand Ballroom</span>
            </div>
            <p>Dress in your favourite festive colours, bring your blessings, and let us make an evening worth remembering.</p>
          </div>
        </section>

        {/* 5. RSVP */}
        <section className="rsvp-section reveal-section" data-reveal aria-labelledby="rsvp-title">
          <div className="rsvp-card">
            <div className="section-heading"><p className="eyebrow eyebrow--gold">We hope you can join us</p><h2 id="rsvp-title">Kindly RSVP</h2><p>We would be honoured to celebrate with you.</p></div>
            {submitted ? <div className="rsvp-success" role="status"><span>✦</span><h3>Thank you for letting us know.</h3><p>Your response has been noted with love. We cannot wait to celebrate together.</p></div> : (
              <form onSubmit={submitRsvp} className="rsvp-form">
                <label>Full name<input name="name" required placeholder="Your name" /></label>
                <div className="rsvp-grid"><label>Guests<select name="guests" defaultValue="1"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option></select></label><label>Attendance<select name="attendance" defaultValue="joyfully-accept"><option value="joyfully-accept">Joyfully accept</option><option value="regretfully-decline">Regretfully decline</option></select></label></div>
                <Button className="button-emerald" type="submit">Confirm attendance</Button>
              </form>
            )}
          </div>
        </section>

        {/* 6. Thanks */}
        <footer className="invitation-footer reveal-section" data-reveal>
          <p className="script-title footer-script">With love &amp; gratitude</p>
          <p className="footer-quote">“Your presence on this auspicious day is the greatest gift we could receive.”</p>
          <div className="family-grid"><div><span>Groom's family</span><strong>Mr. &amp; Mrs. Ahmed Siddiqui</strong><small>Family &amp; relatives</small></div><div><span>Bride's family</span><strong>Mr. &amp; Mrs. Salman Khan</strong><small>Family &amp; relatives</small></div><div><span>With thanks to</span><strong>Our grandparents</strong><small>Siblings &amp; cousins</small></div></div>
          <div className="footer-mark">Aaroon &amp; Olivia · 2027</div>
        </footer>
      </article>
    </main>
  );
}
