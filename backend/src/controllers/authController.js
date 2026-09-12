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