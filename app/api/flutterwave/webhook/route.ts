import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { enrollments, orderItems, orders } from "@/db/schema";
import { verifyFlutterwaveTransaction, verifyWebhookHash } from "@/lib/flutterwave";

/**
 * POST /api/flutterwave/webhook
 *
 * Flutterwave calls this when a payment completes.
 *
 * Two checks before anything is granted:
 *   1. The `verif-hash` header must equal FLW_SECRET_HASH (Settings -> Webhooks).
 *   2. The transaction is re-queried from Flutterwave and must be successful,
 *      for this order, in the right currency, for at least the right amount.
 *
 * Only then is the order marked paid and the enrolment created — which is what
 * gives the student access.
 *
 * Configure the URL in the Flutterwave dashboard:
 *   https://<your-domain>/api/flutterwave/webhook
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const hash = request.headers.get("verif-hash");

  if (!verifyWebhookHash(hash)) {
    return NextResponse.json({ error: "Invalid verif-hash" }, { status: 401 });
  }

  let payload: {
    event?: string;
    data?: {
      id?: number | string;
      tx_ref?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Flutterwave sends several event types; only the ones that mean money
  // arrived are acted on.
  const event = payload.event;
  const paid =
    event === "charge.completed" ||
    event === "payment_intent.completed" ||
    payload.data?.status === "successful" ||
    payload.data?.status === "completed";

  if (!paid) {
    return NextResponse.json({ received: true, acted: false });
  }

  const txRef = payload.data?.tx_ref;
  if (!txRef) {
    return NextResponse.json({ error: "tx_ref missing" }, { status: 400 });
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.reference, txRef),
  });
  if (!order) {
    return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  }

  // Idempotent: a retried webhook must not create a second enrolment.
  if (order.status === "paid") {
    return NextResponse.json({ received: true, acted: false, alreadyPaid: true });
  }

  // Never trust the payload on its own. The secret hash proves the request came
  // from Flutterwave, but it is a static string — if it leaks, anyone can POST a
  // convincing body. Confirming against the API is what closes that hole.
  const transactionId = payload.data?.id;
  if (!transactionId) {
    return NextResponse.json({ error: "Transaction id missing" }, { status: 400 });
  }

  const verified = await verifyFlutterwaveTransaction(transactionId);
  if (!verified.ok) {
    // Ask Flutterwave to retry rather than granting access on an unverified
    // payment. They retry 3 times at 30-minute intervals when enabled.
    return NextResponse.json(
      { error: `Could not verify transaction: ${verified.error}` },
      { status: 502 },
    );
  }

  const tx = verified.tx;

  if (tx.status !== "successful" && tx.status !== "completed") {
    return NextResponse.json({ received: true, acted: false, status: tx.status });
  }

  if (tx.txRef && tx.txRef !== order.reference) {
    return NextResponse.json(
      { error: "tx_ref does not match the order" },
      { status: 409 },
    );
  }

  if (tx.currency !== order.currency) {
    return NextResponse.json(
      { error: `Currency mismatch: paid ${tx.currency}, order is ${order.currency}` },
      { status: 409 },
    );
  }

  // order.total is stored in minor units (ngwee); Flutterwave reports major
  // units (kwacha). The small tolerance absorbs float representation only.
  const expectedMajor = order.total / 100;
  if (tx.amount + 0.01 < expectedMajor) {
    return NextResponse.json(
      { error: `Underpaid: received ${tx.amount}, expected ${expectedMajor}` },
      { status: 409 },
    );
  }

  const now = new Date();
  await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: now,
      paymentReference: String(tx.id ?? order.paymentReference ?? txRef),
    })
    .where(eq(orders.id, order.id));

  const { fulfilOrder } = await import("@/lib/fulfil");
  const fulfil = await fulfilOrder(order.id);

  return NextResponse.json({
    received: true,
    acted: true,
    granted: fulfil.granted,
  });
}
