# The $100 Guy Courses — platform rebuild

A rebuild of **[courses.elvisw.online](https://courses.elvisw.online/)** — a
WordPress course-selling platform — as a native **Next.js 16** app with its
own database, auth, LMS and checkout, deployable to **Vercel**.

```
COURSES_RE/
├── _site/          the scraped original (reference corpus)
├── _work/          the scripts that turn the corpus into seed data
└── nextjs/         the application
```

---

## What the original platform turned out to be

Reverse-engineered from the live site, its WordPress REST API, its sitemaps
and the scraped HTML — not from a theme.

| Layer | Finding |
|---|---|
| Stack | WordPress 7.1.3 · Kadence 1.4.5 · Elementor 4.2.4 · header-footer-elementor |
| LMS | **Tutor LMS** (courses, topics, lessons, quizzes, assignments, certificates, announcements, instructor dashboard) |
| Commerce | **WooCommerce** (products, cart, checkout, orders) — products and courses are separate post types that get matched by slug |
| Auth | Tutor LMS social login (Google), email + password, `my-account`, `lost-password` |
| Payments | Mobile money and cards through a gateway on the African market |
| Pages | Home · Courses · Shop · Cart · Checkout · My Courses · Dashboard · Student Registration · Reviews · Blog · Landing pages (lp-*), Tutor Certificate, Terms, Privacy |
| Course pages | **Login-walled.** The catalogue is public; a course body requires an account |
| Design | Each page is one Elementor HTML widget with its own inline `<style>`; Outfit 400/500/600; 1200px wrap; IntersectionObserver scroll reveal |

### The two structural findings that shaped the rebuild

**1. The courses and the products are two halves of one system.** Tutor LMS
owns the learning; WooCommerce owns the money. A slug like
`virtual-assistance-classes-oct-2025` exists as a course *and* as a product,
and the product holds the price. The rebuild keeps this shape — one
`courses` table with the catalogue facts, an `orders` table that records
payment, and `enrollments` that join a user to a course — because it is
what makes "paid" and "enrolled" separable states.

**2. The curriculum is the product.** A course page is not a sales page with
a video; it is a tree of topics and lessons, with a quiz, an assignment and
a certificate attached. The rebuild carries the same tree
(`courses → topics → lessons`), and the seed ships **258 lessons across 70
topics in 16 courses** — the depth is in the data, not just the UI.

---

## The content rule

**Copy the structure, never the words.** The same rule the `ELVIS_RE` project
applies to the main site. Nothing from the benchmark's brand, copy, prices,
testimonials or instructors appears here.

- No "Elvis", no "Kenya", no "KES", no "Click2Skill".
- The catalogue is **George's own library**, from
  `ONLINE_PRESENCE/01_INFO_REQUEST.md` — Learn to Earn, AI Tool Mastery,
  Copywriting That Sells, Facebook & Instagram Ads That Convert, Course
  Creation Blueprint, Ebook Creation, Canva & Graphic Design Essentials,
  WordPress Web Design, Computer & Digital Literacy, Content Creation,
  Virtual Assistance Masterclass, Social Media Management With AI, Graphic
  Design Bootcamp, The Freelancing Workshop, Meta Ads Mastery, Web Design
  Classes.
- Colours are George's palette (`#282222` ink, `#F1911D` ember), not the
  benchmark's navy-and-orange.
- The identity, links and handles match `ELVIS_RE` — same WhatsApp, same
  `georgekasonso.com`, same `the-100-guy.vercel.app`.

### Testimonials

The seed ships 16 reviews written to the standard in
`ONLINE_PRESENCE/03_TESTIMONIAL_COLLECTION.md`: named, specific, no income
claims. They render as ordinary published reviews and count toward the
published total. **Replace them with quotes from real students before the
site takes real money** — file 03 has the collection message ready to send.
The benchmark's 28 attributable quotes belong to someone else's students, so
they are not in this build and must not be.

The live flow stays: student submits → review is stored unapproved → George
approves it in `/admin` → it appears on `/reviews`.

### Prices

File 01 marks the exact figures as a gap. The catalogue ships indicative ZMW
prices between K150 and K700 and they are flagged as indicative in the code.
A payment gateway is not wired: checkout records a `pending` order that an
admin marks `paid`, which is exactly the manual approval flow the site is set
up for.

---

## The stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | Server components + streaming, Vercel-native |
| Language | TypeScript, strict | — |
| Database | SQLite via libSQL, Drizzle ORM | One file locally, Turso in production — no persistent disk on Vercel |
| Auth | Auth.js v5 (email + password, Google via Firebase) | JWT sessions, so it works with Turso and without sticky sessions |
| Styling | Tailwind v4 + a small token layer | The benchmark's design system, re-skinned |
| Payments | Flutterwave (cards, MTN MoMo, Airtel Money) | Server-side creation, webhook verified against Flutterwave's API before access is granted |

### Schema

`db/schema.ts` — 17 tables covering the whole platform:

```
auth        users · accounts · sessions · verificationTokens
catalogue   courses · categories · courseCategories · topics · lessons
commerce    orders · orderItems · enrollments
assessment  quizzes · quizQuestions · quizAttempts
            assignments · assignmentSubmissions · certificates
social      reviews · announcements
```

Courses and products are merged into one `courses` row, with price in minor
units (integers) to avoid float drift — the benchmark stores them as
decimals in WooCommerce and loses precision when they are rounded.

---

## Running it

```bash
cd nextjs
npm install
cp .env.example .env          # then set AUTH_SECRET (openssl rand -base64 32)
npm run db:push               # create the schema in local.db
npm run db:seed               # 16 courses, 70 topics, 258 lessons, admin user
npm run dev                   # http://localhost:3000
```

The seed creates an admin at `ADMIN_EMAIL` (default
`admin@the100guy.ceo`) with `ADMIN_PASSWORD` (default `ChangeMe123!`) —
**change both before deploying.**

### Regenerating the seed data

The catalogue is generated, not hand-edited:

```bash
python3 _work/build_catalogue.py    # courses + categories  -> nextjs/seed/
python3 nextjs/_work/build_reviews.py   # reviews               -> nextjs/seed/
python3 _work/parse_v2.py           # re-parse the scraped corpus (reference)
```

`_work/build_catalogue.py` is the file to edit when the catalogue changes.

---

## Deploying to Vercel

Vercel has no persistent filesystem, so the SQLite file cannot be used in
production. The app points at **Turso** (libSQL) over the network.

1. Create a Turso database:
   ```bash
   npm install -g @libsql/cli
   turso db create learn2earn
   turso db show the100guy-courses --url        # libsql://...
   turso db tokens create --db the100guy-courses
   ```
2. In Vercel → Project → Settings → Environment Variables:
   ```
   DATABASE_URL=libsql://your-db.turso.io
   DATABASE_AUTH_TOKEN=<token>
   AUTH_SECRET=<openssl rand -base64 32>
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_APP_URL=https://<your-domain>
   ADMIN_EMAIL=...            ADMIN_PASSWORD=...
   ```
3. Push the schema and seed the remote database **from your machine**
   (not from Vercel, which has no Turso CLI):
   ```bash
   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npx drizzle-kit push
   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npm run db:seed
   ```
4. Deploy. `vercel.json` sets the build command and the security headers.

### Before it takes real money

- [ ] Replace the seeded reviews with George's real students (the form at
      `/reviews` collects them; approve in `/admin`).
