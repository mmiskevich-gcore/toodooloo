import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: skip the loading state for visitors with no session
// cookie at all. Real session validation happens in lib/dal.ts.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: "/",
};
