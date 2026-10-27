import { NextResponse } from "next/server";

/**
 * GET /api/cart — the cart lives in the browser (localStorage), so the server
 * holds no cart state and always reports an empty list.
 *
 * DELETE /api/cart — body { slug } acknowledges the removal of a line. The
 * client store owns the real state.
 */
const handlers = {
  async GET() {
    return NextResponse.json({ lines: [] });
  },

  async DELETE(request: Request) {
    let body: { slug?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const slug = body?.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, removed: slug });
  },
};

export const { GET, DELETE } = handlers;
