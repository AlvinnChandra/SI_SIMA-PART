const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    kode: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    harga: { type: Number, required: true },
    keterangan: { type: String, required: true },
    kategori: { type: String, required: true },
    kendaraan: { type: String, required: true },
    gambar: { type: String, default: null },
    cloudinary_id: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);