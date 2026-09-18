const cloudinary = require("../config/cloudinary");
const Item = require("../models/itemModel");

// Helper: upload gambar produk ke Cloudinary
const uploadGambar = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "sima_items",
  });

  return { gambar: result.secure_url, cloudinary_id: result.public_id };
};

// Helper: tempelkan kode SM-001, SM-002, ... sesuai urutan nama (A-Z),
// sekalian hitung hargaSetelahDiskon biar frontend tinggal pakai
const withKodeUrut = (items) => {
  const sorted = [...items].sort((a, b) =>
    a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
  );

  return sorted.map((item, index) => {
    const obj = item.toObject();
    const diskon = obj.diskon || 0;

    return {
      ...obj,
      kode: `SM-${String(index + 1).padStart(3, "0")}`,
      hargaSetelahDiskon: Math.round(obj.harga * (1 - diskon / 100)),
    };
  });
};

// ---------------- TAMBAH PRODUK ----------------
const createItem = async (req, res) => {
  try {
    const { nama, harga, keterangan, kategori, kendaraan } = req.body;

    if (!nama || !harga || !keterangan || !kategori || !kendaraan) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    let gambar = null;
    let cloudinary_id = null;

    if (req.file) {
      ({ gambar, cloudinary_id } = await uploadGambar(req.file));
    }

    const newItem = new Item({
      nama: String(nama).trim(),
      harga: Number(harga),
      keterangan: String(keterangan).trim(),
      kategori: String(kategori).trim(),
      kendaraan: String(kendaraan).trim(),
      gambar,
      cloudinary_id,
    });

    await newItem.save();

    res.status(201).json(newItem.toObject());
  } catch (error) {
    console.error("createItem error:", error);
    res.status(500).json({ message: "Error creating item", error: error.message });
  }
};

// ---------------- AMBIL SEMUA PRODUK ----------------
const getItem = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(withKodeUrut(items));
  } catch (error) {
    console.error("getItem error:", error);
    res.status(500).json({ message: "Error fetching item", error: error.message });
  }
};

// ---------------- UPDATE PRODUK ----------------
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    let gambar = item.gambar;
    let cloudinary_id = item.cloudinary_id;

    if (req.file) {
      if (cloudinary_id) await cloudinary.uploader.destroy(cloudinary_id);
      ({ gambar, cloudinary_id } = await uploadGambar(req.file));
    }

    // buang field yang tidak boleh ditimpa langsung dari body
    // (diskon punya endpoint sendiri)
    const { gambar: _g, cloudinary_id: _c, kode, _id, diskon, ...body } = req.body;

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { ...body, gambar, cloudinary_id },
      { new: true, runValidators: true }
    );

    res.status(200).json(updated.toObject());
  } catch (error) {
    console.error("updateItem error:", error);
    res.status(500).json({ message: "Error updating produk", error: error.message });
  }
};

// ---------------- HAPUS PRODUK ----------------
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.cloudinary_id) await cloudinary.uploader.destroy(item.cloudinary_id);
    await item.deleteOne();

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};

// ---------------- TERAPKAN DISKON KE BANYAK BARANG ----------------
// body: { ids: [...], diskon: 15 }
const applyDiskon = async (req, res) => {
  try {
    const { ids, diskon } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Pilih minimal 1 barang." });
    }

    const persen = Number(diskon);

    if (!Number.isFinite(persen) || persen <= 0 || persen > 100) {
      return res.status(400).json({ message: "Diskon harus antara 1 - 100." });
    }

    const result = await Item.updateMany(
      { _id: { $in: ids } },
      { $set: { diskon: persen } }
    );

    res.status(200).json({
      message: `Diskon ${persen}% diterapkan ke ${result.modifiedCount} barang.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("applyDiskon error:", error);
    res.status(500).json({ message: "Error applying diskon", error: error.message });
  }
};

// ---------------- HAPUS DISKON SATU BARANG ----------------
const removeDiskon = async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: { diskon: 0 } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Item not found" });

    res.status(200).json({ message: "Diskon dihapus.", item: updated.toObject() });
  } catch (error) {
    console.error("removeDiskon error:", error);
    res.status(500).json({ message: "Error removing diskon", error: error.message });
  }
};

module.exports = {
  createItem,
  getItem,
  updateItem,
  deleteItem,
  applyDiskon,
  removeDiskon,
};