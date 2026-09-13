const mongoose = require("mongoose");

const tokoSchema = new mongoose.Schema(
    {
        namaToko: { type: String, required: true },
        alamat: { type: String, required: true },
        noTelepon: { type: String, required: true },

        // Nama yang ditampilkan di kolom "Input By"
        // "Admin" kalau dibuat oleh admin, atau nama lengkap sales
        inputBy: { type: String, required: true },

        // Role pembuat, dipakai buat styling badge (Admin/Sales) di frontend
        role: {
            type: String,
            enum: ["admin", "sales"],
            required: true,
        },

        // Referensi ke user yang membuat data ini (opsional, tapi berguna buat audit)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Parameter ke-3 "dataToko" supaya nulis ke koleksi yang sudah ada,
// bukan bikin koleksi baru "tokos" (default pluralization mongoose)
module.exports = mongoose.model("Toko", tokoSchema, "dataToko");