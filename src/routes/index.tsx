import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock3, MapPin, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

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

const weddingDate = new Date("2026-04-26T20:00:00");

const gallery = [
  { src: couplePortrait, alt: "Aaroon and Olivia in emerald and ivory wedding attire", title: "A new chapter" },
  { src: mehendiDetail, alt: "Intricate bridal mehendi with gold jewelry", title: "Joy in every detail" },
  { src: groomPortrait, alt: "Aaroon in an ivory sherwani with emerald embroidery", title: "Together with grace" },
];

const moments = [
  {
    number: "01",
    name: "Mehendi Ceremony",
    date: "April 24, 2026",
    time: "6:00 PM onwards",
    location: "The Garden Courtyard",
    description: "An evening of music, laughter, sweets, and intricate henna designs with the women of our families.",
  },
  {
    number: "02",
    name: "Wedding Ceremony",
    date: "April 26, 2026",
    time: "8:00 PM sharp",
    location: "Liceria Grand Ballroom",
    description: "The Nikah and formal union of two souls, surrounded by the prayers and blessings of our loved ones.",
  },
  {
    number: "03",
    name: "Valima Reception",
    date: "April 27, 2026",
    time: "7:00 PM",
    location: "Liceria Grand Ballroom",
    description: "A grand feast and a joyful evening to celebrate our first days as husband and wife.",
  },
];

function Index() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const difference = Math.max(0, weddingDate.getTime() - now.getTime());
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

        <header className="invitation-hero">
          <div className="arabic-mark" lang="ar">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <p className="eyebrow">In the name of Allah, the Most Gracious, the Most Merciful</p>
          <div className="hero-rule"><span>✦</span></div>
          <p className="eyebrow">Together with their families</p>
          <h1 className="couple-names"><span>Aaroon Ahmed</span><em>&amp;</em><span>Olivia Khan</span></h1>
          <p className="hero-message">Invite you to join them in celebrating their union and a new chapter of love and laughter.</p>
        </header>

        <section className="date-reveal" aria-labelledby="date-title">
          <p className="eyebrow eyebrow--gold" id="date-title">The day we wed</p>
          <button
            type="button"
            className={`scratch-card ${isRevealed ? "scratch-card--revealed" : ""}`}
            onClick={() => setIsRevealed(true)}
            aria-label={isRevealed ? "Wedding date revealed" : "Reveal the wedding date"}
          >
            <span className="scratch-date"><strong>April 26</strong><small>Two Thousand Twenty Six</small></span>
            {!isRevealed && <span className="scratch-cover"><span>Scratch to reveal</span><Sparkles aria-hidden="true" /></span>}
          </button>
          <p className="date-note">Liceria Grand Ballroom · Any City</p>
        </section>

        <section className="countdown-band" aria-label="Countdown to the wedding">
          {Object.entries(countdown).map(([label, value]) => (
            <div className="countdown-unit" key={label}>
              <strong>{String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="gallery-section" aria-label="Aaroon and Olivia">
          <div className="section-heading">
            <p className="eyebrow eyebrow--gold">A glimpse of us</p>
            <h2>Our story, in still moments</h2>
          </div>
          <div className="gallery-frame">
            <img src={selectedPhoto.src} alt={selectedPhoto.alt} width={800} height={1200} />
            <div className="gallery-caption"><span>{selectedPhoto.title}</span><span>{String(activePhoto + 1).padStart(2, "0")} / 03</span></div>
            <Button variant="outline" size="icon" className="gallery-control gallery-control--prev" onClick={() => selectPhoto(-1)} aria-label="Previous photo"><ChevronLeft /></Button>
            <Button variant="outline" size="icon" className="gallery-control gallery-control--next" onClick={() => selectPhoto(1)} aria-label="Next photo"><ChevronRight /></Button>
          </div>
        </section>

        <section className="moments-section" aria-labelledby="moments-title">
          <div className="section-heading"><p className="eyebrow eyebrow--gold">Three moments, one celebration</p><h2 id="moments-title">Wedding moments</h2></div>
          <div className="moments-list">
            {moments.map((moment) => (
              <article className="moment-row" key={moment.number}>
                <div className="moment-index">{moment.number}</div>
                <div className="moment-date"><span>{moment.date}</span><strong>{moment.time}</strong></div>
                <div className="moment-detail"><h3>{moment.name}</h3><p>{moment.description}</p><span className="moment-location"><MapPin aria-hidden="true" /> {moment.location}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="venue-section" aria-labelledby="venue-title">
          <div className="venue-arch" aria-hidden="true"><span>✦</span></div>
          <p className="eyebrow eyebrow--gold">The venue</p>
          <h2 id="venue-title">Liceria Grand Ballroom</h2>
          <p>123 Anywhere St.<br />Any City, ST 12345</p>
          <a className="button-outline" href="https://www.google.com/maps/search/?api=1&query=Liceria+Grand+Ballroom+123+Anywhere+St+Any+City" target="_blank" rel="noreferrer">Open Google Maps <span>↗</span></a>
        </section>

        <section className="rsvp-section" aria-labelledby="rsvp-title">
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

        <footer className="invitation-footer">
          <p className="script-title footer-script">With love &amp; gratitude</p>
          <p className="footer-quote">“Your presence on this auspicious day is the greatest gift we could receive.”</p>
          <div className="family-grid"><div><span>Groom's family</span><strong>Mr. &amp; Mrs. Ahmed Siddiqui</strong><small>Family &amp; relatives</small></div><div><span>Bride's family</span><strong>Mr. &amp; Mrs. Salman Khan</strong><small>Family &amp; relatives</small></div><div><span>With thanks to</span><strong>Our grandparents</strong><small>Siblings &amp; cousins</small></div></div>
          <div className="footer-mark">Aaroon &amp; Olivia · 2026</div>
        </footer>
      </article>
    </main>
  );
}
