# Style Log

A running log of stylistic and design changes made locally. Add an entry whenever you make a styling decision, then review this file before pushing to `main` so the changes are recorded with context.

Newest entries at the top.

---

## 2026-08-23 — Report completion becomes an action screen

What: Signed-in reports now finish on a dedicated next-steps screen. It uses the existing
cream surface, teal/rust urgency states, numbered white cards, and the same `rounded-md` /
`rounded-lg` radius scale as the report wizard. Official external actions are full teal buttons.
Why: A successful submission needs to lead directly into the platform or real-world response,
without making the reporter hunt through a generic confirmation or a differently styled page.

---

## 2026-08-23 — Product cards scale up and fade in

What: Hero, the three cards, and the home footer fade in on scroll (opacity +
12px rise, 700ms, staggered 90ms). Cards are larger from `md` up (more
padding, `text-3xl` titles, `min-h-16` buttons, `max-w-7xl`). Phone stays
one column so the hero still fits.
Why: The cards read as captions on a wide screen. Motion is one-shot and
honours `prefers-reduced-motion` / no-JS so nothing stays invisible.

---

## 2026-08-23 — Product page: bigger card actions, shorter page

What: The three product cards now end in full-width rust buttons (`min-h-14`,
`text-lg`). Removed the privacy principles block and the "Bring it into the
light" closing band from `/`.
Why: The rust text links read as captions. Sign up stays in the nav; the
page does not need a second essay and a second CTA band under the cards.

---

## 2026-08-23 — Product hero is logo plus motto

What: Dropped Sign up / Log in from the product hero (nav and the closing
band still have them). Enlarged the wordmark (`h-40` / `sm:h-56` / `md:h-72`)
and made the line under it "Report. Connect. Protect."
Why: The hero pair duplicated the nav. The motto belongs under the mark, not
repeated as a section heading over the three cards.

---

## 2026-08-23 — Signup lanterns, landing looks like ours

What: Auth girih/lanterns sit in a fixed teal layer so the taller signup card no
longer clips them. `/` uses the teal flower field instead of Hassan's cream
hero and fake report mock. Cream bands (landing mid-page, About, Report,
Resources, Contact) carry the same bottom girih wash as `/app`. Cards stay
`rounded-lg`; cyan hover fills are gone.
Why: Signup is the same room as login. The product page was reading as a
generic SaaS template on cream; the flower, lanterns, and girih are the
Basirah surfaces.

---

## Template

```
## YYYY-MM-DD — Short title
What: <what changed>
Why: <why you made this choice>
```

---

## 2026-08-23 — Hassan product landing on /

What: `/` now uses Hassan's product landing (hero, three pillars, principles,
closing CTA, footer) with our existing nav. Sign up / Log in go to the pages we
already have. Pillars that pointed at missing `/support` and `/mosques` routes
now go to `/resources` and `/map`.
Why: The product page is the first screen for people who are not signed in.
Auth and the app stay as they were.

## 2026-08-23 — Forms and copy

What: Rewrote report/login/signup/mosque form copy into specific verbs, wired
labels to hints and errors, and used a radius scale (`rounded-md` inputs,
`rounded-lg` cards). Review now shows human labels. Nav and the three-step
section say "Create an account" / "How a report moves" instead of "Get started".
Why: Generic CTAs and snake_case review keys read as template UI. A person
filling in a hate-incident report needs plain questions, visible errors, and
no "please tell us" padding.

## 2026-08-23 — Mosque panel opens more quietly

What: Slowed the drawer and map padding to 420ms and swapped the snap ease-out
for a milder curve (`cubic-bezier(0.33, 0.08, 0.25, 1)` / ease-out quad).
Why: The previous ease started too fast and hit the stop like a bounce.

## 2026-08-23 — Mosque panel is teal and slides

What: The map detail drawer is now solid `basirah-teal` with cream type, cyan
actions, and a rust spine. It slides in from the trailing edge over a faint teal
scrim, and slides out before unmounting.
Why: Cream on the light map had no edge. Teal is the palette colour that can sit
on the tiles without disappearing. The slide tells you the details belong to the
pin you just touched.

## 2026-08-23 — Mosque details open in a side panel

What: Clicking a mosque pin (or a verified incident) now opens a cream side panel
with name, address, distance, phone, website, directions, and published hours.
The map popup is gone. The map pads right so the pin stays in view; Escape and
the close control dismiss the panel.
Why: A 260px balloon on the map hid the pin and could not hold hours or actions.
A side panel is the place to read a mosque, not a sticker on the tiles.

## 2026-08-23 — Auth card: less gloss, more size, more contrast

