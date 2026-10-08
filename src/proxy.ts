import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  const hasSession = request.cookies
    .getAll()
    .some(
      ({ name }) =>
        name.includes("-auth-token") && !name.includes("code-verifier"),
    );
  // Guests and the public NEIS API never require Supabase to be available.
  if (!config || !hasSession) return response;
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values, headers) => {
        const previous = response;
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const cookie of previous.cookies.getAll())
          response.cookies.set(cookie);
        for (const header of ["cache-control", "expires", "pragma"]) {
          const value = previous.headers.get(header);
          if (value) response.headers.set(header, value);
        }
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers))
          response.headers.set(name, value);
      },
    },
  });
  try {
    await supabase.auth.getClaims();
  } catch {
    // A temporary Auth outage must not block public school information.
  }
  return response;
}

export const config = { matcher: ["/", "/auth/:path*"] };
