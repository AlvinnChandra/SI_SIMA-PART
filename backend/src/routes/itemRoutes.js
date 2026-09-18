const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/multer");
const {
  createItem,
  getItem,
  updateItem,
  deleteItem,
  applyDiskon,
  removeDiskon,
} = require("../controllers/itemController");

const router = express.Router();

router.get("/", verifyToken, getItem);
router.post("/", verifyToken, authorizeRoles("admin"), upload.single("gambar"), createItem);
router.put("/:id", verifyToken, authorizeRoles("admin"), upload.single("gambar"), updateItem);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteItem);
router.patch("/diskon", verifyToken, authorizeRoles("admin"), applyDiskon);
router.patch("/:id/diskon/hapus", verifyToken, authorizeRoles("admin"), removeDiskon);
module.exports = router;