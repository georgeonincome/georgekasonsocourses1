import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms & Conditions",
  description: "The terms covering enrolment, refunds, cancellation, copyright, community conduct and ownership on The $100 Guy courses platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="section">
      <div className="wrap max-w-3xl">
        <header>
          <span className="eyebrow">Legal</span>
          <h1 className="h-display text-[clamp(1.9rem,4vw,2.8rem)]">
            Terms &amp; conditions
          </h1>
          <p className="mt-3 text-[0.95rem] text-muted">
            Plain-language terms for using this platform. Enrolling in a
            course means you accept these.
          </p>
        </header>

        <div className="mt-10 space-y-9 text-[0.98rem] leading-relaxed text-muted">
          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              1. Enrolment
            </h2>
            <p className="mt-2">
              A place on a course is granted when the payment is confirmed and
              the course appears in your dashboard. You are responsible for
              keeping your login details safe, and for making sure the email
              address on your account is one you can actually receive mail
              at. Access is personal to you and may not be shared, resold or
              passed on to anyone else.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              2. Prices and payment
            </h2>
            <p className="mt-2">
              Prices are shown in Zambian kwacha (K). Prices listed on the
              platform are indicative until confirmed by the operator, and a
              confirmed final price is shown at checkout. You pay through the
              payment methods offered at checkout; the receipt is issued by
              the payment provider and emailed to you.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              3. Refunds
            </h2>
            <p className="mt-2">
              If you have watched less than 20% of the course and you contact
              me within 7 days of purchase, I will refund you in full. Once
              more than 20% of a course has been watched, the course is
              considered used and the purchase is no longer refundable. Refund
              requests are handled by hand and take up to 7 working days to
              reach your account.
            </p>
            <p className="mt-2">
              A course that is genuinely broken, missing core lessons, or
              materially different from how it was described when you bought it
              will be refunded regardless of how much of it you watched. That
              case is judged case by case by a human being — talk to the{" "}
              <Link href="/support" className="font-semibold text-gold-600 hover:text-gold">
                support desk
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              4. Cancellation
            </h2>
            <p className="mt-2">
              You may cancel a course within 7 days of purchase for a full
              refund under the rule above. After that period the course may
              be retired or updated, and the price you paid continues to give
              you access to what you bought. If a course is permanently
              withdrawn, you will be given a pro-rata refund or a replacement
              course of equal value.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              5. Copyright and what you may do with the material
            </h2>
            <p className="mt-2">
              All lessons, workbooks, templates and files belong to George J.
              Kasonso and are protected by copyright. Buying a course gives you
              a personal, non-transferable licence to study the material and
              use the templates in your own work. You may not copy, resell,
              redistribute, screen-share commercially, or republish the
              material — including to paid groups or as part of another
              course — without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              6. Community conduct
            </h2>
            <p className="mt-2">
              Where a course or group includes a community space, behave
              decently in it. No harassment, no spam, no selling your own
              courses or services in other people's threads without asking, and
              no reproducing course material. I reserve the right to remove
              access from a community space for repeated or serious breaches.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              7. Ownership
            </h2>
            <p className="mt-2">
              The platform, its design, its course material and the name "The
              $100 Guy" remain the property of George J. Kasonso. Your work
              and your own business results remain entirely yours. Nothing in
              these terms transfers ownership of the courses to you.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              8. Results and income claims
            </h2>
            <p className="mt-2">
              The courses teach practical skills and real methods. They do not
              guarantee income. What you earn depends on your own effort, the
              market you serve and the work you put in. No earnings claim in
              any course, review or page is a promise of what you will earn.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              9. Your account and the platform
            </h2>
            <p className="mt-2">
              The platform may be updated, courses revised and features added
              or removed as it grows. If a course is updated, you get the
              updated version at no extra cost. I aim to keep the service
              running continuously, but I do not guarantee uninterrupted
              availability.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              10. Liability
            </h2>
            <p className="mt-2">
              The courses are provided as they are. To the extent permitted by
              law, liability for indirect or consequential loss arising from
              your use of the material is excluded. Nothing here limits
              liability that cannot lawfully be limited, including for fraud.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">
              11. Changes to these terms
            </h2>
            <p className="mt-2">
              These terms may be updated. The version published on this page
              applies to purchases made from the date it is published.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-ink">Contact</h2>
            <p className="mt-2">
              George J. Kasonso, Lusaka, Zambia. Questions about these terms go
              through the{" "}
              <Link href="/contact" className="font-semibold text-gold-600 hover:text-gold">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
