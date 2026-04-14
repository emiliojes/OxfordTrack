import { NextRequest, NextResponse } from "next/server";

// No-op proxy — route protection is handled server-side in each page.
// better-sqlite3 cannot run in the Edge runtime, so we avoid using auth() here.
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
