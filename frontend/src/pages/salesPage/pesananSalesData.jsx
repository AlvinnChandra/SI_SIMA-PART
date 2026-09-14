// ======================================================
// TENTUKAN SATUAN DEFAULT
// ======================================================
// Item di database tidak punya field "satuan" tersendiri, jadi
// diturunkan dari teks "keterangan" (mis. "1 Set 2 Pcs" -> SET,
// "1 Pcs" -> PCS).
// ======================================================

export function tentukanSatuanDefault(qtyText = "") {
    const text = qtyText.toLowerCase();

    if (text.includes("pcs") && !text.includes("set")) {
        return "PCS";
    }

    return "SET";
}


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