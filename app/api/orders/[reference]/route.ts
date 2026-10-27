import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders } from "@/db/schema";

/**
 * GET /api/orders/[reference]
 *
 * The order status, for the page the student lands on after paying. The
 * Flutterwave webhook is usually the thing that flips the order to paid; this
 * lets the return page check rather than assume.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.reference, reference),
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    reference: order.reference,
    status: order.status,
    total: order.total,
    currency: order.currency,
    provider: order.paymentProvider,
  });
}
