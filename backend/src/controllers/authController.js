const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.register = async (req, res) => {
    try {
        const { namaLengkap, username, email, password, tempatLahir, tanggalLahir, nik, noTelepon, alamat } = req.body;

        const existing = await User.findOne({ $or: [{ email }, { username }, { nik }] });
        if (existing) {
            return res.status(400).json({ message: "Email, username, atau NIK sudah terdaftar." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const files = req.files || {};

        const newUser = new User({
            namaLengkap,
            username,
            email,
            password: hashedPassword,
            tempatLahir,
            tanggalLahir,
            nik,
            noTelepon,
            alamat,
            fotoProfile: files.fotoProfile?.[0]?.filename,
            cv: files.cv?.[0]?.filename,
            fotoKtp: files.fotoKtp?.[0]?.filename,
            fotoSimA: files.fotoSimA?.[0]?.filename,
            fotoSimC: files.fotoSimC?.[0]?.filename,
        });

        await newUser.save();

        res.status(201).json({ message: "Registrasi berhasil" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};