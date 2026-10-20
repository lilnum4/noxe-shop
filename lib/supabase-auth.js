import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Buat Supabase client yang membaca/menulis sesi dari cookie.
 * Dipakai di Server Action, Route Handler, dan proxy.js.
 * Jangan import dari file yang memakai "use client".
 */
export async function buatSupabaseAuth() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Kembalikan user yang sedang login, atau null jika belum login.
 * Aman dipakai di Server Action untuk memvalidasi sesi sebelum mengubah data.
 */
export async function ambilUser() {
  const supabase = await buatSupabaseAuth();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
