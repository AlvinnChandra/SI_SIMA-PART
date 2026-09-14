const mongoose = require("mongoose");

// ======================================================
// SUB-SCHEMA: ITEM DI DALAM SATU PESANAN
// ======================================================

const itemPesananSchema = new mongoose.Schema(
    {
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
        // Nomor pesanan otomatis, mis. "ORD-0018"
        noPesanan: {
            type: String,
            required: true,
            unique: true,
        },

        toko: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Toko",
            required: true,
        },

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

        tanggalPesanan: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["Orderan Masuk", "Diproses", "Selesai", "Dibatalkan"],
            default: "Orderan Masuk",
        },

        inputBy: {
            type: String,
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Pesanan", pesananSchema, "pesanan");