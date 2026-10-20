import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";
import { buatSupabaseServer } from "@/lib/supabase";

function buatUrl({ q, kategori }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (kategori && kategori !== "semua") params.set("kategori", kategori);
  const str = params.toString();
  return str ? `/?${str}` : "/";
}

// US-11: Filter kategori atau pencarian produk
export default async function HalamanKatalog({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const kataKunci = (sp.q ?? "").toString().trim();
  const kategoriAktif = (sp.kategori ?? "").toString().trim();

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = buatSupabaseServer();

    // Ambil daftar kategori unik yang ada di tabel produk
    const { data: dataKategori } = await supabase
      .from("produk")
      .select("kategori")
      .not("kategori", "is", null);

    daftarKategori = Array.from(
      new Set(
        (dataKategori ?? [])
          .map((item) => item.kategori?.trim())
          .filter(Boolean)
      )
    ).sort();

    // Query produk dengan penyaringan kategori dan nama
    let query = supabase
      .from("produk")
      .select("id, nama, harga, foto_url, kategori")
      .order("created_at", { ascending: false });

    if (kategoriAktif && kategoriAktif !== "semua") {
      query = query.eq("kategori", kategoriAktif);
    }

    if (kataKunci) {
      query = query.ilike("nama", `%${kataKunci}%`);
    }

    const { data, error } = await query;

    if (error) {
      pesanError = `Gagal mengambil data produk: ${error.message}`;
    } else {
      daftarProduk = data ?? [];
    }
  } catch (err) {
    pesanError = `Terjadi kesalahan saat menghubungi database: ${err.message}`;
  }

  const adaFilter = Boolean(kataKunci || (kategoriAktif && kategoriAktif !== "semua"));

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian Nama Produk */}
          <form method="GET" action="/" className="flex max-w-sm flex-1 gap-2">
            <input
              type="search"
              name="q"
              defaultValue={kataKunci}
              placeholder="Cari nama produk…"
              className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            {kategoriAktif && (
              <input type="hidden" name="kategori" value={kategoriAktif} />
            )}
            <Tombol type="submit">Cari</Tombol>
            {adaFilter && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </form>
        </div>

        {/* Tombol Penyaring Kategori */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buatUrl({ q: kataKunci, kategori: "" })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                !kategoriAktif || kategoriAktif === "semua"
                  ? "bg-utama text-white"
                  : "bg-permukaan text-teks hover:bg-garis"
              }`}
            >
              Semua
            </Link>
            {daftarKategori.map((kategori) => {
              const aktif = kategoriAktif.toLowerCase() === kategori.toLowerCase();
              return (
                <Link
                  key={kategori}
                  href={buatUrl({ q: kataKunci, kategori })}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    aktif
                      ? "bg-utama text-white"
                      : "bg-permukaan text-teks hover:bg-garis"
                  }`}
                >
                  {kategori}
                </Link>
              );
            })}
          </div>
        )}

        {pesanError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          adaFilter ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-garis p-8 text-teks-lembut">
              <p>Tidak ada produk yang cocok dengan pencarian atau filter.</p>
              <Link href="/" className="text-sm font-semibold text-utama underline underline-offset-4">
                Lihat semua produk
              </Link>
            </div>
          ) : (
            <p className="text-teks-lembut">Belum ada produk.</p>
          )
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
