const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    namaLengkap: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tempatLahir: String,
    tanggalLahir: Date,
    nik: { type: String, required: true, unique: true },
    noTelepon: String,
    alamat: String,
    fotoProfile: String,
    cv: String,
    fotoKtp: String,
    fotoSimA: String,
    fotoSimC: String,
    role: { type: String, default: "sales" },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },

    // true HANYA untuk akun admin utama/bawaan sistem (dibuat lewat seed script,
    // bukan lewat alur registrasi sales biasa). Dipakai untuk MENYEMBUNYIKAN
    // akun ini dari tabel "Data Sales", karena tabel itu hanya untuk
    // sales & admin yang berasal dari promosi sales.
    isMainAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);