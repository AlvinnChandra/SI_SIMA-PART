const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload");
const {
    getSales,
    updateVerifikasi,
    updateSales,
    deleteSales,
} = require("../controllers/userControllers");

// Semua route di bawah ini hanya bisa diakses oleh admin yang sudah login

// Ambil semua data sales
router.get("/sales", verifyToken, authorizeRoles("admin"), getSales);

// Update status verifikasi (Berhasil / Tidak Berhasil)
router.patch(
    "/sales/:id/verifikasi",
    verifyToken,
    authorizeRoles("admin"),
    updateVerifikasi
);

// Update data sales (termasuk ganti file)
router.put(
    "/sales/:id",
    verifyToken,
    authorizeRoles("admin"),
    upload.fields([
        { name: "fotoProfile", maxCount: 1 },
        { name: "cv", maxCount: 1 },
        { name: "fotoKtp", maxCount: 1 },
        { name: "fotoSimA", maxCount: 1 },
        { name: "fotoSimC", maxCount: 1 },
    ]),
    updateSales
);

// Hapus data sales
router.delete("/sales/:id", verifyToken, authorizeRoles("admin"), deleteSales);

module.exports = router;