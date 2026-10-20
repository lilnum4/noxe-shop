import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * proxy.js — pengganti middleware.js di Next.js 16.
 *
 * Proteksi semua rute /admin kecuali /admin/login:
 * jika pengguna belum login (tidak ada sesi Supabase Auth yang valid),
 * permintaan langsung dialihkan ke /admin/login.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Halaman login boleh dibuka siapa saja
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Lindungi semua rute /admin lainnya
  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({ request });

    // Buat Supabase client yang membaca cookie dari request
    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Gunakan getUser() — bukan getSession() — agar validasi dilakukan di server
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
