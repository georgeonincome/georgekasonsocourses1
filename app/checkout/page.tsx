import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout-form";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Checkout",
  description: "Checkout for The $100 Guy courses.",
  path: "/checkout",
  noindex: true,
});

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    const { course } = await searchParams;
    const next = course ? `/checkout?course=${course}` : "/checkout";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="section">
      <div className="wrap">
        <span className="eyebrow">Checkout</span>
        <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
          Almost there
        </h1>
        <p className="mt-3 max-w-2xl text-[1rem] text-muted">
          Confirm your details and we will send your course access straight
          away. No waiting for a manual approval email.
        </p>

        <div className="mt-10">
          <CheckoutForm
            email={session.user.email ?? ""}
            name={session.user.name ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
