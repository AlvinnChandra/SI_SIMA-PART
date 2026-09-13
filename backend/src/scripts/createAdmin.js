require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

async function run() {
  await mongoose.connect(process.env.CONNECTION_STRING);

  const hashedPassword = await bcrypt.hash("GANTI_PASSWORD_INI", 10);

  const admin = new User({
    namaLengkap: "Nama Admin",
    username: "admin1",
    email: "admin@sima.com",
    password: hashedPassword,
    role: "admin",
  });

  await admin.save();
  console.log("Admin berhasil dibuat:", admin.username);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});