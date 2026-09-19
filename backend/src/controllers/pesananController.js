const Pesanan = require("../models/pesananModel");
const User = require("../models/userModel");
const Counter = require("../models/counterModel");
const PesananArsip = require("../models/pesananArsipModel");

// Mapping status frontend -> status database
const KEY_TO_STATUS = {
    masuk: "Orderan Masuk",
    disiapkan: "Diproses",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
};

// Status yang diperbolehkan
const STATUS_VALID = [
    "Orderan Masuk",
    "Diproses",
    "Selesai",
    "Dibatalkan",
];


// ============================================================
// TAMBAH PESANAN BARU
// ============================================================
exports.createPesanan = async (req, res) => {
    try {
        const { toko, items, tanggal } = req.body;

        // Validasi toko
        if (!toko || !toko._id) {
            return res.status(400).json({
                message: "Data toko tidak lengkap.",
            });
        }

        // Validasi items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Pesanan harus punya minimal 1 barang.",
            });
        }

        // Validasi tanggal
        if (!tanggal) {
            return res.status(400).json({
                message: "Tanggal pesanan wajib diisi.",
            });
        }

        // Ambil user yang sedang login
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({
                message: "User tidak ditemukan.",
            });
        }

        // Tentukan siapa yang membuat pesanan
        const inputBy =
            currentUser.role === "admin"
                ? "Admin"
                : `Sales - ${currentUser.namaLengkap}`;

        // Bersihkan data barang
        const itemsBersih = items.map((item) => ({
            barangId: String(item.barangId || ""),
            nama: String(item.nama || "").trim(),
            satuan: item.satuan === "PCS" ? "PCS" : "SET",
            qty: Number(item.qty) || 0,
            catatan: String(item.catatan || "").trim(),
            isBaru: !!item.isBaru,
        }));

        // Pastikan semua barang punya nama
        const adaItemTanpaNama = itemsBersih.some(
            (item) => !item.nama
        );

        if (adaItemTanpaNama) {
            return res.status(400).json({
                message: "Ada barang di pesanan yang tidak punya nama.",
            });
        }

        // Generate nomor pesanan
        // Contoh: ORD-0001, ORD-0002, dst.
        const counter = await Counter.findOneAndUpdate(
            { name: "pesanan_no" },
            { $inc: { value: 1 } },
            {
                new: true,
                upsert: true,
            }
        );

        const noPesanan = `ORD-${String(counter.value).padStart(4, "0")}`;

        // Buat pesanan baru
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

        return res.status(201).json({
            message: "Pesanan berhasil disimpan.",
            pesanan: pesananBaru,
        });
    } catch (err) {
        console.error("createPesanan error:", err);

        return res.status(500).json({
            message: err.message || "Terjadi kesalahan server.",
        });
    }
};


// ============================================================
// AMBIL SEMUA PESANAN
// ============================================================
// Query status:
// ?status=masuk
// ?status=disiapkan
// ?status=selesai
// ?status=dibatalkan
// ?status=semua
//
// Pagination:
// ?page=1&limit=5
// ============================================================
exports.getPesanan = async (req, res) => {
    try {
        const {
            status,
            page = 1,
            limit = 5,
        } = req.query;

        const filter = {};

        // Filter berdasarkan status
        if (status && status !== "semua") {
            const statusDb = KEY_TO_STATUS[status];

            if (!statusDb) {
                return res.status(400).json({
                    message: "Filter status tidak valid.",
                });
            }

            filter.status = statusDb;
        }

        // Pagination
        const pageNum = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const limitNum = Math.max(
            parseInt(limit, 10) || 5,
            1
        );

        const skip = (pageNum - 1) * limitNum;

        // Ambil data dan total secara bersamaan
        const [pesananList, total] = await Promise.all([
            Pesanan.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate(
                    "toko",
                    "namaToko alamat noTelepon"
                )
                .populate(
                    "createdBy",
                    "namaLengkap role"
                ),

            Pesanan.countDocuments(filter),
        ]);

        return res.status(200).json({
            data: pesananList,

            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages:
                    Math.ceil(total / limitNum) || 1,
            },
        });
    } catch (err) {
        console.error("getPesanan error:", err);

        return res.status(500).json({
            message: "Terjadi kesalahan server.",
        });
    }
};


// ============================================================
// AMBIL DETAIL SATU PESANAN
// ============================================================
exports.getPesananById = async (req, res) => {
    try {
        const { id } = req.params;

        const pesanan = await Pesanan.findById(id)
            .populate(
                "toko",
                "namaToko alamat noTelepon"
            )
            .populate(
                "createdBy",
                "namaLengkap role"
            );

        if (!pesanan) {
            return res.status(404).json({
                message: "Pesanan tidak ditemukan.",
            });
        }

        return res.status(200).json(pesanan);
    } catch (err) {
        console.error("getPesananById error:", err);

        return res.status(500).json({
            message: "Terjadi kesalahan server.",
        });
    }
};


