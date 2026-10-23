// GSAP (scroll scenes, timelines) loaded on the client only, once.

import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

type Motion = { gsap: typeof GsapType; ScrollTrigger: typeof ScrollTriggerType };
let loaded: Promise<Motion> | null = null;

export function loadMotion(): Promise<Motion> {
  if (!loaded) {
    loaded = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger);
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    });
  }
  return loaded;
}

export const img = (name: string) => `/images/noor/${name}.webp`;

// GSAP's eases as CSS curves, for Web Animations: those run on the compositor, so a busy main thread
// (React commits, scroll-trigger refreshes, image decodes) can't stutter them on phones.
export const ease = {
  outQuad: "cubic-bezier(0.5, 1, 0.89, 1)", // power1.out
  outCubic: "cubic-bezier(0.33, 1, 0.68, 1)", // power2.out / anime out(3)
  outQuart: "cubic-bezier(0.25, 1, 0.5, 1)", // anime out(4)
  inCubic: "cubic-bezier(0.32, 0, 0.67, 0)", // power2.in
  inQuart: "cubic-bezier(0.5, 0, 0.75, 0)", // power3.in
  inOutCubic: "cubic-bezier(0.65, 0, 0.35, 1)", // power2.inOut
};

/** An anime.js spring as a CSS linear() easing and its duration, so it can run as a Web Animation. */
export function springEasing(spring: { ease: (t: number) => number; settlingDuration: number }) {
  if (typeof CSS === "undefined" || !CSS.supports("animation-timing-function", "linear(0, 1)")) {
    return { easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", duration: spring.settlingDuration };
  }
  const points = Array.from({ length: 49 }, (_, i) => spring.ease(i / 48).toFixed(4));
  return { easing: `linear(${points.join(", ")})`, duration: spring.settlingDuration };
}
