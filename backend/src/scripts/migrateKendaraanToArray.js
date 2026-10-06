// Jalankan SEKALI setelah deploy schema baru: node migrateKendaraanToArray.js
// Item lama di DB masih punya kendaraan sebagai string tunggal; skrip ini
// mengubahnya jadi array satu elemen supaya cocok dengan schema baru.
//
// Sesuaikan MONGO_URI dan path require("./models/itemModel") dengan
// struktur project sebenarnya sebelum dijalankan.
require("dotenv").config();
const mongoose = require("mongoose");
 
async function run() {
  await mongoose.connect(process.env.CONNECTION_STRING);
  const db = mongoose.connection.db;
 
  const items = await db
    .collection("items")
    .find({ kendaraan: { $type: "string" } })
    .toArray();
 
  console.log(`Ditemukan ${items.length} item dengan kendaraan masih string.`);
 
  for (const item of items) {
    await db
      .collection("items")
      .updateOne({ _id: item._id }, { $set: { kendaraan: [item.kendaraan] } });
  }
 
  console.log("Migrasi selesai.");
  await mongoose.disconnect();
}
 
run().catch((err) => {
  console.error(err);
  process.exit(1);
});