const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    harga: { type: Number, required: true },
    keterangan: { type: String, required: true },
    kategori: { type: String, required: true },
    kendaraan: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Kendaraan harus diisi minimal satu.",
      },
    },
    gambar: { type: String, default: null },
    diskon: { type: Number, default: 0 },
    cloudinary_id: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);