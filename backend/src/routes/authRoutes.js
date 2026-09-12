const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/authMiddleware");
const { register, login, resetPassword, updateProfile } = require("../controllers/authController");

router.post(
    "/register",
    upload.fields([
        { name: "fotoProfile", maxCount: 1 },
        { name: "cv", maxCount: 1 },
        { name: "fotoKtp", maxCount: 1 },
        { name: "fotoSimA", maxCount: 1 },
        { name: "fotoSimC", maxCount: 1 },
    ]),
    register
);

router.post("/login", login);

// Reset kata sandi: username/email + nomor telepon + NIK harus cocok dengan satu akun
router.post("/reset-password", resetPassword);

// upload.single("fotoProfile") tetap kompatibel dipakai admin (kirim JSON biasa,
// bukan file) karena multer otomatis skip kalau request bukan multipart/form-data
router.put("/profile", verifyToken, upload.single("fotoProfile"), updateProfile);

module.exports = router;