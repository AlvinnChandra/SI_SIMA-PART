// ======================================================
// DATA BARANG
// ======================================================

export const DUMMY_PRODUCTS = [
    {
        nama: "Per Shock Breaker RXK",
        harga: 25000,
        qty: "1 Set 2 Pcs",
        kategori: "Per Shock Breaker",
        kendaraan: "RXK"
    },
    {
        nama: "Per Shock Breaker Legenda",
        harga: 24000,
        qty: "1 Set 2 Pcs",
        kategori: "Per Shock Breaker",
        kendaraan: "Legenda"
    },
    {
        nama: "Per Shock Breaker Satria",
        harga: 24000,
        qty: "1 Set 2 Pcs",
        kategori: "Per Shock Breaker",
        kendaraan: "Satria"
    },
    {
        nama: "Per Shock Breaker GL Pro",
        harga: 45000,
        qty: "1 Set 2 Pcs",
        kategori: "Per Shock Breaker",
        kendaraan: "GL Pro"
    },
    {
        nama: "Per Shock Breaker TRS",
        harga: 65000,
        qty: "1 Set 2 Pcs",
        kategori: "Per Shock Breaker",
        kendaraan: "TRS"
    },
    {
        nama: "Per Shock Breaker Tiger",
        harga: 65000,
        qty: "1 Set 2 Pcs",
        kategori: "Per Shock Breaker",
        kendaraan: "Tiger"
    },
    {
        nama: "Per Standar Samping Grand",
        harga: 5000,
        qty: "1 Pcs",
        kategori: "Per Standar Samping",
        kendaraan: "Grand"
    },
    {
        nama: "Per Standar Samping Yamaha",
        harga: 5000,
        qty: "1 Pcs",
        kategori: "Per Standar Samping",
        kendaraan: "Yamaha"
    },
    {
        nama: "Per Standar Tengah GL",
        harga: 6000,
        qty: "1 Pcs",
        kategori: "Per Standar Tengah",
        kendaraan: "GL"
    },
    {
        nama: "Per Standar Tengah Supra Fit",
        harga: 5000,
        qty: "1 Pcs",
        kategori: "Per Standar Tengah",
        kendaraan: "Supra Fit"
    },
    {
        nama: "Per Stopper GL PRO",
        harga: 5000,
        qty: "1 Pcs",
        kategori: "Per Stopper",
        kendaraan: "GL Pro"
    },
    {
        nama: "Per Stopper RXK",
        harga: 5000,
        qty: "1 Pcs",
        kategori: "Per Stopper",
        kendaraan: "RXK"
    },
    {
        nama: "Per Versnelleng RXK",
        harga: 10000,
        qty: "1 Pcs",
        kategori: "Per Versnelleng",
        kendaraan: "RXK"
    },
    {
        nama: "Switch Rem Depan Supra",
        harga: 12500,
        qty: "1 Pcs",
        kategori: "Switch Rem Depan",
        kendaraan: "Supra"
    },
    {
        nama: "Switch Netral Grand",
        harga: 17500,
        qty: "1 Pcs",
        kategori: "Switch Netral",
        kendaraan: "Grand"
    },
    {
        nama: "Switch Netral Tiger",
        harga: 17500,
        qty: "1 Pcs",
        kategori: "Switch Netral",
        kendaraan: "Tiger"
    },
    {
        nama: "Tutup Magnit Grand (Hitam)",
        harga: 7500,
        qty: "1 Set 2 Pcs",
        kategori: "Tutup Magnit",
        kendaraan: "Grand"
    },
    {
        nama: "Tutup Magnit Supra (Silver)",
        harga: 7500,
        qty: "1 Set 2 Pcs",
        kategori: "Tutup Magnit",
        kendaraan: "Supra"
    },
    {
        nama: "Tutup Mesin Legenda (Plastik)",
        harga: 25000,
        qty: "1 Pcs",
        kategori: "Tutup Mesin",
        kendaraan: "Legenda"
    },
    {
        nama: "Tutup Mesin Smash/Shogun",
        harga: 25000,
        qty: "1 Pcs",
        kategori: "Tutup Mesin",
        kendaraan: "Smash/Shogun"
    },
    {
        nama: "Ring Komstir RC",
        harga: 5000,
        qty: "1 Pcs",
        kategori: "Lainnya",
        kendaraan: "RC"
    },
    {
        nama: "Tombol Klakson",
        harga: 5500,
        qty: "1 Pcs",
        kategori: "Lainnya",
        kendaraan: "Universal"
    }
];


// ======================================================
// TENTUKAN SATUAN DEFAULT
// ======================================================

export function tentukanSatuanDefault(qtyText = "") {
    const text = qtyText.toLowerCase();

    if (text.includes("pcs") && !text.includes("set")) {
        return "PCS";
    }

    return "SET";
}


// ======================================================
// DATA BARANG UNTUK SEARCH
// ======================================================

export const MOCK_BARANG = DUMMY_PRODUCTS.map((product, index) => ({
    id: index + 1,
    nama: product.nama,
    satuanDefault: tentukanSatuanDefault(product.qty),
    harga: product.harga,
    kategori: product.kategori,
    kendaraan: product.kendaraan
}));


// ======================================================
// DRAFT PESANAN (localStorage)
// ======================================================

export const DRAFT_KEY = "pesananSales_draft";


export function bacaDraft() {

    try {

        const raw = localStorage.getItem(DRAFT_KEY);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    } catch (err) {

        console.error("Gagal membaca draft pesanan:", err);

        return null;
    }
}