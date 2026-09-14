const cloudinary = require("../config/cloudinary");
const User = require("../models/userModel");

// helper upload file ke cloudinary
// resourceType: "image" untuk foto, "raw" untuk PDF (cv)
const uploadToCloudinary = async (file, folder, resourceType = "image") => {
    if (!file) return null;

    const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: resourceType,
    });

    return { url: result.secure_url, publicId: result.public_id };
};

// mapping field file -> folder cloudinary & resource type-nya,
// dipakai bareng di updateSales & deleteSales
const FILE_FIELDS = [
    { key: "fotoProfile", idKey: "fotoProfileId", folder: "sima_users/foto_profile", resourceType: "image" },
    { key: "cv", idKey: "cvId", folder: "sima_users/cv", resourceType: "raw" },
    { key: "fotoKtp", idKey: "fotoKtpId", folder: "sima_users/ktp", resourceType: "image" },
    { key: "fotoSimA", idKey: "fotoSimAId", folder: "sima_users/sim_a", resourceType: "image" },
    { key: "fotoSimC", idKey: "fotoSimCId", folder: "sima_users/sim_c", resourceType: "image" },
];

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

        for (const f of FILE_FIELDS) {
            const file = files[f.key]?.[0];
            if (!file) continue;

            // hapus file lama di cloudinary dulu kalau ada, biar gak numpuk sampah
            if (user[f.idKey]) {
                await cloudinary.uploader.destroy(user[f.idKey], {
                    resource_type: f.resourceType,
                });
            }

            const uploaded = await uploadToCloudinary(file, f.folder, f.resourceType);
            user[f.key] = uploaded.url;
            user[f.idKey] = uploaded.publicId;
        }

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

        // bersihkan semua file terkait di cloudinary biar gak jadi sampah
        for (const f of FILE_FIELDS) {
            if (target[f.idKey]) {
                await cloudinary.uploader.destroy(target[f.idKey], {
                    resource_type: f.resourceType,
                });
            }
        }

        await target.deleteOne();

        res.status(200).json({ message: "Data sales berhasil dihapus." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};