# Royal Emerald Muslim Wedding Invitation

## Outcome
Build the first screen as an elegant, single-page digital invitation inspired by the uploaded lavender floral wedding card, while using the selected **Royal Emerald Elegance** direction: deep emerald, ivory paper, restrained gold linework, formal serif typography, and graceful ceremonial reveals.

## Experience
1. Open on a full-screen envelope cover with initials, invitation wording, and a clear **Open Invitation** action.
2. Animate the envelope away to reveal the invitation; support reduced-motion users with an immediate reveal.
3. Show the couple hero with Islamic greeting, names, wedding message, and an interactive scratch-to-reveal date panel.
4. Add a live countdown with days, hours, minutes, and seconds to the wedding date.
5. Add a 3-image couple gallery carousel with previous/next controls and accessible labels.
6. Add the three wedding moments: Mehendi, Wedding Ceremony/Nikkah, and Valima Reception, each with date, time, venue/location, and short description.
7. Add the venue section for Liceria Grand Ballroom with address and a Google Maps directions link.
8. Add a functional RSVP form with name, guest count, attendance choice, submit state, and a clear success message without claiming persistence.
9. Close with the couple's thank-you note and family/kith-and-kin names, using clearly replaceable sample copy based on the reference card.

## Visual system
- Carry the selected direction's emerald/ivory/gold palette into semantic tokens in `src/styles.css` rather than hardcoded component colors.
- Load Playfair Display, Cormorant Garamond, and Great Vibes through the root route head; keep the composition centered and invitation-like with sharp or lightly rounded paper edges.
- Use floral/botanical visual accents that echo the uploaded card without embedding the uploaded reference image itself; generate a cohesive couple/event image set for the gallery.
- Keep animation limited to envelope opening, scratch reveal, gentle gallery transitions, and subtle section entrance; honor `prefers-reduced-motion`.

## Technical implementation
- Rewrite `src/routes/index.tsx` as the complete interactive invitation, with local React state for envelope, scratch reveal, carousel, countdown, and RSVP feedback.
- Update `src/styles.css` with the selected semantic palette, typography tokens, paper texture/decorative utilities, and reduced-motion rules.
- Update `src/routes/__root.tsx` metadata/link tags only as needed for the invitation title, description, and web fonts; add no unrelated navigation.
- Keep `/` as the finished first screen and preserve TanStack Start routing conventions.
- Verify the page at desktop and mobile widths, confirm the envelope opens, scratch state reveals, countdown renders, carousel controls work, RSVP success state appears, links are valid, and no runtime errors remain.

## Sample content to replace later
- Couple: Aaroon & Olivia
- Wedding date: April 26, 2025
- Venue: Liceria Grand Ballroom, 123 Anywhere St., Any City, ST 12345
- Family names: Ahmed Siddiqui family, Salman Khan family, grandparents, siblings and cousins
