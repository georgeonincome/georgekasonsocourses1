import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptionPlans } from "@/db/schema";
import { accessOf, planFeatures } from "@/lib/subscription";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbNode, pageMeta } from "@/lib/seo";
import { SubscribeForm } from "@/components/subscribe-form";

export const dynamic = "force-dynamic";

/**
 * The money page. One payment, every course — the model the benchmark runs
 * its whole business on. The page must answer three questions in order:
 * what do I get, what does it cost, and how do I pay with kwacha.
 */
export const metadata = pageMeta({
  title: "Membership — every course, one payment",
  description:
    "One membership unlocks every Learn2Earn course: AI, ads, content, design, web and online work. Pay with Airtel Money, MTN MoMo or card. Nothing renews automatically.",
  path: "/subscribe",
});

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: requestedPlan } = await searchParams;
  const session = await auth();

  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isVisible, true))
    .orderBy(asc(subscriptionPlans.sortOrder));

  const access = await accessOf(session?.user?.id ?? null);
  const preselect = requestedPlan ?? null;

  return (
    <>
      <JsonLd nodes={[breadcrumbNode([{ name: "Home", path: "/" }, { name: "Membership", path: "/subscribe" }])]} />
      <div className="section">
        <div className="wrap">
          <span className="eyebrow">Membership</span>
          <h1 className="h-display text-[2.1rem] sm:text-[2.7rem]">
            Choose how long you want to learn.
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
            One payment. Every published course. Nothing renews automatically —
            when a plan runs out, you choose whether to renew it.
          </p>

          {access.status === "active" && access.endsAt && (
            <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
              <p className="text-[0.95rem] font-semibold text-ink">
                Your membership is active until{" "}
                {access.endsAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {access.daysRemaining > 0 && (
                  <span className="text-muted">
                    {" "}
                    — {access.daysRemaining} day
                    {access.daysRemaining === 1 ? "" : "s"} left
                  </span>
                )}
                .
              </p>
              <p className="mt-1.5 text-[0.9rem] text-muted">
                Renewing now stacks the new days on top of the days you have
                left — you never lose time you paid for.
              </p>
            </div>
          )}
          {access.status === "ended" && (
            <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
              <p className="text-[0.95rem] font-semibold text-ink">
                Your plan has ended — your progress and certificates are safe.
              </p>
              <p className="mt-1.5 text-[0.9rem] text-muted">
                Renew below to open your courses again, exactly where you left
                them.
              </p>
            </div>
          )}

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const features = planFeatures(plan);
              const selected = preselect === plan.code;
              return (
                <div
                  key={plan.code}
                  id={plan.code}
                  className={`relative flex h-full flex-col rounded-2xl border bg-white p-7 ${
                    plan.isRecommended || selected
                      ? "border-gold shadow-lift"
                      : "border-line"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-ink">
                      {plan.badge}
                    </span>
                  )}
                  <h2 className="text-[1.05rem] font-semibold">{plan.name}</h2>
                  <p className="mt-4 text-[2.1rem] font-semibold text-gold-700">
                    {formatPrice(plan.price, "ZMW")}
                  </p>
                  {plan.compareAtPrice && (
                    <p className="text-[0.85rem] text-muted">
                      <s>{formatPrice(plan.compareAtPrice, "ZMW")}</s> if paid
                      in shorter pieces
                    </p>
                  )}
                  {plan.description && (
                    <p className="mt-3 text-[0.9rem] text-muted">
                      {plan.description}
                    </p>
                  )}
                  <ul className="mt-5 flex-1 space-y-2 text-[0.9rem] text-muted">
                    {(features.length
                      ? features
                      : [
                          "Every published course",
                          "New courses while active",
                          "Templates and resources",
                          "Completion certificates",
                        ]
                    ).map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <SubscribeForm
                      planCode={plan.code}
                      planName={plan.name}
                      highlight={plan.isRecommended || selected}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-surface p-7">
            <h2 className="text-[1.15rem] font-semibold">How payment works</h2>
            <ol className="mt-4 space-y-3 text-[0.95rem] text-muted">
              <li>
                <span className="font-semibold text-ink">1.</span> Choose a plan
                above. Sign in first if you are not already —{" "}
                <Link
                  href="/register?next=/subscribe"
                  className="font-medium text-gold-600 hover:underline"
                >
                  creating an account takes under a minute
                </Link>
                .
              </li>
              <li>
                <span className="font-semibold text-ink">2.</span> You will get
                an order reference like{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.85rem]">
                  MEM-…
                </code>{" "}
                and the amount to send.
              </li>
              <li>
                <span className="font-semibold text-ink">3.</span> Pay by
                Airtel Money, MTN MoMo, bank transfer or card — then send the
                confirmation to George on WhatsApp (
                <a
                  href="https://wa.me/260979982819"
                  className="font-medium text-gold-600 hover:underline"
                >
                  +260 979 982 819
                </a>
                ).
              </li>
              <li>
                <span className="font-semibold text-ink">4.</span> George
                confirms the money, marks the order paid, and every course
                opens in your dashboard. Usually within the hour.
              </li>
            </ol>
            <p className="mt-5 text-[0.9rem] text-muted">
              With the online card checkout enabled, step 3 is automatic — you
              pay on the form and the catalogue opens itself.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-[0.95rem] text-muted">
              Questions first?{" "}
              <a
                href="https://wa.me/260979982819?text=Hi%20George%2C%20I%20have%20a%20question%20about%20the%20Learn2Earn%20membership"
                className="font-medium text-gold-600 hover:underline"
              >
                WhatsApp George directly
              </a>{" "}
              — there is no support desk between you and the person teaching.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
