export const dynamic = "force-dynamic";

import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatSupabaseServer } from "@/lib/supabase";

// US-07: daftar produk diambil dari database, bukan data contoh.
export default async function HalamanAdmin() {
  const supabase = buatSupabaseServer();
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil produk:", error.message);
  }

  const produk = daftarProduk ?? [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {produk.length === 0 ? (
        <p className="rounded-2xl border border-garis px-6 py-12 text-center text-teks-lembut">
          Belum ada produk. Mulai dengan menambah produk baru.
        </p>
      ) : (
        <TabelProduk daftarProduk={produk} />
      )}
    </div>
  );
}
