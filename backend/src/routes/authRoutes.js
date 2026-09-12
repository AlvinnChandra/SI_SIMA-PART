const express = require("express");
const upload = require("../middlewares/multer");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { register, login, createAdmin } = require("../controllers/authController");
const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "fotoProfil", maxCount: 1 },
    { name: "cv", maxCount: 1 },
    { name: "ktp", maxCount: 1 },
    { name: "simA", maxCount: 1 },
    { name: "simC", maxCount: 1 },
  ]),
  register
);
router.post("/login", login);
router.post("/create-admin", verifyToken, authorizeRoles("admin"), createAdmin);

module.exports = router;