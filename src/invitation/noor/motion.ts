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
