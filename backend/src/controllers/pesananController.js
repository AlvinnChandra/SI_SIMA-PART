const Pesanan = require("../models/pesananModel");
const User = require("../models/userModel");

// ---------------- TAMBAH PESANAN BARU ----------------
// Dipanggil dari halaman "Pesanan" sales/admin (tombol "Simpan Pesanan").
exports.createPesanan = async (req, res) => {
    try {
        const { toko, items, tanggal } = req.body;

        if (!toko || !toko._id) {
            return res.status(400).json({ message: "Data toko tidak lengkap." });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Pesanan harus punya minimal 1 barang." });
        }

        if (!tanggal) {
            return res.status(400).json({ message: "Tanggal pesanan wajib diisi." });
        }

        // req.user didapat dari middleware verifyToken (isi JWT)
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        // inputBy ditentukan di backend, TIDAK dipercaya dari body request,
        // sama seperti pola di tokoController.js
        const inputBy =
            currentUser.role === "admin"
                ? "Admin"
                : `Sales - ${currentUser.namaLengkap}`;

        // Bersihkan & validasi ringan tiap item sebelum disimpan
        const itemsBersih = items.map((item) => ({
            barangId: String(item.barangId || ""),
            nama: String(item.nama || "").trim(),
            satuan: item.satuan === "PCS" ? "PCS" : "SET",
            qty: Number(item.qty) || 0,
            catatan: String(item.catatan || "").trim(),
            isBaru: !!item.isBaru,
        }));

        const adaItemTanpaNama = itemsBersih.some((item) => !item.nama);
        if (adaItemTanpaNama) {
            return res.status(400).json({ message: "Ada barang di pesanan yang tidak punya nama." });
        }

        const pesananBaru = new Pesanan({
            toko: toko._id,
            namaToko: toko.namaToko,
            alamatToko: toko.alamat || "",
            noTeleponToko: toko.noTelepon || "",
            items: itemsBersih,
            tanggalPesanan: new Date(tanggal),
            inputBy,
            createdBy: currentUser._id,
        });

        await pesananBaru.save();

        res.status(201).json({
            message: "Pesanan berhasil disimpan.",
            pesanan: pesananBaru,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Terjadi kesalahan server." });
    }
};


// ---------------- AMBIL SEMUA PESANAN (buat halaman History Order) ----------------
exports.getPesanan = async (req, res) => {
    try {
        const pesananList = await Pesanan.find()
            .sort({ createdAt: -1 })
            .populate("toko", "namaToko alamat noTelepon");

        res.status(200).json(pesananList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};


// ---------------- AMBIL DETAIL SATU PESANAN ----------------
exports.getPesananById = async (req, res) => {
    try {
        const pesanan = await Pesanan.findById(req.params.id)
            .populate("toko", "namaToko alamat noTelepon");

        if (!pesanan) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan." });
        }

        res.status(200).json(pesanan);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};


// ---------------- UPDATE STATUS PESANAN ----------------
// Mis. "baru" -> "diproses" -> "selesai", atau "dibatalkan"
exports.updateStatusPesanan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusValid = ["Orderan Masuk", "Diproses", "Selesai", "Dibatalkan"];
        if (!statusValid.includes(status)) {
            return res.status(400).json({ message: "Status pesanan tidak valid." });
        }

        const pesanan = await Pesanan.findById(id);
        if (!pesanan) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan." });
        }

        pesanan.status = status;
        await pesanan.save();

        res.status(200).json({ message: "Status pesanan diperbarui.", pesanan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};