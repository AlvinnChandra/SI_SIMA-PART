const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
    createPesanan,
    getPesanan,
    getPesananById,
    updateStatusPesanan,
    deletePesanan,
    resetNomorPesanan, // tambahkan
} = require("../controllers/pesananController");

// Reset total: hapus semua pesanan + nomor urut kembali ke ORD-0001 — hanya admin
router.post("/reset-nomor", verifyToken, authorizeRoles("admin"), resetNomorPesanan);

// Admin & sales sama-sama boleh lihat dan membuat pesanan
router.get("/", verifyToken, authorizeRoles("admin", "sales"), getPesanan);
router.get("/:id", verifyToken, authorizeRoles("admin", "sales"), getPesananById);
router.post("/", verifyToken, authorizeRoles("admin", "sales"), createPesanan);

// Ubah status pesanan (mis. dari halaman History Order) hanya admin
router.patch("/:id/status", verifyToken, authorizeRoles("admin"), updateStatusPesanan);

// Hapus pesanan:
// - admin boleh hapus pesanan apapun statusnya
// - sales cuma boleh hapus kalau status masih "Orderan Masuk"
//   (pengecekan status detail dilakukan di dalam controller deletePesanan)
router.delete("/:id", verifyToken, authorizeRoles("admin", "sales"), deletePesanan);

module.exports = router;