// ============================================================
// UPDATE STATUS PESANAN
// ============================================================
exports.updateStatusPesanan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validasi status
        if (!STATUS_VALID.includes(status)) {
            return res.status(400).json({
                message: "Status pesanan tidak valid.",
            });
        }

        // Cari pesanan
        const pesanan = await Pesanan.findById(id);

        if (!pesanan) {
            return res.status(404).json({
                message: "Pesanan tidak ditemukan.",
            });
        }

        // Update status
        pesanan.status = status;

        await pesanan.save();

        return res.status(200).json({
            message: "Status pesanan diperbarui.",
            pesanan,
        });
    } catch (err) {
        console.error("updateStatusPesanan error:", err);

        return res.status(500).json({
            message: "Terjadi kesalahan server.",
        });
    }
};


// ============================================================
// HAPUS PESANAN
// ============================================================
// Aturan:
// - admin        -> boleh hapus pesanan apapun statusnya
// - sales        -> cuma boleh hapus pesanan yang statusnya masih "Orderan Masuk"
//                   (kalau sudah berubah status, harus lewat admin)
// ============================================================
exports.deletePesanan = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil user yang sedang login (role-nya) dari token
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({
                message: "User tidak ditemukan.",
            });
        }

        // Cari dulu pesanannya, jangan langsung delete,
        // supaya bisa dicek statusnya sebelum dihapus
        const pesanan = await Pesanan.findById(id);

        if (!pesanan) {
            return res.status(404).json({
                message: "Pesanan tidak ditemukan.",
            });
        }

        const isAdmin = currentUser.role === "admin";
        const isSalesDanMasihMasuk =
            currentUser.role === "sales" &&
            pesanan.status === "Orderan Masuk";

        if (!isAdmin && !isSalesDanMasihMasuk) {
            return res.status(403).json({
                message:
                    "Forbidden: Pesanan yang statusnya sudah berubah hanya bisa dihapus oleh admin.",
            });
        }

        await pesanan.deleteOne();

        return res.status(200).json({
            message: "Pesanan berhasil dihapus.",
        });
    } catch (err) {
        console.error("deletePesanan error:", err);

        return res.status(500).json({
            message: "Terjadi kesalahan server.",
        });
    }
};


// ============================================================
// RESET TOTAL PESANAN
// ============================================================
// Menghapus SEMUA data pesanan dan mengembalikan nomor urut
// ke awal, sehingga pesanan berikutnya akan menjadi ORD-0001 lagi.
//
// Pengaman yang diterapkan:
// 1. HANYA admin utama (isMainAdmin) yang boleh melakukan ini,
//    sama seperti proteksi di updateRole/deleteSales. Admin biasa
//    tetap kena authorizeRoles("admin") di route, tapi dicek lagi
//    di sini supaya admin biasa tetap ditolak.
// 2. WAJIB kirim teks konfirmasi persis "HAPUS SEMUA" di body
//    request (req.body.konfirmasi), supaya endpoint ini tidak bisa
//    kepanggil tidak sengaja lewat script/Postman tanpa sadar.
// 3. Sebelum dihapus, SEMUA pesanan disalin dulu ke koleksi arsip
//    "pesananArsip" (lihat models/pesananArsipModel.js), jadi kalau
//    suatu saat butuh data lama, masih bisa ditelusuri dari sana.
// ============================================================
exports.resetNomorPesanan = async (req, res) => {
    try {
        const { konfirmasi } = req.body;

        // Wajib ketik ulang teks konfirmasi di request, bukan cuma di frontend
        if (konfirmasi !== "HAPUS SEMUA") {
            return res.status(400).json({
                message: 'Konfirmasi tidak valid. Kirim { "konfirmasi": "HAPUS SEMUA" } di body request.',
            });
        }

        // Hanya admin utama yang boleh reset
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({
                message: "User tidak ditemukan.",
            });
        }

        if (!currentUser.isMainAdmin) {
            return res.status(403).json({
                message: "Forbidden: Hanya admin utama yang boleh mereset nomor pesanan.",
            });
        }

        // Ambil semua pesanan yang ada sebelum dihapus
        const semuaPesanan = await Pesanan.find({}).lean();

        if (semuaPesanan.length > 0) {
            const resetBatchId = `RESET-${Date.now()}`;

            // Salin semua pesanan ke koleksi arsip dulu, biar tidak hilang permanen
            const dokumenArsip = semuaPesanan.map((p) => ({
                dataAsli: p,
                noPesananAsli: p.noPesanan,
                resetBatchId,
                resetBy: currentUser._id,
                resetByNama: currentUser.namaLengkap,
            }));

            await PesananArsip.insertMany(dokumenArsip);
        }

        // Baru setelah aman diarsipkan, hapus semua pesanan
        await Pesanan.deleteMany({});

        // Kembalikan counter nomor pesanan ke 0
        await Counter.findOneAndUpdate(
            { name: "pesanan_no" },
            { $set: { value: 0 } },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            message: `Semua pesanan berhasil diarsipkan & dihapus (${semuaPesanan.length} data). Nomor pesanan direset ke ORD-0001.`,
        });
    } catch (err) {
        console.error("resetNomorPesanan error:", err);

        return res.status(500).json({
            message: "Terjadi kesalahan server.",
        });
    }
};