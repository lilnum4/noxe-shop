import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { cariProdukContoh } from "@/lib/data-contoh";

// US-09 (bonus): ubah produk.
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const produk = cariProdukContoh(id);

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} labelTombol="Simpan perubahan" />
    </div>
  );
}
