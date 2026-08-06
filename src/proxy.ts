import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/reset-password", "/auth/confirm"];

// MCP + OAuth bridge: these authenticate themselves (bearer token /
// client-secret / PKCE, see src/lib/mcp/) rather than the browser cookie
// session this proxy checks, and must stay reachable by claude.ai's servers
// with no cookie at all — unlike PUBLIC_PATHS above, a logged-in browser
// hitting one of these should NOT be bounced to "/" either, so they skip
// this proxy entirely rather than going through the public/private branch
// below. /oauth/authorize is deliberately NOT here — it's a real browser
// page and should keep the normal redirect-to-login behavior.
const ALWAYS_ALLOWED_PATHS = [
  "/.well-known/oauth-authorization-server",
  "/.well-known/oauth-protected-resource",
  "/api/oauth/token",
  "/api/mcp",
  // Todoist "notepad" capture bridge (src/lib/todoist/). The webhook has no
  // cookie at all (Todoist's servers call it directly); the callback route
  // authenticates itself via requireUser() internally regardless. /todoist/connect
  // and /api/todoist/authorize are deliberately NOT here — same reasoning
  // as /oauth/authorize above.
  "/api/todoist/webhook",
  "/api/todoist/callback",
  // Home-screen shortcut endpoints (src/lib/quick-log/) — authenticate via a
  // single bearer token (QUICK_LOG_TOKEN), no cookie at all, called directly
  // by iOS Shortcuts / Android automation apps.
  "/api/quick/",
  // Legal pages need to be readable by a prospective signup who has no
  // session yet AND by an already-logged-in user re-reading them — unlike
  // PUBLIC_PATHS below, which bounces a logged-in visitor away, these should
  // never redirect either way.
  "/terms",
  "/privacy",
];

/**
 * UX-only redirect layer — not the security boundary. Every route that
 * reads/writes user data also verifies auth itself (requireUser in
 * src/lib/supabase/auth.ts) and RLS enforces ownership at the database
 * level regardless of what happens here.
 */
export async function proxy(request: NextRequest) {
  if (ALWAYS_ALLOWED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() verifies the JWT locally (WebCrypto + a cached JWKS lookup)
  // instead of round-tripping to the Auth server like getUser() does — this
  // runs on every navigation via the matcher below, so the network call
  // getUser() required here was a full extra round-trip on top of the one
  // requireUser() already pays for inside the page render.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!claims && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (claims && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
