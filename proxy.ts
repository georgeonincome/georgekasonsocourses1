import { NextResponse, type NextRequest } from "next/server";

/**
 * The header highlights the active nav item, which needs the pathname on the
 * server. The proxy is the only place that can expose it to a server
 * component without making the header dynamic on every navigation.
 *
 * Next.js 16 renamed `middleware` to `proxy` (the edge runtime is not
 * supported there; the runtime is nodejs).
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
