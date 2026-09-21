// ==================================================
// PENYIMPANAN DISKON DI localStorage
// Bentuk data: { [idProduk]: persen }
// Murni frontend. Tidak pernah dikirim atau disimpan ke database.

export const DISKON_KEY = "katalog_diskon";

export function hitungHargaSetelahDiskon(harga, persen) {
    return Math.round(harga - (harga * persen) / 100);
}

export function loadDiskonMap() {
    try {
        return JSON.parse(localStorage.getItem(DISKON_KEY)) || {};
    } catch {
        return {};
    }
}

export function saveDiskonMap(map) {
    try {
        localStorage.setItem(DISKON_KEY, JSON.stringify(map));
    } catch {
        // storage penuh atau diblokir -> diskon tetap jalan di state React,
        // hanya tidak bertahan setelah refresh.
    }
}

// Tempelkan diskon tersimpan ke daftar produk dari server.
export function applyStoredDiskon(items) {
    const map = loadDiskonMap();
    return items.map((p) => {
        const persen = map[p._id];
        return persen > 0
            ? {
                ...p,
                diskon: persen,
                hargaSetelahDiskon: hitungHargaSetelahDiskon(p.harga, persen),
            }
            : p;
    });
}

// Harga yang benar-benar ditampilkan ke user.
// Dulu ekspresi ini ditulis ulang di card, preview, PDF, dan Excel.
export function getHargaFinal(product) {
    if (!product) return 0;
    return product.diskon > 0
        ? product.hargaSetelahDiskon ??
              hitungHargaSetelahDiskon(product.harga, product.diskon)
        : product.harga;
}

// --- operasi map diskon (dipakai hook useDiskon) ---
export function setDiskonForIds(ids, persen) {
    const map = loadDiskonMap();
    ids.forEach((id) => {
        map[id] = persen;
    });
    saveDiskonMap(map);
}

export function removeDiskonForId(id) {
    const map = loadDiskonMap();
    delete map[id];
    saveDiskonMap(map);
}

export function clearAllDiskon() {
    saveDiskonMap({});
}