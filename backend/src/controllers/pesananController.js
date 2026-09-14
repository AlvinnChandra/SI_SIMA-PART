const Pesanan = require("../models/pesananModel");
const User = require("../models/userModel");
const Counter = require("../models/counterModel");

// mapping status DB -> key tab di frontend
const STATUS_TO_KEY = {
    "Orderan Masuk": "masuk",
    "Diproses": "disiapkan",
    "Selesai": "selesai",
    "Dibatalkan": "dibatalkan",
};

// ---------------- TAMBAH PESANAN BARU ----------------
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

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        const inputBy =
            currentUser.role === "admin"
                ? "Admin"
                : `Sales - ${currentUser.namaLengkap}`;

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

        // Generate noPesanan otomatis, mis. "ORD-0018"
        const counter = await Counter.findOneAndUpdate(
            { name: "pesanan_no" },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );
        const noPesanan = `ORD-${String(counter.value).padStart(4, "0")}`;

        const pesananBaru = new Pesanan({
            noPesanan,
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


// ---------------- AMBIL SEMUA PESANAN (buat halaman History Order, dengan filter status & pagination) ----------------
// Query params yang didukung:
//   - status: "masuk" | "disiapkan" | "selesai" | "dibatalkan" (opsional, default semua)
//   - page: nomor halaman (default 1)
//   - limit: jumlah data per halaman (default 5)
exports.getPesanan = async (req, res) => {
    try {
        const { status, page = 1, limit = 5 } = req.query;

        const KEY_TO_STATUS = {
            masuk: "Orderan Masuk",
            disiapkan: "Diproses",
            selesai: "Selesai",
            dibatalkan: "Dibatalkan",
        };

        const filter = {};
        if (status && status !== "semua") {
            const statusDb = KEY_TO_STATUS[status];
            if (!statusDb) {
                return res.status(400).json({ message: "Filter status tidak valid." });
            }
            filter.status = statusDb;
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.max(parseInt(limit, 10) || 5, 1);
        const skip = (pageNum - 1) * limitNum;

        const [pesananList, total] = await Promise.all([
            Pesanan.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate("toko", "namaToko alamat noTelepon")
                .populate("createdBy", "namaLengkap role"),
            Pesanan.countDocuments(filter),
        ]);

        res.status(200).json({
            data: pesananList,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};


// ---------------- AMBIL DETAIL SATU PESANAN ----------------
exports.getPesananById = async (req, res) => {
    try {
        const pesanan = await Pesanan.findById(req.params.id)
            .populate("toko", "namaToko alamat noTelepon")
            .populate("createdBy", "namaLengkap role");

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