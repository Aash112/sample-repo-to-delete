import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import bridePortrait from "@/assets/bride-portrait.jpg";
import couplePortrait from "@/assets/couple-portrait.jpg";
import groomPortrait from "@/assets/groom-portrait.jpg";
import mehendiDetail from "@/assets/mehendi-detail.jpg";
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

const gallery = [
  { src: couplePortrait, alt: "Aaroon and Olivia in emerald and ivory wedding attire", title: "A new chapter" },
  { src: mehendiDetail, alt: "Intricate bridal mehendi with gold jewelry", title: "Joy in every detail" },
  { src: groomPortrait, alt: "Aaroon in an ivory sherwani with emerald embroidery", title: "Together with grace" },
];

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

function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const scratching = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIsRevealed(true);
  }, []);

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
      const stripe = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      stripe.addColorStop(0, "#c9a227");
      stripe.addColorStop(0.5, "#e6c65c");
      stripe.addColorStop(1, "#a8861c");
      ctx.fillStyle = stripe;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(120, 88, 12, 0.35)";
      ctx.lineWidth = 6 * dpr;
      for (let x = -canvas.height; x < canvas.width + canvas.height; x += 22 * dpr) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvas.height, canvas.height);
        ctx.stroke();
      }
      ctx.fillStyle = "#123524";
      ctx.font = `600 ${13 * dpr}px "Cormorant Garamond", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = `${3 * dpr}px`;
      ctx.fillText("SCRATCH TO REVEAL", canvas.width / 2, canvas.height / 2);
    };

    paintCover();
    const observer = new ResizeObserver(paintCover);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let last: { x: number; y: number } | null = null;
    let moves = 0;

    const eraseAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (clientX - rect.left) * dpr;
      const y = (clientY - rect.top) * dpr;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 44 * dpr;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      if (last) ctx.moveTo(last.x, last.y);
      else ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last = { x, y };

      moves += 1;
      if (moves % 6 === 0) checkCleared();
    };

    const checkCleared = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cleared = 0;
      for (let i = 3; i < data.length; i += 32) {
        if (data[i] === 0) cleared += 1;
      }
      if (cleared / (data.length / 32) > 0.35) setIsRevealed(true);
    };

    const onPointerDown = (event: PointerEvent) => {
      scratching.current = true;
      last = null;
      canvas.setPointerCapture(event.pointerId);
      eraseAt(event.clientX, event.clientY);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!scratching.current) return;
      eraseAt(event.clientX, event.clientY);
    };
    const onPointerUp = () => {
      scratching.current = false;
      last = null;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [isRevealed]);

  return (
    <div
      className={`scratch-card ${isRevealed ? "scratch-card--revealed" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={isRevealed ? "Wedding date revealed: April 26" : "Scratch to reveal the wedding date"}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsRevealed(true);
        }
      }}
    >
      <span className="scratch-date"><strong>April 26</strong><small>Two Thousand Twenty Seven</small></span>
      {!isRevealed && <canvas ref={canvasRef} className="scratch-canvas" aria-hidden="true" />}
    </div>
  );
}

function Index() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
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

  const selectPhoto = (direction: number) => {
    setActivePhoto((current) => (current + direction + gallery.length) % gallery.length);
  };

  const selectedPhoto = gallery[activePhoto] ?? {
    src: couplePortrait,
    alt: "Aaroon and Olivia in emerald and ivory wedding attire",
    title: "A new chapter",
  };

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
          <div className="hero-rule"><span>✦</span></div>
          <p className="eyebrow">Together with their families</p>
          <h1 className="couple-names"><span>Aaroon Ahmed</span><em>&amp;</em><span>Olivia Khan</span></h1>
          <p className="hero-message">“Two souls, one heart, a lifetime of love — we invite you to witness the beginning of our forever.”</p>

          <div className="date-reveal reveal-section" data-reveal aria-labelledby="date-title">
            <p className="eyebrow eyebrow--gold" id="date-title">The day we wed</p>
            <ScratchCard />
            <p className="date-note">Liceria Grand Ballroom · Any City</p>
          </div>

        </header>

        {/* 2. The couple, individually */}
        <section className="couple-section reveal-section" data-reveal aria-labelledby="couple-title">
          <div className="section-heading">
            <p className="eyebrow eyebrow--gold">The bride &amp; groom</p>
            <h2 id="couple-title">Two hearts, one journey</h2>
          </div>
          <div className="couple-grid">
            <figure className="couple-card">
              <div className="couple-card__frame">
                <img src={groomPortrait} alt="Aaroon in an ivory sherwani with emerald embroidery" loading="lazy" width={832} height={1248} />
              </div>
              <figcaption>
                <span className="eyebrow eyebrow--gold">The groom</span>
                <h3>Aaroon Ahmed</h3>
                <p>Son of Mr. &amp; Mrs. Ahmed Siddiqui</p>
              </figcaption>
            </figure>
            <div className="couple-amp" aria-hidden="true">&amp;</div>
            <figure className="couple-card">
              <div className="couple-card__frame">
                <img src={bridePortrait} alt="Olivia in an emerald lehenga with gold jewellery" loading="lazy" width={832} height={1248} />
              </div>
              <figcaption>
                <span className="eyebrow eyebrow--gold">The bride</span>
                <h3>Olivia Khan</h3>
                <p>Daughter of Mr. &amp; Mrs. Salman Khan</p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Countdown */}
        <section className="countdown-band reveal-section" data-reveal aria-label="Countdown to the wedding">
          {Object.entries(countdown).map(([label, value]) => (
            <div className="countdown-unit" key={label}>
              <strong>{String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
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

        {/* Venue */}
        <section className="venue-section reveal-section" data-reveal aria-labelledby="venue-title">
          <div className="venue-arch" aria-hidden="true"><span>✦</span></div>
          <p className="eyebrow eyebrow--gold" id="venue-title">The venue</p>
          <h2>Liceria Grand Ballroom</h2>
          <p>123 Anywhere St., Any City, ST 12345</p>
          <a className="button-outline" href="https://www.google.com/maps/search/?api=1&query=Liceria+Grand+Ballroom+123+Anywhere+St+Any+City" target="_blank" rel="noreferrer">Open Google Maps <span>↗</span></a>
        </section>


        {/* 4. Gallery */}
        <section className="gallery-section reveal-section" data-reveal aria-label="Aaroon and Olivia">
          <div className="section-heading">
            <p className="eyebrow eyebrow--gold">A glimpse of us</p>
            <h2>Our story, in still moments</h2>
          </div>
          {gallery.length <= 3 ? (
            <div className="gallery-frame">
              <img src={selectedPhoto.src} alt={selectedPhoto.alt} width={800} height={1200} loading="lazy" />
              <div className="gallery-caption"><span>{selectedPhoto.title}</span><span>{String(activePhoto + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span></div>
              <Button variant="outline" size="icon" className="gallery-control gallery-control--prev" onClick={() => selectPhoto(-1)} aria-label="Previous photo"><ChevronLeft /></Button>
              <Button variant="outline" size="icon" className="gallery-control gallery-control--next" onClick={() => selectPhoto(1)} aria-label="Next photo"><ChevronRight /></Button>
            </div>
          ) : (
            <div className="gallery-grid">
              {gallery.map((photo, index) => (
                <figure className="gallery-grid__item" key={photo.title}>
                  <div className="gallery-grid__frame">
                    <img src={photo.src} alt={photo.alt} width={600} height={800} loading="lazy" />
                  </div>
                  <figcaption>{photo.title}</figcaption>
                </figure>
              ))}
            </div>
          )}
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
