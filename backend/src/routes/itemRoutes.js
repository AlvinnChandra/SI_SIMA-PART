const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/multer");
const {
  createItem,
  getItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const router = express.Router();

router.get("/", verifyToken, getItem);
router.post("/", verifyToken, authorizeRoles("admin"), upload.single("gambar"), createItem);
router.put("/:id", verifyToken, authorizeRoles("admin"), upload.single("gambar"), updateItem);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteItem);

module.exports = router;