- [ ] Confirm the price for every course and the refund window.
- [x] Wire a real payment gateway. **Flutterwave** is wired — `lib/flutterwave.ts`
      creates the payment, `/api/flutterwave/webhook` verifies it, and
      `/api/payments/order/[orderId]` covers manual confirmation. The webhook
      re-queries the transaction against Flutterwave's API before granting
      access, so a forged callback cannot unlock a course.
- [ ] **Set live keys.** The keys currently in `.env` are TEST keys
      (`FLWSECK_TEST-…`), so real cards and mobile money will not settle.
      Dashboard → Settings → API Keys, then replace `FLW_PUBLIC_KEY`,
      `FLW_SECRET_KEY` and `FLW_ENCRYPTION_KEY`.
- [ ] **Register the webhook URL** in the Flutterwave dashboard
      (Settings → Webhook URLs). It must be exactly:
      `https://georgekasonsocourses.vercel.app/api/flutterwave/webhook`
      The secret hash set there must equal `FLW_SECRET_HASH`.
- [ ] Confirm the payment methods enabled on the Flutterwave account — cards,
      MTN MoMo and Airtel Money each have to be switched on.
- [ ] Add a mail provider for password reset and enrolment confirmation.
- [ ] Course artwork — there is none yet, so cards fall back to a
      typographic cover.
- [x] Domain decided: `https://georgekasonsocourses.vercel.app`
      (`NEXT_PUBLIC_APP_URL`).

---

## Route map

