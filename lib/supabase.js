import { createClient } from "@supabase/supabase-js";

/**
 * Buat Supabase client untuk dipakai di sisi server (Server Component,
 * Server Action, Route Handler). Gunakan SUPABASE_SECRET_KEY supaya
 * bisa membaca data yang dilindungi RLS dengan hak penuh.
 *
 * Jangan import file ini dari komponen yang memakai "use client".
 */
export function buatSupabaseServer() {
  let url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Environment variable SUPABASE_URL atau SUPABASE_SECRET_KEY belum diisi."
    );
  }

  // Bersihkan jika ada /rest/v1 atau trailing slash yang tidak sengaja terbawa
  url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createClient(url, key);
}

