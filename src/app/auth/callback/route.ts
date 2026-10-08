import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { portalTab } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Only redirect to this portal's root and a known tab, never a supplied URL.
  const destination = new URL("/", request.url);
  destination.searchParams.set(
    "tab",
    portalTab(request.nextUrl.searchParams.get("tab")),
  );
  const finish = (error?: string) => {
    if (error) destination.searchParams.set("auth_error", error);
    // A relative Location keeps the browser on the portal's external origin,
    // including when the Next.js server sees an internal proxy hostname.
    const response = new NextResponse(null, {
      status: 303,
      headers: { Location: destination.pathname + destination.search },
    });
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate, max-age=0",
    );
    response.headers.set("Expires", "0");
    response.headers.set("Pragma", "no-cache");
    return response;
  };
  if (request.nextUrl.searchParams.has("error")) {
    return finish(
      request.nextUrl.searchParams.get("error") === "access_denied"
        ? "cancelled"
        : "oauth_failed",
    );
  }
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return finish("missing_code");
  try {
    const supabase = await createClient();
    if (!supabase) return finish("not_configured");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return finish(error ? "exchange_failed" : undefined);
  } catch {
    return finish("connection_failed");
  }
}
