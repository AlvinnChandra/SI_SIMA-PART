const mongoose = require("mongoose");

// ======================================================
// SUB-SCHEMA: ITEM DI DALAM SATU PESANAN
// ======================================================

const itemPesananSchema = new mongoose.Schema(
    {
        // barangId disimpan sebagai String (bukan ObjectId ref) karena
        // barang "baru" yang diketik manual oleh sales di frontend
        // punya id sementara seperti "new-1694... " yang bukan ObjectId
        // valid dan belum tentu ada di collection "items".
        barangId: {
            type: String,
            required: true,
        },

        nama: {
            type: String,
            required: true,
        },

        satuan: {
            type: String,
            enum: ["SET", "PCS"],
            required: true,
        },

        qty: {
            type: Number,
            required: true,
            min: 0,
        },

        catatan: {
            type: String,
            default: "",
        },

        // true kalau barang ini belum ada di katalog resmi (collection "items")
        // saat pesanan dibuat, hanya dicatat manual oleh sales
        isBaru: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);


// ======================================================
// SCHEMA UTAMA: PESANAN
// ======================================================

const pesananSchema = new mongoose.Schema(
    {
        toko: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Toko",
            required: true,
        },

        // Snapshot data toko disimpan langsung di sini (bukan cuma
        // referensi), supaya histori pesanan tetap utuh & akurat
        // walaupun data di collection "dataToko" nanti diedit/dihapus.
        namaToko: {
            type: String,
            required: true,
        },

        alamatToko: {
            type: String,
            default: "",
        },

        noTeleponToko: {
            type: String,
            default: "",
        },

        items: {
            type: [itemPesananSchema],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: "Pesanan harus punya minimal 1 barang.",
            },
        },

        // Tanggal pesanan dibuat (bisa diedit manual oleh sales
        // di form, jadi disimpan terpisah dari createdAt)
        tanggalPesanan: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["Orderan Masuk", "Diproses", "Selesai", "Dibatalkan"],
            default: "Orderan Masuk",
        },

        // Nama yang ditampilkan di kolom "Input By" (mis. di History Order)
        // "Admin" kalau dibuat oleh admin, atau nama lengkap sales
        inputBy: {
            type: String,
            required: true,
        },

        // Referensi ke user yang membuat pesanan ini (buat audit)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Parameter ke-3 "pesanan" supaya nulis ke koleksi "pesanan" persis
// seperti yang terlihat di Compass, bukan "pesanans" (default pluralization)
module.exports = mongoose.model("Pesanan", pesananSchema, "pesanan");