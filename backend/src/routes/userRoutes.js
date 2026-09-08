const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const router = express.Router();

// Only admin can access this route
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({ message: "Welcome, Admin!" });
});

// All can access this route
router.get("/user", verifyToken, authorizeRoles("admin", "user"), (req, res) => {
    res.status(200).json({ message: "Welcome, User!" });
});

module.exports = router;