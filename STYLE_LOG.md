# Style Log

A running log of stylistic and design changes made locally. Add an entry whenever you make a styling decision, then review this file before pushing to `main` so the changes are recorded with context.

Newest entries at the top.

---

## Template

```
## YYYY-MM-DD — Short title
What: <what changed>
Why: <why you made this choice>
```

---

<!-- Add new entries below this line -->

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
