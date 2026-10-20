# Noor — premium upgrade plan for the Al-Ryan & Faseeha invitation

Working name for the design: **Noor** (light). Emerald, antique gold, ivory and jasmine; lanterns, a crescent moon,
a carved arch, and the sea at Thengapattanam. Built here first; later lifted into the app as a template
(everything already reads from `src/config/wedding.ts`, so that stays the rule).

## 1. What's there today (code review)

| Area | Today | Problem |
|---|---|---|
| Opening | Dark emerald card, couple PNG, "Open invitation" button; slides up | A button, not an experience. No reveal moment. |
| Couple art | `couple-illustration.png` (2.2 MB) | **Broken cut-out**: yellow/pink fringe round the arch and leaves. Has to be regenerated. |
| Hero | Arabic text + names + quote | Arabic uses a fallback font; nothing moves; no art at all |
| Date | Gold scratch card + confetti | Works and people like it. Foil is a flat gradient; confetti is generic coloured paper |
| Story | 3 text cards (dark / light / outline) | Reads as "pasted boxes". Text in the JSX is hard-coded, not from config (`a7K9xP4mQ2L8.tsx:433-435`) |
| Countdown | 4 numbers in a band | Static, nothing to do |
| Event | One text card | `nikah-card.png` exists but is unused and has text baked into the image |
| Venue | Name + address + Maps button | No picture, no sense of place |
| Celebration | Text with orbit dots | No interaction |
| RSVP | Two `<select>`s | Feels like a form. `console.log` of guest data in production. Guest count still asked when declining |
| Footer | Families text | No share, no brand credit, no closing moment |
| Sharing | No `og:image` | **WhatsApp/Instagram previews are blank**. This is the biggest loss for a promo invite |
| Weight | 3 MP3s (13 MB) + 4 PNGs (7 MB) in `public/` | Only one of each is used; the rest still deploy. Main MP3 is 5.5 MB |
| Motion | CSS keyframes + IntersectionObserver | No scroll story, no physics, no SFX |

## 2. Direction

- **Medium:** soft painted gouache-and-watercolour illustration (matches the art you already like), cream paper
  with gold leaf. Not photographic: Pookolam is the photographic one, Noor is the painted one.
- **Light is the story.** The guest brings light in at every step: opens the doors, lights lanterns, scratches gold
  leaf, releases a wish lantern. By the footer the whole page is glowing.
- **One continuous background** through the middle sections (ivory paper with a faint gold geometric watermark,
  shifting from dawn ivory to evening emerald as you scroll). A gold arch separator before the footer.
- **Type:** Arabic in **Aref Ruqaa** or **Amiri** (real calligraphic font, drawn in with an SVG mask, never AI-generated
  Arabic, it always comes out wrong). Latin: **Cormorant Garamond** body, a more distinctive display face
  (e.g. *Italiana* or *Gilda Display*) instead of Playfair, *Pinyon Script* for names.
- **Motion:** GSAP (ScrollTrigger) for scroll scenes, anime.js v4 for SVG draw, springs and staggers. Lazy-loaded.
  Every effect has a `prefers-reduced-motion` fallback. Haptics on mobile, optional SFX (muted with the music).

## 3. Section by section (one hands-on action each, plus automatic motion)

