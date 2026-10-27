import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { CartView } from "@/components/cart-view";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Your Cart",
  description: "Your cart on The $100 Guy courses platform.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return (
    <div className="section">
      <div className="wrap">
        <span className="eyebrow">Cart</span>
        <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
          Your cart
        </h1>
        <p className="mt-3 max-w-2xl text-[1rem] text-muted">
          One course is usually enough to get moving. If you are taking more
          than one, the second one costs you less than the first — talk to us
          about a bundle.
        </p>

        <div className="mt-10">
          <CartView />
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-[0.92rem]">
          <Link href="/courses" className="font-semibold text-gold-600 hover:text-gold">
            ← Keep browsing courses
          </Link>
          <Link href="/faq" className="text-muted hover:text-ink">
            Questions about payment? Read the FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
