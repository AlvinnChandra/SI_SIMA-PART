const User = require("../models/userModel");

// Ambil semua user dengan role "sales" (tanpa password)
exports.getSales = async (req, res) => {
    try {
        const salesList = await User.find({ role: "sales" }).select("-password");
        res.status(200).json(salesList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// Update status verifikasi satu sales (hanya bisa sekali, dari "pending")
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

// Update data sales (nama, nik, no telepon, alamat, dan file baru jika ada)
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

// Hapus data sales
exports.deleteSales = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findOneAndDelete({ _id: id, role: "sales" });

        if (!deleted) {
            return res.status(404).json({ message: "Data sales tidak ditemukan." });
        }

        res.status(200).json({ message: "Data sales berhasil dihapus." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};