const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { register, login } = require("../controllers/authController");

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

module.exports = router;