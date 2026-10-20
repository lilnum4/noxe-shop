import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { buatSupabaseServer } from "@/lib/supabase";

export default async function HalamanKatalog() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = buatSupabaseServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, foto_url, kategori")
      .order("created_at", { ascending: false });

    if (error) {
      pesanError = `Gagal mengambil data produk: ${error.message}`;
    } else {
      daftarProduk = data ?? [];
    }
  } catch (err) {
    pesanError = `Terjadi kesalahan saat menghubungi database: ${err.message}`;
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {pesanError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="text-teks-lembut">Belum ada produk.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
