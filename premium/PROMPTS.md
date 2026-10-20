# Noor: asset prompts (ChatGPT for images, Gemini / Suno for music, ElevenLabs for sound effects)

**Occasion:** a Tamil Muslim Nikkah in coastal Kanniyakumari (Al-Ryan & Faseeha, 30 Dec 2026).
**Medium:** soft painted **gouache-and-watercolour illustration** on cream paper with real **gold-leaf** accents.
Luminous and calm, like the arch and couple art you already have, but cleaner and more consistent.
**Palette:** ivory `#F8F1E1`, deep emerald `#123524`, emerald `#1F5A43`, antique gold `#C9A24A`, pale gold
`#EAD38E`, jasmine white `#FFFDF6`, warm lantern amber `#F6B860`, night teal `#0D2B2A`.

**Where to save:** raw files into `nikah-suite\art\noor\` (not deployed; I'll compress them into
`public/images/noor/`). Music into `art\noor\music\`, sound effects into `art\noor\sfx\`.

## How to generate

1. All images in **one ChatGPT conversation**, in order. Paste the **style block** first, then start every request
   with *"Same painted style, palette and light as the previous images."*
2. **Transparent** images need real transparency. If you get a checkerboard or a white box, reply
   *"truly transparent PNG background, no checkerboard, no white, clean edges with no coloured fringe"*.
   (The current couple PNG has a yellow/pink fringe. Zoom to 200% on the edges before you keep one.)
3. **No text, letters, numbers or Arabic** in any image. I add all writing in code (AI Arabic always comes out wrong).
4. **No faces.** People only from behind, or only hands.
5. Pairs that must match exactly: **03 + 04** (the two doors) and **11 + 12** (lantern unlit / lit). Ask for the
   second one *"with exactly the same framing, size and position as Image NN"*.

---

## Style block (paste once)

```
I'm creating a set of matching images for a premium Muslim wedding (Nikkah) invitation website, for a couple in
coastal South India (Kanniyakumari).
Style for ALL images: SOFT PAINTED GOUACHE-AND-WATERCOLOUR ILLUSTRATION on warm cream paper, with real
GOLD-LEAF accents that catch the light. Fine Islamic geometric details (8-point stars, arabesque lattice), carved
arches, brass lanterns, jasmine flowers, deep green leaves. Luminous, calm, elegant, high detail, gentle warm glow,
soft shadows. Premium and refined, not cartoonish, not photographic, not 3D-rendered.
Palette: ivory #F8F1E1, deep emerald #123524, emerald #1F5A43, antique gold #C9A24A, pale gold #EAD38E,
jasmine white #FFFDF6, lantern amber #F6B860, night teal #0D2B2A.
No text, no letters, no numbers, no Arabic or calligraphy, no faces, no logos, no watermark, no signature.
```

---

## Background

### 01 · `paper.jpg`: continuous page background (square 1024×1024, **seamless**)
```
Image 1. A SEAMLESS tileable texture of warm ivory handmade paper (#F8F1E1) with very soft watercolour mottling and,
at about 6% strength, a faint gold Islamic geometric pattern of interlocking 8-point stars like a watermark.
Flat, even lighting, no objects, no vignette. Must tile perfectly on all four edges. Square 1024×1024.
```

## Gate (opening)

### 02 · `gate-backdrop.jpg`: what's behind the doors (portrait 1024×1536)
```
Image 2. Seen straight on: the inside of a grand carved ivory-and-gold arched doorway, as if the doors have just
opened. Warm golden light pours out from deep inside, soft light rays and floating dust motes, hanging brass
lanterns glowing in the distance, a few jasmine petals on a marble floor. The centre is bright and calm with empty
space for text. Portrait 1024×1536.
```

### 03 · `door-left.png`: left door (portrait 768×1536, **transparent**)
```
Image 3. The LEFT half of a pair of tall closed wooden doors, seen perfectly straight on, flat (no perspective).
Deep emerald lacquer with an inlaid gold Islamic geometric lattice (8-point stars), a carved pointed-arch top edge
(this is the left half of the arch), a gold door handle on the RIGHT edge. The right edge is a clean straight
vertical line where it meets the other door. Only the door: transparent PNG. Portrait 768×1536.
```

### 04 · `door-right.png`: right door (portrait 768×1536, **transparent**)
```
Image 4. The RIGHT half, an exact mirror of Image 3, with exactly the same size, colours, pattern and arch height,
gold handle on the LEFT edge, clean straight vertical left edge. Placed side by side, Image 3 and Image 4 must form
one perfect pair of closed doors. Transparent PNG. Portrait 768×1536.
```

### 05 · `seal.png`: wax seal (square 1024×1024, **transparent**)
```
Image 5. A single round deep-emerald WAX SEAL seen from directly above, with a thin gold edge and a soft raised rim,
the centre completely SMOOTH and EMPTY (letters will be added later), a short gold silk ribbon tucked under it.
Only the seal and ribbon: transparent PNG. Square 1024×1024.
```

## Hero

### 06 · `sky.jpg`: dusk sky with crescent (portrait 1024×1536 and landscape 1536×1024, two images)
```
Image 6. A calm dusk sky over the sea: soft gradient from night teal (#0D2B2A) at the top to warm gold near the
horizon, a delicate glowing CRESCENT MOON in the upper third, a few faint stars, soft painted clouds. No land, no
buildings. Portrait 1024×1536. Then the same sky again as landscape 1536×1024.
```

### 07 · `skyline.png`: mosque and palm skyline (landscape 1536×768, **transparent**)
```
Image 7. A soft painted skyline seen from far away: one graceful mosque dome with two slender minarets in the
centre, coconut palms on both sides, small whitewashed coastal houses, all in muted emerald and ivory with warm
lit windows. The sky is fully transparent; only the skyline. Transparent PNG. Landscape 1536×768.
```

### 08 · `arch.png`: hero arch frame (portrait 1024×1536, **transparent opening**)
```
Image 8. A grand ornate pointed (ogee) arch frame seen straight on: deep emerald panels with fine gold geometric
inlay, gold edging, carved ivory pillars at both sides, a small gold lantern pendant hanging at the top centre.
The INSIDE of the arch is completely empty and fully transparent (the sky and names show through). Transparent
outside too. Clean edges. Transparent PNG. Portrait 1024×1536.
```

### 09 · `couple.png`: the couple, redone cleanly (square 1536×1536, **transparent**)
```
Image 9. A bride and groom seen FROM BEHIND (no faces), sitting close together, her head resting on his shoulder.
He wears an ivory sherwani with gold embroidery and a white embroidered cap; she wears an ivory-and-gold bridal
dress with a long sheer embroidered dupatta over her head, a few jasmine strands in it. A lush crescent-shaped
arrangement of jasmine, white lilies, deep green and gold leaves wraps the bottom. Only the couple and flowers:
truly transparent background with clean edges and no coloured fringe. Transparent PNG. Square 1536×1536.
```

### 10 · `garland.png`: hanging jasmine garland (landscape 1536×512, **transparent**)
```
Image 10. A soft draped garland of strung jasmine buds with a few small white roses and green leaves, hanging in
one gentle curve from the top-left corner to the top-right corner, with three short jasmine strands dangling from
it. Only the garland: transparent PNG. Landscape 1536×512.
```

### 11 · `lantern.png`: brass lantern, unlit (portrait 512×1024, **transparent**)
```
Image 11. A single ornate Moroccan-style brass LANTERN with pierced geometric star patterns and coloured glass,
hanging from a thin chain that reaches the very top edge. It is NOT lit: cool, quiet, dark glass. Seen straight on,
centred. Only the lantern and chain: transparent PNG. Portrait 512×1024.
```

### 12 · `lantern-lit.png`: the same lantern, lit (portrait 512×1024, **transparent**)
```
Image 12. EXACTLY the same lantern, chain, framing, size and position as Image 11, now LIT from inside: warm amber
glow (#F6B860) through the glass and pierced stars, a soft halo around it. Transparent PNG. Portrait 512×1024.
```

## Date

### 13 · `gold-leaf.jpg`: scratch-off foil (square 1024×1024, **seamless**)
```
Image 13. A SEAMLESS tileable texture of real hammered GOLD LEAF: rich antique gold with soft crinkles, tiny breaks
and warm highlights, like gilding on an old manuscript. Flat even light, no objects. Must tile on all four edges.
Square 1024×1024.
```

### 14 · `star-frame.png`: 8-point star frame for the date (square 1024×1024, **transparent opening**)
```
Image 14. A flat 8-pointed Islamic star (Rub el Hizb shape) FRAME seen straight on: emerald and gold geometric
inlay with jasmine buds at each of the eight points. The centre is a large circle about 60% wide, completely empty
and fully transparent (the date goes there). Transparent outside too. Transparent PNG. Square 1024×1024.
```

## Our story (3 manuscript pages)

### 15 · `page.png`: illuminated manuscript page (portrait 1024×1536, **transparent outside**)
```
Image 15. A single illuminated manuscript page seen straight on: aged ivory paper with an ornate gold-leaf and
emerald border of arabesque vines and small 8-point stars, slightly uneven hand-cut edges. The inner area is
completely plain empty paper (a picture and text go there). Transparent outside the page. Transparent PNG.
Portrait 1024×1536.
```

### 16 · `vignette-promise.png`: "The promise" (square 1024×1024, **transparent**)
```
Image 16. A small round painted vignette: two hands only (his and hers, hers with delicate mehendi), gently placing
a simple gold ring, resting on a folded ivory cloth with a few jasmine flowers, warm soft light. Soft edges that
fade out. Transparent PNG. Square 1024×1024.
```

### 17 · `vignette-blessing.png`: "The blessing" (square 1024×1024, **transparent**)
```
Image 17. A small round painted vignette: several pairs of hands only, young and old, raised gently together in
prayer (dua), palms open, a soft gold light above them, jasmine petals drifting. No faces. Soft edges that fade
out. Transparent PNG. Square 1024×1024.
```

### 18 · `vignette-invitation.png`: "The invitation" (square 1024×1024, **transparent**)
```
Image 18. A small round painted vignette: an open arched doorway seen from a garden path lined with glowing brass
lanterns and jasmine bushes, warm golden light inside, the path leading the eye in. No people. Soft edges that fade
out. Transparent PNG. Square 1024×1024.
```

## Nikkah (event)

### 19 · `nikah-stage.png`: the event arch, empty (portrait 1152×1366, solid)
```
Image 19. The same idea as an ornate Nikkah stage: a grand emerald-and-gold pointed arch inside a cream marble
hall, two glowing lanterns hanging inside the arch on long chains, a small gold pendant at the top centre, soft
window shadows on the wall, polished marble floor. The INSIDE of the arch is plain smooth cream wall with lots of
EMPTY space (the event details go there): absolutely NO text, letters, lines or ornaments in the middle.
Portrait 1152×1366.
```

## Venue

### 20 · `venue-map.jpg`: painted map of the coast (landscape 1536×1024)
```
Image 20. A painted illustrated MAP seen from above at a slight angle, like a storybook map: a small coastal town
in South India by a calm turquoise sea, golden sand, coconut palms, a few small fishing boats, winding lanes, and
one elegant ivory community hall with an emerald dome near the centre-right, softly glowing as the destination.
Leave clear open space along a lane from the bottom-left to the hall (a path will be drawn there). Warm late
afternoon light. No text, no labels, no pins. Landscape 1536×1024.
```

## Evening + wish wall

### 21 · `night-sky.jpg`: evening sky for the wish lanterns (portrait 1024×2048)
```
Image 21. A tall night sky over a calm sea: deep night teal (#0D2B2A) at the top fading to warm amber at the
horizon at the very bottom, a thin crescent moon, many soft stars, a very gentle shimmer on the water at the
bottom edge, the silhouette of a few coconut palms at the bottom corners. Lots of empty sky. Portrait 1024×2048.
```

### 22 · `sky-lantern.png`: a floating wish lantern (portrait 512×768, **transparent**)
```
Image 22. A single paper SKY LANTERN floating upward, ivory paper with a delicate gold geometric pattern, glowing
warm amber from inside, a soft halo. Seen straight on, centred. Only the lantern: transparent PNG. Portrait 512×768.
```

### 23 · `petals.png`: jasmine petals and buds (square 1024×1024, **transparent**)
```
Image 23. Sixteen separate single pieces scattered with clear space between them (none touching, none cut off at
the edges): jasmine buds, open jasmine flowers, single white petals, two small gold leaves, two tiny gold-leaf
flakes. Seen from above. Only the pieces: transparent PNG. Square 1024×1024.
```

## RSVP

### 24 · `envelope.png`: open envelope (square 1024×1024, **transparent**)
```
Image 24. An elegant deep-emerald envelope seen straight on from the BACK, flap OPEN and pointing up, a thin gold
foil border, the inside lined with ivory paper with a fine gold geometric pattern. Empty, no letter inside. Only the
envelope: transparent PNG. Square 1024×1024.
```

## Footer

### 25 · `border.png`: gold separator strip (landscape 2048×256, **transparent, seamless left-right**)
```
Image 25. A horizontal ornamental BORDER strip: a thin row of gold-leaf Islamic geometric tiles (8-point stars and
small arches) with a jasmine bud in the very centre, on transparency. The left and right edges must tile seamlessly.
Transparent PNG. Landscape 2048×256.
```

## Share preview

### 26 · `share-art.jpg`: WhatsApp / social preview, the couple's monogram (landscape 1536×806 → I crop to 1200×630)
No InviteNest logo here: it's the couple's card. I add the initials **A & F**, the names and the date in code.
```
Image 26. A wide, calm, luxurious composition on deep emerald (#123524) with a soft gold geometric pattern at low
strength. In the exact CENTRE: a round MONOGRAM FRAME, a gold-leaf ring of fine Islamic geometric inlay with a
wreath of jasmine buds and small gold leaves around it, a tiny crescent at its top. The inside of the ring is
plain deep emerald, completely EMPTY (the initials go there), about 40% of the image height. Thin gold corner
ornaments, and soft warm light. Lots of calm space left and right of the ring. No text, no letters.
Landscape 1536×806.
```

---

## Music: not needed

We keep the current `public/music/wedding-music.mp3` (already compressed to 96 kbps). The prompts below are kept
only for when this becomes an app template.

**A · Instrumental** (Gemini / Suno)
```
Create a 3-minute instrumental for a Muslim wedding (Nikkah) invitation website.
Mood: serene, romantic and luminous, like lanterns being lit at dusk by the sea.
Instruments: oud for the main melody, qanun ripples, a soft breathy ney flute, warm low strings, and a gentle daf
(frame drum) pulse.
No vocals, no lyrics. About 78 BPM, Hijaz-Kar or Nahawand feeling, ORIGINAL melody.
Structure: soft qanun and ney intro, oud theme, strings swell, a quieter ney-only middle, theme returns, gentle
fade-out. Consistent volume, suitable as background music that loops.
```

**B · Daf and voice only** (for families who prefer no instruments)
```
Create a 3-minute piece for a Muslim wedding (Nikkah) invitation website using ONLY human voice and daf (frame
drum). A warm male and female choir humming and singing open vowels ("ah", "oh") in soft harmony, no words, no
lyrics. Gentle daf rhythm. Mood: serene, joyful, luminous. About 76 BPM, original melody.
Structure: solo hum intro, choir enters with daf, a quiet middle, full harmony return, soft fade-out. Consistent
volume, background music that loops.
```

## Sound effects (ElevenLabs Sound Effects or freesound.org, CC0). Short, soft, low volume

| File | Prompt |
|---|---|
| `sfx/seal-crack.mp3` | `a wax seal cracking softly, small and crisp, 0.5 seconds` |
| `sfx/doors.mp3` | `heavy carved wooden palace doors swinging open slowly with a soft warm whoosh, 2 seconds` |
| `sfx/chime.mp3` | `a single soft brass lantern chime, gentle shimmer tail, 1.5 seconds` |
| `sfx/light.mp3` | `a tiny soft whoosh of a flame lighting inside a lantern, 0.6 seconds` |
| `sfx/page.mp3` | `a thick old paper page turning, soft, 0.7 seconds` |
| `sfx/scratch.mp3` | `gentle scratching of thin gold foil with a coin, loopable, 1 second` |
| `sfx/reveal.mp3` | `a soft magical sparkle swell, warm and short, 1.5 seconds` |
| `sfx/release.mp3` | `a soft airy rising whoosh with a faint shimmer, 1.5 seconds` |
| `sfx/stamp.mp3` | `a wax seal stamp pressed onto paper, soft thud, 0.4 seconds` |

---

## Checklist before you send them to me

- [ ] 26 images (06 is two files, so 27 files), 1 music file, 9 sound effects
- [ ] Transparent ones checked at 200% zoom: no checkerboard, no white box, no coloured fringe
- [ ] 03/04 doors line up side by side; 11/12 lantern identical except the glow
- [ ] No text, letters, Arabic or faces anywhere
