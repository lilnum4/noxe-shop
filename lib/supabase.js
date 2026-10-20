import { createClient } from "@supabase/supabase-js";

/**
 * Buat Supabase client untuk dipakai di sisi server (Server Component,
 * Server Action, Route Handler). Gunakan SUPABASE_SECRET_KEY supaya
 * bisa membaca data yang dilindungi RLS dengan hak penuh.
 *
 * Jangan import file ini dari komponen yang memakai "use client".
 */
export function buatSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Environment variable SUPABASE_URL atau SUPABASE_SECRET_KEY belum diisi."
    );
  }

  return createClient(url, key);
}

