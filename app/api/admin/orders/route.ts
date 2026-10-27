import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";

/**
 * GET /api/admin/orders
 *
 * Admin-only. The order queue, newest first, so pending payments can be
 * marked paid by hand.
 */
const handlers = {
  async GET() {
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

    const rows = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 50,
    });

    return NextResponse.json(
      rows.map((order) => ({
        id: order.id,
        reference: order.reference,
        userId: order.userId,
        email: order.email,
        status: order.status,
        total: order.total,
        currency: order.currency,
        paymentReference: order.paymentReference,
        paymentProvider: order.paymentProvider,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      })),
    );
  },
};

export const { GET } = handlers;
