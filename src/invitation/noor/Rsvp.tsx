import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { weddingConfig } from "@/config/wedding";
import { img, loadMotion } from "./motion";
import { Accent } from "./Accent";
import { petalBurst } from "./petals";
import { buzz, playSfx, prefersReducedMotion, unlockSound } from "./sound";

const { rsvp, noor, couple } = weddingConfig;
const STORAGE_KEY = "wedding_rsvp_submitted";
const MAX_GUESTS = 10;

export function Rsvp() {
  const root = useRef<HTMLElement>(null);
  const [attendance, setAttendance] = useState<"joyfully-accept" | "regretfully-decline">("joyfully-accept");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"form" | "saving" | "sealing" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === "true") setStatus("done"); } catch { /* storage blocked */ }
  }, []);

  const sealAndSend = async () => {
    const el = root.current;
    if (!el || prefersReducedMotion()) { setStatus("done"); return; }
    setStatus("sealing");
    const { gsap } = await loadMotion();
    const q = gsap.utils.selector(el);
    const layers = q(".noor-env__layers")[0] as HTMLElement | undefined;
    const letter = q(".noor-letter")[0]?.getBoundingClientRect();
    if (!layers || !letter) { setStatus("done"); return; }
    // The envelope only appears now: the letter shrinks to fit the pocket, the envelope rises behind it,
    // and the letter tucks in just under the flap's hinge (41% down the envelope).
    const envW = layers.offsetWidth, envH = (envW * 878) / 800;
    const scale = Math.min(1, (envW * 0.8) / letter.width, (envH * 0.5) / letter.height);
    const shrunk = letter.height * scale;
    const envTop = Math.max(0, shrunk - envH * 0.22);
    gsap.set(layers, { top: envTop });
    gsap.set(q(".noor-env")[0] ?? null, { minHeight: envTop + envH });
    gsap.timeline({ onComplete: () => setStatus("done") })
      .to(q(".noor-letter"), { scale, transformOrigin: "50% 0%", duration: 0.55, ease: "power2.inOut" })
      .add(() => el.scrollIntoView({ behavior: "smooth", block: "center" }))
      // top, not a transform: a transform would make the layers their own stacking context
      // and the letter could no longer slide between the back and the front pocket
      .fromTo(layers, { opacity: 0, top: envTop + 70 }, { opacity: 1, top: envTop, duration: 0.6, ease: "power3.out" }, "-=0.15")
      .to(q(".noor-letter"), { y: envTop + envH * 0.42, duration: 0.85, ease: "power2.inOut" })
      .set(q(".noor-env__back"), { clipPath: "inset(41% 0 0 0)" })
      .fromTo(q(".noor-env__flap"), { rotateX: -180, transformPerspective: 900 }, { rotateX: 0, duration: 0.6, ease: "power2.in" }, "<")
      .fromTo(q(".noor-env__seal"), { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.in" })
      .add(() => {
        playSfx("stamp", 0.7); buzz([30, 20, 10]);
        const box = q(".noor-env__seal")[0]?.getBoundingClientRect();
        if (box) petalBurst(box.left + box.width / 2, box.top + box.height / 2, 34);
      })
      .to(q(".noor-env"), { y: -30, rotate: -4, duration: 0.4, ease: "power1.out" }, "+=0.4")
      .add(() => playSfx("release", 0.45))
      .to(q(".noor-env"), { x: "60vw", y: "-60vh", rotate: 18, scale: 0.45, opacity: 0, duration: 1.1, ease: "power2.in" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    unlockSound();
    setError(null);
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) return;
    setStatus("saving");
    try {
      const reply: { name: string; guests: number; attendance: string; message?: string } = { name, guests: attendance === "regretfully-decline" ? 0 : guests, attendance };
      const wish = message.trim();
      let { error: dbError } = await supabase.from("wedding_rsvps").insert(wish ? { ...reply, message: wish } : reply);
      // the message column not added yet: still save the reply itself
      if (dbError && wish && /message/i.test(dbError.message)) ({ error: dbError } = await supabase.from("wedding_rsvps").insert(reply));
      if (dbError) throw new Error(dbError.message);
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* storage blocked */ }
      await sealAndSend();
    } catch (cause) {
      setStatus("form");
      setError(`Couldn't save your RSVP: ${cause instanceof Error ? cause.message : "please try again."}`);
    }
  };

  const step = (delta: number) => { setGuests((n) => Math.max(1, Math.min(MAX_GUESTS, n + delta))); buzz(6); };

  if (status === "done") {
    return (
      <section ref={root} className="noor-rsvp noor-reveal" data-reveal aria-labelledby="noor-rsvp-title">
        <div className="noor-rsvp__done" role="status">
          <img className="noor-rsvp__done-seal" src={img("seal")} alt="" loading="lazy" />
          <span className="noor-rsvp__done-mono" aria-hidden="true">{couple.monogram.groom}<i>&amp;</i>{couple.monogram.bride}</span>
          <h2 id="noor-rsvp-title" className="noor-title">{rsvp.successTitle}</h2>
          <p className="noor-lede">{rsvp.successMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="noor-rsvp noor-reveal" data-reveal aria-labelledby="noor-rsvp-title">
      <p className="noor-eyebrow">{rsvp.eyebrow}</p>
      <h2 id="noor-rsvp-title" className="noor-title"><Accent text={rsvp.title} /></h2>
      <p className="noor-lede">{rsvp.intro}</p>

      <div className={`noor-env ${status === "sealing" ? "is-sealing" : ""}`}>
        <form className="noor-letter" onSubmit={submit}>
          <label className="noor-field">
            <span>{rsvp.nameLabel}</span>
            <input name="name" required autoComplete="name" maxLength={80} placeholder={rsvp.namePlaceholder} />
          </label>

          <fieldset className="noor-choice">
            <legend>{rsvp.attendanceLabel}</legend>
            {(["joyfully-accept", "regretfully-decline"] as const).map((value) => (
              <label key={value} className={`noor-choice__card ${attendance === value ? "is-picked" : ""}`}>
                <input type="radio" name="attendance" value={value} checked={attendance === value} onChange={() => { setAttendance(value); buzz(8); playSfx(value === "joyfully-accept" ? "chime" : "page", 0.3); }} />
                <img src={img(value === "joyfully-accept" ? "lantern-lit" : "lantern")} alt="" loading="lazy" />
                <span>{value === "joyfully-accept" ? rsvp.attendanceOptions.accept : rsvp.attendanceOptions.decline}</span>
              </label>
            ))}
          </fieldset>

          {attendance === "joyfully-accept" && (
            <div className="noor-stepper">
              <span id="noor-guests-label">{noor.rsvp.guestsLabel}</span>
              <div className="noor-stepper__control" role="group" aria-labelledby="noor-guests-label">
                <button type="button" onClick={() => step(-1)} disabled={guests <= 1} aria-label={noor.rsvp.fewer}>−</button>
                <output aria-live="polite">{guests}</output>
                <button type="button" onClick={() => step(1)} disabled={guests >= MAX_GUESTS} aria-label={noor.rsvp.more}>+</button>
              </div>
            </div>
          )}

          <label className="noor-field">
            <span>{noor.rsvp.messageLabel}</span>
            <textarea name="message" rows={3} maxLength={noor.rsvp.maxMessage} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={noor.rsvp.messagePlaceholder} />
            <small className="noor-field__count" aria-hidden="true">{message.length}/{noor.rsvp.maxMessage}</small>
          </label>

          {error && <p className="noor-error" role="alert">{error}</p>}

          <button type="submit" className="noor-button noor-button--solid" disabled={status !== "form"}>
            {status === "saving" ? "Saving…" : status === "sealing" ? noor.rsvp.sealing : rsvp.submit}
          </button>
        </form>

        {/* Not a stacking context, so the letter (z 2) slides between the back (1) and the front pocket (3). */}
        <div className="noor-env__layers" aria-hidden="true">
          <img className="noor-env__back" src={img("envelope")} alt="" loading="lazy" />
          <img className="noor-env__front" src={img("envelope")} alt="" loading="lazy" />
          <span className="noor-env__flap">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><linearGradient id="noor-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b5a3f" /><stop offset="1" stopColor="#0e3323" /></linearGradient></defs>
              <path d="M0 0 L100 0 L50 100 Z" fill="url(#noor-flap)" stroke="#d9b45a" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
          <img className="noor-env__seal" src={img("seal")} alt="" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
