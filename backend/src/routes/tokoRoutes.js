const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
    getToko,
    createToko,
    updateToko,
    deleteToko,
} = require("../controllers/tokoController");

// Admin & sales sama-sama boleh lihat dan tambah data toko
router.get("/", verifyToken, authorizeRoles("admin", "sales"), getToko);
router.post("/", verifyToken, authorizeRoles("admin", "sales"), createToko);
router.put("/:id", verifyToken, authorizeRoles("admin", "sales"), updateToko);

// Hapus data toko hanya boleh oleh admin
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteToko);

module.exports = router;