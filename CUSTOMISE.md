# What still needs George

The platform is built, seeded and deployable. These are the things that
need a decision or an asset from you before it takes real money.

---

## 1. Testimonials — the biggest one

**Status: the wall ships with 16 seeded reviews.** They are written to the
standard in file 03 — named, specific, no income claims — with Zambian names,
and they render as ordinary published reviews that count toward the published
total.

They are a template and a proof-of-layout, not endorsements. The benchmark's
28 attributable quotes belong to someone else's students, and a review that
looks real and isn't is false advertising — the exposure file 02 already
flags. **Replace every seeded review with a real quote before the site takes
real money.**

`ONLINE_PRESENCE/03_TESTIMONIAL_COLLECTION.md` says it plainly: you have
2,800+ students and **zero** named testimonials anywhere online. That is the
single biggest proof gap in your presence, and no rebuild can fix it — only
your students can.

**What the platform does now:**

- `/reviews` is a live wall with a submission form.
- Every submission is stored **unapproved** and appears nowhere.
- You approve them in `/admin` (Admin → Review queue → Approve & publish).

**What you do:** send the message in file 03 to your WhatsApp broadcast
list. The exact text is written for you. Ten named reviews is the target
for 30 days, then one a week. To change the seeded text itself, edit
`_work/build_reviews.py` and re-run the build + seed.

**The reference platform has 28 attributable student quotes.** They are
Elvis's students and they are not yours, so they are not in this build and
must not be. That is not a stylistic rule — it is the difference between
proof and a lie.

---

## 2. Prices

`01_INFO_REQUEST.md` records the price range as "K70 – K9,997 (ebooks to
mentorship)" and marks the exact figures as a gap.

**What the platform does now:** indicative prices between K150 and K700,
per course, in `_work/build_catalogue.py`. They are shown with the note
"indicative" in the cart and on the FAQ.

**What you do:** confirm the price for each course and the price for the
mentorship tier. Then edit `_work/build_catalogue.py` and re-run:

```bash
python3 _work/build_catalogue.py
npm run db:seed
```

---

## 3. The catalogue itself

The 16 courses are built from the list in file 01 — Learn to Earn, AI Tool
Mastery, Copywriting That Sells, Facebook & Instagram Ads That Convert,
Course Creation Blueprint, Ebook Creation, Canva & Graphic Design
Essentials, WordPress Web Design, Computer & Digital Literacy, Content
Creation, Virtual Assistance Masterclass, Social Media Management With AI,
Graphic Design Bootcamp, The Freelancing Workshop, Meta Ads Mastery, Web
Design Classes.

**What you do:** rename anything that is not quite what you teach, and
confirm the curriculum. Each course has a topic tree in
`_work/build_catalogue.py` — 70 topics and 258 lessons in total. The
lesson *titles* are real, but the lesson *content* is not written yet.

---

## 4. Lesson content

The lessons are a curriculum, not a course. Each of the 258 lessons needs:

- a recording (or a written lesson)
- a duration
- for the flagship course, the assignment and the final checkpoint quiz
  (both are seeded and working)

The player at `/learn/[course]/[lesson]` has a placeholder panel where the
video goes. Wire a real video URL to `lessons.videoUrl` and the player
renders it.

---

## 5. Payments — Flutterwave is wired, it just needs your keys

The integration is built: `lib/flutterwave.ts`, the hosted-checkout redirect
in `app/api/checkout/route.ts`, the signature-verified webhook at
`/api/flutterwave/webhook`, and the return page at `/checkout/paid`.

**All it needs from you is the three keys** (`FLW_SECRET_KEY`,
`FLW_SECRET_HASH`, `FLW_PUBLIC_KEY`) and a Flutterwave account that has
ZMW enabled. `DEPLOY.md` has the full walkthrough.

Until then the checkout falls back to manual approval: the order is
recorded as `pending` and you mark it paid in `/admin`. That is a complete,
working flow — it is how the site behaves on day one and it is fine at low
volume.

---

## 6. Course artwork

There is no artwork. Each course gets a generated cover — the course
initials on a dark background, deterministic per course
(`components/course-cover.tsx`). It looks deliberate rather than broken,
but real thumbnails will do better. Set `image` on a course row and the
cover is replaced automatically.

---

## 7. Email

There is no mail provider, so:

- the contact form writes to the server log instead of sending anything
- there is no password reset
- there is no enrolment confirmation

The contact form is one line to fix in `app/api/contact/route.ts` once you
pick a provider (Resend, Postmark or SES all work on Vercel).

---

## 8. The domain

`NEXT_PUBLIC_APP_URL` currently points at `localhost`. Set it to the real
domain before deploying, or the canonical URLs, sitemap and Open Graph
tags will all point at localhost.

---

## 9. Small things worth deciding

- **Handle** — ✅ resolved. The footer in `components/site-footer.tsx` now uses
  the live handles: Facebook `@georgeonincome`, Instagram `@georgeonincome1`,
  TikTok `@georgeonincome`, X `@georgeonincome`, YouTube `@georgeonincome-m3m`,
  Telegram `@georgeonincome`, GitHub `georgeonincome`, LinkedIn
  `george-kasonso`. Instagram is the only one carrying the `1`.
- **A "Become a Teacher" page** — the reference platform has one
  (`lp-become-a-teacher`) and a tutor-certificate page. Both are absent
  here. They only make sense once there is an instructor side.
- **Blog** — the reference platform has one. The schema has no posts
  table, so this is new work rather than a port.
- **Refund window** — the terms page says 20% if you have watched more
  than half, or 7 days from purchase, whichever is longer. Confirm that is
  what you want, or change it in `app/terms/page.tsx`.

---

## The one-line version

The platform works end to end. What it cannot do is make your students
trust it, and only their own words will do that. Everything else on this
list is an afternoon's work.
