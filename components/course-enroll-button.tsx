"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useCart } from "@/components/cart-provider";

export type EnrollableCourse = {
  slug: string;
  title: string;
  price: number;
  currency: string;
};

/**
 * Adds a course to the cart and sends the visitor to checkout.
 * Publicly usable — no login required to add to the cart.
 */
export function CourseEnrollButton({
  course,
  label = "Enroll now",
  className = "btn btn-gold w-full sm:w-auto",
}: {
  course: EnrollableCourse;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const { add, has } = useCart();
  const [busy, setBusy] = useState(false);

  const inCart = has(course.slug);

  const handleClick = useCallback(() => {
    if (inCart) {
      router.push(`/checkout?course=${encodeURIComponent(course.slug)}`);
      return;
    }
    setBusy(true);
    add({
      slug: course.slug,
      title: course.title,
      price: course.price,
      currency: course.currency,
    });
    router.push(`/checkout?course=${encodeURIComponent(course.slug)}`);
  }, [add, course, inCart, router]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={className}
      aria-disabled={inCart}
    >
      {inCart ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Added — go to checkout
        </>
      ) : busy ? (
        "Adding…"
      ) : (
        label
      )}
    </button>
  );
}
