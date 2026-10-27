import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "How The $100 Guy courses platform collects, uses and protects your personal information, payments and course access.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="section">
      <div className="wrap max-w-3xl">
        <header>
          <span className="eyebrow">Legal</span>
          <h1 className="h-display text-[clamp(1.9rem,4vw,2.8rem)]">
            Privacy policy
          </h1>
          <p className="mt-3 text-[0.95rem] text-muted">
            Written in plain language. If anything here is unclear, ask and I
            will explain it.
          </p>
        </header>

        <div className="mt-10 space-y-9 text-[0.98rem] leading-relaxed text-muted">
          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              What we collect
            </h2>
            <p className="mt-2">
              When you register we keep your name, email address and a
              password in an encrypted form. When you enrol we record which
              courses you bought and which lessons you have completed, so the
              platform can show you your own progress. When you send a message
              through the contact or support form we keep the text of it so I
              can answer you.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              Course access
            </h2>
            <p className="mt-2">
              Access is tied to your account. Your login is yours — do not
              share your password, and do not share your account with other
              people. If you lose access to your email address, contact the
              support desk and I will help you recover it.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Payments</h2>
            <p className="mt-2">
              Payments are handled by a payment provider, not by this site
              directly. They receive what they need to take the payment — such
              as your email address and the amount — and they hold your card or
              mobile money details. Those details never reach my servers and I
              never see or store your full card number or PIN. I can see only
              the transaction reference and the amount.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Cookies</h2>
            <p className="mt-2">
              The platform uses a small number of cookies and similar storage
              to keep you signed in and to remember things like the contents of
              your basket. These are functional cookies, not advertising ones.
              No third-party advertising trackers are used on the course pages.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              What I do with your data
            </h2>
            <p className="mt-2">
              I use your information to run the platform, to answer your
              messages, to send you course updates and to issue receipts. I do
              not sell your data, and I do not share it for marketing with
              other companies.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              How long it is kept
            </h2>
            <p className="mt-2">
              Your account and enrolment records are kept for as long as your
              account exists, because they are what gives you access to the
              courses you paid for. If you ask to have your account deleted,
              I will remove your personal details, though transaction and
              accounting records must be kept for legal and tax reasons.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Your rights</h2>
            <p className="mt-2">
              You can ask me what information I hold about you, ask for a
              correction, or ask for deletion. You can also ask at any time to
              stop receiving non-essential emails. Write to{" "}
              <a
                href="mailto:kasonso44@gmail.com"
                className="font-semibold text-gold-600 hover:text-gold"
              >
                kasonso44@gmail.com
              </a>{" "}
              and I will deal with it.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Security</h2>
            <p className="mt-2">
              The site is served over HTTPS and passwords are stored as
              one-way hashes, so a leaked password list cannot be used to log
              in. No system is perfect, but I keep the data I hold to a minimum
              and I do not store payment details at all.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Changes</h2>
            <p className="mt-2">
              If this policy changes, the updated version will be published on
              this page. Continuing to use the platform after a change means
              you accept it.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Contact</h2>
            <p className="mt-2">
              George J. Kasonso, Lusaka, Zambia. Use the{" "}
              <Link href="/contact" className="font-semibold text-gold-600 hover:text-gold">
                contact page
              </Link>{" "}
              for anything privacy-related.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