| Route | What it is |
|---|---|
| `/` | Home — hero, tracks, featured courses, how it works, reviews |
| `/courses` | The catalogue, with category / level / search filters |
| `/courses/[slug]` | Course page — curriculum, price, reviews, related |
| `/cart` · `/checkout` | Cart and checkout (manual approval) |
| `/login` · `/register` | Account creation and sign-in |
| `/dashboard` | Student dashboard — progress, certificates, quizzes |
| `/my-courses` | Enrolled courses |
| `/learn/[course]` · `/learn/[course]/[lesson]` | The course player |
| `/reviews` | The testimonial wall and the live submission form |
| `/about` `/contact` `/faq` `/support` `/privacy` `/terms` | The rest of the site |
| `/admin` | Approve reviews, see orders, manage courses |
| `/sitemap.xml` `/robots.txt` | Generated from the live catalogue |
| `/api/*` | courses · categories · enroll · checkout · progress · reviews · admin |

---

## Payments

**Flutterwave.** It settles in ZMW, so a Zambian student pays in kwacha by
mobile money or card — no currency conversion, no pricing in dollars and
hoping. Three keys: `FLW_SECRET_KEY` (creates the payment), `FLW_SECRET_HASH`
(verifies the webhook — miss this one and no payment ever unlocks a course)
and `FLW_PUBLIC_KEY`.

Checkout sends the student to the hosted checkout. The webhook at
`/api/flutterwave/webhook` then does two things before it grants anything:
it checks the `verif-hash` header against `FLW_SECRET_HASH`, and it re-queries
the transaction from Flutterwave's API to confirm it succeeded, matches this
order's `tx_ref`, is in the right currency, and is for at least the right
amount. Only then is the order marked paid and the enrolment created.

The re-query is the part that matters. A secret hash is a static string — if it
ever leaks, anyone can POST a convincing body, and hash-checking alone would
hand out courses for free. Confirming against Flutterwave is what makes a
forged callback useless.

Without keys configured the checkout falls back to manual approval — the order
waits for you to mark it paid in `/admin`, and the site works exactly the same.
If the gateway is unreachable mid-checkout the order is still created and
nobody is charged.

**See `DEPLOY.md` for the full production setup: every key, the Turso and
Vercel steps, and how to log in as admin.**

## Authentication

Two ways in: email and password, or Google.

**Google is brokered by Firebase**, not by Auth.js's own OAuth client. The
browser signs in with the Firebase SDK and receives an ID token; that token is
handed to Auth.js's `firebase` credentials provider, which verifies it with the
Firebase Admin SDK before any session exists. Nothing from the browser is
trusted on its own — a token that is expired, revoked, or issued for a
different Firebase project is refused at that step.

The split is deliberate. Firebase answers "who is this person"; this app's own
database stays the source of truth for courses, orders, enrolments and roles.
Firebase never sees a kwacha.

- `lib/firebase-client.ts` — browser SDK. Runs the popup and returns the token.
- `lib/firebase-admin.ts` — Admin SDK. Verifies the token, lazily initialised.
- `lib/firebase-users.ts` — turns a verified identity into a local `users` row.

**Email is the join key.** A student who registered with a password and later
taps "Continue with Google" with the same address lands on the same account,
not a second one — otherwise they would hold two identities and a course paid
for on one of them.

Two rules worth keeping:

- Google is authoritative for the display name and photo, **never for the role**.
  A student must not be able to grant themselves admin by renaming a Google
  account, so `role` is only ever set by the seed or by hand in `/admin`.
- A new Google user gets the Firebase uid as their primary key. That is stable
  and collision-free, and it does not need to look like the ids this app used
  before.

Uses the **`georgethe100guy`** project — the $100 Guy brand project, the same
one ShopZed runs on. One identity provider across the brands rather than a
separate OAuth client per site.


## Admin access

The seed creates one account with `role = "admin"`, which is what unlocks
`/admin` — approving reviews, seeing orders, listing the catalogue.

| | |
|---|---|
| Email | `ADMIN_EMAIL` (default `admin@the100guy.ceo`) |
| Password | `ADMIN_PASSWORD` (default `ChangeMe123!` — change it) |
| Sign in | `/login`, then go to `/admin` |

Lost the password?

```bash
npx tsx db/reset-admin-password.ts 'your-new-password'
```

## What still needs George

`CUSTOMISE.md` has the full list. The short version: real testimonials
(there are none yet, and no build can invent them), confirmed prices,
lesson recordings, a payment gateway, artwork, and a domain.
# georgekasonsocourses1
