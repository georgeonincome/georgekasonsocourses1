import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { fulfilOrder } from "@/lib/fulfil";

/**
 * PATCH /api/payments/order/[orderId]
 *
 * Admin-only. Body: { status: "paid" }
 *
 * Marks a pending order paid by hand — mobile money to the till, cash at the
 * office, a bank transfer. Fulfilment goes through `fulfilOrder`, the same
 * door the gateway webhook walks through, so both paths leave the same
 * database state behind.
 */
const handlers = {
  async PATCH(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> },
  ) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 },
      );
    }
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { orderId } = await params;
    const id = Number(orderId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    let body: { status?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const status = body?.status;
    if (status !== "paid") {
      return NextResponse.json(
        { error: "Only the 'paid' status can be set" },
        { status: 400 },
      );
    }

    const { order, granted } = await fulfilOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const message =
      order.kind === "membership"
        ? "Paid — membership active, catalogue unlocked"
        : "Paid & unlocked";

    return NextResponse.json({ ok: true, order, granted, message });
  },
};

export const { PATCH } = handlers;
