import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptionPlans, orders } from "@/db/schema";
import { isFlutterwaveConfigured } from "@/lib/flutterwave";
import { createFlutterwavePayment } from "@/lib/flutterwave";
import { formatPrice } from "@/lib/format";

/**
 * POST /api/subscribe
 *
 * Body: { planCode: string, phone?: string }
 *
 * Auth required — accounts are one honest email and password, created at
 * /register. Creates a pending membership order for the plan. With a gateway
 * configured the buyer is sent straight to the hosted checkout; without one
 * the order waits for manual approval and the "how to pay" page shows the
 * steps (mobile money to the line George answers himself).
 */
const handlers = {
  async POST(request: Request) {
    let body: { planCode?: string; phone?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const planCode = body?.planCode?.trim();
    if (!planCode) {
      return NextResponse.json({ error: "planCode is required" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to subscribe", authRequired: true },
        { status: 401 },
      );
    }

    const plan = (
      await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.code, planCode))
    )[0];
    if (!plan || !plan.isVisible) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const user = session.user;
    const reference = `MEM-${user.id}-${Date.now()}`;
    const now = new Date();

    const [order] = await db
      .insert(orders)
      .values({
        reference,
        userId: user.id,
        email: user.email ?? `${user.id}@unknown.local`,
        kind: "membership",
        productSlug: plan.code,
        phone: typeof body?.phone === "string" ? body.phone.trim() : null,
        status: "pending",
        paymentReference: null,
        paymentProvider: isFlutterwaveConfigured() ? "flutterwave" : "manual",
        total: plan.price,
        currency: "ZMW",
        createdAt: now,
      })
      .returning();

    if (isFlutterwaveConfigured()) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const result = await createFlutterwavePayment({
        txRef: reference,
        amount: plan.price / 100,
        currency: "ZMW",
        email: user.email ?? `${user.id}@unknown.local`,
        name: user.name ?? "Student",
        phone: typeof body?.phone === "string" ? body.phone.trim() : undefined,
        description: `Learn2Earn membership — ${plan.name}`,
        redirectUrl: `${appUrl}/checkout/paid?tx_ref=${reference}`,
        orderId: order.id,
      });

      if (result.ok) {
        await db
          .update(orders)
          .set({ paymentReference: result.flwReference || reference })
          .where(eq(orders.id, order.id));
        return NextResponse.json({
          orderId: order.id,
          reference: order.reference,
          paymentUrl: result.paymentUrl,
          provider: "flutterwave",
        });
      }

      await db
        .update(orders)
        .set({ paymentProvider: "manual" })
        .where(eq(orders.id, order.id));
      return NextResponse.json(
        {
          orderId: order.id,
          reference: order.reference,
          provider: "manual",
          warning: `Payment gateway unavailable: ${result.error}`,
        },
        { status: 202 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      reference: order.reference,
      plan: plan.code,
      amount: formatPrice(plan.price, "ZMW"),
      provider: "manual",
    });
  },
};

export const { POST } = handlers;