What: Replaced the frosted glass login/signup panel with a solid cream card (`max-w-md` /
`sm:max-w-lg`), dropped the diagonal white sheen, and raised body/label/link color from
`teal/50–70` to full teal or `teal/80–90`. Inputs and Google sit on opaque white.
Why: The glass overlay washed out the type, the sheen read as a smear, and the
`max-w-sm` card left unused margin on phones.

## 2026-08-23 — Login lanterns hang straight; gloss is a wash

What: Lanterns hang vertically from the top edge (`top: -2px`, no rotate). The right
cluster is only flipped and smaller. Strings were drawn flush to the PNG top and the
asset is a full-res `img` so the lines survive. The girih gloss is now a wide
soft-light wash (slow radial drift) instead of a tight screen stripe.
Why: Rotation lifted the cords off the ceiling. The old shine read as a white bar
sweeping the page. Flip without tilt keeps the two sides from looking copy-pasted.

## 2026-08-23 — Home flower field, larger type

What: Removed the Three.js rosette. The home screen now uses the cropped
`basirah-flower.png` as a centered, oversized, screened motif on teal. Logo, headline,
and CTAs are larger. Login/signup wordmarks sit centered in the card.
Why: The coded flower fought the real mark. The supplied PNG was almost-black and
faint; cream ink + cover + opacity keeps it present without shouting.

## 2026-08-23 — New Basirah wordmark

What: Replaced `logo.png` with the new Arabic wordmark (black keyed out, tightly
cropped). Hero uses it large (`h-20`/`h-28`); login/signup `h-16`/`h-20`; nav and
app chrome `h-10`/`h-12`. Deleted the spaced `basirah new logo.png` source file.
Why: The old mark was small and outdated. The new file had a black field and
wide empty margins that would have boxed badly on cream and glass.

## 2026-08-23 — Auth card: glass kept, gloss and contrast tuned

What: Restored the frosted cream glass panel (`bg-basirah-cream/60`, `backdrop-blur-xl`)
at `max-w-md` / `lg`, with a faint highlight (`from-white/15`) instead of the heavy sheen
or the later solid cream slab. Type stays full teal on that denser glass.
Why: The opaque card lost the look they wanted. The original problem was only the
white smear and washed-out copy, not the glass itself.

## 2026-08-23 — Split title and body fonts

What: Installed the provided Creato Display family (including italics) as `--font-display`
for headings. Body, labels, and UI chrome use Noto Sans (`font-sans`) so long copy stays
readable and does not sit in a display face.
Why: One geometric display font on every string looked heavy and uneven. Titles need
Creato; secondary text needs a proper text face.

## 2026-08-23 — Auth goes to /app, not the marketing home

What: Logged-in visits to `/`, `/login`, and `/signup` now redirect to `/app`. Email
sign-up sends a live session straight there. The home page is only the teal hero
(no nav, no three-step section). Fixed `/app` importing `AppTabs`/`email`.
Why: After Google sign-up the callback sent people to `/app`, which 500'd on a
corrupt `.next` cache, then they landed back on the marketing page they asked
not to see. Routes were also broken by two Next servers sharing a deleted cache.

## 2026-08-23 — Auth girih background

What: Cropped the exported Islamic girih PNG (removed black export padding) and tiled it
behind login/signup as a teal-screened, slowly shining field. The form sits on frosted
cream glass (`backdrop-blur`, translucent fill, inner highlight) so the pattern reads
through the card instead of hiding under a solid white panel.
Why: The previous auth screens used a flat teal slab. The provided motif is the
product's visual language and needed to fill the page without the leftover export junk.

## 2026-08-23 — Login page, real routes, and a connected step timeline

What: Removed the "Community Security Infrastructure" eyebrow badge from the hero. Added
`/login` with a Supabase Google OAuth flow (`@supabase/ssr` browser/server clients +
`/auth/callback` route handler). Converted the nav's anchor links (`#about`, `#report`, …) into
real routes backed by a shared `PagePlaceholder` stub, and added a "Log in" link to both the
desktop nav and mobile sidebar. Restructured the three-step "Get started" section from
disconnected cards into a stepper: a track line behind the numbered nodes whose fill scrubs in
sync with scroll position (horizontal on `sm:`, vertical on mobile). Added a scroll-linked
parallax fade to the hero content as it scrolls out of view.
Why: The badge repeated the page title with no added meaning. Real routes were needed so nav
links go somewhere once pages exist, rather than 404ing on hash anchors from other pages. The
three-step cards read as three unrelated boxes with no sense of sequence — a scroll-tied
connector line was the direct fix for making the steps read as one flow.