| # | Section | Guest does | Page does (wow) | Assets |
|---|---|---|---|---|
| 0 | **Gate** | **Press and hold** the wax seal on carved emerald doors (ring fills, phone buzzes) | Seal cracks, doors swing open in 3D, warm light and dust floods out, couple revealed, music fades in | 02–05, 09 |
| 1 | **Hero** | **Tap a lantern** → it swings on its chain (spring) and glows brighter with a chime. Tilt phone / move mouse → layers drift (parallax) | Bismillah writes itself in gold, names rise letter by letter, crescent glows, jasmine falls slowly | 06–12 |
| 2 | **Date** | **Scratch the gold leaf** (keep it: it's the signature) | Real gold-leaf texture; scratched flakes fall with gravity; on reveal, jasmine petals burst instead of paper confetti; the 8-point star frame turns once | 13, 14, 23 |
| 3 | **Our story** (3 chapters) | **Swipe/turn pages** of an illuminated manuscript (3D page flip) | Each page's painted vignette fades in and its gold border draws itself; a jasmine is threaded onto a garland per page | 15–18 |
| 4 | **Countdown** | **Tap to light** four lanterns: Days, Hours, Minutes, Seconds | Each lit lantern shows its live number; all four lit → they rise slightly and sparkle | 11, 12 |
| 5 | **Nikkah** (works with one event) | **Tap "Add to calendar"** (Google / Apple .ics) | The arch stage lights up from the bottom, a garland drops into place, time and date slide in under the hanging lamp | 19, 10 |
| 6 | **Venue** | **Tap "Show me the way"** | A gold path draws itself across a painted map of the coast to the hall, a boat rocks on the sea, then the Maps button appears | 20 |
| 7 | **Evening** (8 PM celebration) + **Wish wall** | **Write a dua / wish** and release it | Your wish becomes a sky lantern that floats up into a night sky full of other guests' lanterns (tap any to read it) | 21, 22 |
| 8 | **RSVP** | **Tap** Accept / Decline cards, **+/−** guests | On submit the letter folds into an envelope, gets the A&F seal stamped, and flies off; petals fall | 24, 05, 23 |
| 9 | **Footer** | **Tap the crescent** → stars join into a heart; **Share** (WhatsApp / native share) | Families fade in on a gold separator; small "Crafted with [your brand] · Make yours" credit | 25 |

Background through the middle: asset 01. Share preview: asset 26.

User engagement / promo hooks (the reason we're doing this):
- `og:image` share card (asset 22) so every WhatsApp forward shows the art + names.
- Share button with prefilled WhatsApp text, and the wish wall (guests come back to read wishes).
- Footer credit linking to the website with `?utm_source=alryan-faseeha&utm_medium=invite`.
- Optional: "Save the date" image download (the share card in portrait).

## 4. Build phases

1. **Foundations** (no new art needed): remove unused files from `public/`, compress music to ~128 kbps, move
   hard-coded story text into config, drop the `console.log`, fix RSVP (no guest count on decline), add og meta,
   add GSAP + anime.js, new fonts, continuous background.
2. **Assets** (you): generate with `PROMPTS.md`, save raw files to `art/noor/` (not deployed). I convert them to
   WebP/AVIF at the right sizes into `public/images/noor/`.
3. **Sections**: gate → hero → date → story → countdown → event → venue → evening/wishes → RSVP → footer.
4. **Backend**: `wedding_wishes` table in Supabase (name, message, created_at, approved) with RLS: anyone can
   insert, only approved rows are readable; a simple word filter.
5. **QA**: Playwright screenshots desktop / tablet / mobile, reduced motion, low-end Android (4× CPU throttle),
   Lighthouse (target LCP < 2.5 s on 4G), share preview check on WhatsApp.
6. **Template later**: the section components stay config-driven so the app can reuse them.

## 5. Decisions (owner, 2026-10-20)

1. Brand: **InviteNest** (https://invitenest.cc/), only as the small footer credit. The **share preview is the
   couple's monogram (A & F)**, no InviteNest logo.
2. Music: keep the current `wedding-music.mp3` (compressed to 96 kbps).
3. Wish wall: yes. Table `wedding_wishes` (`supabase/migrations/20261020120000_wedding_wishes.sql`); wishes show
   instantly, hide one with `hidden = true` in the dashboard.
4. Date: keep the **scratch card** only.

## 6. Phase 1 done (2026-10-20)

- Removed unused `couple-illustration1.png`, `nikah-card*.png`, `wedding-music1/2.mp3`; music 5.5 → 3.2 MB.
- `art/` gitignored for raw art. GSAP + anime.js added (npm + bun lockfiles).
- Story text now from config; RSVP `console.log` removed; declining hides the guest count and saves 0.
- Fonts added: Aref Ruqaa (Arabic, already live on the Bismillah), Italiana, Pinyon Script.
- Config: `wishes`, `share`, `brand`, `seo.siteUrl` / `seo.shareImage`. og:image tags switch on once `siteUrl` is set.
- `src/lib/wishes.ts`: `fetchWishes()` / `addWish()` for the wish-wall section.

## 7. Phase 2–3 done (2026-10-20): Noor is built

- Code: `src/invitation/noor/` (one file per section + `noor.css`, `sound.ts`, `petals.ts`, `motion.ts`); the route
  just renders `<NoorInvitation />`. Section order: gate → hero → date → story → countdown → Nikkah → venue → RSVP →
  evening + wish wall → footer.
- Art: `public/images/noor/` (4 MB WebP, from 56 MB raw), `arch-mask.png` (arch opening, generated),
  `petals/1–16.webp` (cut from the sheet), `share.jpg` (monogram share card). SFX in `public/sfx/`.
- Supabase: `wedding_wishes` live (owner ran the SQL); types for both tables added to `types.ts`.
- QA (Playwright, Supabase mocked so nothing is written): full click-through on 1440×900 and 390×844, 0 console
  errors, no horizontal overflow.
- Round 2 (owner feedback, 2026-10-20): gate rebuilt (emerald wall, corridor only through the doorway, walk into
  light); hero pinned dolly into the arch, dissolving to paper; countdown numbers large under the lanterns; venue
  re-laid out (name as heading, chips, map + directions panel, auto-drawn route); RSVP envelope appears only when
  sending (no gap); arcade of arches from paper into night; golden thread in the paper margins; titles in light
  Cormorant with a gold italic last word; jasmine-only drizzle.
- Round 3 (owner feedback, 2026-10-20): hero no longer zooms or pins on scroll; doors open straight onto the hero
  (doorway cut out of the wall), then doors and wall zoom out, no white flash; seal centred on the door seam on
  desktop; countdown lanterns stay on the rail when all are lit; story page-curl glitch removed (first page peeks
  instead); venue route traced along the painted road to the hall steps, directions panel under the map; wish
  wall removed, RSVP takes an optional message (`wedding_rsvps.message`, migration
  `20261020130000_rsvp_message.sql`, also drops `wedding_wishes`); evening is now arches + text + a few lanterns.
- Round 4 (2026-10-20): footer share button removed; the 8 PM time removed (it was never shown on the original
  invite: show only what the original shows, no new facts). Gate rebuilt without the flash/seam: the wall lives
  inside the stage with one doorway-shaped hole (`doorway-mask.png`) from the start; the seam glow is switched off
  by class (its CSS pulse beat GSAP's fade); scrollbar gutter kept so the hero doesn't jump on unlock.
- Still open: `seo.siteUrl` (share image tags stay off until set); bride's hair showing in `couple.png` (owner to
  check with the family); old invitation CSS in `src/styles.css` and `couple-illustration.png` now unused.
