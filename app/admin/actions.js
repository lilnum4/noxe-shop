"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function buatSupabaseAuth() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          const store = await cookieStore;
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = buatSupabaseAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { pesan: "Email atau password salah. Silakan coba lagi." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = buatSupabaseAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  // Validasi di server
  if (!passwordBaru || passwordBaru.length < 8) {
    return { ok: false, pesan: "Password baru minimal 8 karakter." };
  }
  if (passwordBaru !== konfirmasi) {
    return { ok: false, pesan: "Konfirmasi password tidak cocok." };
  }

  const supabase = buatSupabaseAuth();

  // Pastikan admin sedang login
  const { data: { user }, error: errSesi } = await supabase.auth.getUser();
  if (errSesi || !user) {
    redirect("/admin/login");
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });
  if (error) {
    return { ok: false, pesan: `Gagal mengganti password: ${error.message}` };
  }

  return { ok: true, pesan: "Password berhasil diganti." };
}

