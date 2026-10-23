import { useCallback, useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import { Countdown } from "./Countdown";
import { DateReveal } from "./DateReveal";
import { Evening } from "./Evening";
import { Footer } from "./Footer";
import { Gate } from "./Gate";
import { Hero } from "./Hero";
import { Nikah } from "./Nikah";
import { Rsvp } from "./Rsvp";
import { setSfxMuted } from "./sound";
import { GoldenThread } from "./GoldenThread";
import { Story } from "./Story";
import { Venue } from "./Venue";
import "./noor.css";

const MUSIC_VOLUME = 0.55;

export function NoorInvitation() {
  const audio = useRef<HTMLAudioElement>(null);
  const fade = useRef(0);
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const fadeTo = useCallback((target: number, ms: number) => {
    const el = audio.current;
    if (!el) return;
    window.clearInterval(fade.current);
    const from = el.volume, start = performance.now();
    fade.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      el.volume = from + (target - from) * t;
      if (t >= 1) window.clearInterval(fade.current);
    }, 50);
  }, []);

  // The hold on the seal is the user gesture that lets the browser play audio.
  const onHoldStart = useCallback(() => {
    const el = audio.current;
    if (!el || !el.paused) return;
    // muted (not volume) because iOS ignores volume changes from code
    el.muted = true;
    el.play().catch(() => {});
  }, []);
  const onHoldCancel = useCallback(() => {
    const el = audio.current;
    if (el?.muted) el.pause();
  }, []);
  const onUnseal = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    el.volume = 0;
    el.muted = false;
    if (el.paused) el.play().catch(() => {});
    setPlaying(true);
    fadeTo(MUSIC_VOLUME, 2500);
  }, [fadeTo]);

  const toggleMusic = async () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      try { el.volume = MUSIC_VOLUME; await el.play(); setPlaying(true); setSfxMuted(false); } catch { setPlaying(false); }
    } else {
      el.pause(); setPlaying(false); setSfxMuted(true);
    }
  };

  // Sections fade up as they enter the screen.
  useEffect(() => {
    if (!opened) return;
    const items = document.querySelectorAll<HTMLElement>(".noor [data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      // a data attribute, not a class: React rewrites className on re-render and would drop it
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.setAttribute("data-visible", ""); observer.unobserve(entry.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [opened]);

  // Looping decorations only run where they can be seen: off-screen sections are marked idle and their CSS
  // animations pause (about 70 of them would otherwise be restyled every frame, the footer's stars included).
  useEffect(() => {
    // a class, not html:has(.noor): :has made every DOM change (the countdown's ticking digits) restyle the page
    document.documentElement.classList.add("noor-site");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.toggleAttribute("data-idle", !entry.isIntersecting));
    }, { rootMargin: "120px 0px" });
    document.querySelectorAll(".noor-hero, .noor-paper > section, .noor-thread, .noor-evening, .noor-footer").forEach((el) => observer.observe(el));
    return () => { observer.disconnect(); document.documentElement.classList.remove("noor-site"); };
  }, []);

  useEffect(() => () => window.clearInterval(fade.current), []);

  return (
    <main className={`noor ${opened ? "is-open" : ""}`}>
      <audio ref={audio} src="/music/wedding-music.mp3" loop preload="auto" />

      <Gate onHoldStart={onHoldStart} onHoldCancel={onHoldCancel} onUnseal={onUnseal} onReveal={() => setRevealed(true)} onOpened={() => setOpened(true)} />

      <Hero opened={revealed} settled={opened} />
      <div className="noor-paper">
        <GoldenThread />
        <DateReveal />
        <Story />
        <Countdown />
        <Nikah />
        <Venue />
        <Rsvp />
      </div>
      <Evening />
      <Footer />

      <button type="button" className="noor-music" onClick={toggleMusic} aria-label={playing ? "Mute music" : "Play music"} aria-pressed={playing}>
        {playing ? <Music aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        {playing && <span className="noor-music__bars" aria-hidden="true"><i /><i /><i /></span>}
      </button>
    </main>
  );
}
