const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const User = require("../models/userModel");

async function uploadIfExists(file) {
  if (!file) return null;
  const result = await cloudinary.uploader.upload(file[0].path, { folder: "sima_users" });
  return result.secure_url;
}

const register = async (req, res) => {
  try {
    const {
      namaLengkap, username, email, password,
      tempatLahir, tanggalLahir, nik, noTelepon, alamat,
    } = req.body;
    // role SENGAJA tidak diambil dari req.body — selalu "user"

    const hashedPassword = await bcrypt.hash(password, 10);

    const fotoProfil = await uploadIfExists(req.files?.fotoProfil);
    const cv = await uploadIfExists(req.files?.cv);
    const ktp = await uploadIfExists(req.files?.ktp);
    const simA = await uploadIfExists(req.files?.simA);
    const simC = await uploadIfExists(req.files?.simC);

    const newUser = new User({
      namaLengkap, username, email, password: hashedPassword,
      tempatLahir, tanggalLahir, nik, noTelepon, alamat,
      fotoProfil, cv, ktp, simA, simC,
      role: "user",
    });

    await newUser.save();
    res.status(201).json({ message: `User registered with username ${username}` });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const login = async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({
            $or: [{ username}, { email: username }] // Allow login with either username or email
        });
        if (!user) {
            return res.status(404).json({ message: `User with username/ email ${username} not found` });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

const createAdmin = async (req, res) => {
  try {
    const { namaLengkap, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      namaLengkap,
      username,
      email,
      password: hashedPassword,
      role: "admin", // dikunci, sama seperti register dikunci ke "user"
    });

    await newAdmin.save();
    res.status(201).json({ message: `Admin ${username} berhasil dibuat` });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};

module.exports = { register, login, createAdmin };