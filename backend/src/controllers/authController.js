const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// ---------------- REGISTER ----------------
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

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username dan kata sandi wajib diisi." });
        }

        // cari berdasarkan username ATAU email, biar fleksibel
        const user = await User.findOne({
            $or: [{ username }, { email: username }],
        });

        if (!user) {
            return res.status(400).json({ message: "Username/email atau kata sandi salah." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Username/email atau kata sandi salah." });
        }

        // hanya akun dengan status "active" yang boleh masuk
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Akun kamu belum aktif. Silakan tunggu verifikasi dari admin.",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login berhasil",
            token,
            user: {
                id: user._id,
                namaLengkap: user.namaLengkap,
                username: user.username,
                role: user.role,
                status: user.status,
                fotoProfile: user.fotoProfile,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ---------------- UPDATE PROFIL (nama, password, & foto) ----------------
exports.updateProfile = async (req, res) => {
    try {
        const { namaLengkap, oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        if (namaLengkap) {
            user.namaLengkap = namaLengkap;
        }

        // Ganti password hanya kalau user mengisi newPassword
        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({
                    message: "Password lama wajib diisi untuk mengganti password.",
                });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Password lama salah." });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        // Ganti foto profil kalau ada file baru yang diupload
        if (req.file) {
            user.fotoProfile = req.file.filename;
        }

        await user.save();

        res.status(200).json({
            message: "Profil berhasil diperbarui.",
            user: {
                id: user._id,
                namaLengkap: user.namaLengkap,
                username: user.username,
                role: user.role,
                status: user.status,
                fotoProfile: user.fotoProfile,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};