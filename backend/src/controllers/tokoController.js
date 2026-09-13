const Toko = require("../models/tokoModel");
const User = require("../models/userModel");

// ---------------- AMBIL SEMUA DATA TOKO ----------------
exports.getToko = async (req, res) => {
    try {
        const tokoList = await Toko.find().sort({ createdAt: -1 });
        res.status(200).json(tokoList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ---------------- TAMBAH DATA TOKO ----------------
exports.createToko = async (req, res) => {
    try {
        const { namaToko, alamat, noTelepon } = req.body;

        if (!namaToko || !alamat || !noTelepon) {
            return res.status(400).json({ message: "Semua field wajib diisi." });
        }

        // req.user didapat dari verifyToken (isinya { id, role } dari JWT)
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        // inputBy ditentukan di backend, TIDAK dipercaya dari body request
        const inputBy =
            currentUser.role === "admin"
                ? "Admin"
                : `Sales - ${currentUser.namaLengkap}`;

        const newToko = new Toko({
            namaToko,
            alamat,
            noTelepon,
            inputBy,
            role: currentUser.role,
            createdBy: currentUser._id,
        });

        await newToko.save();

        res.status(201).json({ message: "Data toko berhasil ditambahkan.", toko: newToko });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ---------------- UPDATE DATA TOKO ----------------
exports.updateToko = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaToko, alamat, noTelepon } = req.body;

        const toko = await Toko.findById(id);
        if (!toko) {
            return res.status(404).json({ message: "Data toko tidak ditemukan." });
        }

        // inputBy & role pembuat sengaja TIDAK diubah saat edit,
        // supaya histori "siapa yang input pertama kali" tetap terjaga
        if (namaToko) toko.namaToko = namaToko;
        if (alamat) toko.alamat = alamat;
        if (noTelepon) toko.noTelepon = noTelepon;

        await toko.save();

        res.status(200).json({ message: "Data toko diperbarui.", toko });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ---------------- HAPUS DATA TOKO ----------------
exports.deleteToko = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Toko.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Data toko tidak ditemukan." });
        }

        res.status(200).json({ message: "Data toko berhasil dihapus." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};