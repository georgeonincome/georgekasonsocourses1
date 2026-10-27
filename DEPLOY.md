# Going to production

Everything you need to take this live, in the order you need it.

---

## 1. The keys you need

Seven values. Everything else is optional.

| Variable | Required | Where it comes from | What it does |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | **yes** | Your domain | Canonical URLs, sitemap, Open Graph, payment redirect. If this is wrong, everything points at the wrong place. |
| `DATABASE_URL` | **yes** | Turso — `turso db create learn2earn` | The database. On Vercel this must be `libsql://…`; a `file:` URL will not survive a deploy. |
| `DATABASE_AUTH_TOKEN` | **yes** (remote only) | `turso db tokens create --db the100guy-courses` | Authenticates the app to the database. |
| `AUTH_SECRET` | **yes** | `openssl rand -base64 32` | Signs the session cookie. Changing it signs everybody out. |
| `FLW_SECRET_KEY` | **yes** for payments | Flutterwave dashboard → Settings → API Keys | Creates the payment. Server only. |
| `FLW_SECRET_HASH` | **yes** for payments | Flutterwave dashboard → Settings → API Keys | Verifies the webhook signature. Server only. If this is wrong, no payment ever grants access. |
| `FLW_PUBLIC_KEY` | no | Same page | Your public key. Kept for a future inline checkout; the hosted checkout link does not need it. |
| `AUTH_TRUST_HOST` | **yes** | — | Just `true`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | **yes** | You choose | The admin account that unlocks `/admin`. See §4. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | no | Google Cloud Console | Optional Google sign-in. |
| `RESEND_API_KEY` | no | Resend | Optional email. Without it the contact form writes to the server log. |

**Flutterwave setup, in order:**

1. Create an account at <https://dashboard.flutterwave.com> and complete
   onboarding. You will need your business details and a bank account for
   the payouts — this is the part that takes a few days.
2. Settings → API Keys → copy the **Secret Key** and the **Secret Hash**.
   The secret hash is the one people miss; without it the webhook signature
   cannot be verified and no payment will ever unlock a course.
3. Settings → Webhook URLs → add:
   `https://<your-domain>/api/flutterwave/webhook`
4. Make sure **ZMW** is enabled for your account. Flutterwave supports
   Zambian kwacha, which is why it is the gateway here — a student pays in
   kwacha with mobile money, and you do not have to price in dollars and
   hope. If ZMW is not offered on your account, ask their support to
   enable it before taking payments.

**Turso setup, in order:**

```bash
npm install -g @libsql/cli
turso auth login
turso db create learn2earn
turso db tokens create --db the100guy-courses
turso db show the100guy-courses --url        # libsql://...
```

---

## 2. Deploy to Vercel

The repo is `https://github.com/digitaldreams42/georgekasonsocourses` and
the app lives at the repository root, so Vercel detects Next.js on its own.

1. Go to <https://vercel.com/new> → import the repository.
2. It should detect **Next.js** and use the root directory. Leave the build
   command as `npm run build`.
3. Add the environment variables from §1 (Settings → Environment Variables).
   Add them to **Production** and **Preview**.
4. Deploy.
5. Attach your domain (Settings → Domains).
6. Set `NEXT_PUBLIC_APP_URL` to that domain and redeploy — it is baked in at
   build time, so changing the variable alone is not enough.

**Then seed the production database from your machine** (not from Vercel,
which has no Turso CLI):

```bash
cd nextjs
DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npx drizzle-kit migrate
DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npm run db:seed
```

`db:seed` is idempotent — safe to run again. It creates the 16 courses,
70 topics, 258 lessons, the sample reviews and the admin account.

---

## 3. Point Flutterwave at the live domain

After the first deploy, the webhook URL exists. Add it in the Flutterwave
dashboard (Settings → Webhook URLs):

```
https://<your-domain>/api/flutterwave/webhook
```

Then send yourself a real payment of a small amount and confirm three
things: the order flips to `paid` in `/admin`, the course appears in
`/my-courses`, and the webhook shows a 200 in the Flutterwave dashboard.

---

## 4. Logging in as admin

The admin account is the only way into `/admin` — it approves reviews, shows
orders and lists the catalogue.

**The account**

| | |
|---|---|
| Email | `ADMIN_EMAIL` — defaults to `admin@the100guy.ceo` |
| Password | `ADMIN_PASSWORD` — defaults to `ChangeMe123!` |
| Where | `/login` — sign in there, then go to `/admin` |

**Change the password before you deploy.** The default is public knowledge
because it is in `.env.example`.

To set a new one, either:

```bash
# set ADMIN_PASSWORD in .env, then:
npm run db:seed          # creates or updates the admin account
```

or, on an existing database (local or production):

```bash
npx tsx db/reset-admin-password.ts 'your-new-password'
```

Against production:

```bash
DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." \
  npx tsx db/reset-admin-password.ts 'your-new-password'
```

**The role is what grants access.** `users.role` must be `admin` — the seed
and the reset script both set it. A student account that reaches `/admin` is
redirected to `/dashboard`, and the admin API endpoints answer `403`.

**In the admin panel you can:** approve or reject submitted reviews, see
every order with its status and total, and see the full catalogue with its
prices and publication state.

---

## 5. The seeded reviews, and how to replace them

The wall at `/reviews` ships with 16 reviews written to the standard in
`ONLINE_PRESENCE/03_TESTIMONIAL_COLLECTION.md`: named, specific, no income
claims. They render as ordinary published reviews and count toward the
published total.

They are **not** quotes from real students. The benchmark site has 28
attributable student quotes, and they belong to someone else's students —
publishing them under your name would be a false endorsement, and file 02
already flags that exposure. Replace the seeded rows before the site takes
real money.

**To replace them with real reviews:**

1. Send the message in file 03 to your WhatsApp broadcast list. The exact
   text is written for you.
2. Students submit through the form at `/reviews`.
3. Their submissions sit unapproved until you approve them in
   `/admin` → Review queue.

**To change the seeded text itself** (only once the names and words are real
quotes from your own students):

```bash
python3 _work/build_reviews.py
npm run db:seed
```

---

## 6. The checkout before it is real

Right now checkout does one of two things:

- **Flutterwave keys set** → the student is taken to the hosted Flutterwave
  checkout, pays in kwacha by mobile money or card, and the webhook marks
  the order paid and opens the course automatically.
- **No keys** → the order is recorded as `pending` and you mark it paid by
  hand in `/admin`. The site works end to end either way; it is just manual.

If Flutterwave is unreachable at the moment of checkout, the order is still
created and the student is not charged — they are told payment failed and
can try again. You never end up with a paid-but-locked course.

---

## 7. After launch

- [ ] Change the admin password
- [ ] Set `NEXT_PUBLIC_APP_URL` to the real domain
- [ ] Send a real test payment and confirm the course unlocks
- [ ] Add a mail provider (Resend) so the contact form and password reset work
- [ ] Collect the first 10 real testimonials
- [ ] Add course artwork — set `image` on a course row and the generated cover is replaced
- [ ] Set `FLW_WEBHOOK_URL` for reference
- [ ] Confirm the ZMW price for every course in `_work/build_catalogue.py`
- [ ] Update the handles in the footer to `@georgeonincome` if you adopt the
      decision in `ONLINE_PRESENCE/05_SITE_FIXES.md`
