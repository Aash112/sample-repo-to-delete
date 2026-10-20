// Short sound effects through Web Audio (reliable on iOS once unlocked by a tap) and haptics.
// Muting the music mutes these too.

export type Sfx = "seal-crack" | "doors" | "chime" | "light" | "page" | "scratch" | "reveal" | "release" | "stamp";

const names: Sfx[] = ["seal-crack", "doors", "chime", "light", "page", "scratch", "reveal", "release", "stamp"];
const buffers = new Map<Sfx, AudioBuffer>();
let context: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let loading: Promise<void> | null = null;

/** Call from a user gesture (pointerdown/click). Safe to call many times. */
export function unlockSound() {
  if (typeof window === "undefined") return;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context = new Ctor();
    master = context.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume();
  if (!loading) {
    const ctx = context;
    loading = Promise.all(
      names.map(async (name) => {
        try {
          const response = await fetch(`/sfx/${name}.mp3`);
          buffers.set(name, await ctx.decodeAudioData(await response.arrayBuffer()));
        } catch {
          // A missing effect should never break the invitation.
        }
      }),
    ).then(() => undefined);
  }
}

export function playSfx(name: Sfx, volume = 0.5, rate = 1) {
  if (!context || !master || muted) return;
  const buffer = buffers.get(name);
  if (!buffer) return;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  gain.gain.value = volume;
  source.connect(gain).connect(master);
  source.start();
}

export function setSfxMuted(value: boolean) {
  muted = value;
  if (master && context) master.gain.setTargetAtTime(value ? 0 : 1, context.currentTime, 0.05);
}

export function buzz(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(pattern);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
