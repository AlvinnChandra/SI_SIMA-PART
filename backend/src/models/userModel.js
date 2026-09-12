const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    namaLengkap: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tempatLahir: { type: String, required: true },
    tanggalLahir: { type: Date, required: true },
    nik: { type: String, required: true, unique: true },
    noTelepon: { type: String, required: true },
    alamat: { type: String, required: true },
    fotoProfil: { type: String, default: null },
    fotoProfilCloudinaryId: { type: String, default: null },
    cv: { type: String, default: null },
    ktp: { type: String, required: true },
    simA: { type: String, default: null },
    simC: { type: String, default: null },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);