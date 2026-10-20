"use server";

import { redirect } from "next/navigation";
import { buatSupabaseAuth, ambilUser } from "@/lib/supabase-auth";

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = await buatSupabaseAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { pesan: "Email atau password salah. Silakan coba lagi." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatSupabaseAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  // Aturan keamanan #3: periksa login di server sebelum mengubah data
  const user = await ambilUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Validasi di server
  if (!passwordBaru || passwordBaru.length < 8) {
    return { ok: false, pesan: "Password baru minimal 8 karakter." };
  }
  if (passwordBaru !== konfirmasi) {
    return { ok: false, pesan: "Konfirmasi password tidak cocok." };
  }

  const supabase = await buatSupabaseAuth();
  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    return { ok: false, pesan: `Gagal mengganti password: ${error.message}` };
  }

  return { ok: true, pesan: "Password berhasil diganti." };
}
