const User = require("../models/userModel");

// Ambil semua user yang dikelola lewat tabel ini
// (sales, maupun yang sudah dipromosikan jadi admin) — KECUALI admin utama/bawaan sistem
exports.getSales = async (req, res) => {
    try {
        const salesList = await User.find({ isMainAdmin: { $ne: true } }).select("-password");
        res.status(200).json(salesList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// Update status verifikasi satu sales (hanya bisa sekali, dari "pending")
// Admin biasa TETAP BOLEH melakukan ini
exports.updateVerifikasi = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "active" atau "rejected"

        if (!["active", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status verifikasi tidak valid." });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Data sales tidak ditemukan." });
        }

        if (user.status !== "pending") {
            return res.status(400).json({
                message: "Status verifikasi sudah final dan tidak bisa diubah lagi.",
            });
        }

        user.status = status;
        await user.save();

        res.status(200).json({ message: "Status verifikasi diperbarui.", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// Update role satu user (mis. naikkan sales jadi admin, atau turunkan admin jadi sales lagi)
// - Promosi "sales" -> "admin": boleh dilakukan admin biasa maupun admin utama.
// - Mengubah role user yang statusnya SUDAH "admin" (termasuk menurunkan balik ke "sales"):
//   HANYA boleh dilakukan oleh admin utama (isMainAdmin).
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // "admin" atau "sales"

        if (!["admin", "sales"].includes(role)) {
            return res.status(400).json({ message: "Role tidak valid." });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Data user tidak ditemukan." });
        }

        if (user.isMainAdmin) {
            return res.status(403).json({ message: "Role admin utama tidak bisa diubah." });
        }

        // Kalau target user statusnya sudah "admin", perubahan apapun terhadap
        // role-nya (termasuk menurunkan ke "sales") hanya boleh dilakukan
        // oleh admin utama.
        if (user.role === "admin") {
            const requester = await User.findById(req.user.id);

            if (!requester || !requester.isMainAdmin) {
                return res.status(403).json({
                    message: "Hanya admin utama yang bisa mengubah role admin.",
                });
            }
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: "Role berhasil diperbarui.", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// Update data sales (nama, nik, no telepon, alamat, dan file baru jika ada)
// Admin biasa TETAP BOLEH melakukan ini
exports.updateSales = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaLengkap, nik, noTelepon, alamat } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Data sales tidak ditemukan." });
        }

        if (namaLengkap) user.namaLengkap = namaLengkap;
        if (nik) user.nik = nik;
        if (noTelepon) user.noTelepon = noTelepon;
        if (alamat) user.alamat = alamat;

        const files = req.files || {};
        if (files.fotoProfile?.[0]) user.fotoProfile = files.fotoProfile[0].filename;
        if (files.fotoKtp?.[0]) user.fotoKtp = files.fotoKtp[0].filename;
        if (files.fotoSimA?.[0]) user.fotoSimA = files.fotoSimA[0].filename;
        if (files.fotoSimC?.[0]) user.fotoSimC = files.fotoSimC[0].filename;
        if (files.cv?.[0]) user.cv = files.cv[0].filename;

        await user.save();

        res.status(200).json({ message: "Data sales diperbarui.", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// Hapus data sales.
// HANYA admin utama (isMainAdmin) yang dilindungi dan tidak bisa dihapus.
// Admin biasa (hasil promosi dari sales) TETAP BOLEH dihapus lewat endpoint ini.
exports.deleteSales = async (req, res) => {
    try {
        const { id } = req.params;

        const target = await User.findById(id);
        if (!target) {
            return res.status(404).json({ message: "Data sales tidak ditemukan." });
        }

        if (target.isMainAdmin) {
            return res.status(403).json({ message: "Admin utama tidak bisa dihapus." });
        }

        await target.deleteOne();

        res.status(200).json({ message: "Data sales berhasil dihapus." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};