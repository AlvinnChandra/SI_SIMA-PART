const cloudinary = require("../config/cloudinary");
const Item = require("../models/itemModel");
const Counter = require("../models/counterModel");
const createItem = async (req, res) => {
  try {
    console.log("req.file:", req.file);
    const { nama, harga, keterangan, kategori, kendaraan } = req.body;

    let gambar = null;
    let cloudinary_id = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {folder: "sima_items",});
      gambar = result.secure_url;
      cloudinary_id = result.public_id;
    }

    // Get the next counter value for the item code
    const counter = await Counter.findOneAndUpdate(
      { name: "item_kode" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const kode = `SM-${String(counter.value).padStart(3, "0")}`;

    const newItem = new Item({ kode, nama, harga, keterangan, kategori, kendaraan, gambar, cloudinary_id });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Error creating item", error: error.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.find().sort({ nama: 1 });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    let gambar = item.gambar;
    let cloudinary_id = item.cloudinary_id;

    if (req.file) {
      if (cloudinary_id) await cloudinary.uploader.destroy(cloudinary_id);
      const result = await cloudinary.uploader.upload(req.file.path, {folder: "sima_items",});
      gambar = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body, gambar, cloudinary_id },
      { new: true, runValidators: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating produk", error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.cloudinary_id) await cloudinary.uploader.destroy(item.cloudinary_id);
    await item.deleteOne();

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};

module.exports = { createItem, getItem, updateItem, deleteItem };