import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo-lumerlabs.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo_anon_key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Fetch authenticated user safely without crashing if demo/invalid URL is provided
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (_err) {
    user = null;
  }

  // Redirect unauthenticated requests away from protected dashboard pages if not on public pages (/login, /privacy, /terms)
  const isPublicPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/privacy") ||
    request.nextUrl.pathname.startsWith("/terms");
  const isApiWebhook = request.nextUrl.pathname.startsWith("/api/webhooks");
  const isPublicAsset =
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico");

  if (isApiWebhook) {
    return NextResponse.next();
  }


  // Note: For initial demo convenience, allow access if url is demo or if logged in
  if (!user && !isPublicPage && !isPublicAsset && process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co") && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("demo")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

