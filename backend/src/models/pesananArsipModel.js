const mongoose = require("mongoose");

// ======================================================
// SCHEMA ARSIP PESANAN
// ======================================================
// Dipakai untuk menyimpan salinan seluruh data pesanan
// SEBELUM di-reset/dihapus lewat fitur "Reset Nomor Pesanan".
// Isinya snapshot apa adanya dari dokumen pesanan asli (pakai
// Mixed supaya tidak perlu duplikasi schema item pesanan),
// ditambah beberapa metadata soal siapa & kapan reset dilakukan.
// ======================================================

const pesananArsipSchema = new mongoose.Schema(
    {
        // Snapshot lengkap dokumen pesanan asli (apa adanya, termasuk _id lama)
        dataAsli: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        // Nomor pesanan asli, biar gampang dicari tanpa buka dataAsli
        noPesananAsli: {
            type: String,
            required: true,
        },

        // Batch reset mana arsip ini berasal (biar bisa dikelompokkan per-reset)
        resetBatchId: {
            type: String,
            required: true,
        },

        // Siapa yang melakukan reset
        resetBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        resetByNama: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Koleksi terpisah "pesananArsip", tidak mengganggu koleksi "pesanan" yang aktif
module.exports = mongoose.model("PesananArsip", pesananArsipSchema, "pesananArsip");