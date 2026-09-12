const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { register } = require("../controllers/authController");

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

module.exports = router;