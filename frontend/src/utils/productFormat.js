// Helper tampilan produk. Dulu formatRupiah ada dua versi (katalog.jsx dan
// productCard.jsx) dengan perilaku beda saat nilainya kosong.

// Ubah nama produk jadi "seed" yang aman dipakai di URL.
export function toSeed(nama) {
    return (nama || "produk")
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

export const FALLBACK_IMG = (nama) =>
    `https://picsum.photos/seed/${toSeed(nama)}/400/400`;

// Gambar produk: pakai gambar dari server, kalau kosong pakai fallback.
export function getProductImage(product) {
    return product?.gambar || FALLBACK_IMG(product?.nama);
}

// Kembalikan "" untuk nilai kosong supaya aman dipakai di input form,
// dan "Rp 25.000" untuk angka valid.
export function formatRupiah(value) {
    if (value === "" || value === null || value === undefined) return "";
    const number = Number(value);
    if (Number.isNaN(number)) return "";
    return `Rp ${number.toLocaleString("id-ID")}`;
}

// Untuk input harga: buang semua karakter selain angka.
export function onlyDigits(value) {
    return String(value ?? "").replace(/[^0-9]/g, "");
}

// Tentukan satuan dari teks keterangan.
// Kalau ada "1 Pcs" -> PCS, selain itu -> SET.
export function getSatuan(keterangan = "") {
    return /1\s*pcs/i.test(keterangan) ? "PCS" : "SET";
}