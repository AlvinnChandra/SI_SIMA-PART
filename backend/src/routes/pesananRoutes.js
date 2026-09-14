const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
    createPesanan,
    getPesanan,
    getPesananById,
    updateStatusPesanan,
} = require("../controllers/pesananController");

// Admin & sales sama-sama boleh lihat dan membuat pesanan
router.get("/", verifyToken, authorizeRoles("admin", "sales"), getPesanan);
router.get("/:id", verifyToken, authorizeRoles("admin", "sales"), getPesananById);
router.post("/", verifyToken, authorizeRoles("admin", "sales"), createPesanan);

// Ubah status pesanan (mis. dari halaman History Order) hanya admin
router.patch("/:id/status", verifyToken, authorizeRoles("admin"), updateStatusPesanan);

module.exports = router;